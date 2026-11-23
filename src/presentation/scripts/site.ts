/**
 * Small behaviours shared by every page. No framework: each one finds its
 * elements by a data attribute and does one job.
 */

/** Adds `is-inview` once an element scrolls into view. CSS does the rest. */
function watchInView(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-inview], [data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-inview'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  targets.forEach((target) => observer.observe(target));
}

/** Copies `data-copy` to the clipboard and confirms on the button itself. */
function enableCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]') ?? button;
    const idle = label.textContent ?? '';
    const done = button.dataset.copied ?? idle;
    let timer: number | undefined;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        label.textContent = done;
        button.classList.add('is-copied');
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          label.textContent = idle;
          button.classList.remove('is-copied');
        }, 1800);
      } catch {
        // Clipboard access can be refused. The address stays visible and selectable.
      }
    });
  });
}

/** Marks the next navigation as a language switch, so the page turns over. */
function tagLanguageSwitch(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-language-switch]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        sessionStorage.setItem('view-transition', 'language');
      } catch {
        // Storage can be blocked. The default cross-fade is used instead.
      }
    });
  });
}

/** Gives the header a solid background once the page has scrolled. */
function watchHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

watchInView();
enableCopyButtons();
tagLanguageSwitch();
watchHeader();
