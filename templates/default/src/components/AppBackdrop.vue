<script setup>
// Full-screen dynamic background: dark base + animated aurora mesh of blurred
// blobs + a fine dotted grid + film grain. Palette deliberately avoids
// purple/blue gradients (emerald / teal / cyan / rose / amber).
defineOptions({ name: "AppBackdrop" });
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page"
  >
    <!-- Aurora mesh base -->
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_84%_16%,rgba(251,113,133,0.13),transparent_40%),radial-gradient(circle_at_48%_88%,rgba(251,191,36,0.11),transparent_45%),radial-gradient(circle_at_76%_60%,rgba(45,212,191,0.14),transparent_42%),radial-gradient(circle_at_6%_70%,rgba(34,211,238,0.08),transparent_45%)]"
    ></div>

    <!-- Dotted grid, faint -->
    <div class="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"></div>

    <!-- Morphing blobs -->
    <div
      class="absolute -start-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-[130px] animate-mesh-drift-a motion-reduce:animate-none"
    ></div>
    <div
      class="absolute -end-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-rose-500/20 blur-[120px] animate-mesh-drift-b motion-reduce:animate-none"
    ></div>
    <div
      class="absolute -bottom-40 start-1/4 h-[36rem] w-[36rem] rounded-full bg-amber-400/15 blur-[140px] animate-mesh-drift-a motion-reduce:animate-none"
      style="animation-delay: -7s"
    ></div>
    <div
      class="absolute start-[42%] top-12 h-[22rem] w-[22rem] rounded-full bg-teal-400/15 blur-[110px] animate-blob-morph motion-reduce:animate-none"
    ></div>
    <div
      class="absolute start-[10%] top-1/2 hidden h-[18rem] w-[18rem] rounded-full bg-cyan-400/10 blur-[100px] animate-blob-morph motion-reduce:animate-none lg:block"
      style="animation-delay: -4s"
    ></div>

    <!-- Vignette so content keeps contrast -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--vignette))]"></div>
  </div>
</template>