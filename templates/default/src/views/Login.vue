<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push({ name: "home" });
  } catch (e) {
    error.value = t("auth.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="max-w-sm mx-auto flex flex-col gap-4">
    <label class="flex flex-col gap-1">
      <span>{{ t("auth.email") }}</span>
      <input v-model="email" type="email" required class="border rounded px-3 py-2" />
    </label>
    <label class="flex flex-col gap-1">
      <span>{{ t("auth.password") }}</span>
      <input v-model="password" type="password" required class="border rounded px-3 py-2" />
    </label>
    <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
    <button
      type="submit"
      :disabled="loading"
      class="bg-gray-900 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      {{ t("auth.submit") }}
    </button>
  </form>
</template>
