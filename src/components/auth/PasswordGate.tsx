import { useState, type ReactNode } from 'react';
import styles from './PasswordGate.module.css';

const STORAGE_KEY = 'optro-tprm-unlocked';
// Client-side gate — the password is embedded in the bundle and trivially
// bypassable. This is a demo veneer to keep random visitors out of the
// prototype, not a real authentication boundary.
const PASSWORD = 'OptroTPRM!';

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoTile}>O</div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Optro</div>
            <div className={styles.brandTag}>TPRM · Prototype</div>
          </div>
        </div>
        <h1 className={styles.title}>Restricted preview</h1>
        <p className={styles.body}>
          This is an internal prototype demonstrating the Optro Third-Party Risk Management workflow.
          Enter the access password to continue.
        </p>
        <form onSubmit={submit} className={styles.form} autoComplete="off">
          <label className={styles.label} htmlFor="optro-pw">PASSWORD</label>
          <input
            id="optro-pw"
            type="password"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            autoFocus
            aria-invalid={error}
            aria-describedby={error ? 'optro-pw-error' : undefined}
          />
          {error && (
            <div id="optro-pw-error" className={styles.errorMsg}>Incorrect password.</div>
          )}
          <button type="submit" className={styles.submit} disabled={!value.trim()}>
            Enter prototype
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <div className={styles.footnote}>
          Access provisioned by Optro · For questions, contact the prototype maintainer.
        </div>
      </div>
    </div>
  );
}
