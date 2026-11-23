export const LOCALES = ['en', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export type TextDirection = 'ltr' | 'rtl';

export function directionOf(locale: Locale): TextDirection {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
