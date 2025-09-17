/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust if using Vue/Svelte/etc.
  ],
  theme: {
    extend: {
      colors: {
        brand: "#1E40AF",
        accent: "#F472B6",
        laal:'#FF0000'
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
