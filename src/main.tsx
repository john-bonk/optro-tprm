import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import PasswordGate from './components/auth/PasswordGate';

// Vite exposes the configured `base` as BASE_URL with a trailing slash.
// React Router's basename wants no trailing slash, so trim it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename || '/'}>
      <PasswordGate>
        <App />
      </PasswordGate>
    </BrowserRouter>
  </StrictMode>,
);
