import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface Props {
  msg: string;
  onDone: () => void;
}

export default function Toast({ msg, onDone }: Props) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setHiding(true), 3000);
    const t2 = window.setTimeout(() => onDone(), 3300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`${styles.toast} ${hiding ? styles.hiding : ''}`}>
      <span className={styles.icon}>
        <svg viewBox="0 0 12 12" fill="none">
          <path d="M3 6.2l2 2 4-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{msg}</span>
    </div>
  );
}
