/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cool-white': '#ECEFF1',
        lavender: '#847FA4',
        wine: '#6B2D39',
        rose: '#CD9EBA',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
};
