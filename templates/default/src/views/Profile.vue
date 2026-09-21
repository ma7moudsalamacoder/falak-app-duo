<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import GlassCard from "@/components/GlassCard.vue";
import { countries, citiesFor } from "@/data/locations";
import { ROLES } from "@/data/roles";

const { t } = useI18n();
const auth = useAuthStore();

const roleInfo = computed(() => ROLES.find((r) => r.key === auth.user?.role));

const form = ref({
  name: "",
  email: "",
  phone: "",
  country_code: "",
  city: "",
  channel: "none", // none | telegram | whatsapp
  channel_handle: "",
  photo: null, // dataURL from the file picker
});

const saved = ref(false);
const saving = ref(false);
const error = ref("");
const photoInput = ref(null);

const cities = computed(() => citiesFor(form.value.country_code));

function onPickPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    form.value.photo = reader.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  form.value.photo = null;
  if (photoInput.value) photoInput.value.value = "";
}

async function save() {
  saved.value = false;
  error.value = "";
  saving.value = true;
  try {
    await auth.updateProfile({ ...form.value });
    saved.value = true;
  } catch (e) {
    error.value = t("profile.saveError");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    await auth.fetchProfile();
  } catch {
    // Not logged in is handled by the router guard.
  }
  const user = auth.user || {};
  form.value.name = user.name || "";
  form.value.email = user.email || "";
  form.value.phone = user.phone || "";
  form.value.country_code = user.country_code || "";
  form.value.city = user.city || "";
  form.value.channel = user.channel || "none";
  form.value.channel_handle = user.channel_handle || "";
  form.value.photo = user.photo || null;
});
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-8 animate-fade-in-up motion-reduce:animate-none">
      <div class="section-head">
        <h1 class="text-2xl font-bold text-white">{{ t("profile.title") }}</h1>
        <span
          v-if="roleInfo"
          class="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1"
          :class="roleInfo.badge"
        >
          <span class="relative inline-flex h-1.5 w-1.5">
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
          </span>
          {{ t(roleInfo.label) }}
        </span>
      </div>
      <p class="mt-1 text-sm text-gray-400">{{ t("profile.subtitle") }}</p>
    </div>

    <GlassCard spotlight class="p-6 sm:p-8 animate-fade-in-up motion-reduce:animate-none" style="animation-delay: 80ms">
      <div class="flex flex-col gap-8">
        <!-- Photo -->
        <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div class="relative">
            <div
              class="rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2.5px]"
              :class="form.photo ? 'shadow-lg shadow-emerald-500/20' : ''"
            >
              <div
                v-if="!form.photo"
                class="grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-[#0d1520] text-2xl font-bold text-emerald-300"
              >
                {{ auth.user?.name?.[0]?.toUpperCase() || "?" }}
              </div>
              <img
                v-else
                :src="form.photo"
                alt=""
                class="h-20 w-20 rounded-full object-cover ring-4 ring-[#0d1520]"
              />
            </div>
            <span
              v-if="form.photo"
              class="absolute -bottom-1 -start-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-rose-500/80"
              role="button"
              :aria-label="t('profile.removePhoto')"
              @click="removePhoto"
            >
              ×
            </span>
            <button
              type="button"
              class="absolute -bottom-1 -end-1 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/10 text-emerald-300 backdrop-blur transition hover:bg-emerald-500/80 hover:text-white"
              :aria-label="t('profile.photo.change')"
              @click="photoInput?.click()"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                <path d="M21.2 15.9A2 2 0 0 1 22 17.3V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2.7c0-.5.3-1 .8-1.4l1.7-1.1" />
                <path d="M16 2h2a2 2 0 0 1 2 2v2" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPickPhoto"
            />
          </div>

          <div class="sm:ms-2">
            <p class="text-sm font-medium text-gray-200">{{ t("profile.photo.label") }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ t("profile.photo.hint") }}</p>
            <button type="button" class="btn-ghost mt-3 !px-3 !py-1.5 text-xs" @click="photoInput?.click()">
              {{ t("profile.photo.change") }}
            </button>
          </div>
        </div>

        <div class="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

        <!-- Identity -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="field-label">{{ t("profile.name") }}</span>
            <input v-model="form.name" type="text" class="glass-input" />
          </label>
          <label class="block">
            <span class="field-label">{{ t("profile.email") }}</span>
            <input v-model="form.email" type="email" class="glass-input" />
          </label>
          <label class="block sm:col-span-2">
            <span class="field-label">{{ t("profile.phone") }}</span>
            <input v-model="form.phone" type="tel" class="glass-input" :placeholder="t('profile.phonePlaceholder')" />
            <span class="field-hint">{{ t("profile.phoneHint") }}</span>
          </label>
        </div>

        <div class="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

        <!-- Location: cascading country -> city -->
        <div>
          <p class="section-head mb-4">
            <span class="text-sm font-semibold text-white">{{ t("profile.location.title") }}</span>
          </p>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="field-label">{{ t("profile.country") }}</span>
              <select v-model="form.country_code" class="glass-select">
                <option value="" disabled>{{ t("profile.countryPlaceholder") }}</option>
                <option v-for="c in countries" :key="c.code" :value="c.code">
                  {{ c.name }}
                </option>
              </select>
            </label>
            <label class="block">
              <span class="field-label">{{ t("profile.city") }}</span>
              <select
                v-model="form.city"
                class="glass-select"
                :disabled="!form.country_code"
              >
                <option value="" disabled>
                  {{
                    form.country_code
                      ? t("profile.cityPlaceholder")
                      : t("profile.countryFirst")
                  }}
                </option>
                <option v-for="city in cities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </label>
          </div>
          <Transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0 -translate-y-1"
          >
            <p v-if="form.country_code" class="mt-2 text-xs text-gray-500">
              {{ cities.length ? `${cities.length} ` + t("profile.location.available") : t("profile.location.none") }}
            </p>
          </Transition>
        </div>

        <div class="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

        <!-- Additional communication channel -->
        <div>
          <p class="section-head mb-1">
            <span class="text-sm font-semibold text-white">{{ t("profile.channel.title") }}</span>
          </p>
          <p class="mb-4 text-xs text-gray-500">{{ t("profile.channel.hint") }}</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              class="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border px-4 py-4 text-sm font-medium transition"
              :class="
                form.channel === 'none'
                  ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              "
              @click="form.channel = 'none'"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-lg transition"
                :class="form.channel === 'none' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <span>{{ t("profile.channel.none") }}</span>
            </button>
            <button
              type="button"
              class="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border px-4 py-4 text-sm font-medium transition"
              :class="
                form.channel === 'telegram'
                  ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              "
              @click="form.channel = 'telegram'"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-lg transition"
                :class="form.channel === 'telegram' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                  <path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.3 6c.4-.3-.1-.5-.6-.2L7.1 12.6l-4.4-1.4c-1-.3-1-1 .2-1.4L20.8 3.2c.8-.3 1.5.2 1.1 1.4Z" />
                </svg>
              </span>
              <span>{{ t("profile.channel.telegram") }}</span>
            </button>
            <button
              type="button"
              class="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border px-4 py-4 text-sm font-medium transition"
              :class="
                form.channel === 'whatsapp'
                  ? 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              "
              @click="form.channel = 'whatsapp'"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-lg transition"
                :class="form.channel === 'whatsapp' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.1.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3 0 .2 0 .5-.1 1.1Z" />
                </svg>
              </span>
              <span>{{ t("profile.channel.whatsapp") }}</span>
            </button>
          </div>

          <label v-if="form.channel !== 'none'" class="mt-4 block animate-fade-in-up motion-reduce:animate-none">
            <span class="field-label">
              {{
                form.channel === "telegram"
                  ? t("profile.channel.telegramHandle")
                  : t("profile.channel.whatsappHandle")
              }}
            </span>
            <input
              v-model="form.channel_handle"
              type="text"
              class="glass-input"
              :placeholder="
                form.channel === 'telegram'
                  ? '@username'
                  : '+201234567890'
              "
            />
          </label>
        </div>

        <div>
          <p v-if="error" class="mb-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              <span>{{ saving ? t("common.saving") : t("profile.save") }}</span>
            </button>
            <Transition
              enter-from-class="opacity-0 -translate-y-1"
              enter-active-class="transition duration-300"
            >
              <span v-if="saved" class="text-sm text-emerald-300">{{ t("profile.saved") }}</span>
            </Transition>
          </div>
        </div>
      </div>
    </GlassCard>
  </div>
</template>