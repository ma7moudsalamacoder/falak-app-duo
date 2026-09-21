<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import { authenticator } from "otplib";
import QRCode from "qrcode";

defineOptions({ name: "TwoFactorDialog" });

const { t } = useI18n();
const auth = useAuthStore();

const enabled = ref(auth.user?.two_factor_enabled ?? false);
const methods = ref(auth.user?.two_factor_methods ?? []);
const secret = ref(auth.user?.two_factor_secret ?? "");
const challenge = ref(auth.user?.two_factor_challenge ?? false);
const recoveryCodes = ref(auth.user?.two_factor_recovery_codes ?? fallbackCodes());
const qrDataUrl = ref("");
const code = ref("");
const error = ref("");
const info = ref("");
const busy = ref(false);

// Delivery options derived from the profile's communication channel:
// Telegram only works when Telegram is the channel AND a chat ID is set;
// WhatsApp requires WhatsApp as the channel and a phone number.
const telegramReady = computed(
  () => (auth.user?.channel || "none") === "telegram" && Boolean(auth.user?.telegram?.chat_id)
);
const whatsappReady = computed(
  () => (auth.user?.channel || "none") === "whatsapp" && Boolean(auth.user?.phone)
);

const choices = computed(() => {
  const list = [
    { key: "recovery_codes", default: true },
    { key: "email", default: true },
    { key: "authenticator", default: true },
  ];
  if (telegramReady.value) list.push({ key: "telegram", default: true });
  if (whatsappReady.value) list.push({ key: "whatsapp", default: true });
  return list;
});

const selected = ref(choices.value.map((c) => c.key));

function toggleChoice(key) {
  if (selected.value.includes(key)) selected.value = selected.value.filter((k) => k !== key);
  else selected.value = [...selected.value, key];
}

function labelFor(key) {
  const map = {
    recovery_codes: "twoFactor.methodRecovery",
    email: "twoFactor.methodEmail",
    authenticator: "twoFactor.methodApp",
    telegram: "twoFactor.methodTelegram",
    whatsapp: "twoFactor.methodWhatsapp",
  };
  return t(map[key] || "twoFactor.methodApp");
}

function fallbackCodes() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes = new Set();
  while (codes.size < 10) {
    let build = "";
    for (let i = 0; i < 4; i++) build += chars[Math.floor(Math.random() * chars.length)];
    build += "-";
    for (let i = 0; i < 4; i++) build += chars[Math.floor(Math.random() * chars.length)];
    codes.add(build);
  }
  return [...codes];
}

async function buildQr() {
  qrDataUrl.value = "";
  const normalized = (secret.value || authenticator.generateSecret()).replace(/\s+/g, "");
  const account = auth.user?.email || "user";
  const otpauth = authenticator.keyuri(account, "Falak", normalized);
  try {
    qrDataUrl.value = await QRCode.toDataURL(otpauth, {
      margin: 1,
      width: 176,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0f16", light: "#ffffff" },
    });
  } catch {
    qrDataUrl.value = "";
  }
}

async function enable() {
  error.value = "";
  info.value = "";
  busy.value = true;
  try {
    const data = await auth.enable2FA(selected.value);
    secret.value = data.secret || auth.user?.two_factor_secret || "";
    challenge.value = data.challenge ?? true;
    if (Array.isArray(data.recoveryCodes)) recoveryCodes.value = data.recoveryCodes;
    methods.value = data.methods || selected.value;
    info.value = t("twoFactor.enterCode");
    await buildQr();
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
    const user = await auth.verify2FA(code.value);
    enabled.value = true;
    challenge.value = false;
    methods.value = user.two_factor_methods || methods.value;
    recoveryCodes.value = user.two_factor_recovery_codes || recoveryCodes.value;
    info.value = t("twoFactor.enabled");
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
    const user = await auth.disable2FA(code.value);
    enabled.value = false;
    info.value = t("twoFactor.disabled");
    code.value = "";
    methods.value = user.two_factor_methods || [];
    recoveryCodes.value = user.two_factor_recovery_codes || [];
    secret.value = "";
    challenge.value = false;
    qrDataUrl.value = "";
  } catch (e) {
    error.value = t("twoFactor.error");
  } finally {
    busy.value = false;
  }
}

