import { ref } from "vue";

// Drives the `.ripple` span that `.btn-ripple` buttons expect (see main.css).
// Usage: const { ripples, spawnRipple, removeRipple } = useRipple();
export function useRipple() {
  const ripples = ref([]);
  let nextId = 0;

  function spawnRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripples.value.push({
      id: nextId++,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      size,
    });
  }

  function removeRipple(id) {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }

  return { ripples, spawnRipple, removeRipple };
}