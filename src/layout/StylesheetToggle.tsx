import { useEffect, useState } from 'react';
import styles from './StylesheetToggle.module.css';

const STORAGE_KEY = 'optro-grayscale';

export default function StylesheetToggle() {
  const [grayscale, setGrayscale] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle('grayscale', grayscale);
    try {
      localStorage.setItem(STORAGE_KEY, grayscale ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [grayscale]);

  return (
    <button
      className={`${styles.toggle} ${grayscale ? styles.toggleActive : ''}`}
      onClick={() => setGrayscale(g => !g)}
      title={grayscale ? 'Switch to color theme' : 'Switch to grayscale theme'}
      aria-label={grayscale ? 'Switch to color theme' : 'Switch to grayscale theme'}
      aria-pressed={grayscale}
    >
      <svg viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
