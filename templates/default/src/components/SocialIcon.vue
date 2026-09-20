<script setup>
defineOptions({ name: "SocialIcon" });
defineProps({
  provider: { type: String, required: true }, // 'google' | 'facebook'
});
</script>

<template>
  <!-- Gmail (Google) -->
  <svg
    v-if="provider === 'google'"
    viewBox="0 0 24 24"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path
      fill="#EA4335"
      d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z"
    />
    <path
      fill="#4285F4"
      d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3a7.23 7.23 0 0 1-10.8-3.8H1.22v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.26 14.29a7.19 7.19 0 0 1 0-4.58v-3.1H1.22a12 12 0 0 0 0 10.78l4.04-3.1Z"
    />
    <path
      fill="#34A853"
      d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45A11.97 11.97 0 0 0 1.22 6.61l4.04 3.1A7.23 7.23 0 0 1 12 4.77Z"
    />
  </svg>

  <!-- Facebook -->
  <svg
    v-else-if="provider === 'facebook'"
    viewBox="0 0 24 24"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path
      fill="#1877F2"
      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07Z"
    />
  </svg>
</template>