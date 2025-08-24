'use client';

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

// Initialize i18n with empty resources initially
// Resources will be loaded when components mount
i18n.use(initReactI18next).init({
  resources: {
    en: { common: {} },
    id: { common: {} },
  },
  lng: 'id', // default language
  fallbackLng: 'id',
  debug: process.env.NODE_ENV === 'development',

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  ns: ['common'],
  defaultNS: 'common',
});

// Types for translations
type TranslationResource = Record<string, unknown>;
type Translations = {
  en: TranslationResource;
  id: TranslationResource;
};

// Function to load translation resources
export const loadTranslations = async (): Promise<Translations> => {
  const [enCommon, idCommon] = await Promise.all([
    fetch('/locales/en/common.json').then((res) => {
      if (!res.ok)
        throw new Error(`Failed to load EN translations: ${res.status}`);
      return res.json();
    }),
    fetch('/locales/id/common.json').then((res) => {
      if (!res.ok)
        throw new Error(`Failed to load ID translations: ${res.status}`);
      return res.json();
    }),
  ]);

  return { en: enCommon, id: idCommon };
};

// Function to add translations to i18n
export const addTranslationsToI18n = (translations: Translations) => {
  i18n.addResourceBundle('en', 'common', translations.en, true, true);
  i18n.addResourceBundle('id', 'common', translations.id, true, true);
};

export { useTranslation };
export default i18n;
