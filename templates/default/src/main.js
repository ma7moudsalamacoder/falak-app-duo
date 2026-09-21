import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import App from "./App.vue";
import router from "./router";
import i18n, { initLocale } from "./i18n";
import { initTheme } from "./theme";
import { ready } from "./storage";
import "./assets/main.css";

// Hydrate the IndexedDB store before mounting: the theme, locale and auth
// token are read synchronously from its in-memory mirror, so this guarantees
// the first paint has the right theme/language. The `theme-loading` class
// (set in index.html) keeps the page hidden until now to avoid any flash.
async function bootstrap() {
  await ready();
  initTheme();
  await initLocale();
  document.documentElement.classList.remove("theme-loading");

  const app = createApp(App);

  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        cssLayer: false,
      },
    },
  });
  app.use(createPinia());
  app.use(router);
  app.use(i18n);

  app.mount("#app");
}

bootstrap();
