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
      animation: {
        'pulse-bounce': 'pulse-bounce 2s infinite', // Adjust duration and iteration as needed
      },
      plugins: [],
    },
  },
  plugins: [],
};
