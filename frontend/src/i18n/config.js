import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './en.json';
import translationAR from './ar.json';

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Helper to determine normalized language
const getNormalizedLang = (lng) => {
  if (!lng) return 'en';
  return lng.startsWith('ar') ? 'ar' : 'en';
};

// Initialize HTML lang & dir
const initialLang = getNormalizedLang(i18n.language);
document.documentElement.lang = initialLang;
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';

i18n.on('languageChanged', (lng) => {
  const normalized = getNormalizedLang(lng);
  document.documentElement.lang = normalized;
  document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;
