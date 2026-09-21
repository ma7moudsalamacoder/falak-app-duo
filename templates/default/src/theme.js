// Light/dark theme. Dark is the default (no class); light adds `.light` on
// <html> (tokens in assets/main.css flip). The choice persists in IndexedDB
// (src/storage.js); before any stored choice we follow the OS preference.
// main.js awaits storage.ready() before initTheme(), so getSync() sees the
// persisted value; index.html keeps the page hidden until then to avoid a flash
// of the wrong theme.
import storage from "@/storage";

const KEY = "falak_theme";

export function getTheme() {
  const stored = storage.getSync(KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

export function initTheme() {
  applyTheme(getTheme());
}

export function setTheme(theme) {
  storage.set(KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const next = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}
