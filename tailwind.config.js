/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f1fb',
          100: '#b5d4f4',
          400: '#378add',
          600: '#185FA5',
          800: '#0C447C',
          900: '#042C53',
        }
      }
    },
  },
  plugins: [],
}
