/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {
      colors: {
        'accent-blue': '#0ea5e9',
        'accent-purple': '#9333ea',
      },
    },
  },
  plugins: [],
}
