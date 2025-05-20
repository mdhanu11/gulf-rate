import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Import translations
import enTranslation from "../locales/en/translation.json";
import arTranslation from "../locales/ar/translation.json";
import hiTranslation from "../locales/hi/translation.json";
import urTranslation from "../locales/ur/translation.json";
import bnTranslation from "../locales/bn/translation.json";
import neTranslation from "../locales/ne/translation.json";
import tlTranslation from "../locales/tl/translation.json";
import mlTranslation from "../locales/ml/translation.json";
import taTranslation from "../locales/ta/translation.json";

// Map of language codes to directions
export const languageDirections: Record<string, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
  hi: "ltr",
  ur: "rtl",
  bn: "ltr",
  ne: "ltr",
  tl: "ltr",
  ml: "ltr",
  ta: "ltr",
};

// Map of language codes to font families
export const languageFonts: Record<string, string> = {
  en: "font-roboto",
  ar: "font-arabic",
  hi: "font-noto",
  ur: "font-noto",
  bn: "font-noto",
  ne: "font-noto",
  tl: "font-roboto",
  ml: "font-noto",
  ta: "font-noto",
};

// Language names in their native script
export const languageNames: Record<string, string> = {
  en: "English",
  ar: "العربية",
  hi: "हिन्दी",
  ur: "اردو",
  bn: "বাংলা",
  ne: "नेपाली",
  tl: "Tagalog",
  ml: "മലയാളം",
  ta: "தமிழ்",
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
      hi: { translation: hiTranslation },
      ur: { translation: urTranslation },
      bn: { translation: bnTranslation },
      ne: { translation: neTranslation },
      tl: { translation: tlTranslation },
      ml: { translation: mlTranslation },
      ta: { translation: taTranslation },
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lang",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage", "cookie"],
    }
  });

// Function to update HTML dir attribute when language changes
export const handleLanguageChange = (language: string) => {
  const dir = languageDirections[language] || "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  
  // Apply appropriate font class
  // Keep existing classes but replace only font classes
  const existingClasses = document.body.className.split(' ').filter(cls => !cls.startsWith('font-'));
  const newFontClass = languageFonts[language] || "font-roboto";
  document.body.className = [...existingClasses, newFontClass].join(' ');
  
  // Set cookie for server-side rendering
  document.cookie = `i18next=${language}; path=/; max-age=31536000`;
};

// Subscribe to language changes
i18n.on("languageChanged", handleLanguageChange);

// Set initial direction
handleLanguageChange(i18n.language);

export default i18n;
