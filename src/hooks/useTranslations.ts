import { useParams } from 'next/navigation';
import { createTranslator, type Locale, type TranslationKey, isValidLocale, getDefaultLocale } from '@/utils/translations';

/**
 * Hook for using translations in components
 */
export function useTranslations() {
  const params = useParams();
  const localeParam = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const locale = localeParam && isValidLocale(localeParam) ? localeParam : getDefaultLocale();
  
  const t = (key: TranslationKey, params?: Record<string, string>) => {
    return createTranslator(locale)(key, params);
  };

  return { t, locale };
}
