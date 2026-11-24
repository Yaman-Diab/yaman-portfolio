import { startGlyphFields } from './glyph-field';
import { enableMagnetic } from './magnetic';
import { startExpertise } from './expertise';
import { startStrokes } from './strokes';
import { startFlows } from './flow';

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

/**
 * Keeps the floating header readable: frosted once the page has scrolled,
 * light text while a dark section sits under it, and the link of the
 * section in view marked as current.
 */
function watchHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const darkSections = [...document.querySelectorAll<HTMLElement>('.theme-dark:not(.menu)')];
  const navLinks = [...header.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const progress = header.querySelector<HTMLElement>('[data-scroll-progress]');
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.navLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);

  let queued = false;
  const update = () => {
    queued = false;
    const line = header.offsetHeight / 2;
    header.classList.toggle('is-scrolled', window.scrollY > 8);

    const overDark = darkSections.some((section) => {
      const box = section.getBoundingClientRect();
      return box.top <= line && box.bottom >= line;
    });
    header.dataset.tone = overDark ? 'dark' : 'light';

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress?.style.setProperty('--progress', String(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0));

    // The current section is the last one whose top has passed a third of the screen.
    const mark = window.innerHeight / 3;
    let current: string | undefined;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= mark) current = section.id;
    }
    navLinks.forEach((link) => {
      if (link.dataset.navLink === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

/** The full-screen menu on small screens. Escape, a link or the button closes it. */
function enableMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;
  const root = document.documentElement;

  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      // One frame later, so the clip animates from closed.
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    } else {
      menu.classList.remove('is-open');
      window.setTimeout(() => {
        if (button.getAttribute('aria-expanded') === 'false') menu.hidden = true;
      }, 600);
    }
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('[data-menu-link]').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (query) => {
    if (query.matches) setOpen(false);
  });
}

/** Shows the time in Damascus wherever `data-local-time` appears, updated every minute. */
function showLocalTime(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-local-time]');
  if (targets.length === 0) return;
  const format = new Intl.DateTimeFormat(document.documentElement.lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Damascus',
  });
  const update = () => targets.forEach((target) => (target.textContent = format.format(new Date())));
  update();
  window.setInterval(update, 30_000);
}

/**
 * The chapter rail of a case study: shown once the hero has passed, it marks
 * the chapter being read and fills its track as the story goes on.
 */
function watchChapters(): void {
  const rail = document.querySelector<HTMLElement>('[data-chapters]');
  if (!rail) return;
  const fill = rail.querySelector<HTMLElement>('[data-chapters-fill]');
  const links = [...rail.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
  const sections = links
    .map((link) => document.getElementById(link.dataset.chapterLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);
  if (sections.length === 0) return;

  let queued = false;
  const update = () => {
    queued = false;
    const first = sections[0]!.getBoundingClientRect();
    const last = sections[sections.length - 1]!.getBoundingClientRect();
    const mark = window.innerHeight * 0.4;
    rail.classList.toggle('is-visible', first.top < window.innerHeight * 0.7 && last.bottom > mark);

    let current = -1;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= mark) current = i;
    });
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    const span = last.bottom - first.top;
    const done = span > 0 ? (mark - first.top) / span : 0;
    fill?.style.setProperty('--progress', String(Math.min(1, Math.max(0, done))));
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

/**
 * Switching language keeps the reader's place. The two versions of a page
 * share section ids but not lengths, so the place is kept as "this section,
 * this far through it", and restored on the other side before the curtain lifts.
 */
const PLACE_KEY = 'lang-place';

function keepPlaceAcrossLanguages(): void {
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest?.('a[hreflang]');
      if (!link) return;
      const header = document.querySelector<HTMLElement>('[data-site-header]')?.offsetHeight ?? 0;
      const sections = [...document.querySelectorAll<HTMLElement>('main [id], body > section[id]')];
      let current: HTMLElement | undefined;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= header + 8) current = section;
      }
      try {
        if (!current || window.scrollY < 40) {
          sessionStorage.removeItem(PLACE_KEY);
          return;
        }
        const box = current.getBoundingClientRect();
        const through = Math.min(1, Math.max(0, (header - box.top) / Math.max(1, box.height)));
        sessionStorage.setItem(PLACE_KEY, JSON.stringify({ id: current.id, through }));
      } catch {
        // Storage blocked: the other page simply opens at the top.
      }
    },
    true,
  );

  let place: { id: string; through: number } | null = null;
  try {
    place = JSON.parse(sessionStorage.getItem(PLACE_KEY) ?? 'null');
    sessionStorage.removeItem(PLACE_KEY);
  } catch {
    place = null;
  }
  const target = place && document.getElementById(place.id);
  if (!place || !target) return;
  const header = document.querySelector<HTMLElement>('[data-site-header]')?.offsetHeight ?? 0;
  const top = target.getBoundingClientRect().top + window.scrollY + place.through * target.offsetHeight - header;
  window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
}


/**
 * A progress line runs down the project list as it scrolls (sections/Work.astro).
 */
function watchRows(): void {
  const list = document.querySelector<HTMLElement>('[data-scroll-rows]');
  if (!list) return;
  let queued = false;
  const update = () => {
    queued = false;
    const middle = window.innerHeight / 2;
    const box = list.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (middle - box.top) / box.height));
    list.style.setProperty('--progress', String(progress));
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

/**
 * A section with `data-expand` grows out of the dark block above it: it starts
 * inset with rounded top corners and widens to the full page as it scrolls in.
 */
function watchExpand(): void {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-expand]')];
  if (blocks.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let queued = false;
  const update = () => {
    queued = false;
    const maxInset = Math.min(window.innerWidth * 0.06, 96);
    for (const block of blocks) {
      const top = block.getBoundingClientRect().top;
      const raw = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.8)));
      const eased = 1 - Math.pow(1 - raw, 3);
      block.style.setProperty('--inset', `${(1 - eased) * maxInset}px`);
      block.style.setProperty('--round', `${(1 - eased) * 48}px`);
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

keepPlaceAcrossLanguages();
watchExpand();
watchInView();
watchRows();
startGlyphFields();
enableMagnetic();
startExpertise();
startStrokes();
startFlows();
watchChapters();
enableCopyButtons();
watchHeader();
enableMenu();
showLocalTime();
