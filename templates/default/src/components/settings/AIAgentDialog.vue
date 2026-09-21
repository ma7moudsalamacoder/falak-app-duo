<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";

defineOptions({ name: "AIAgentDialog" });

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user;

const steps = [
  { num: "1", icon: "account" },
  { num: "2", icon: "key" },
  { num: "3", icon: "copy" },
  { num: "4", icon: "server" },
];

const form = ref({
  enabled: user?.ai_agent?.enabled ?? false,
  model: user?.ai_agent?.model ?? "llama-3.3-70b-versatile",
  temperature: user?.ai_agent?.temperature ?? 0.7,
  reasoning: user?.ai_agent?.reasoning ?? false,
});

const models = [
  { id: "llama-3.3-70b-versatile", tag: "LLaMA", speed: 0.4 },
  { id: "llama-3.1-8b-instant", tag: "LLaMA", speed: 1.0 },
  { id: "mixtral-8x7b-32768", tag: "Mixtral", speed: 0.6 },
  { id: "gemma2-9b-it", tag: "Gemma", speed: 0.8 },
];

const saved = ref(false);
const saving = ref(false);
const error = ref("");

const tempLabel = computed(() => form.value.temperature.toFixed(1));

async function save() {
  saved.value = false;
  error.value = "";
  saving.value = true;
  try {
    await auth.updateAIAgent({ ...form.value });
    saved.value = true;
  } catch (e) {
    error.value = t("aiAgent.saveError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Free API key steps -->
    <GlassCard spotlight class="p-4 sm:p-6">
      <div class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/25">
          AI
        </span>
        <div>
          <h2 class="text-base font-semibold text-ink">{{ t("aiAgent.key.title") }}</h2>
          <p class="text-xs text-mute">{{ t("aiAgent.key.subtitle") }}</p>
        </div>
        <span class="ms-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          <span class="relative inline-flex h-1.5 w-1.5">
            <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </span>
          Free
        </span>
      </div>

      <div class="mt-5 flex flex-col gap-3 rounded-xl border border-edge bg-glass p-4">
        <div
          v-for="(step, i) in steps"
          :key="step.num"
          class="flex items-start gap-3.5"
        >
          <span class="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 font-bold text-emerald-300 ring-1 ring-emerald-300/30">
            {{ step.num }}
          </span>
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-glass text-mute ring-1 ring-edge">
            <svg v-if="step.icon === 'account'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <svg v-else-if="step.icon === 'key'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="m21 2-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8Zm0 0L15 7m-3 3-2 2m8-9 3 3-2.5 2.5-3-3L17 4Zm-1.5 1.5 3 3" />
            </svg>
            <svg v-else-if="step.icon === 'copy'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="3" y="4" width="18" height="12" rx="2" />
              <path d="M12 16v4M8 20h8" />
            </svg>
          </span>
          <span class="flex-1 pt-0.5 text-sm leading-relaxed text-ink2">{{ t(`aiAgent.key.steps.${step.num}`) }}</span>
        </div>
      </div>

      <div class="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/20 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0">
          <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        <span>{{ t("aiAgent.key.note") }}</span>
      </div>
    </GlassCard>

    <!-- Agent settings -->
    <GlassCard spotlight class="p-4 sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-ink">{{ t("aiAgent.settings.title") }}</h2>
          <p class="mt-1 text-sm text-mute">{{ t("aiAgent.settings.hint") }}</p>
        </div>
        <ToggleSwitch v-model="form.enabled" />
      </div>

      <div class="mt-5 flex flex-col gap-6">
        <div>
          <span class="field-label">{{ t("aiAgent.model") }}</span>
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              v-for="m in models"
              :key="m.id"
              type="button"
              class="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition"
              :class="form.model === m.id ? 'border-emerald-300/50 bg-emerald-500/15 shadow-lg shadow-emerald-500/10' : 'border-edge bg-glass hover:bg-glass2'"
              @click="form.model = m.id"
            >
              <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black" :class="form.model === m.id ? 'bg-emerald-400/20 text-emerald-300' : 'bg-glass text-mute'">
                {{ m.tag.slice(0, 2) }}
              </span>
              <span class="min-w-0">
                <span class="block truncate font-mono text-xs font-medium text-ink2">{{ m.id }}</span>
                <span class="mt-0.5 flex items-center gap-1 text-[10px] text-mute">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  {{ m.speed === 1 ? "fast" : `${m.speed}x` }}
                </span>
              </span>
              <svg v-if="form.model === m.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="ms-auto h-4 w-4 text-emerald-300">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </div>
        </div>

        <label class="block">
          <span class="field-label flex items-center justify-between">
            <span>{{ t("aiAgent.temperature") }}</span>
            <span class="rounded-md border border-emerald-300/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-300">{{ tempLabel }}</span>
          </span>
          <input
            v-model.number="form.temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="mt-2 w-full accent-emerald-500"
          />
          <div class="flex justify-between text-xs text-mute">
            <span>{{ t("aiAgent.temperatureLow") }}</span>
            <span>{{ t("aiAgent.temperatureHigh") }}</span>
          </div>
        </label>

        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-edge bg-glass p-4">
          <ToggleSwitch v-model="form.reasoning" />
          <span class="text-sm text-ink2">{{ t("aiAgent.reasoning") }}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ms-auto h-4 w-4 text-mute">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </label>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" class="btn-primary" :disabled="saving" @click="save">
          <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          <span>{{ saving ? t("common.saving") : t("aiAgent.save") }}</span>
        </button>
        <Transition
          enter-from-class="opacity-0 -translate-y-1"
          enter-active-class="transition duration-300"
        >
          <span v-if="saved" class="text-sm text-emerald-300">{{ t("aiAgent.saved") }}</span>
        </Transition>
      </div>
      <p v-if="error" class="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
    </GlassCard>
  </div>
</template>