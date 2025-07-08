import { createTranslator, type Locale, type TranslationKey, isValidLocale, getDefaultLocale } from './translations';

/**
 * Get translations for server components
 */
export function getServerTranslations(locale: string) {
  const validLocale: Locale = isValidLocale(locale) ? locale : getDefaultLocale();
  
  const t = (key: TranslationKey, params?: Record<string, string>) => {
    return createTranslator(validLocale)(key, params);
  };

  return { t, locale: validLocale };
}
