/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        team1: '#a7c957',
        team2: '#f4845f'
      }
    },
  },
  plugins: [],
  safelist: [
    'border-l-team1',
    'border-l-team2',
    'border-team1',
    'border-team2',
    'bg-team1',
    'bg-team2',
    'text-team1',
    'text-team2',
  ]
}
