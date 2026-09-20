<script setup>
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const auth = useAuthStore();
</script>

<template>
  <div class="max-w-2xl mx-auto text-center py-16">
    <h1 class="text-3xl font-bold mb-4">{{ t("home.welcome") }}</h1>
    <p v-if="auth.userToken" class="text-gray-600">
      {{ auth.user?.name || auth.userToken.slice(0, 12) + "..." }}
    </p>
  </div>
</template>
