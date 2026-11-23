// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Site origin and base path.
 *
 * The defaults target the GitHub Pages project address:
 *   https://yaman-diab.github.io/yaman-portfolio/
 *
 * The deploy workflow passes both values from the repository's Pages
 * settings. With a custom domain SITE_URL becomes that domain and
 * BASE_PATH is empty, so nothing in the code has to change.
 */
const site = process.env.SITE_URL || 'https://yaman-diab.github.io';
const basePath = process.env.BASE_PATH ?? '/yaman-portfolio';

export default defineConfig({
  site,
  base: basePath === '' ? '/' : basePath,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ar: 'ar' },
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
