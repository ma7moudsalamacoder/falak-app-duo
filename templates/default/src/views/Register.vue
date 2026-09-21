<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/components/AuthLayout.vue";
import SocialIcon from "@/components/SocialIcon.vue";
import { useRipple } from "@/composables/useRipple";
import { ROLES } from "@/data/roles";

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirm = ref("");
const showPassword = ref(false);
const error = ref("");
const loading = ref(false);
const socialBusy = ref("");
// When UserRole support is on, new accounts carry a role; ROLES is empty when
// the feature was not picked at scaffold time.
const role = ref(ROLES[0]?.key || "");

const { ripples, spawnRipple, removeRipple } = useRipple();

const strength = computed(() => {
  let score = 0;
  const p = password.value;
  if (!p) return 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});
const strengthLabel = computed(() => t(`register.strength.${strength.value}`));
const strengthColor = computed(() => ["", "bg-rose-400", "bg-amber-400", "bg-teal-400", "bg-emerald-400"][strength.value]);
const strengthBar = computed(() => `${strength.value / 4 * 100}%`);

async function submit() {
  error.value = "";
  if (password.value !== confirm.value) {
    error.value = t("register.mismatch");
    return;
  }
  loading.value = true;
  try {
    const payload = {
      name: name.value,
      identifier: email.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value,
      locale: locale.value,
    };
    if (ROLES.length) payload.role = role.value;
    await auth.register(payload);
    router.push({ name: "home" });
  } catch (e) {
    error.value = t("register.error");
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
  <AuthLayout :title="t('register.title')" :subtitle="t('register.subtitle')">
    <!-- Social signup -->
    <div class="grid gap-3">
      <button
        type="button"
        class="flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 backdrop-blur transition-all duration-200 hover:border-emerald-300/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!!socialBusy"
        @click="social('google')"
      >
        <SocialIcon provider="google" />
        <span>{{ socialBusy === "google" ? t("common.loading") : t("register.socialGoogle") }}</span>
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 backdrop-blur transition-all duration-200 hover:border-sky-300/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!!socialBusy"
        @click="social('facebook')"
      >
        <SocialIcon provider="facebook" />
        <span>{{ socialBusy === "facebook" ? t("common.loading") : t("register.socialFacebook") }}</span>
      </button>
    </div>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></span>
      <span class="text-xs tracking-wide text-gray-500">{{ t("auth.or") }}</span>
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></span>
    </div>

    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <label class="block">
        <span class="field-label">{{ t("register.name") }}</span>
        <input
          v-model="name"
          type="text"
          required
          :placeholder="t('register.namePlaceholder')"
          class="glass-input"
          autocomplete="name"
        />
      </label>

      <label v-if="ROLES.length > 1" class="block">
        <span class="field-label">{{ t("register.role") }}</span>
        <select v-model="role" class="glass-select">
          <option v-for="r in ROLES" :key="r.key" :value="r.key">
            {{ t(r.label) }}
          </option>
        </select>
      </label>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="field-label">{{ t("register.email") }}</span>
          <input
            v-model="email"
            type="email"
            required
            :placeholder="t('register.emailPlaceholder')"
            class="glass-input"
            autocomplete="email"
          />
        </label>
        <label class="block">
          <span class="field-label">{{ t("register.phone") }}</span>
          <input
            v-model="phone"
            type="tel"
            :placeholder="t('register.phonePlaceholder')"
            class="glass-input"
            autocomplete="tel"
          />
          <span class="field-hint">{{ t("register.phoneHint") }}</span>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="field-label">{{ t("register.password") }}</span>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              :placeholder="t('register.passwordPlaceholder')"
              class="glass-input pe-11"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-200"
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
          <span v-if="password" class="mt-2 block">
            <span class="flex gap-1">
              <span v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full bg-white/10">
                <span
                  class="block h-full rounded-full transition-all duration-300"
                  :style="{ width: i <= strength ? '100%' : '0%', background: strengthColor }"
                ></span>
              </span>
            </span>
            <span class="mt-1 block text-xs" :class="strength >= 3 ? 'text-emerald-300' : strength >= 2 ? 'text-amber-300' : 'text-rose-300'">
              {{ strengthLabel }}
            </span>
          </span>
        </label>
        <label class="block">
          <span class="field-label">{{ t("register.confirm") }}</span>
          <input
            v-model="confirm"
            type="password"
            required
            minlength="8"
            :placeholder="t('register.confirmPlaceholder')"
            class="glass-input"
            autocomplete="new-password"
          />
        </label>
      </div>

      <p v-if="error" class="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
        {{ error }}
      </p>

      <button
        type="submit"
        class="btn-ripple relative isolate rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50 bg-[length:200%_200%] animate-gradient-pan motion-reduce:animate-none"
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
        <span>{{ loading ? t("common.pleaseWait") : t("register.submit") }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-400">
      {{ t("register.haveAccount") }}
      <RouterLink
        to="/login"
        class="font-semibold text-emerald-300 transition hover:text-emerald-200"
      >
        {{ t("register.loginLink") }}
      </RouterLink>
    </p>
  </AuthLayout>
</template>