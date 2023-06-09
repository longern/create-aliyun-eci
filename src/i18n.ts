import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import resources from "./trans-resources.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    detection: { order: ["navigator"] },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
