/**
 * Glyph field: code symbols that drift, gather into a shape (Yaman's mark,
 * a word, an icon), scatter away from the pointer and spring back. A field
 * can morph to a new shape at any time; the slider uses that.
 *
 * Markup: <canvas data-glyph-field data-shape='…json…' data-align="end" data-valign="start">
 * inside a positioned parent. The parent receives the pointer, so the canvas
 * never blocks a click. Shapes are described in ShapeSpec below.
 *
 * Cost control, because the site must stay light:
 *   - no library; one 2D canvas, text drawn in a few colour batches;
 *   - particle count scales with the area, and drops on small screens;
 *   - the loop only runs while the field is on screen and the tab is visible;
 *   - with reduced motion the shape is drawn once and stays still.
 */

export type ShapeSpec =
  /** SVG path data, filled, inside the given viewBox. */
  | { kind: 'path'; d: string[]; viewBox: [number, number, number, number] }
  /** Line icon on a 24-unit grid (Lucide style), stroked thick. */
  | { kind: 'icon'; d: string[] }
  /** Text in the display face. */
  | { kind: 'text'; text: string; weight?: number };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** Bound to a point of the shape, or drifting free. */
  bound: boolean;
  ch: string;
  tone: number;
  phase: number;
  /** A morph in flight: from (sx, sy), dipping through (cx, cy), to the target. Times in ms. */
  tween?: { sx: number; sy: number; cx: number; cy: number; start: number; duration: number };
}

