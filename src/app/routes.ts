import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/domain/entities/locale';
import type { ProjectSlug } from '@/domain/entities/project';

/** Base path the site is served from, always with a trailing slash. */
const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `${locale}/`;
}

/** Every internal link goes through these helpers so the base path is never forgotten. */
export const routes = {
  home: (locale: Locale) => `${BASE}${localePrefix(locale)}`,
  section: (locale: Locale, id: string) => `${BASE}${localePrefix(locale)}#${id}`,
  project: (locale: Locale, slug: ProjectSlug) => `${BASE}${localePrefix(locale)}projects/${slug}/`,
  lab: (locale: Locale) => `${BASE}${localePrefix(locale)}lab/`,
  asset: (path: string) => `${BASE}${path.replace(/^\//, '')}`,
};

/** Absolute URL for canonical links and social previews. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(path, site ?? 'http://localhost:4321').toString();
}

/** Route params for the optional `[...locale]` segment: undefined for the default language. */
export function localeParams(): { params: { locale: string | undefined }; props: { locale: Locale } }[] {
  return LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}
