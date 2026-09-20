<script setup>
import { ref } from "vue";

defineOptions({ name: "GlassCard" });
const props = defineProps({
  hover: { type: Boolean, default: false },
  spotlight: { type: Boolean, default: false },
  as: { type: String, default: "div" },
});

const el = ref(null);

function onMove(e) {
  if (!props.spotlight || !el.value) return;
  const rect = el.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  el.value.style.setProperty("--mx", `${x}%`);
  el.value.style.setProperty("--my", `${y}%`);
}
</script>

<template>
  <component
    :is="as"
    ref="el"
    class="glass-card glass-highlight"
    :class="[
      hover ? 'glass-card-hover' : '',
      spotlight ? 'isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:bg-[radial-gradient(480px_circle_at_var(--mx,50%)_var(--my,50%),rgba(45,212,191,0.12),transparent_45%)]' : '',
    ]"
    @mousemove="onMove"
  >
    <slot />
  </component>
</template>