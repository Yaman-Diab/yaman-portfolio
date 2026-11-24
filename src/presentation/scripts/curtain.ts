/**
 * Drives the curtain (components/PageCurtain.astro): the loader on the first
 * page of a visit, and the logo transition between pages.
 *
 * The inline script in BaseLayout decides the mode before first paint and
 * puts `pt-load` or `pt-enter` on <html>. This module only animates.
 */

const html = document.documentElement;
const curtain = document.querySelector<HTMLElement>('[data-curtain]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** The lean of the logo's bar: 93.33 across for every 184.71 up. */
const LEAN = 93.33 / 184.71;
const EASE_PANEL = 'cubic-bezier(0.76, 0, 0.24, 1)';
const EASE_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.55, 0, 1, 0.45)';

/** Loader timing: long enough for the counter to read, never a wait for its own sake. */
const MIN_LOAD_MS = 1600;
const MAX_LOAD_MS = 6000;

/** Session key that tells the next page to open under the curtain. */
const NAV_KEY = 'pt-nav';

const MARK_TOP = 296;
const MARK_HEIGHT = 194;

/* ---------- Geometry ---------- */

/** A panel whose start edge sits at `a` and end edge at `b`, both measured along the bottom. */
function panel(a: number, b: number): string {
  const k = LEAN * window.innerHeight;
  return `polygon(${a + k}px 0px, ${b + k}px 0px, ${b}px 100%, ${a}px 100%)`;
}

const shapes = () => {
  const k = LEAN * window.innerHeight;
  const w = window.innerWidth;
  return { before: panel(-k, -k), cover: panel(-k, w), after: panel(w, w) };
};

/* ---------- Parts ---------- */

function parts(root: HTMLElement) {
  return {
    accent: root.querySelector<HTMLElement>('.curtain__panel--accent')!,
    main: root.querySelector<HTMLElement>('.curtain__panel--main')!,
    meta: [...root.querySelectorAll<HTMLElement>('[data-curtain-meta]')],
    bubble: root.querySelector<SVGGElement>('.mark__bubble')!,
    bar: root.querySelector<SVGGElement>('.mark__bar')!,
    track: root.querySelector<SVGGElement>('.mark__track'),
    fill: root.querySelector<SVGRectElement>('[data-mark-fill]'),
    columns: [...root.querySelectorAll<HTMLElement>('.curtain__col')],
  };
}

type Parts = ReturnType<typeof parts>;

const finished = (animation: Animation) => animation.finished.catch(() => undefined);
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/* ---------- Loader ---------- */

/** Resolves a fraction from 0 to 1 as the first screen's images, the fonts and the page finish loading. */
function watchLoading(): () => number {
  const tasks: Promise<unknown>[] = [...document.images]
    .filter((img) => img.loading !== 'lazy')
    .map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }),
    );
  tasks.push(document.fonts?.ready ?? Promise.resolve());
  tasks.push(
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
  );

  let done = 0;
  tasks.forEach((task) => task.then(() => (done += 1)));
  return () => done / tasks.length;
}

/** Rolls the three digit columns like an odometer: each column turns as the one after it wraps. */
function renderCounter(columns: HTMLElement[], value: number): void {
  const [hundredsCol, tensCol, onesCol] = columns;
  const ones = value % 10;
  const tens = Math.floor(value / 10) % 10;
  const carry = ones > 9 ? ones - 9 : 0;
  const tensPos = tens + carry;
  const hundredsPos = Math.floor(value / 100) + (tens === 9 ? carry : 0);
  onesCol.style.transform = `translateY(${-ones}em)`;
  tensCol.style.transform = `translateY(${-tensPos}em)`;
  hundredsCol.style.transform = `translateY(${-Math.min(hundredsPos, 1)}em)`;
}

function renderFill(fill: SVGRectElement | null, fraction: number): void {
  if (!fill) return;
  const height = MARK_HEIGHT * fraction;
  fill.setAttribute('y', String(MARK_TOP + MARK_HEIGHT - height));
  fill.setAttribute('height', String(height));
}

