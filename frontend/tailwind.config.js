/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        railway: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#5f9ec8',
          500: '#3981b2',
          600: '#2a6794',
          700: '#235277',
          800: '#1e4462',
          900: '#0f2942', // Classic Indian Railways Deep Blue
          950: '#091a2b',
        },
        safety: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        pinkFemale: '#ec4899',
        maleYellow: '#eab308',
      },
    },
  },
  plugins: [],
}
