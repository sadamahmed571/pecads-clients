/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: '#0ea5e9',
        nutrition: '#f97316',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#eab308'
      },
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
