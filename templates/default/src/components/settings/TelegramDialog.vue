<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";

defineOptions({ name: "TelegramDialog" });

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user;

const form = ref({
  chat_id: user?.telegram?.chat_id ?? "",
});

const saved = ref(false);
const saving = ref(false);
const testing = ref(false);
const error = ref("");
const testResult = ref("");

const configured = computed(() => Boolean(form.value.chat_id));

async function save() {
  saved.value = false;
  error.value = "";
  saving.value = true;
  try {
    await auth.updateTelegram({ chat_id: form.value.chat_id });
    saved.value = true;
  } catch (e) {
    error.value = t("telegram.saveError");
  } finally {
    saving.value = false;
  }
}

async function test() {
  testResult.value = "";
  error.value = "";
  testing.value = true;
  try {
    const { data } = await auth.testTelegram();
    testResult.value = data?.ok ? t("telegram.testSent") : data?.message || t("telegram.testSent");
  } catch (e) {
    error.value = t("telegram.testError");
  } finally {
    testing.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <GlassCard spotlight class="p-4 sm:p-6">
      <div class="flex items-center gap-3">
        <span class="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-xs font-black text-sky-950 shadow-lg shadow-sky-500/20">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.3 6c.4-.3-.1-.5-.6-.2L7.1 12.6l-4.4-1.4c-1-.3-1-1 .2-1.4L20.8 3.2c.8-.3 1.5.2 1.1 1.4Z" />
          </svg>
        </span>
        <div>
          <h2 class="text-base font-semibold text-ink">{{ t("telegram.setup.title") }}</h2>
          <p class="text-xs text-mute">{{ t("telegram.setup.hint") }}</p>
        </div>
        <span
          class="ms-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="configured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-glass text-mute'"
        >
          <span class="relative inline-flex h-1.5 w-1.5">
            <span v-if="configured" class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full" :class="configured ? 'bg-emerald-400' : 'bg-amber-400'"></span>
          </span>
          {{ configured ? t("telegram.statusConnected") : t("telegram.statusDisconnected") }}
        </span>
      </div>
      <div class="mt-4 rounded-xl border border-edge bg-glass p-4 text-sm text-ink2">
        <p class="flex items-center gap-2 font-medium text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-sky-400">
            <path d="M9 18h6M10 22h4M8 4h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
          {{ t("telegram.setup.howTo") }}
        </p>
        <ol class="mt-3 flex list-inside list-decimal flex-col gap-2 pl-1 text-mute">
          <li>{{ t("telegram.step1") }}</li>
          <li>{{ t("telegram.step2") }}</li>
          <li>{{ t("telegram.step3") }}</li>
        </ol>
      </div>
    </GlassCard>

    <GlassCard spotlight class="p-4 sm:p-6">
      <form @submit.prevent="save" class="flex flex-col gap-4">
        <label class="block">
          <span class="field-label">{{ t("telegram.chatId") }}</span>
          <input
            v-model="form.chat_id"
            type="text"
            :placeholder="t('telegram.chatIdPlaceholder')"
            class="glass-input"
          />
        </label>

        <p v-if="error" class="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
        <p v-if="testResult" class="rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{{ testResult }}</p>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" class="btn-primary" :disabled="saving">
            <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            <span>{{ saving ? t("common.saving") : t("telegram.save") }}</span>
          </button>
          <button
            type="button"
            class="btn-ghost !border-sky-300/30 !text-sky-300 hover:!bg-sky-500/10"
            :disabled="testing || !configured"
            @click="test"
          >
            <span v-if="testing" class="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"></span>
            <span>{{ testing ? t("common.loading") : t("telegram.test") }}</span>
          </button>
          <Transition
            enter-from-class="opacity-0 -translate-y-1"
            enter-active-class="transition duration-300"
          >
            <span v-if="saved" class="text-sm text-emerald-300">{{ t("telegram.saved") }}</span>
          </Transition>
        </div>
      </form>
    </GlassCard>
  </div>
</template>