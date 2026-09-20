/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "Almarai", "sans-serif"],
        sans: ["Almarai", "'IBM Plex Sans Arabic'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
