import enTranslations from '@/locales/en.json';
import ukTranslations from '@/locales/uk.json';

export type Locale = 'en' | 'uk';
export type TranslationKey = keyof typeof enTranslations;

const translations = {
  en: enTranslations,
  uk: ukTranslations,
} as const;

/**
 * Get translation by key for specific locale
 */
export function getTranslation(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string>
): string {
  const localeTranslations = translations[locale] as Record<string, string>;
  const fallbackTranslations = translations.en as Record<string, string>;
  
  let translation = localeTranslations[key] || fallbackTranslations[key] || key;

  // Replace parameters in translation string
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value);
    });
  }

  return translation;
}

/**
 * Create a translation function for specific locale
 */
export function createTranslator(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string>) =>
    getTranslation(locale, key, params);
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return ['en', 'uk'];
}

/**
 * Check if locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return getAvailableLocales().includes(locale as Locale);
}

/**
 * Get default locale
 */
export function getDefaultLocale(): Locale {
  return 'uk';
}
