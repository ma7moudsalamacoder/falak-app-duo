// Light/dark theme. Dark is the default (no class); light adds `.light` on
// <html> (tokens in assets/main.css flip). Choice persists in localStorage;
// before any stored choice we follow the OS preference. The tiny duplicated
// logic in index.html <head> runs first to avoid a flash of the wrong theme.
const KEY = "falak_theme";

export function getTheme() {
  const stored = localStorage.getItem(KEY);
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
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const next = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}