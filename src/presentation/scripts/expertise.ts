/**
 * "What I bring" (sections/Expertise.astro): as the list scrolls, the item
 * crossing the middle of the screen becomes the one being read. Its line
 * lights up, and the sticky glyph field redraws itself as that item's number.
 */
import { morphGlyphField } from './glyph-field';

function watchExpertise(section: HTMLElement): void {
  const items = [...section.querySelectorAll<HTMLElement>('[data-xp-item]')];
  const field = section.querySelector<HTMLCanvasElement>('[data-xp-field]');
  if (items.length === 0) return;

  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  let current = 0;
  let queued = false;

  const activate = (index: number) => {
    if (index === current) return;
    current = index;
    items.forEach((item, i) => item.toggleAttribute('data-active', i === index));
    if (field) morphGlyphField(field, { kind: 'text', text: pad(index + 1, 3), weight: 800 });
  };

  const update = () => {
    queued = false;
    const middle = window.innerHeight * 0.5;
    let index = 0;
    items.forEach((item, i) => {
      if (item.getBoundingClientRect().top <= middle) index = i;
    });
    activate(index);
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

export function startExpertise(): void {
  document.querySelectorAll<HTMLElement>('[data-xp]').forEach(watchExpertise);
}