function downloadCodes() {
  const blob = new Blob([recoveryCodes.value.join("\n")], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "falak-2fa-recovery-codes.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>

<template>
  <GlassCard spotlight class="p-4 sm:p-6">
    <!-- Status -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-ink2">{{ t("twoFactor.status") }}</p>
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
      <span class="relative hidden h-14 w-14 sm:block rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 ring-1 ring-edge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="absolute inset-0 m-auto h-7 w-7 text-emerald-300">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1.5" />
        </svg>
      </span>
    </div>

    <div class="mt-5 h-px bg-gradient-to-r from-transparent via-edge2 to-transparent"></div>

    <!-- Enabled: active methods, recovery codes + download, disable -->
    <div v-if="enabled" class="mt-5 flex flex-col gap-5">
      <div v-if="methods.length">
        <p class="field-label">{{ t("twoFactor.methodsTitle") }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="m in methods"
            :key="m"
            class="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            {{ labelFor(m) }}
          </span>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between gap-3">
          <p class="field-label">{{ t("twoFactor.codesTitle") }}</p>
          <button type="button" class="btn-ghost !px-3 !py-1.5 text-xs" @click="downloadCodes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1 inline h-3.5 w-3.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {{ t("twoFactor.downloadCodes") }}
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <code
            v-for="c in recoveryCodes"
            :key="c"
            class="select-all rounded-lg border border-edge bg-glass px-3 py-2 text-center font-mono text-xs tracking-widest text-emerald-300"
          >{{ c }}</code>
        </div>
        <p class="mt-2 text-xs text-mute">{{ t("twoFactor.codesHint") }}</p>
      </div>

      <div>
        <p class="field-label">{{ t("twoFactor.disableHint") }}</p>
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
    </div>

    <!-- Disabled: choose methods, then verify -->
    <div v-else class="mt-5">
      <p class="field-label">{{ t("twoFactor.method") }}</p>
      <div class="flex flex-col gap-2.5">
        <button
          v-for="c in choices"
          :key="c.key"
          type="button"
          role="checkbox"
          :aria-checked="selected.includes(c.key)"
          class="flex items-start gap-3 rounded-xl border p-4 text-start text-sm transition"
          :class="selected.includes(c.key) ? 'border-emerald-300/50 bg-emerald-500/15 shadow-lg shadow-emerald-500/10' : 'border-edge bg-glass hover:bg-glass2'"
          @click="toggleChoice(c.key)"
        >
          <span
            class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition"
            :class="selected.includes(c.key) ? 'border-emerald-400/60 bg-emerald-500/20' : 'border-edge2 bg-glass'"
          >
            <svg v-if="selected.includes(c.key)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-emerald-300">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span class="min-w-0">
            <span class="flex flex-wrap items-center gap-2 font-medium" :class="selected.includes(c.key) ? 'text-emerald-200' : 'text-ink2'">
              {{ labelFor(c.key) }}
              <span v-if="c.default" class="rounded-full bg-glass3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mute">
                {{ t("twoFactor.default") }}
              </span>
            </span>
            <span class="mt-0.5 block text-xs text-mute">{{ t(`twoFactor.methodDesc.${c.key}`) }}</span>
          </span>
        </button>
      </div>
      <p v-if="!telegramReady && !whatsappReady" class="mt-2 text-xs text-mute">{{ t("twoFactor.channelNote") }}</p>

      <span v-if="challenge" class="mt-5 block">
        <!-- Pending challenge: QR + secret, recovery codes, code input -->
        <div class="rounded-xl border border-emerald-300/20 bg-glass p-4">
          <div v-if="selected.includes('authenticator')" class="mx-auto text-center">
            <p class="text-sm font-medium text-ink2">{{ t("twoFactor.qrLabel") }}</p>
            <div class="mt-3 inline-block rounded-2xl bg-white p-3 shadow-lg shadow-emerald-500/10">
              <img v-if="qrDataUrl" :src="qrDataUrl" alt="2FA QR code" class="h-40 w-40" />
              <span v-else class="grid h-40 w-40 place-items-center text-xs text-mute">{{ t("common.loading") }}</span>
            </div>
            <p class="mt-3 text-xs text-mute">{{ t("twoFactor.secretHint") }}</p>
            <code class="mt-1 block select-all font-mono text-xs tracking-[0.2em] text-emerald-300">{{ secret }}</code>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between gap-3">
              <p class="field-label">{{ t("twoFactor.codesTitle") }}</p>
              <button type="button" class="btn-ghost !px-3 !py-1.5 text-xs" @click="downloadCodes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1 inline h-3.5 w-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                {{ t("twoFactor.downloadCodes") }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <code
                v-for="c in recoveryCodes"
                :key="c"
                class="select-all rounded-lg border border-edge bg-glass px-3 py-2 text-center font-mono text-xs tracking-widest text-emerald-300"
              >{{ c }}</code>
            </div>
            <p class="mt-2 text-xs text-mute">{{ t("twoFactor.codesHint") }}</p>
          </div>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
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
      </span>

      <button v-else type="button" class="btn-primary mt-5 btn-ripple" :disabled="busy || !selected.length" @click="enable">
        {{ t("twoFactor.enable") }}
      </button>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
    <p v-if="info" class="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{{ info }}</p>
  </GlassCard>
</template>