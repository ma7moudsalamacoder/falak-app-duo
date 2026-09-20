<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import SettingsDialog from "@/components/settings/SettingsDialog.vue";
import SecurityDialog from "@/components/settings/SecurityDialog.vue";
import TwoFactorDialog from "@/components/settings/TwoFactorDialog.vue";
import NotificationsDialog from "@/components/settings/NotificationsDialog.vue";
import AIAgentDialog from "@/components/settings/AIAgentDialog.vue";
import TelegramDialog from "@/components/settings/TelegramDialog.vue";

const { t } = useI18n();
const auth = useAuthStore();

const active = ref(null);

const tfaEnabled = computed(() => Boolean(auth.user?.two_factor_enabled));
const agentEnabled = computed(() => Boolean(auth.user?.ai_agent?.enabled));
const telegramConfigured = computed(() =>
  Boolean(auth.user?.telegram?.bot_token && auth.user?.telegram?.chat_id)
);

const sections = computed(() => [
  {
    key: "security",
    title: t("security.title"),
    subtitle: t("security.subtitle"),
    tint: "from-emerald-400/20 to-teal-500/20 text-emerald-200",
    status: tfaEnabled.value ? t("twoFactor.on") : t("twoFactor.off"),
    on: tfaEnabled.value,
    wide: false,
  },
  {
    key: "two-factor",
    title: t("twoFactor.title"),
    subtitle: t("twoFactor.subtitle"),
    tint: "from-amber-400/20 to-orange-500/20 text-amber-200",
    status: tfaEnabled.value ? t("twoFactor.on") : t("twoFactor.off"),
    on: tfaEnabled.value,
    wide: false,
  },
  {
    key: "notifications",
    title: t("notifications.title"),
    subtitle: t("notifications.subtitle"),
    tint: "from-cyan-400/20 to-sky-500/20 text-cyan-200",
    status: "",
    on: false,
    wide: false,
  },
  {
    key: "ai-agent",
    title: t("aiAgent.title"),
    subtitle: t("aiAgent.subtitle"),
    tint: "from-teal-400/20 to-emerald-500/20 text-teal-200",
    status: agentEnabled.value ? t("settings.status.on") : t("settings.status.off"),
    on: agentEnabled.value,
    wide: false,
  },
  {
    key: "telegram",
    title: t("telegram.title"),
    subtitle: t("telegram.subtitle"),
    tint: "from-sky-400/20 to-cyan-500/20 text-sky-200",
    status: telegramConfigured.value ? t("telegram.statusConnected") : t("telegram.statusDisconnected"),
    on: telegramConfigured.value,
    wide: true,
  },
]);

function open(section) {
  active.value = section;
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div class="mb-8 animate-fade-in-up motion-reduce:animate-none">
      <div class="section-head">
        <h1 class="text-2xl font-bold text-white">{{ t("nav.settings") }}</h1>
      </div>
      <p class="mt-1 text-sm text-gray-400">{{ t("settings.subtitle") }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="s in sections"
        :key="s.key"
        role="button"
        tabindex="0"
        class="group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40 rounded-2xl"
        :class="s.wide ? 'sm:col-span-2' : ''"
        @click="open(s.key)"
        @keydown.enter="open(s.key)"
        @keydown.space.prevent="open(s.key)"
      >
        <GlassCard
          hover
          spotlight
          class="h-full p-5 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-emerald-950/30"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10 transition duration-300 group-hover:scale-105" :class="s.tint">
              <svg v-if="s.key === 'security'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
                <path d="m9.5 12 1.8 1.8 3.2-3.6" />
              </svg>
              <svg v-else-if="s.key === 'two-factor'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <svg v-else-if="s.key === 'notifications'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <svg v-else-if="s.key === 'ai-agent'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                <path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.3 6c.4-.3-.1-.5-.6-.2L7.1 12.6l-4.4-1.4c-1-.3-1-1 .2-1.4L20.8 3.2c.8-.3 1.5.2 1.1 1.4Z" />
              </svg>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1.5 h-4 w-4 text-gray-600 transition duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-300 rtl:rotate-180">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>

          <h3 class="mt-4 text-base font-bold text-white">{{ s.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-gray-400">{{ s.subtitle }}</p>

          <div class="mt-4 flex items-center justify-between gap-3">
            <span
              v-if="s.status"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="s.on ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-gray-400'"
            >
              <span class="relative inline-flex h-1.5 w-1.5">
                <span v-if="s.on" class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full" :class="s.on ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              </span>
              {{ s.status }}
            </span>
            <span class="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
              {{ t("settings.open") }}
            </span>
          </div>
        </GlassCard>
      </div>
    </div>

    <!-- Dialogs -->
    <SettingsDialog
      v-if="active === 'security'"
      :title="t('security.title')"
      :subtitle="t('security.subtitle')"
      @close="active = null"
    >
      <SecurityDialog @open-two-factor="active = 'two-factor'" />
    </SettingsDialog>

    <SettingsDialog
      v-if="active === 'two-factor'"
      :title="t('twoFactor.title')"
      :subtitle="t('twoFactor.subtitle')"
      @close="active = null"
    >
      <TwoFactorDialog />
    </SettingsDialog>

    <SettingsDialog
      v-if="active === 'notifications'"
      :title="t('notifications.title')"
      :subtitle="t('notifications.subtitle')"
      @close="active = null"
    >
      <NotificationsDialog />
    </SettingsDialog>

    <SettingsDialog
      v-if="active === 'ai-agent'"
      wide
      :title="t('aiAgent.title')"
      :subtitle="t('aiAgent.subtitle')"
      @close="active = null"
    >
      <AIAgentDialog />
    </SettingsDialog>

    <SettingsDialog
      v-if="active === 'telegram'"
      :title="t('telegram.title')"
      :subtitle="t('telegram.subtitle')"
      @close="active = null"
    >
      <TelegramDialog />
    </SettingsDialog>
  </div>
</template>