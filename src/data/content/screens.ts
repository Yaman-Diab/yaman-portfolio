import type { ProjectSlug, ScreenImage } from '@/domain/entities/project';

/**
 * Screenshots are found by file name, so adding one needs no code:
 *
 *   src/assets/screens/<project>/1.png   first screen
 *   src/assets/screens/<project>/2.png   second screen
 *   src/assets/screens/<project>/3.png   third screen
 *
 * PNG, JPG, WebP and AVIF all work. The build resizes and compresses them.
 * A missing file leaves an empty phone frame in its place.
 */
const files = import.meta.glob<{ default: ScreenImage }>('/src/assets/screens/*/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
});

const byName = new Map<string, ScreenImage>();
for (const [path, module] of Object.entries(files)) {
  const match = path.match(/\/screens\/([^/]+)\/(\d+)\.[a-z]+$/i);
  if (match) byName.set(`${match[1]}/${match[2]}`, module.default);
}

const logos = import.meta.glob<{ default: ScreenImage }>('/src/assets/brand/projects/*.{png,svg,webp}', { eager: true });
const logoByName = new Map<string, ScreenImage>();
for (const [path, module] of Object.entries(logos)) {
  const match = path.match(/\/projects\/([^/]+)\.[a-z]+$/i);
  if (match?.[1]) logoByName.set(match[1], module.default);
}

/** The app's logo, from src/assets/brand/projects/<project>.png, if it has been added. */
export function brandLogo(slug: ProjectSlug): ScreenImage | undefined {
  return logoByName.get(slug);
}

/** The screenshot for one position (1, 2 or 3) of one project, if it has been added. */
export function screenImage(slug: ProjectSlug, position: number): ScreenImage | undefined {
  return byName.get(`${slug}/${position}`);
}
