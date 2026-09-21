<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import GlassCard from "@/components/GlassCard.vue";

defineOptions({ name: "AuthLayout" });
defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});

const { t } = useI18n();

const highlights = computed(() => [
  {
    icon: "realtime",
    title: t("home.features.realtime.title"),
    desc: t("home.features.realtime.desc"),
  },
  {
    icon: "email",
    title: t("home.features.brevo.title"),
    desc: t("home.features.brevo.desc"),
  },
  {
    icon: "security",
    title: t("home.features.security.title"),
    desc: t("home.features.security.desc"),
  },
]);
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel (large screens) -->
    <aside class="relative hidden overflow-hidden border-e border-edge lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div class="absolute -start-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px] animate-float motion-reduce:animate-none"></div>
      <div class="absolute -end-20 bottom-10 h-72 w-72 rounded-full bg-rose-500/15 blur-[100px] animate-float motion-reduce:animate-none" style="animation-delay: -3.5s"></div>

      <div class="relative flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-black text-emerald-950 shadow-lg shadow-emerald-500/30">
          F
        </span>
        <span class="text-xl font-bold text-ink">{{ t("app.name") }}</span>
      </div>

      <div class="relative">
        <div class="mb-6 flex items-center gap-2">
          <span class="relative inline-flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>
          <span class="text-xs font-medium tracking-wide text-emerald-300 uppercase">{{ t("auth.brand.badge") }}</span>
        </div>

        <h1 class="text-4xl font-extrabold leading-tight tracking-tight text-ink">
          {{ t("auth.brand.headline1") }}
          <span class="text-gradient">{{ t("auth.brand.headline2") }}</span>
        </h1>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-mute">
          {{ t("auth.brand.tagline") }}
        </p>

        <ul class="mt-10 flex flex-col gap-4">
          <li
            v-for="h in highlights"
            :key="h.title"
            class="flex items-start gap-3 rounded-xl border border-edge bg-glass p-3.5 backdrop-blur"
          >
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-200 ring-1 ring-edge">
              <svg v-if="h.icon === 'realtime'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" opacity=".4" />
                <path d="M12 12 8.5 8.5" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
              <svg v-else-if="h.icon === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
                <path d="m9.5 12 1.8 1.8 3.2-3.6" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold text-ink">{{ h.title }}</p>
              <p class="mt-0.5 text-xs text-mute">{{ h.desc }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-mute">
        {{ t("auth.brand.footer") }}
      </p>
    </aside>

    <!-- Form side -->
    <div class="relative flex items-center justify-center px-4 py-10 sm:px-8">
      <div class="w-full max-w-md animate-fade-in-up motion-reduce:animate-none">
        <div class="mb-6 text-center lg:text-start">
          <div class="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-black text-emerald-950 shadow-lg shadow-emerald-500/30 lg:hidden">
            F
          </div>
          <h1 class="text-2xl font-bold text-ink">{{ title }}</h1>
          <p v-if="subtitle" class="mt-2 text-sm text-mute">{{ subtitle }}</p>
        </div>
        <GlassCard spotlight class="p-6 sm:p-8">
          <slot />
        </GlassCard>
      </div>
    </div>
  </div>
</template>