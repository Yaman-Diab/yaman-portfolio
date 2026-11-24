/**
 * Moves the ribbon of a `[data-strokes]` stretch of the page with the scroll
 * (components/ScrollStrokes.astro). Only a segment of the path is visible at
 * a time: its head runs ahead as the reader scrolls down and its tail follows,
 * so the ribbon travels through the section. Scrolling up runs it backwards.
 */
function watchRibbon(zone: HTMLElement): void {
  const paths = [...zone.querySelectorAll<SVGPathElement>('[data-stroke]')];
  if (paths.length === 0) return;
  let queued = false;

  const update = () => {
    queued = false;
    const box = zone.getBoundingClientRect();
    const view = window.innerHeight;
    // 0 as the zone's top reaches the bottom of the screen, 1 as its bottom leaves the top.
    const progress = Math.min(1, Math.max(0, (view - box.top) / (box.height + view)));
    for (const path of paths) {
      const segment = Number(path.dataset.segment ?? 0.3);
      // One dash of length `segment`; its head sits at progress × (1 + segment).
      path.style.strokeDasharray = `${segment} ${1 + segment}`;
      path.style.strokeDashoffset = String(segment - progress * (1 + segment));
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  // Only listen while the zone is near the screen.
  let listening = false;
  new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && !listening) {
        listening = true;
        window.addEventListener('scroll', schedule, { passive: true });
        update();
      } else if (!entry?.isIntersecting && listening) {
        listening = false;
        window.removeEventListener('scroll', schedule);
      }
    },
    { rootMargin: '30% 0px' },
  ).observe(zone);
  update();
}

export function startStrokes(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-strokes]').forEach(watchRibbon);
}
