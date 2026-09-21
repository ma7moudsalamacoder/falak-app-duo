import { createI18n } from "vue-i18n";
import storage from "@/storage";
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

const i18n = createI18n({
  legacy: false,
  locale: "ar",
  fallbackLocale: "en",
  messages: { ar, de, en, es, fr, it, ru },
});

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  storage.set(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

// Apply the persisted locale (falling back to the default) once storage is
// ready. main.js awaits this before mounting so the first paint is correct.
export async function initLocale() {
  const stored = await storage.get(STORAGE_KEY);
  const saved = SUPPORTED_LOCALES.some((l) => l.code === stored) ? stored : "ar";
  setLocale(saved);
}

export default i18n;