/** Slow in, slow out: the move reads as deliberate, never as a snap. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const GLYPHS = '{}()<>[]/\\=;:+-*&|!?#$%~^_.'.split('').concat(['=>', '</>', '&&', '::', '//', '{}', '=']);
const TONES = [
  { color: '#dbe2ef', alpha: 0.85 },
  { color: '#8fb3e3', alpha: 0.95 },
  { color: '#ffffff', alpha: 1 },
  // A few red glyphs, the signal colour, so the field never reads as one flat blue.
  { color: '#ff5c63', alpha: 0.95 },
];
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]!;

class GlyphField {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  private pointer = { x: -9999, y: -9999, active: false };
  /** Where the pointer is aimed; the field follows it smoothly, never jerkily. */
  private aim = { x: -9999, y: -9999 };
  private running = false;
  private visible = false;
  private frame = 0;
  private shape: ShapeSpec;
  private readonly still: boolean;
  private readonly align: string;
  /** "start" pins the shape near the top of the field instead of centring it. */
  private readonly valign: string;
  private readonly fill: number;
  private readonly wide: boolean;
  /** The whole shape bobs gently, like something light floating in air. */
  private readonly float: boolean;

  constructor(
    private canvas: HTMLCanvasElement,
    shape: ShapeSpec,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.shape = shape;
    this.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.align = canvas.dataset.align ?? 'center';
    this.valign = canvas.dataset.valign ?? 'center';
    this.fill = Number(canvas.dataset.fill ?? 0.78);
    this.wide = canvas.dataset.wide !== undefined;
    this.float = canvas.dataset.float !== undefined;

    const host = canvas.parentElement!;
    new ResizeObserver(() => this.resize()).observe(host);
    new IntersectionObserver(([entry]) => {
      this.visible = Boolean(entry?.isIntersecting);
      this.toggle();
    }).observe(host);
    document.addEventListener('visibilitychange', () => this.toggle());

    if (!this.still) {
      host.addEventListener('pointermove', (event) => {
        const box = canvas.getBoundingClientRect();
        this.aim = { x: event.clientX - box.left, y: event.clientY - box.top };
        if (!this.pointer.active) this.pointer = { ...this.aim, active: true };
        this.pointer.active = true;
      });
      host.addEventListener('pointerleave', () => (this.pointer.active = false));
    }

    // Text shapes need the display face before they can be measured.
    document.fonts?.ready.then(() => this.layout(true));
  }

  /** Gather the glyphs into a new shape. */
  morph(shape: ShapeSpec): void {
    this.shape = shape;
    this.layout(false);
    if (this.still) this.draw();
  }

  private resize(): void {
    const box = this.canvas.parentElement!.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = box.width;
    this.height = box.height;
    this.canvas.width = Math.round(box.width * this.dpr);
    this.canvas.height = Math.round(box.height * this.dpr);
    this.canvas.style.width = `${box.width}px`;
    this.canvas.style.height = `${box.height}px`;
    this.layout(true);
  }

  /** The box the shape is drawn into. */
  private target(): { x: number; y: number; w: number; h: number } {
    const small = this.width < 720;
    const h = this.height * this.fill;
    const w = small || this.wide ? this.width * 0.92 : Math.min(this.width * 0.55, h * 1.25);
    const y = this.valign === 'start' ? this.height * 0.1 : (this.height - h) / 2;
    const rtl = document.documentElement.dir === 'rtl';
    if (this.align === 'start' && !small) {
      const sw = Math.min(this.width * 0.42, h * 1.4);
      return { x: rtl ? this.width * 0.95 - sw : this.width * 0.05, y, w: sw, h };
    }
    const x =
      this.align === 'end' && !small
        ? document.documentElement.dir === 'rtl'
          ? this.width * 0.04
          : this.width * 0.96 - w
        : (this.width - w) / 2;
    return { x, y, w, h };
  }

  /** Rasterise the shape small, and read back the points that fall inside it. */
  private sample(): [number, number][] {
    const box = this.target();
    const step = this.width < 720 ? 10 : this.shape.kind === 'text' ? 8 : 9;
    const scratch = document.createElement('canvas');
    scratch.width = Math.ceil(this.width);
    scratch.height = Math.ceil(this.height);
    const g = scratch.getContext('2d', { willReadFrequently: true })!;
    g.fillStyle = '#000';
    g.strokeStyle = '#000';

    const shape = this.shape;
    if (shape.kind === 'text') {
      // Fit the real ink box (dots and descenders included), not the em box.
      const weight = shape.weight ?? 800;
      const font = (px: number) => `${weight} ${px}px Unbounded, Alexandria, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.font = font(100);
      const probe = g.measureText(shape.text);
      const inkW = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight || probe.width;
      const inkH = probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent || 100;
      const size = 100 * Math.min(box.w / inkW, box.h / inkH);
      g.font = font(size);
      const ink = g.measureText(shape.text);
      const top = ink.actualBoundingBoxAscent;
      const height = ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent;
      const offsetX = (ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / 2;
      g.fillText(shape.text, box.x + box.w / 2 + offsetX, box.y + (box.h - height) / 2 + top);
    } else {
      const [vx, vy, vw, vh] = shape.kind === 'path' ? shape.viewBox : [0, 0, 24, 24];
      const scale = Math.min(box.w / vw, box.h / vh);
      const ox = box.x + (box.w - vw * scale) / 2 - vx * scale;
      const oy = box.y + (box.h - vh * scale) / 2 - vy * scale;
      g.setTransform(scale, 0, 0, scale, ox, oy);
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const d of shape.d) {
        const path = new Path2D(d);
        if (shape.kind === 'path') g.fill(path);
        else g.stroke(path);
      }
    }

    const { data } = g.getImageData(0, 0, scratch.width, scratch.height);
    const points: [number, number][] = [];
    for (let y = 0; y < scratch.height; y += step) {
      for (let x = 0; x < scratch.width; x += step) {
        if (data[(y * scratch.width + x) * 4 + 3]! > 128) points.push([x, y]);
      }
    }
    // Cap the count, so a huge screen does not mean a huge bill.
    const cap = this.width < 720 ? 420 : 1100;
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j]!, points[i]!];
    }
    return points.slice(0, cap);
  }

  private layout(fresh: boolean): void {
    if (this.width === 0) return;
    const points = this.sample();
    const free = Math.round(points.length * 0.35);
    const needed = points.length + free;

    while (this.particles.length < needed) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: 0,
        tx: 0,
        ty: 0,
        bound: false,
        ch: pick(GLYPHS),
        tone: Math.random() < 0.12 ? 1 : Math.random() < 0.06 ? 2 : Math.random() < 0.08 ? 3 : 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.particles.length = needed;

    // Shuffle who goes where, so a morph sends glyphs across the field.
    this.particles.forEach((particle, i) => {
      const point = points[i];
      particle.bound = Boolean(point);
      if (point) {
        particle.tx = point[0];
        particle.ty = point[1];
      }
      if (!fresh && Math.random() < 0.3) particle.ch = pick(GLYPHS);
      if (!fresh && point && !this.still) {
        // The old shape falls away and the new one rises into place: a curve that dips
        // below both ends, with a wave of start times across the field.
        const now = performance.now();
        const sweep = (point[0] / Math.max(1, this.width)) * 420;
        particle.tween = {
          sx: particle.x,
          sy: particle.y,
          cx: (particle.x + point[0]) / 2 + (Math.random() - 0.5) * 80,
          cy: this.height * (1.05 + Math.random() * 0.25),
          start: now + sweep + Math.random() * 160,
          duration: 1500 + Math.random() * 300,
        };
      }
      if (fresh && this.still && point) {
        particle.x = point[0];
        particle.y = point[1];
      }
    });

    if (this.still) this.draw();
    else this.toggle();
  }

  private toggle(): void {
    const shouldRun = !this.still && this.visible && !document.hidden;
    if (shouldRun && !this.running) {
      this.running = true;
      this.frame = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.frame);
    }
  }

  private tick = (time: number): void => {
    if (!this.running) return;
    this.step(time / 1000);
    this.draw();
    this.frame = requestAnimationFrame(this.tick);
  };

  private step(t: number): void {
    // Ease the pointer toward the mouse, so the scatter flows instead of snapping.
    this.pointer.x += (this.aim.x - this.pointer.x) * 0.12;
    this.pointer.y += (this.aim.y - this.pointer.y) * 0.12;
    const { x: px, y: py, active } = this.pointer;
    const radius = this.width < 720 ? 110 : 190;
    const r2 = radius * radius;

    const now = t * 1000;
    const floatX = this.float ? Math.sin(t * 0.45) * 6 : 0;
    const floatY = this.float ? Math.sin(t * 0.7) * 14 + Math.sin(t * 0.23) * 6 : 0;

    for (const p of this.particles) {
      if (p.tween) {
        const { sx, sy, cx, cy, start, duration } = p.tween;
        const raw = (now - start) / duration;
        if (raw < 0) continue; // still waiting for its turn in the wave
        const k = easeInOut(Math.min(1, raw));
        const u = 1 - k;
        // Quadratic curve through the dip point.
        p.x = u * u * sx + 2 * u * k * cx + k * k * (p.tx + floatX);
        p.y = u * u * sy + 2 * u * k * cy + k * k * (p.ty + floatY);
        if (raw >= 1) {
          p.tween = undefined;
          p.vx = 0;
          p.vy = 0;
        }
        continue;
      }
      if (p.bound) {
        // Spring to the point, with a slow breathing wobble.
        const tx = p.tx + floatX + Math.sin(t * 1.3 + p.phase) * 1.2;
        const ty = p.ty + floatY + Math.cos(t * 1.1 + p.phase) * 1.2;
        // A soft spring: scattered glyphs drift home slowly.
        p.vx += (tx - p.x) * 0.018;
        p.vy += (ty - p.y) * 0.018;
      } else {
        // Free glyphs wander, and wrap at the edges.
        p.vx += Math.cos(t * 0.4 + p.phase) * 0.02;
        p.vy += Math.sin(t * 0.3 + p.phase) * 0.02 - 0.004;
        if (p.x < -20) p.x = this.width + 20;
        if (p.x > this.width + 20) p.x = -20;
        if (p.y < -20) p.y = this.height + 20;
        if (p.y > this.height + 20) p.y = -20;
      }

      if (active) {
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          // Gentle, wide push that fades with distance.
          const falloff = (radius - d) / radius;
          const push = falloff * falloff * 1.6;
          p.vx += (dx / d) * push;
          p.vy += (dy / d) * push;
        }
      }

      p.vx *= p.bound ? 0.9 : 0.96;
      p.vy *= p.bound ? 0.9 : 0.96;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  private draw(): void {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const size = this.width < 720 ? 11 : 13;
    ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;

    // One batch per tone: few state changes, fast on any device.
    TONES.forEach((tone, index) => {
      ctx.fillStyle = tone.color;
      for (const p of this.particles) {
        if (p.tone !== index) continue;
        ctx.globalAlpha = p.bound ? tone.alpha : tone.alpha * 0.35;
        ctx.fillText(p.ch, p.x, p.y);
      }
    });
    ctx.globalAlpha = 1;
  }
}

const fields = new WeakMap<HTMLCanvasElement, GlyphField>();

export function startGlyphFields(): void {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-glyph-field]').forEach((canvas) => {
    try {
      const shape = JSON.parse(canvas.dataset.shape ?? '') as ShapeSpec;
      fields.set(canvas, new GlyphField(canvas, shape));
    } catch {
      // A bad shape leaves an empty canvas; the page around it is unaffected.
    }
  });
}

export function morphGlyphField(canvas: HTMLCanvasElement, shape: ShapeSpec): void {
  fields.get(canvas)?.morph(shape);
}
