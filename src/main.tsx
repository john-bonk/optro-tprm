import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import PasswordGate from './components/auth/PasswordGate';

// Vite exposes the configured `base` as BASE_URL with a trailing slash.
// React Router's basename wants no trailing slash, so trim it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

// ─── Stale-deploy detector ───
// GitHub Pages serves entry HTML with a 10-minute browser cache and the
// hashed JS bundle as effectively immutable. After a redeploy, returning
// visitors can keep running the previous bundle until their cached HTML
// expires. We work around it by stamping a BUILD_ID into both the bundle
// (this module) and the document via a <meta> tag, then fetching the
// LIVE index.html out-of-band and comparing its build id against the one
// the running JS carries. A mismatch ⇒ live deploy is newer than cache ⇒
// reload once with cache bypassed so the new HTML + bundle line up.
const BUILD_ID = import.meta.env.VITE_BUILD_ID || 'dev';
try {
  if (BUILD_ID !== 'dev') {
    const liveUrl = `${import.meta.env.BASE_URL}?__c=${Date.now()}`;
    fetch(liveUrl, { cache: 'no-store' })
      .then(r => r.ok ? r.text() : null)
      .then(html => {
        if (!html) return;
        const m = html.match(/<meta name="app-build" content="([^"]+)"/);
        const liveBuild = m && m[1];
        if (!liveBuild || liveBuild === '%VITE_BUILD_ID%' || liveBuild === BUILD_ID) return;
        const reloadGuard = '__optro_build_reload_' + liveBuild;
        if (sessionStorage.getItem(reloadGuard)) return;
        sessionStorage.setItem(reloadGuard, '1');
        // location.reload() may serve from cache in some browsers — replace
        // with a cache-busted URL to force a fresh fetch of index.html.
        window.location.replace(`${window.location.pathname}?__r=${Date.now()}${window.location.hash}`);
      })
      .catch(() => {});
  }
} catch { /* noop — never break rendering on cache-detection edge cases */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename || '/'}>
      <PasswordGate>
        <App />
      </PasswordGate>
    </BrowserRouter>
  </StrictMode>,
);
