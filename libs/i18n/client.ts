'use client';

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import enCommon from './locales/en/common.json';
import idCommon from './locales/id/common.json';

// Initialize i18n with empty resources initially
// Resources will be loaded when components mount
i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    id: { common: idCommon },
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

export { useTranslation };
export default i18n;
