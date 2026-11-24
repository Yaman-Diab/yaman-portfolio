/**
 * Turns every `[data-device]` phone (components/DeviceFrame.astro) into a
 * small prototype: tap the screen for the next one, swipe either way, or use
 * the arrows, the dots and the arrow keys. Screens slide like an iOS push.
 */

function enableDevice(device: HTMLElement): void {
  const screen = device.querySelector<HTMLElement>('[data-device-screen]');
  const track = device.querySelector<HTMLElement>('[data-device-track]');
  if (!screen || !track) return;

  const slides = [...track.children].filter((child): child is HTMLElement =>
    child.classList.contains('device__slide'),
  );
  if (slides.length < 2) return;

  const prev = device.querySelector<HTMLButtonElement>('[data-device-prev]');
  const next = device.querySelector<HTMLButtonElement>('[data-device-next]');
  const title = device.querySelector<HTMLElement>('[data-device-title]');
  const dots = [...device.querySelectorAll<HTMLButtonElement>('[data-device-dot]')];
  // The track runs in reading order, so in Arabic the next screen comes from the left.
  const dir = document.documentElement.dir === 'rtl' ? 1 : -1;
  let index = 0;

  const show = (target: number) => {
    index = (target + slides.length) % slides.length;
    track.style.transform = `translateX(${dir * index * 100}%)`;
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
    if (title) title.textContent = slides[index]?.dataset.title ?? '';
  };

  prev?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

  device.addEventListener('keydown', (event) => {
    const forward = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = document.documentElement.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) show(index + 1);
    else if (event.key === back) show(index - 1);
    else return;
    event.preventDefault();
  });

  // Swipe follows the finger; a short tap moves on. Live screens handle their own taps.
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  screen.addEventListener('pointerdown', (event) => {
    if ((event.target as Element).closest('[data-live-screen] button, [data-live-screen] a, [data-live-screen] input')) return;
    dragging = true;
    startX = event.clientX;
    deltaX = 0;
    track.classList.add('is-dragging');
    screen.setPointerCapture(event.pointerId);
  });

  screen.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    deltaX = event.clientX - startX;
    const width = screen.clientWidth;
    track.style.transform = `translateX(calc(${dir * index * 100}% + ${deltaX}px))`;
    if (Math.abs(deltaX) > width) deltaX = Math.sign(deltaX) * width;
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    const threshold = screen.clientWidth * 0.18;
    if (Math.abs(deltaX) < 6) show(index + 1);
    else if (deltaX * dir < -threshold) show(index - 1);
    else if (deltaX * dir > threshold) show(index + 1);
    else show(index);
  };

  screen.addEventListener('pointerup', release);
  screen.addEventListener('pointercancel', release);
  show(0);
}

document.querySelectorAll<HTMLElement>('[data-device]').forEach(enableDevice);

export {};
