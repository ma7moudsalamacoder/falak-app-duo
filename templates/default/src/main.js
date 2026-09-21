import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import "./assets/main.css";

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
