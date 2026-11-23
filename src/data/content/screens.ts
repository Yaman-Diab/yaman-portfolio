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

/** The screenshot for one position (1, 2 or 3) of one project, if it has been added. */
export function screenImage(slug: ProjectSlug, position: number): ScreenImage | undefined {
  return byName.get(`${slug}/${position}`);
}
