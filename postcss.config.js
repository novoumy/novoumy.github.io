import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fixedViewport from './postcss-fixed-viewport.js';

export default {
  plugins: [tailwindcss(), fixedViewport(), autoprefixer()],
};
