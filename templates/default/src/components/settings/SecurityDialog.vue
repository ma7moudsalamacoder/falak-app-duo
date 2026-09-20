<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import { useRipple } from "@/composables/useRipple";

defineOptions({ name: "SecurityDialog" });

const emit = defineEmits(["open-two-factor"]);

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user;
const tfaEnabled = computed(() => Boolean(user?.two_factor_enabled));

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");
const saving = ref(false);

const { ripples, spawnRipple, removeRipple } = useRipple();

const strength = computed(() => {
  let score = 0;
  const p = newPassword.value;
  if (!p) return 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});
const strengthLabel = computed(() => t(`register.strength.${strength.value}`));
const strengthColor = computed(() => ["", "bg-rose-400", "bg-amber-400", "bg-teal-400", "bg-emerald-400"][strength.value]);

const sessions = computed(() => [
  { kind: "desktop", name: t("security.sessions.current"), meta: "Chrome · This device", current: true },
  { kind: "phone", name: "OnePlus 12", meta: "Android · Cairo, EG · 2h ago", current: false },
  { kind: "tablet", name: "iPad Air", meta: "iOS · Giza, EG · 3d ago", current: false },
]);

async function changePassword() {
  error.value = "";
  success.value = "";
  if (newPassword.value !== confirmPassword.value) {
    error.value = t("security.mismatch");
    return;
  }
  saving.value = true;
  try {
    await auth.changePassword(currentPassword.value, newPassword.value);
    success.value = t("security.passwordChanged");
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (e) {
    error.value = t("security.passwordError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <GlassCard spotlight class="p-4 sm:p-6">
      <div class="flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-200 ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <div>
          <h2 class="text-base font-semibold text-white">{{ t("security.changePassword.title") }}</h2>
          <p class="mt-0.5 text-sm text-gray-400">{{ t("security.changePassword.hint") }}</p>
        </div>
      </div>

      <form @submit.prevent="changePassword" class="mt-5 flex flex-col gap-4">
        <label class="block">
          <span class="field-label">{{ t("security.currentPassword") }}</span>
          <input
            v-model="currentPassword"
            type="password"
            required
            class="glass-input"
            autocomplete="current-password"
          />
        </label>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="field-label">{{ t("security.newPassword") }}</span>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              class="glass-input"
              autocomplete="new-password"
            />
            <span v-if="newPassword" class="mt-2 block">
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
            <span class="field-label">{{ t("security.confirmPassword") }}</span>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              class="glass-input"
              autocomplete="new-password"
            />
          </label>
        </div>

        <p v-if="error" class="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
        <p v-if="success" class="rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{{ success }}</p>

        <div>
          <button type="submit" class="btn-primary btn-ripple" :disabled="saving" @click="spawnRipple">
            <span
              v-for="r in ripples"
              :key="r.id"
              class="ripple"
              :style="{ left: r.x + 'px', top: r.y + 'px', width: r.size + 'px', height: r.size + 'px' }"
              @animationend="removeRipple(r.id)"
            ></span>
            <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            <span>{{ saving ? t("common.saving") : t("security.changePassword.submit") }}</span>
          </button>
        </div>
      </form>
    </GlassCard>

    <GlassCard spotlight class="p-4 sm:p-6">
      <div class="flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-200 ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
            <path d="m9.5 12 1.8 1.8 3.2-3.6" />
          </svg>
        </span>
        <div>
          <h2 class="text-base font-semibold text-white">{{ t("security.protection.title") }}</h2>
          <p class="mt-0.5 text-sm text-gray-400">{{ t("security.protection.hint") }}</p>
        </div>
      </div>

      <div class="mt-5 flex flex-col divide-y divide-white/10">
        <div class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
          <div>
            <p class="text-sm font-medium text-gray-200">{{ t("security.twoFactor.title") }}</p>
            <p class="mt-0.5 text-xs text-gray-500">{{ t("security.twoFactor.hint") }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="tfaEnabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'"
            >
              <span class="relative inline-flex h-1.5 w-1.5">
                <span v-if="tfaEnabled" class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full" :class="tfaEnabled ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              </span>
              {{ tfaEnabled ? t("twoFactor.on") : t("twoFactor.off") }}
            </span>
            <button type="button" class="btn-ghost !px-3 !py-1.5 text-xs" @click="emit('open-two-factor')">
              {{ t("security.configure") }}
            </button>
          </div>
        </div>

        <div class="py-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-gray-200">{{ t("security.sessions.title") }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ t("security.sessions.hint") }}</p>
            </div>
          </div>
          <ul class="mt-4 flex flex-col gap-2.5">
            <li
              v-for="s in sessions"
              :key="s.name"
              class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
            >
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-gray-400 ring-1 ring-white/10">
                <svg v-if="s.kind === 'desktop'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M12 16v4M8 20h8" />
                </svg>
                <svg v-else-if="s.kind === 'phone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                  <rect x="7" y="2" width="10" height="20" rx="2.5" />
                  <path d="M11 18h2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M12 19h.01" />
                </svg>
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-200">
                  {{ s.name }}
                  <span v-if="s.current" class="ms-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">{{ t("security.sessions.currentBadge") }}</span>
                </p>
                <p class="mt-0.5 text-xs text-gray-500">{{ s.meta }}</p>
              </div>
              <button v-if="!s.current" class="text-xs text-gray-500 transition hover:text-rose-300">
                {{ t("security.sessions.revoke") }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </GlassCard>
  </div>
</template>