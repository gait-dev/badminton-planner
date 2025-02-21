/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aptbc-green': '#4CAF50',
        'aptbc-black': '#333333',
      },
    },
  },
  plugins: [],
}
