import { useWorkflow } from '../../state/WorkflowContext';
import styles from './shared.module.css';

export default function StatusBanner() {
  const { state } = useWorkflow();
  return (
    <div className={styles.statusBanner}>
      <div className={styles.statusBannerIcon}>
        <svg viewBox="0 0 12 12" fill="none">
          <path d="M3 6.2l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={styles.statusBannerTitle}>{state.statusBannerTitle}</span>
      <span className={styles.statusBannerMeta}>{state.statusBannerMeta}</span>
    </div>
  );
}
