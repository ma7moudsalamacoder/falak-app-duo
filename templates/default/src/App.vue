<script setup>
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n";
import { useAuthStore } from "@/stores/auth";
import { RouterLink, RouterView } from "vue-router";

const { t, locale } = useI18n();
const auth = useAuthStore();

function toggleLocale() {
  setLocale(locale.value === "ar" ? "en" : "ar");
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <nav class="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <span class="font-bold text-lg">{{ t("app.name") }}</span>
      <div class="flex items-center gap-4">
        <RouterLink to="/" class="hover:underline">{{ t("nav.home") }}</RouterLink>
        <RouterLink v-if="!auth.userToken" to="/login" class="hover:underline">{{
          t("nav.login")
        }}</RouterLink>
        <button v-else @click="auth.logout()" class="text-sm text-red-600 hover:underline">
          {{ t("nav.login") === "Login" ? "Logout" : "خروج" }}
        </button>
        <button @click="toggleLocale" class="text-sm px-2 py-1 border rounded">
          {{ locale === "ar" ? "EN" : "AR" }}
        </button>
      </div>
    </nav>
    <main class="p-6">
      <RouterView />
    </main>
  </div>
</template>
