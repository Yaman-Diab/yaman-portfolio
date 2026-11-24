/**
 * Magnetic buttons: an element with `data-magnetic` reaches toward the
 * pointer once it comes within a short distance (not only when it is on the
 * button), its label reaches a little further, and both glide back when the
 * pointer leaves. The motion is eased every frame, so it follows smoothly
 * instead of jumping. Only for a fine pointer that can hover, and never with
 * reduced motion. `data-magnetic="0.4"` sets the strength.
 */
interface Magnet {
  el: HTMLElement;
  label: HTMLElement | null;
  strength: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/** How far outside its edges a button starts to feel the pointer, in px. */
const REACH = 90;

export function enableMagnetic(): void {
  const allowed = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!allowed.matches) return;

  const magnets: Magnet[] = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')].map((el) => ({
    el,
    label: el.querySelector<HTMLElement>('[data-magnetic-label]'),
    strength: Number(el.dataset.magnetic || 0.35),
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  }));
  if (magnets.length === 0) return;
  magnets.forEach((magnet) => magnet.el.classList.add('is-magnetic'));

  let pointerX = -1e4;
  let pointerY = -1e4;
  let frame = 0;

  const aim = () => {
    for (const magnet of magnets) {
      const box = magnet.el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = pointerX - cx;
      const dy = pointerY - cy;
      // Distance from the button's edge, not its centre: big buttons feel it as early as small ones.
      const outside = Math.hypot(Math.max(0, Math.abs(dx) - box.width / 2), Math.max(0, Math.abs(dy) - box.height / 2));
      if (outside < REACH) {
        const pull = 1 - outside / REACH;
        magnet.tx = dx * magnet.strength * pull;
        magnet.ty = dy * magnet.strength * pull;
      } else {
        magnet.tx = 0;
        magnet.ty = 0;
      }
    }
  };

  const tick = () => {
    let moving = false;
    for (const magnet of magnets) {
      magnet.x += (magnet.tx - magnet.x) * 0.16;
      magnet.y += (magnet.ty - magnet.y) * 0.16;
      if (Math.abs(magnet.tx - magnet.x) > 0.05 || Math.abs(magnet.ty - magnet.y) > 0.05) moving = true;
      magnet.el.style.translate = `${magnet.x.toFixed(2)}px ${magnet.y.toFixed(2)}px`;
      if (magnet.label) magnet.label.style.translate = `${(magnet.x * 0.5).toFixed(2)}px ${(magnet.y * 0.5).toFixed(2)}px`;
    }
    frame = moving ? requestAnimationFrame(tick) : 0;
  };

  const kick = () => {
    aim();
    if (!frame) frame = requestAnimationFrame(tick);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      kick();
    },
    { passive: true },
  );
  window.addEventListener('scroll', kick, { passive: true });
  document.addEventListener('pointerleave', () => {
    pointerX = -1e4;
    pointerY = -1e4;
    kick();
  });
}
