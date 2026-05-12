import type { SubstepStatus } from '../../../types';
import styles from './lifecycle.module.css';

export default function StatusIcon({ status }: { status: SubstepStatus }) {
  if (status === 'complete') {
    return (
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" fill="#3B6D11" />
        <path d="M5 8.4l2 2 4-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (status === 'in_progress') {
    return (
      <svg viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#185FA5" strokeWidth="1.5" />
        <circle className={styles.statusPulse} cx="8" cy="8" r="3" fill="#185FA5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#C8C6BE" strokeWidth="1.5" />
    </svg>
  );
}
