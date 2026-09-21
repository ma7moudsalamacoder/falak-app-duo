import { defineConfig } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Semantic theme tokens (values flip with html.light in main.css).
           `color` prefixed tokens (page/ink/mute) accept /opacity modifiers;
           rgba tokens (glass/edge) bake their own alpha. */
        page: "rgb(var(--c-page) / <alpha-value>)",
        page2: "rgb(var(--c-page-2) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        ink2: "rgb(var(--c-ink-2) / <alpha-value>)",
        ink3: "rgb(var(--c-ink-3) / <alpha-value>)",
        mute: "rgb(var(--c-mute) / <alpha-value>)",
        glass: "rgb(255 255 255 / var(--glass-a))",
        glass2: "rgb(255 255 255 / var(--glass-a-2))",
        glass3: "rgb(255 255 255 / var(--glass-a-3))",
        edge: "var(--c-edge)",
        edge2: "var(--c-edge-2)",
        edge3: "var(--c-edge-3)",
        /* Pale soft-accent shades read as glow on dark, so they're remapped
           through tokens to darken for light mode. Other shades (400+) stay
           on the default Tailwind palette. */
        emerald: {
          200: "rgb(var(--c-em-200) / <alpha-value>)",
          300: "rgb(var(--c-em-300) / <alpha-value>)",
        },
        teal: {
          200: "rgb(var(--c-teal-200) / <alpha-value>)",
          300: "rgb(var(--c-teal-300) / <alpha-value>)",
        },
        cyan: {
          200: "rgb(var(--c-cyan-200) / <alpha-value>)",
          300: "rgb(var(--c-cyan-300) / <alpha-value>)",
        },
        sky: {
          200: "rgb(var(--c-sky-200) / <alpha-value>)",
        },
        amber: {
          200: "rgb(var(--c-amber-200) / <alpha-value>)",
          300: "rgb(var(--c-amber-300) / <alpha-value>)",
        },
        orange: {
          300: "rgb(var(--c-orange-300) / <alpha-value>)",
        },
        rose: {
          200: "rgb(var(--c-rose-200) / <alpha-value>)",
          300: "rgb(var(--c-rose-300) / <alpha-value>)",
          400: "rgb(var(--c-rose-400) / <alpha-value>)",
        },
      },
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "Almarai", "sans-serif"],
        sans: ["Almarai", "'IBM Plex Sans Arabic'", "sans-serif"],
      },
      animation: {
        "gradient-pan": "gradient-pan 14s ease infinite",
        "blob-morph": "blob-morph 10s ease-in-out infinite",
        "mesh-drift-a": "mesh-drift-a 16s ease-in-out infinite",
        "mesh-drift-b": "mesh-drift-b 18s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease forwards",
        shimmer: "shimmer 1.6s ease infinite",
        heartbeat: "heartbeat 1.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-spin": "border-spin 4s linear infinite",
        "text-shimmer": "text-shimmer 4s linear infinite",
        typewriter: "typewriter 2.4s steps(22, end) forwards",
        "caret-blink": "caret-blink 0.75s step-end infinite",
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spin 24s linear infinite",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "blob-morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 60% / 40% 30% 70% 60%" },
          "75%": { borderRadius: "60% 40% 60% 30% / 70% 50% 40% 30%" },
        },
        "mesh-drift-a": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(8%, 10%)" },
        },
        "mesh-drift-b": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-8%, -10%)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.18)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.12)" },
          "60%": { transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        "border-spin": {
          to: { "--tw-border-angle": "360deg" },
        },
        "text-shimmer": {
          to: { backgroundPosition: "-200% center" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "caret-blink": {
          "50%": { borderColor: "transparent" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
    },
  },
  plugins: [],
};