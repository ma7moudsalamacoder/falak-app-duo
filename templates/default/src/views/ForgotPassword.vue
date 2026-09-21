<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/components/AuthLayout.vue";
import { useRipple } from "@/composables/useRipple";

const { t } = useI18n();
const auth = useAuthStore();

const identifier = ref("");
const error = ref("");
const loading = ref(false);
const sent = ref(false);

const { ripples, spawnRipple, removeRipple } = useRipple();

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.forgotPassword(identifier.value.trim());
    sent.value = true;
  } catch (e) {
    error.value = t("recover.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout :title="t('recover.title')" :subtitle="t('recover.subtitle')">
    <div v-if="sent" class="animate-fade-in-up motion-reduce:animate-none">
      <div
        class="relative mb-6 overflow-hidden rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-5 text-sm text-emerald-200"
      >
        <div class="flex items-center gap-3">
          <span
            class="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-lg shadow-emerald-500/30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <p class="font-semibold text-ink">{{ t("recover.sentTitle") }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-emerald-200">{{ t("recover.sent") }}</p>
          </div>
        </div>
        <div class="pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl"></div>
      </div>
      <RouterLink to="/login" class="btn-primary w-full">
        {{ t("recover.backToLogin") }}
      </RouterLink>
    </div>

    <form v-else @submit.prevent="submit" class="flex flex-col gap-4">
      <div
        class="mb-1 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 ring-1 ring-amber-300/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7 text-amber-300">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <label class="block">
        <span class="field-label">{{ t("recover.identifier") }}</span>
        <input
          v-model="identifier"
          type="text"
          required
          :placeholder="t('recover.identifierPlaceholder')"
          class="glass-input"
          autocomplete="username"
        />
        <span class="field-hint">{{ t("recover.identifierHint") }}</span>
      </label>

      <p v-if="error" class="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
        {{ error }}
      </p>

      <button
        type="submit"
        class="btn-primary btn-ripple w-full"
        @click="spawnRipple"
        :disabled="loading"
      >
        <span
          v-for="r in ripples"
          :key="r.id"
          class="ripple"
          :style="{ left: r.x + 'px', top: r.y + 'px', width: r.size + 'px', height: r.size + 'px' }"
          @animationend="removeRipple(r.id)"
        ></span>
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        <span>{{ loading ? t("common.pleaseWait") : t("recover.submit") }}</span>
      </button>

      <RouterLink
        to="/login"
        class="mt-2 text-center text-sm text-mute transition hover:text-ink2"
      >
        {{ t("recover.backToLogin") }}
      </RouterLink>
    </form>
  </AuthLayout>
</template>