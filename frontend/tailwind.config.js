/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        lora: "'Lora', serif",
        'quicksand': ['Quicksand', 'sans-serif']
      },
      keyframes: {
        'loading': {
          '0%': { left: '-40%' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'pulse-bounce': 'pulse-bounce 2s infinite',
        'loading': 'loading 3s infinite',
      },
      plugins: [],
    },
  },
  plugins: [],
};
