<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/components/AuthLayout.vue";
import SocialIcon from "@/components/SocialIcon.vue";
import { useRipple } from "@/composables/useRipple";
import { isDemoMode, client } from "@/services/dataClient";
import storage from "@/storage";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const REMEMBER_KEY = "falak_remember_identifier";

const mode = ref("email"); // 'email' | 'phone'
const identifier = ref("");
const password = ref("");
const remember = ref(false);
const showPassword = ref(false);
const error = ref("");
const loading = ref(false);
const socialBusy = ref("");

const { ripples, spawnRipple, removeRipple } = useRipple();

// In demo mode, surface a ready-to-use account (from demoAccounts / demo data)
// so the login flow can be exercised without a backend.
const demoHint = ref(null);
onMounted(async () => {
  if (!isDemoMode) return;
  try {
    const { data } = await client.get("/overview");
    demoHint.value = data.signInHint || null;
  } catch {
    demoHint.value = null;
  }
});

const savedIdentifier = storage.getSync(REMEMBER_KEY, "") || "";
if (savedIdentifier) {
  identifier.value = savedIdentifier;
  remember.value = true;
  mode.value = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(savedIdentifier) ? "email" : "phone";
}

watch(remember, (on) => {
  if (on) storage.set(REMEMBER_KEY, identifier.value);
  else storage.remove(REMEMBER_KEY);
});

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(identifier.value, password.value);
    if (remember.value) storage.set(REMEMBER_KEY, identifier.value);
    else storage.remove(REMEMBER_KEY);
    router.push({ name: "home" });
  } catch (e) {
    error.value = t("auth.loginError");
  } finally {
    loading.value = false;
  }
}

async function social(provider) {
  socialBusy.value = provider;
  error.value = "";
  try {
    await auth.socialLogin(provider);
  } catch (e) {
    error.value = t("auth.socialError");
  } finally {
    socialBusy.value = "";
  }
}
</script>

<template>
  <AuthLayout :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <!-- Email / phone toggle -->
    <div class="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-edge bg-glass p-1">
      <button
        type="button"
        class="rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="mode === 'email' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20' : 'text-mute hover:text-ink2'"
        @click="mode = 'email'"
      >
        {{ t("auth.tabEmail") }}
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="mode === 'phone' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20' : 'text-mute hover:text-ink2'"
        @click="mode = 'phone'"
      >
        {{ t("auth.tabPhone") }}
      </button>
    </div>

    <!-- Social login -->
    <div class="grid gap-3">
      <button
        type="button"
        class="relative isolate overflow-hidden group flex items-center justify-center gap-2.5 rounded-xl border border-edge2 bg-glass px-4 py-2.5 text-sm font-semibold text-ink2 backdrop-blur transition-all duration-200 hover:border-emerald-300/40 hover:bg-glass3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!!socialBusy"
        @click="social('google')"
      >
        <SocialIcon provider="google" />
        <span>{{ socialBusy === "google" ? t("common.loading") : t("auth.social.google") }}</span>
      </button>
      <button
        type="button"
        class="relative flex items-center justify-center gap-2.5 rounded-xl border border-edge2 bg-glass px-4 py-2.5 text-sm font-semibold text-ink2 backdrop-blur transition-all duration-200 hover:border-sky-300/40 hover:bg-glass3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!!socialBusy"
        @click="social('facebook')"
      >
        <SocialIcon provider="facebook" />
        <span>{{ socialBusy === "facebook" ? t("common.loading") : t("auth.social.facebook") }}</span>
      </button>
    </div>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-edge2 to-transparent"></span>
      <span class="text-xs tracking-wide text-mute">{{ t("auth.or") }}</span>
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-edge2 to-transparent"></span>
    </div>

    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <label class="block">
        <span class="field-label">
          {{ mode === "email" ? t("auth.email") : t("auth.phone") }}
        </span>
        <div class="relative">
          <span
            class="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-mute"
            aria-hidden="true"
          >
            <svg v-if="mode === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="7" y="2" width="10" height="20" rx="2.5" />
              <path d="M11 18h2" />
            </svg>
          </span>
          <input
            v-model="identifier"
            :type="mode === 'email' ? 'email' : 'tel'"
            required
            :inputmode="mode === 'email' ? 'email' : 'tel'"
            :placeholder="mode === 'email' ? t('auth.emailPlaceholder') : t('auth.phonePlaceholder')"
            class="glass-input ps-11"
            autocomplete="username"
          />
        </div>
        <span class="field-hint">{{ t("auth.identifierHint") }}</span>
      </label>

      <label class="block">
        <span class="field-label">{{ t("auth.password") }}</span>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            :placeholder="t('auth.passwordPlaceholder')"
            class="glass-input pe-11"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute end-3 top-1/2 -translate-y-1/2 text-mute transition hover:text-ink2"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </label>

      <div class="flex items-center justify-between gap-3 text-sm">
        <label class="flex cursor-pointer items-center gap-2 text-mute">
          <span class="relative">
            <input v-model="remember" type="checkbox" class="peer sr-only" />
            <span class="grid h-5 w-5 place-items-center rounded-md border border-edge2 bg-glass transition peer-checked:border-emerald-400/60 peer-checked:bg-emerald-500/20">
              <svg v-if="remember" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-emerald-300">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </span>
          <span>{{ t("auth.remember") }}</span>
        </label>
        <RouterLink
          to="/forgot-password"
          class="font-medium text-emerald-300 transition hover:text-emerald-200"
        >
          {{ t("auth.forgotPassword") }}
        </RouterLink>
      </div>

      <p v-if="error" class="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
        {{ error }}
      </p>

      <button
        type="submit"
        class="btn-ripple relative isolate rounded-xl px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 before:absolute before:-inset-0.5 before:rounded-xl before:-z-10 before:bg-[conic-gradient(from_var(--tw-border-angle),#10B981,#2DD4BF,#F472B6,#F59E0B,#10B981)] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:animate-border-spin before:motion-reduce:animate-none bg-page2 shadow-xl shadow-emerald-500/10"
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
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"></span>
        <span>{{ loading ? t("common.pleaseWait") : t("auth.login.submit") }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-mute">
      {{ t("auth.noAccount") }}
      <RouterLink
        to="/register"
        class="font-semibold text-emerald-300 transition hover:text-emerald-200"
      >
        {{ t("auth.registerLink") }}
      </RouterLink>
    </p>

    <!-- Demo-mode account hint (bottom of the column, never in live mode) -->
    <div
      v-if="isDemoMode && demoHint"
      class="mt-6 rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm"
    >
      <p class="font-medium text-emerald-200">{{ t("auth.demoHint") }}</p>
      <code class="mt-1 block font-mono text-xs text-emerald-300">
        {{ demoHint.email }} / {{ demoHint.password }}
      </code>
    </div>
  </AuthLayout>
</template>