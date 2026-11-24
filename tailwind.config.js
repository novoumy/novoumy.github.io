/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Built dynamically as `accent-${id}`, so the scanner can't see them.
  safelist: ['accent-media', 'accent-games', 'accent-music', 'accent-quotes'],
  theme: {
    extend: {
      colors: {
        'cool-white': 'rgb(var(--cool-white-rgb) / <alpha-value>)',
        lavender: 'rgb(var(--lavender-rgb) / <alpha-value>)',
        wine: 'rgb(var(--wine-rgb) / <alpha-value>)',
        rose: 'rgb(var(--rose-rgb) / <alpha-value>)',
        'pink-soft': '#D6C9F8',
        // Retro-folder tokens are runtime variables so /theme recolors every component.
        'r-bg': 'rgb(var(--r-bg-rgb) / <alpha-value>)',
        'r-panel': 'rgb(var(--r-panel-rgb) / <alpha-value>)',
        'r-raised': 'rgb(var(--r-raised-rgb) / <alpha-value>)',
        'r-line': 'rgb(var(--r-line-rgb) / <alpha-value>)',
        'r-text': 'rgb(var(--r-text-rgb) / <alpha-value>)',
        'r-dim': 'rgb(var(--r-dim-rgb) / <alpha-value>)',
        // Per-library accent (shared across the folder views).
        accent: 'rgb(var(--r-accent-rgb) / <alpha-value>)',
        'accent-dim': 'rgb(var(--r-accent-dim-rgb) / <alpha-value>)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
};
