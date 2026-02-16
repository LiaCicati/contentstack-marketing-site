/** Supported locales — must match Contentstack locale codes */
export const LOCALES = ["en-us", "it-it"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en-us";

export const LOCALE_LABELS: Record<Locale, string> = {
  "en-us": "English",
  "it-it": "Italiano",
};

/** Locale codes used as URL prefixes (no prefix for default) */
export function localeToPrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
