<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { setLocale, SUPPORTED_LOCALES } from "@/i18n";
import { useAuthStore } from "@/stores/auth";
import { getTheme, toggleTheme } from "@/theme";
import AppBackdrop from "@/components/AppBackdrop.vue";

const { t, locale } = useI18n();
const locales = SUPPORTED_LOCALES;
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const theme = ref(getTheme());

// Auth pages hide the app chrome and go full-screen.
const authPageNames = ["login", "register", "forgot-password"];
const isAuthPage = computed(() => authPageNames.includes(route.name));

const links = computed(() => [
  { to: "/profile", label: t("nav.profile") },
  { to: "/settings", label: t("nav.settings") },
]);

async function logout() {
  await auth.logout();
  router.push({ name: "home" });
}
</script>

<template>
  <div class="relative min-h-screen">
    <AppBackdrop />

    <div class="relative z-10 flex min-h-screen flex-col">
      <header
        v-if="!isAuthPage"
        class="sticky top-0 z-30 border-b border-edge bg-page/70 backdrop-blur-xl"
      >
        <nav class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <RouterLink to="/" class="group flex items-center gap-2.5">
            <span
              class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-black text-emerald-950 shadow-lg shadow-emerald-500/20 transition group-hover:shadow-emerald-400/40"
            >
              F
            </span>
            <span class="text-lg font-bold text-ink">{{ t("app.name") }}</span>
          </RouterLink>

          <div class="flex flex-1 flex-wrap items-center justify-end gap-1.5 text-sm">
            <RouterLink
              to="/"
              class="rounded-full px-3 py-1.5 font-medium transition"
              :class="route.name === 'home' ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/30' : 'text-ink2 hover:bg-glass hover:text-ink'"
            >
              {{ t("nav.home") }}
            </RouterLink>
            <template v-if="auth.userToken">
              <RouterLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="rounded-full px-3 py-1.5 font-medium transition"
                :class="route.path === link.to ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/30' : 'text-ink2 hover:bg-glass hover:text-ink'"
              >
                {{ link.label }}
              </RouterLink>
            </template>
          </div>

          <div class="flex items-center gap-2.5">
            <button
              type="button"
              :title="t(theme === 'light' ? 'theme.light' : 'theme.dark')"
              :aria-label="t(theme === 'light' ? 'theme.light' : 'theme.dark')"
              class="grid h-9 w-9 place-items-center rounded-full border border-edge2 bg-glass text-ink2 transition hover:bg-glass3 hover:text-ink"
              @click="theme = toggleTheme()"
            >
              <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4.5 w-4.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4.5 w-4.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            </button>
            <RouterLink
              v-if="!auth.userToken"
              to="/login"
              class="btn-primary !px-4 !py-2"
            >
              {{ t("nav.login") }}
            </RouterLink>
            <button v-else @click="logout" class="btn-ghost !px-4 !py-2 !text-rose-300 hover:!bg-rose-500/10 hover:!text-rose-200">
              {{ t("nav.logout") }}
            </button>
            <select
              v-if="locales.length > 1"
              :value="locale"
              @change="setLocale($event.target.value)"
              class="rounded-full border border-edge2 bg-glass px-2.5 py-1.5 text-sm font-medium text-ink2 outline-none transition hover:bg-glass3 hover:text-ink"
            >
              <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </div>
        </nav>
      </header>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>