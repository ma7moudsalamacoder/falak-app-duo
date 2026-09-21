<script setup>
defineOptions({ name: "ToggleSwitch" });
const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

function toggle() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors duration-200"
    :class="
      modelValue
        ? 'border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-teal-500'
        : 'border-edge2 bg-glass'
    "
    @click="toggle"
  >
    <span
      class="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all duration-200"
      :class="modelValue ? 'end-1' : 'start-1'"
    ></span>
  </button>
</template>