/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Built dynamically as `accent-${id}`, so the scanner can't see them.
  safelist: ['accent-media', 'accent-games', 'accent-music', 'accent-quotes'],
  theme: {
    extend: {
      colors: {
        'cool-white': '#ECEFF1',
        lavender: '#847FA4',
        wine: '#6B2D39',
        rose: '#CD9EBA',
        // Per-library accent (set by .accent-* classes in index.css; defaults to the dusty pink).
        accent: 'var(--r-accent)',
        'accent-dim': 'var(--r-accent-dim)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
};