function runLoader(p: Parts): Promise<void> {
  const progress = watchLoading();
  const start = performance.now();
  let shown = 0;
  let last = start;

  return new Promise((resolve) => {
    const frame = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min(now - last, 250);
      last = now;

      // Never ahead of the real progress, never faster than the minimum time, never stuck past the maximum.
      const real = elapsed > MAX_LOAD_MS ? 1 : progress();
      const paced = Math.min(1, elapsed / MIN_LOAD_MS);
      const target = Math.min(real, paced) * 100;
      // Glide toward the target, but always at least at a steady pace, so the last digits never crawl.
      const glide = (target - shown) * (1 - Math.pow(0.02, dt / 1000));
      const steady = (dt / MIN_LOAD_MS) * 60;
      shown = Math.min(target, shown + Math.max(glide, steady));

      renderCounter(p.columns, shown);
      renderFill(p.fill, shown / 100);

      if (shown >= 100) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/* ---------- Sequences ---------- */

function popBubble(p: Parts, delay = 0): Animation {
  return p.bubble.animate(
    [
      { opacity: 0.16, transform: 'scale(0.4)' },
      { opacity: 1, transform: 'scale(1.12)', offset: 0.6 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: 520, delay, easing: EASE_POP, fill: 'both' },
  );
}

/* ---------- App splash ---------- */

interface Splash {
  name: string;
  primary: string;
  deep: string;
  accent: string;
  on: string;
  kind: 'wordmark' | 'icon' | 'none';
  logo?: string;
}

/**
 * Paints the curtain as the app's splash for a link into a case study, or
 * puts Yaman's mark back for any other link. Mirrors the markup PageCurtain
 * renders on a case study page.
 */
function setSplash(p: Parts, data: Splash | null): void {
  if (!curtain) return;
  p.main.querySelector('[data-splash]')?.remove();
  if (!data) {
    curtain.removeAttribute('data-has-splash');
    return;
  }
  curtain.setAttribute('data-has-splash', '');
  curtain.style.setProperty('--splash', data.primary);
  curtain.style.setProperty('--splash-deep', data.deep);
  curtain.style.setProperty('--splash-accent', data.accent);
  curtain.style.setProperty('--splash-on', data.on);

  const splash = document.createElement('div');
  splash.className = 'splash';
  splash.dataset.splash = '';
  if (data.logo) {
    const img = document.createElement('img');
    img.className = `splash__logo splash__logo--${data.kind}`;
    img.src = data.logo;
    img.alt = '';
    splash.append(img);
  } else {
    const word = document.createElement('span');
    word.className = 'splash__word';
    word.textContent = data.name;
    splash.append(word);
  }
  const bar = document.createElement('span');
  bar.className = 'splash__bar';
  bar.append(document.createElement('i'));
  splash.append(bar);
  p.main.append(splash);
}

function readSplash(link: HTMLAnchorElement): Splash | null {
  try {
    return link.dataset.splash ? (JSON.parse(link.dataset.splash) as Splash) : null;
  } catch {
    return null;
  }
}

/** The mark (or the app's logo) leaves, then the curtain sweeps off the end edge. */
async function reveal(p: Parts): Promise<void> {
  const { cover, after } = shapes();

  const splashLogo = curtain?.hasAttribute('data-has-splash')
    ? p.main.querySelector<HTMLElement>('.splash__logo, .splash__word')
    : null;
  splashLogo?.animate(
    [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.18)' },
    ],
    { duration: 420, delay: 80, easing: EASE_IN, fill: 'both' },
  );

  p.meta.forEach((el, i) =>
    el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${i ? 16 : -16}px)` }], {
      duration: 320,
      easing: EASE_IN,
      fill: 'both',
    }),
  );
  p.bubble.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.5)' }], {
    duration: 300,
    easing: EASE_IN,
    fill: 'both',
  });
  p.bar.animate(
    [
      { opacity: 1, transform: 'translate(0, 0)' },
      { opacity: 0, transform: 'translate(36%, -70%)' },
    ],
    { duration: 420, delay: 60, easing: EASE_IN, fill: 'both' },
  );
  p.track?.animate([{ opacity: 0.16 }, { opacity: 0 }], { duration: 200, easing: EASE_IN, fill: 'both' });

  const panelTiming = { duration: 900, easing: EASE_PANEL, fill: 'both' as const };
  const main = p.main.animate([{ clipPath: cover }, { clipPath: after }], { ...panelTiming, delay: 260 });
  const accent = p.accent.animate([{ clipPath: cover }, { clipPath: after }], { ...panelTiming, delay: 360 });

  // Let the page's own entrance play while the panels are still moving off it.
  window.setTimeout(() => html.classList.remove('pt-load', 'pt-enter'), 520);
  html.classList.add('pt-revealing');

  await Promise.all([finished(main), finished(accent)]);
  reset(p);
}

/** Panels sweep in, the mark draws itself, then the browser moves on. */
async function cover(p: Parts, href: string, splash: Splash | null): Promise<void> {
  const { before, cover: full } = shapes();
  setSplash(p, splash);
  html.classList.add('pt-leave');

  const panelTiming = { duration: 620, easing: EASE_PANEL, fill: 'both' as const };
  const accent = p.accent.animate([{ clipPath: before }, { clipPath: full }], panelTiming);
  const main = p.main.animate([{ clipPath: before }, { clipPath: full }], { ...panelTiming, delay: 80 });

  // Plain transitions are just the lines; only a project's splash has something to show.
  const bubble = splash
    ? p.main.querySelector<HTMLElement>('.splash__logo, .splash__word')?.animate(
        [
          { opacity: 0, transform: 'scale(0.85)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 480, delay: 420, easing: EASE_OUT, fill: 'both' },
      ) ?? popBubble(p, 520)
    : null;

  await Promise.all([finished(accent), finished(main)]);
  if (bubble) await Promise.race([finished(bubble), wait(500)]);

  try {
    sessionStorage.setItem(NAV_KEY, '1');
  } catch {
    // Storage blocked: the next page opens without the curtain. Nothing breaks.
  }
  window.location.assign(href);
}

/** Puts everything back as it was, for the next transition or a page restored from the back-forward cache. */
function reset(p: Parts): void {
  html.classList.remove('pt-load', 'pt-enter', 'pt-leave', 'pt-revealing');
  curtain?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  [p.accent, p.main].forEach((el) => (el.style.clipPath = ''));
  renderFill(p.fill, 0);
}

/* ---------- Links ---------- */

function shouldTransition(event: MouseEvent, link: HTMLAnchorElement): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== '_self') return false;
  if (link.hasAttribute('download')) return false;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // A jump within the same page keeps the browser's own scroll.
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
  return true;
}

/* ---------- Start ---------- */

declare global {
  interface Window {
    __curtainFailsafe?: number;
  }
}

if (curtain) {
  window.clearTimeout(window.__curtainFailsafe);
  const p = parts(curtain);
  let busy = false;

  if (html.classList.contains('pt-load')) {
    busy = true;
    runLoader(p)
      .then(async () => {
        await finished(popBubble(p));
        await wait(140);
        await reveal(p);
      })
      .finally(() => (busy = false));
  } else if (html.classList.contains('pt-enter')) {
    busy = true;
    Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(700)])
      .then(() => wait(120))
      .then(() => reveal(p))
      .finally(() => (busy = false));
  }

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    if (reducedMotion.matches || busy || !shouldTransition(event, link)) return;
    event.preventDefault();
    busy = true;
    // The logo in the header replays the intro on the page it opens.
    if (link.closest('.brand')) {
      try {
        sessionStorage.setItem('pt-logo', '1');
      } catch {
        // Storage blocked: the page opens with the lines only.
      }
    }
    void cover(p, link.href, readSplash(link));
  });

  // Coming back through the back-forward cache shows the page exactly as it was left: covered. Uncover it.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    busy = false;
    reset(p);
  });
}

export {};
