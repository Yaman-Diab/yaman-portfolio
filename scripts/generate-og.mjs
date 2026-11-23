/**
 * Draws the social preview image and the PNG icons into public/.
 *
 * Run it with `npm run og` after changing the name, the tagline or the
 * colours. The results are committed, so the deploy build does not need it.
 */
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import wawoff2 from 'wawoff2';

const root = new URL('..', import.meta.url);
const file = (path) => fileURLToPath(new URL(path, root));

const COLOR = {
  navy: '#112d4e',
  paper: '#f9f7f7',
  mist: '#dbe2ef',
  navyText: '#b9c8dd',
  blueLight: '#8fb3e3',
  lineDark: '#2e4c74',
};

/**
 * The text renderer reads TrueType files, and the site ships WOFF2.
 * Each font is unpacked once into a temporary folder.
 */
const fontFolder = await mkdtemp(join(tmpdir(), 'portfolio-fonts-'));

async function unpackFont(family, woff2Path) {
  const target = join(fontFolder, `${family.replaceAll(' ', '')}.ttf`);
  await writeFile(target, await wawoff2.decompress(await readFile(file(woff2Path))));
  return { family, file: target };
}

const FONT = {
  latin: await unpackFont(
    'Bricolage Grotesque',
    'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2',
  ),
  arabic: await unpackFont(
    'Fustat',
    'node_modules/@fontsource-variable/fustat/files/fustat-arabic-wght-normal.woff2',
  ),
};

/** Renders one piece of text to a transparent PNG, sized by its font size in pixels. */
async function renderText(content, { font, size, color, weight = 700, rtl = false }) {
  // The display font has an optical-size axis that stops at 96. Asking for a
  // larger size makes the renderer drop the font, so large text is drawn at
  // 90 and scaled up through the resolution instead.
  const fontSize = Math.min(size, 90);
  const markup = `<span foreground="${color}" font_weight="${weight}" font_size="${fontSize * 1024}">${content}</span>`;
  const { data, info } = await sharp({
    text: {
      text: markup,
      font: font.family,
      fontfile: font.file,
      rgba: true,
      dpi: Math.round((72 * size) / fontSize),
      align: rtl ? 'right' : 'left',
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
}

async function socialImage() {
  const width = 1200;
  const height = 630;
  const margin = 80;

  // One at a time: the renderer registers a font file on first use, and a
  // second request racing the first falls back to a system font.
  await renderText('.', { font: FONT.latin, size: 12, color: COLOR.paper });
  await renderText('.', { font: FONT.arabic, size: 12, color: COLOR.paper });
  const latinName = await renderText('Yaman Diab', { font: FONT.latin, size: 168, color: COLOR.paper });
  const arabicName = await renderText('يمان دياب', {
    font: FONT.arabic,
    size: 84,
    color: COLOR.blueLight,
    weight: 600,
    rtl: true,
  });
  const line1 = await renderText('Flutter developer.', { font: FONT.latin, size: 40, color: COLOR.paper, weight: 500 });
  const line2 = await renderText('Arabic-first, offline-first mobile apps.', {
    font: FONT.latin,
    size: 40,
    color: COLOR.navyText,
    weight: 500,
  });

  const ruleY = 318;
  const background = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${COLOR.navy}"/>
      <rect x="${margin}" y="${ruleY}" width="${width - 2 * margin}" height="3" fill="${COLOR.lineDark}"/>
      <rect x="-11" y="-11" width="22" height="22" fill="${COLOR.blueLight}"
        transform="translate(${margin + 250} ${ruleY + 1.5}) rotate(45)"/>
    </svg>`);

  await sharp(background)
    .composite([
      { ...pick(latinName), left: margin - 6, top: ruleY - latinName.height - 18 },
      { ...pick(arabicName), left: width - margin - arabicName.width, top: ruleY + 26 },
      { ...pick(line1), left: margin, top: 470 },
      { ...pick(line2), left: margin, top: 470 + line1.height + 12 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(file('public/og.png'));
}

const pick = ({ input }) => ({ input });

/** The site mark: a mist nuqta on navy. */
function iconSvg(size) {
  const half = size / 2;
  const side = size * 0.36;
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" rx="${size * 0.22}" fill="${COLOR.navy}"/>
      <rect x="${-side / 2}" y="${-side / 2}" width="${side}" height="${side}" fill="${COLOR.mist}"
        transform="translate(${half} ${half}) rotate(45)"/>
    </svg>`);
}

await mkdir(file('public'), { recursive: true });
await socialImage();
await sharp(iconSvg(64)).png().toFile(file('public/favicon.png'));
await sharp(iconSvg(180)).flatten({ background: COLOR.navy }).png().toFile(file('public/apple-touch-icon.png'));

console.log('Wrote public/og.png, public/favicon.png and public/apple-touch-icon.png');
