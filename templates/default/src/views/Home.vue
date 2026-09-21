<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import { isDemoMode, client } from "@/services/dataClient";

const { t } = useI18n();
const auth = useAuthStore();

const features = computed(() => [
  { icon: "realtime", title: t("home.features.realtime.title"), desc: t("home.features.realtime.desc") },
  { icon: "email", title: t("home.features.brevo.title"), desc: t("home.features.brevo.desc") },
  { icon: "security", title: t("home.features.security.title"), desc: t("home.features.security.desc") },
  { icon: "agent", title: t("home.features.agent.title"), desc: t("home.features.agent.desc") },
]);

const words = computed(() => [
  t("home.rotator.1"),
  t("home.rotator.2"),
  t("home.rotator.3"),
  t("home.rotator.4"),
]);

const chips = computed(() => ["Vue 3", "Laravel", "Tailwind", "Ably", "Brevo", "Pinia", "vue-i18n", "Groq"]);

// Demo mode: the hero stats are derived from the bundled demo data and a
// live "demo data" section shows the entities the scaffold shipped.
const demoOverview = ref(null);

// 1 = starter users, 2 = uptime, 3 = services wired, 4 = support
const stats = computed(() => {
  if (!isDemoMode || !demoOverview.value) return ["12k+", "99.9%", "10", "24/7"];
  const s = demoOverview.value.stats;
  return [String(s.users), "99.9%", String(demoOverview.value.entities.length), "24/7"];
});

// Typewriter
const typed = ref("");
const wordIndex = ref(0);
const deleting = ref(false);
let timeout = null;

