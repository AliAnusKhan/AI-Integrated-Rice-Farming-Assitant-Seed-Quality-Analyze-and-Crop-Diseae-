/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   // 👈 yeh add karein
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
