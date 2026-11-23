/**
 * Checks the built site in dist/ before it is published.
 *
 *   npm run qa               internal links, anchors, assets and metadata
 *   npm run qa -- --external also requests every external link once
 *
 * Exits with code 1 when something is broken, which stops the deploy.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const base = (process.env.BASE_PATH ?? '/yaman-portfolio').replace(/\/$/, '');
const checkExternal = process.argv.includes('--external');

const problems = [];
const external = new Map();

async function htmlFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

/** Maps a site address to the file that serves it. */
function fileFor(pathname) {
  const withoutBase = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const clean = decodeURIComponent(withoutBase);
  return clean.endsWith('/') ? join(dist, clean, 'index.html') : join(dist, clean);
}

const idCache = new Map();
async function idsIn(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
  }
  return idCache.get(file);
}

function requireTag(page, html, pattern, what) {
  if (!pattern.test(html)) problems.push(`${page}: missing ${what}`);
}

if (!existsSync(dist)) {
  console.error('dist/ does not exist. Run "npm run build" first.');
  process.exit(1);
}

const pages = await htmlFiles(dist);

// The site's own absolute addresses (canonical, hreflang, social image) are
// checked against the built files. They cannot be requested before the first deploy.
const home = await readFile(join(dist, 'index.html'), 'utf8');
const canonicalHome = home.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? 'https://invalid.example';
const siteOrigin = new URL(canonicalHome).origin;

for (const file of pages) {
  const page = relative(dist, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');

  requireTag(page, html, /<html[^>]*\slang="(en|ar)"/, 'a lang attribute');
  requireTag(page, html, /<html[^>]*\sdir="(ltr|rtl)"/, 'a dir attribute');
  requireTag(page, html, /<title>[^<]{10,}<\/title>/, 'a title');
  requireTag(page, html, /<meta name="description" content="[^"]{40,}"/, 'a description');
  requireTag(page, html, /<link rel="canonical" href="https:\/\/[^"]+"/, 'a canonical link');
  requireTag(page, html, /<meta property="og:image" content="https:\/\/[^"]+"/, 'a social image');
  requireTag(page, html, /<link rel="alternate" hreflang="ar"/, 'the Arabic alternate link');
  if ((html.match(/<h1[\s>]/g) ?? []).length === 0) problems.push(`${page}: no h1`);

  const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));
  const sources = [...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((match) =>
    match[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0]),
  );

  const metaUrls = [...html.matchAll(/<meta property="og:(?:image|url)" content="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of new Set([...references, ...sources, ...metaUrls])) {
    if (/^(mailto:|tel:|data:)/.test(reference)) continue;

    if (reference.startsWith(`${siteOrigin}${base}/`)) {
      if (!existsSync(fileFor(new URL(reference).pathname))) {
        problems.push(`${page}: "${reference}" is this site's own address but no built file serves it`);
      }
      continue;
    }

    if (/^https?:\/\//.test(reference)) {
      if (!external.has(reference)) external.set(reference, page);
      continue;
    }

    if (reference.startsWith('#')) {
      if (!(await idsIn(file)).has(reference.slice(1))) problems.push(`${page}: no element with id "${reference}"`);
      continue;
    }

    if (!reference.startsWith(`${base}/`)) {
      problems.push(`${page}: "${reference}" does not start with the base path "${base}/"`);
      continue;
    }

    const [pathname, hash] = reference.split('#');
    const target = fileFor(pathname);
    if (!existsSync(target)) {
      problems.push(`${page}: "${reference}" points to a missing file`);
    } else if (hash && target.endsWith('.html') && !(await idsIn(target)).has(hash)) {
      problems.push(`${page}: "${reference}" points to a missing anchor`);
    }
  }
}

if (checkExternal) {
  for (const [url, page] of external) {
    // Sites that only answer signed-in browsers still prove the address exists.
    const blocksRobots = /linkedin\.com/.test(url);
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000) });
      const fine = response.ok || (blocksRobots && [403, 429, 999].includes(response.status));
      console.log(`${fine ? 'ok ' : 'BAD'} ${response.status} ${url}`);
      if (!fine) problems.push(`${page}: external link ${url} answered ${response.status}`);
    } catch (error) {
      problems.push(`${page}: external link ${url} failed (${error.message})`);
    }
  }
}

console.log(`Checked ${pages.length} pages and ${external.size} external links${checkExternal ? '' : ' (addresses only)'}.`);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  process.exit(1);
}
console.log('No problems found.');
