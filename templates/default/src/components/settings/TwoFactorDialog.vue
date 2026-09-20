<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";

defineOptions({ name: "TwoFactorDialog" });

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user;

const enabled = ref(user?.two_factor_enabled ?? false);
const method = ref(user?.two_factor_method ?? "app"); // 'app' | 'sms'
const secret = ref(user?.two_factor_secret ?? "");
const challenge = ref(user?.two_factor_challenge ?? "");
const code = ref("");
const error = ref("");
const info = ref("");
const busy = ref(false);

const recoveryCodes = ref(user?.two_factor_recovery_codes ?? ["F5K2-M9Q1", "A7J3-P8T4", "C2N6-R3V7", "K9H4-X2L8", "M3B8-D1S5", "T6G5-Z7A9"]);

async function enable() {
  error.value = "";
  info.value = "";
  busy.value = true;
  try {
    const data = await auth.enable2FA(method.value);
    secret.value = data.secret || "";
    challenge.value = data.challenge || "";
    info.value = t("twoFactor.enterCode");
  } catch (e) {
    error.value = t("twoFactor.error");
  } finally {
    busy.value = false;
  }
}

async function confirm() {
  error.value = "";
  busy.value = true;
  try {
    await auth.verify2FA(code.value);
    enabled.value = true;
    info.value = t("twoFactor.enabled");
    challenge.value = "";
  } catch (e) {
    error.value = t("twoFactor.error");
  } finally {
    busy.value = false;
  }
}

async function disable() {
  error.value = "";
  busy.value = true;
  try {
    await auth.disable2FA(code.value);
    enabled.value = false;
    info.value = t("twoFactor.disabled");
    code.value = "";
  } catch (e) {
    error.value = t("twoFactor.error");
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <GlassCard spotlight class="p-4 sm:p-6">
    <!-- Status -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-gray-200">{{ t("twoFactor.status") }}</p>
        <p
          class="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          :class="enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'"
        >
          <span class="relative inline-flex h-1.5 w-1.5">
            <span v-if="enabled" class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full" :class="enabled ? 'bg-emerald-400' : 'bg-amber-400'"></span>
          </span>
          {{ enabled ? t("twoFactor.on") : t("twoFactor.off") }}
        </p>
      </div>
      <span class="relative hidden h-14 w-14 sm:block rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="absolute inset-0 m-auto h-7 w-7 text-emerald-300">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1.5" />
        </svg>
      </span>
    </div>

    <div class="mt-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

    <!-- Disable form + recovery codes -->
    <div v-if="enabled" class="mt-5">
      <p class="field-label">{{ t("twoFactor.codesTitle") }}</p>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <code
          v-for="c in recoveryCodes"
          :key="c"
          class="select-all rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center font-mono text-xs tracking-widest text-emerald-300"
        >{{ c }}</code>
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ t("twoFactor.codesHint") }}</p>

      <p class="field-label mt-5">{{ t("twoFactor.disableHint") }}</p>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="glass-input sm:max-w-[180px]"
          :placeholder="t('twoFactor.codePlaceholder')"
        />
        <button type="button" class="btn-ghost !border-rose-400/30 !text-rose-300 hover:!bg-rose-500/10" :disabled="busy" @click="disable">
          {{ t("twoFactor.disable") }}
        </button>
      </div>
    </div>

    <!-- Enable flow -->
    <div v-else class="mt-5">
      <p class="field-label">{{ t("twoFactor.method") }}</p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition"
          :class="method === 'app' ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/10' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'"
          @click="method = 'app'"
        >
          <span class="grid h-9 w-9 place-items-center rounded-lg" :class="method === 'app' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-gray-500'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M12 9v6M9 12h6" />
            </svg>
          </span>
          <span>{{ t("twoFactor.methodApp") }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition"
          :class="method === 'sms' ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/10' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'"
          @click="method = 'sms'"
        >
          <span class="grid h-9 w-9 place-items-center rounded-lg" :class="method === 'sms' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-gray-500'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span>{{ t("twoFactor.methodSms") }}</span>
        </button>
      </div>

      <!-- Pending challenge -->
      <div v-if="challenge" class="mt-5 rounded-xl border border-emerald-300/20 bg-white/[0.03] p-4">
        <p class="text-sm font-medium text-gray-200">
          {{ secret ? t("twoFactor.secretLabel") : t("twoFactor.pendingLabel") }}
        </p>
        <code v-if="secret" class="mt-2 block select-all rounded-lg border border-white/10 bg-[#0d1520] px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-emerald-300">
          {{ secret }}
        </code>
        <p v-if="secret" class="mt-2 text-xs text-gray-500">{{ t("twoFactor.secretHint") }}</p>
        <div class="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            class="glass-input sm:max-w-[180px]"
            :placeholder="t('twoFactor.codePlaceholder')"
          />
          <button type="button" class="btn-primary" :disabled="busy" @click="confirm">
            {{ t("twoFactor.confirm") }}
          </button>
        </div>
      </div>

      <button v-else type="button" class="btn-primary mt-5 btn-ripple" :disabled="busy" @click="enable">
        {{ t("twoFactor.enable") }}
      </button>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
    <p v-if="info" class="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{{ info }}</p>
  </GlassCard>
</template>