import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//
// GitHub Pages serves project repos at https://<user>.github.io/<repo>/, so
// the build needs `base: '/<repo>/'`. Local dev (`npm run dev`) keeps `/` so
// nothing changes day-to-day; the deploy build sets `GH_PAGES_BASE` to flip
// the base path for the static bundle.
//
// A per-build BUILD_ID is stamped into both the bundle (via define) and the
// index.html <meta> (via Vite's HTML template substitution). The stale-deploy
// detector in main.tsx uses it to force a one-shot reload when a returning
// visitor lands on a stale cached index.html after a fresh deploy.
const BUILD_ID = process.env.GITHUB_SHA?.slice(0, 12) ?? String(Date.now());
// Vite's HTML substitution (`%VITE_BUILD_ID%`) reads from process.env at
// build time, so we set it here before the config is evaluated.
process.env.VITE_BUILD_ID = BUILD_ID;

export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES_BASE ?? '/',
  envPrefix: ['VITE_'],
});