function tick() {
  const word = words.value[wordIndex.value];
  if (!deleting.value) {
    typed.value = word.slice(0, typed.value.length + 1);
    if (typed.value === word) {
      deleting.value = true;
      timeout = setTimeout(tick, 1700);
      return;
    }
    timeout = setTimeout(tick, 55 + Math.random() * 55);
  } else {
    typed.value = word.slice(0, typed.value.length - 1);
    if (!typed.value) {
      deleting.value = false;
      wordIndex.value = (wordIndex.value + 1) % words.value.length;
      timeout = setTimeout(tick, 300);
      return;
    }
    timeout = setTimeout(tick, 30);
  }
}
onMounted(async () => {
  timeout = setTimeout(tick, 700);
  if (isDemoMode) {
    try {
      demoOverview.value = (await client.get("/overview")).data;
    } catch {
      // The demo backend is always available — nothing to do on failure.
    }
  }
});
onUnmounted(() => clearTimeout(timeout));
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16 sm:py-24">
    <!-- Hero -->
    <div class="text-center animate-fade-in-up motion-reduce:animate-none">
      <span class="chip mx-auto">
        <span class="relative inline-flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring motion-reduce:hidden"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
        </span>
        {{ t("home.badge") }}
      </span>

      <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
        <span class="text-gradient bg-[length:200%_auto] animate-text-shimmer motion-reduce:animate-none">
          {{ t("home.title") }}
        </span>
      </h1>

      <!-- Typewriter -->
      <p class="mx-auto mt-5 flex h-7 items-center justify-center gap-1 font-mono text-base text-teal-200 sm:text-lg" aria-hidden="true">
        <span class="text-ink/50">$</span>
        <span class="overflow-hidden whitespace-nowrap border-e-2 border-teal-300/80 pr-1" :class="typed === '' ? 'w-0' : ''">{{ typed }}</span>
      </p>
      <span class="sr-only">{{ words[wordIndex] }}</span>

      <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mute">
        {{ t("home.subtitle") }}
      </p>

      <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          v-if="!auth.userToken"
          to="/register"
          class="relative isolate rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-emerald-400/50 bg-[length:200%_200%] animate-gradient-pan motion-reduce:animate-none before:absolute before:-inset-0.5 before:rounded-xl before:-z-10 before:bg-[conic-gradient(from_var(--tw-border-angle),#10B981,#2DD4BF,#F472B6,#F59E0B,#10B981)] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:animate-border-spin before:motion-reduce:animate-none"
        >
          {{ t("home.ctaRegister") }}
        </RouterLink>
        <RouterLink
          :to="auth.userToken ? '/profile' : '/login'"
          class="btn-ghost px-7 py-3"
          :class="auth.userToken ? 'btn-accent' : ''"
        >
          {{ auth.userToken ? t("home.ctaProfile") : t("home.ctaLogin") }}
        </RouterLink>
      </div>

      <!-- Tech chips -->
      <div class="mt-10 flex flex-wrap items-center justify-center gap-2">
        <span
          v-for="(chip, i) in chips"
          :key="chip"
          class="rounded-lg border border-edge bg-glass px-3 py-1.5 text-xs text-mute transition hover:border-emerald-300/30 hover:text-emerald-200"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          {{ chip }}
        </span>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div v-for="(s, i) in stats" :key="i" class="animate-fade-in-up motion-reduce:animate-none">
        <GlassCard class="p-5 text-center glass-card-hover">
          <p class="text-2xl font-extrabold text-gradient">{{ s }}</p>
          <p class="mt-1 text-xs text-mute">{{ t(`home.stats.${i + 1}`) }}</p>
        </GlassCard>
      </div>
    </div>

    <!-- Demo data (only when the app runs in demo mode) -->
    <div v-if="isDemoMode && demoOverview" class="mt-6 animate-fade-in-up motion-reduce:animate-none">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="section-head flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-teal-300">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 4v5M16 4v5" />
            </svg>
            {{ t("home.demo.title") }}
          </h2>
          <p class="mt-1 text-sm text-mute">{{ t("home.demo.subtitle") }}</p>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
          {{ demoOverview.entities.length }} {{ t("home.demo.entities") }}
        </span>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard v-for="e in demoOverview.entities" :key="e.name" hover class="p-5">
          <div class="flex items-center justify-between gap-3">
            <span class="rounded-lg border border-edge bg-glass px-2.5 py-1 font-mono text-xs font-semibold text-teal-200">
              {{ e.name }}
            </span>
            <span class="text-lg font-extrabold text-ink">{{ e.count }}</span>
          </div>
          <p v-if="e.preview" class="mt-3 truncate text-xs text-mute" :title="e.preview">{{ e.preview }}</p>
          <p v-else class="mt-3 text-xs text-mute">—</p>
        </GlassCard>
      </div>
    </div>

    <!-- Features -->
    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10">
      <GlassCard
        v-for="(f, i) in features"
        :key="f.title"
        hover
        spotlight
        class="animate-fade-in-up p-6 motion-reduce:animate-none"
        :style="{ animationDelay: `${i * 90}ms` }"
      >
        <div class="flex items-start gap-4">
          <span
            class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-lg text-emerald-200 ring-1 ring-edge transition group-hover:from-emerald-400/30"
          >
            <svg v-if="f.icon === 'realtime'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 9 9" opacity=".4" />
              <path d="M12 12 8.5 8.5" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
            <svg v-else-if="f.icon === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <svg v-else-if="f.icon === 'security'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
              <path d="m9.5 12 1.8 1.8 3.2-3.6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </span>
          <div>
            <h3 class="font-semibold text-ink">{{ f.title }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-mute">{{ f.desc }}</p>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Bottom CTA -->
    <div class="relative mt-14 overflow-hidden rounded-2xl border border-edge p-8 sm:p-12 animate-fade-in-up motion-reduce:animate-none">
      <div class="absolute inset-0 -z-10 bg-page2"></div>
      <div class="absolute -start-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-[90px] animate-float motion-reduce:animate-none pointer-events-none"></div>
      <div class="absolute -end-16 -bottom-16 h-56 w-56 rounded-full bg-rose-500/15 blur-[90px] animate-float motion-reduce:animate-none pointer-events-none" style="animation-delay: -3s"></div>
      <div class="relative text-center">
        <h2 class="text-2xl font-bold text-ink sm:text-3xl">
          <span class="text-gradient">{{ t("home.cta.title") }}</span>
        </h2>
        <p class="mx-auto mt-2 max-w-lg text-sm text-mute">{{ t("home.cta.subtitle") }}</p>
        <RouterLink
          v-if="!auth.userToken"
          to="/register"
          class="btn-primary mt-6 px-8 py-3"
        >
          {{ t("home.ctaRegister") }}
        </RouterLink>
        <RouterLink v-else to="/profile" class="btn-primary mt-6 px-8 py-3">
          {{ t("home.ctaProfile") }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>