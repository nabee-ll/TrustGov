/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 800: '#003580', 900: '#002060' },
        saffron: { 400: '#FF9933', 500: '#FF8C00' },
        govblue: { 500: '#1a56db', 600: '#1346c0', 700: '#0f3799' },
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
