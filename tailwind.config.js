/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twilight: {
          900: "#0b1020",
          800: "#0f1a2b",
          700: "#13233a",
          600: "#1b2e4a",
        },
      },
    },
  },
  plugins: [],
}


