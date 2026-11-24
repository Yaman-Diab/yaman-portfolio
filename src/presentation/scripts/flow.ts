/**
 * Interactive plans (features/case-study/FlowDiagram.astro): steps are tabs,
 * one panel open at a time, the rail fills up to the open step. While the
 * plan is on screen it steps through on its own; any click, hover or key
 * hands control to the visitor for good.
 */

function enableFlow(flow: HTMLElement): void {
  const steps = [...flow.querySelectorAll<HTMLButtonElement>('[data-flow-step]')];
  const panels = [...flow.querySelectorAll<HTMLElement>('[data-flow-panel]')];
  const fill = flow.querySelector<HTMLElement>('[data-flow-fill]');
  if (steps.length === 0) return;

  let index = 0;
  let timer = 0;
  let manual = false;

  const show = (target: number, focus = false) => {
    index = (target + steps.length) % steps.length;
    steps.forEach((step, i) => {
      const active = i === index;
      step.setAttribute('aria-selected', String(active));
      step.tabIndex = active ? 0 : -1;
      step.classList.toggle('is-passed', i < index);
      if (active && focus) step.focus();
    });
    panels.forEach((panel, i) => panel.toggleAttribute('data-active', i === index));
    fill?.style.setProperty('--p', String(steps.length > 1 ? index / (steps.length - 1) : 1));
  };

  const takeOver = () => {
    manual = true;
    window.clearInterval(timer);
  };

  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      takeOver();
      show(i);
    });
    step.addEventListener('pointerenter', () => {
      takeOver();
      show(i);
    });
    step.addEventListener('keydown', (event) => {
      const rtl = document.documentElement.dir === 'rtl';
      const next = rtl ? 'ArrowLeft' : 'ArrowRight';
      const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === next || event.key === 'ArrowDown') show(index + 1, true);
      else if (event.key === prev || event.key === 'ArrowUp') show(index - 1, true);
      else if (event.key === 'Home') show(0, true);
      else if (event.key === 'End') show(steps.length - 1, true);
      else return;
      event.preventDefault();
      takeOver();
    });
  });

  // Walk the plan while it is on screen, unless the visitor has taken over or prefers stillness.
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still) {
    new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (!entry?.isIntersecting || manual) return;
        timer = window.setInterval(() => show(index + 1), 2400);
      },
      { threshold: 0.5 },
    ).observe(flow);
  }

  show(0);
}

export function startFlows(): void {
  document.querySelectorAll<HTMLElement>('[data-flow]').forEach(enableFlow);
}
