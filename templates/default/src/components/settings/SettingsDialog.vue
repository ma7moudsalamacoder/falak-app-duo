<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "SettingsDialog" });

const { t } = useI18n();

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  wide: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const panel = ref(null);

let previousOverflow = "";

function close() {
  emit("close");
}

function onKey(e) {
  if (e.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("keydown", onKey);
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  panel.value?.focus({ preventScroll: true });
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey);
  document.body.style.overflow = previousOverflow;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sd" appear>
      <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
        <div class="sd-backdrop absolute inset-0 bg-[#05070d]/80 backdrop-blur-md" @click="close"></div>

        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          class="sd-panel relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-edge bg-page/95 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:rounded-3xl"
          :class="wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'"
        >
          <div class="flex items-start justify-between gap-4 border-b border-edge px-5 py-4 sm:px-6">
            <div>
              <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
              <p v-if="subtitle" class="mt-0.5 text-sm text-mute">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-edge bg-glass text-mute transition hover:bg-glass3 hover:text-ink"
              :aria-label="t('common.cancel')"
              @click="close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sd-enter-active,
.sd-leave-active {
  transition: opacity 0.25s ease;
}
.sd-enter-from,
.sd-leave-to {
  opacity: 0;
}
.sd-backdrop {
  transition: opacity 0.25s ease;
}
.sd-enter-from .sd-backdrop,
.sd-leave-to .sd-backdrop {
  opacity: 0;
}
.sd-panel {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.sd-enter-from .sd-panel,
.sd-leave-to .sd-panel {
  opacity: 0;
  transform: translateY(24px);
}
@media (prefers-reduced-motion: reduce) {
  .sd-enter-active,
  .sd-leave-active,
  .sd-backdrop,
  .sd-panel {
    transition: none;
  }
}
</style>