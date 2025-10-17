import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";

/**
 * Initialize i18next for the app.
 * - Reads saved language from localStorage (key: 'i18nextLng').
 * - Falls back to 'en' when not set.
 * - To add a language: add JSON under /locales/<lang>/translation.json and add it to resources.
 */
const saved = (typeof localStorage !== "undefined" && localStorage.getItem("i18nextLng")) || null;
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: saved || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// persist language changes
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("i18nextLng", lng);
  } catch {}
});

export default i18n;