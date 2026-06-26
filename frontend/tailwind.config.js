/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500
        accent: '#8b5cf6', // purple-500
        'dark-bg': '#0f172a', // slate-900
        'dark-card': '#1e293b', // slate-800
        'dark-border': '#334155', // slate-700
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
