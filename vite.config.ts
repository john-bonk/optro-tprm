import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//
// GitHub Pages serves project repos at https://<user>.github.io/<repo>/, so
// the build needs `base: '/<repo>/'`. Local dev (`npm run dev`) keeps `/` so
// nothing changes day-to-day; the deploy build sets `GH_PAGES_BASE` to flip
// the base path for the static bundle.
export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES_BASE ?? '/',
});
