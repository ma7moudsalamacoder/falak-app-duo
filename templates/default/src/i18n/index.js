import { createI18n } from "vue-i18n";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";

export const SUPPORTED_LOCALES = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
  { code: "it", label: "Italiano" },
];

const STORAGE_KEY = "falak_locale";
const stored = localStorage.getItem(STORAGE_KEY);
const savedLocale = SUPPORTED_LOCALES.some((l) => l.code === stored) ? stored : "ar";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: { ar, de, en, es, fr, it, ru },
});

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

// Apply on load
setLocale(savedLocale);

export default i18n;