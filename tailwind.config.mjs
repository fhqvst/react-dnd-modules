/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'serif'],
        mono: ['Roboto Mono', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#91cbf8',
          100: '#84bcf0',
          200: '#66b4f0',
          300: '#3ca3ec',
          400: '#1884dc',
          500: '#1663b6',
          600: '#184a90',
          700: '#112850',
          800: '#0c1831',
          900: '#091120',
          950: '#030408',
        },
        primary: {
          50: '#0b91e5',
          100: '#0a7ed6',
          200: '#0867b4',
          300: '#064788',
          400: '#04285d',
          500: '#041b4e',
          600: '#061442',
          700: '#051038',
          800: '#030b25',
          900: '#04091b',
          950: '#010309',
        },
      },
    },
  },
  plugins: [],
  safelist: ['sky-500'],
}
