<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";

defineOptions({ name: "NotificationsDialog" });

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user;

const prefs = reactive(
  user?.notification_preferences || {
    account: { email: true, push: true, telegram: false },
    security: { email: true, push: true, telegram: false },
    marketing: { email: false, push: false, telegram: false },
    updates: { email: true, push: false, telegram: false },
  }
);

const categories = [
  { key: "account", icon: "user" },
  { key: "security", icon: "shield" },
  { key: "marketing", icon: "megaphone" },
  { key: "updates", icon: "sparkles" },
];
const channels = ["email", "push", "telegram"];

const channelExtra = {
  email: t("notifications.desc.email"),
  push: t("notifications.desc.push"),
  telegram: t("notifications.desc.telegram"),
};

const saved = ref(false);
const saving = ref(false);
const error = ref("");

async function save() {
  saved.value = false;
  error.value = "";
  saving.value = true;
  try {
    await auth.updateNotifications(prefs);
    saved.value = true;
  } catch (e) {
    error.value = t("notifications.saveError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <GlassCard spotlight class="p-4 sm:p-6">
    <div class="flex flex-col divide-y divide-edge">
      <div
        v-for="(cat, ci) in categories"
        :key="cat.key"
        class="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-200 ring-1 ring-edge">
            <svg v-if="cat.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <svg v-else-if="cat.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
            </svg>
            <svg v-else-if="cat.icon === 'megaphone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="m3 11 18-5v12L3 14v-3Z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-semibold text-ink">{{ t(`notifications.categories.${cat.key}`) }}</p>
            <p class="mt-0.5 text-xs text-mute">{{ t(`notifications.categoryDesc.${cat.key}`) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label
            v-for="ch in channels"
            :key="ch"
            class="group flex cursor-pointer items-center gap-2"
            :title="channelExtra[ch]"
          >
            <ToggleSwitch v-model="prefs[cat.key][ch]" />
            <span
              class="text-xs font-medium transition"
              :class="prefs[cat.key][ch] ? 'text-emerald-300' : 'text-mute group-hover:text-ink2'"
            >
              {{ t(`notifications.channels.${ch}`) }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button type="button" class="btn-primary" :disabled="saving" @click="save">
        <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        <span>{{ saving ? t("common.saving") : t("notifications.save") }}</span>
      </button>
      <Transition
        enter-from-class="opacity-0 -translate-y-1"
        enter-active-class="transition duration-300"
      >
        <span v-if="saved" class="text-sm text-emerald-300">{{ t("notifications.saved") }}</span>
      </Transition>
    </div>
    <p v-if="error" class="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
  </GlassCard>
</template>