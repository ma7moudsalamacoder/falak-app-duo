import { defineConfig } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
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