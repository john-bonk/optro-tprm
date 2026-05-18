import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import styles from './profile.module.css';

export default function TierClassificationBlock() {
  const { state } = useWorkflow();
  const tier = tierData[state.selectedTier];
  const tierLabel = `${tier.label} — ${state.tierAccepted ? 'confirmed' : 'pending'}`;
  const meta = state.tierAccepted
    ? 'AI suggested with 87% confidence · 4 policy signals · confirmed today'
    : 'AI suggested with 87% confidence · 4 policy signals · awaiting confirmation';

  return (
    <div className={styles.tierClassBlock}>
      <div className={styles.tierClassHdr}>
        <div className={styles.tierClassTitle}>Tier Classification</div>
        <button className={styles.reclassifyBtn}>
          <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
            <path d="M2 11.5l1-3 6-6 2 2-6 6-3 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Re-classify
          <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className={styles.tierClassBody}>
        <span className={`${styles.tierPill} ${state.tierAccepted ? styles.tierPillConfirmed : styles.tierPillPending}`}>
          {tierLabel}
        </span>
        <span className={styles.tierClassMeta}>{meta}</span>
      </div>
    </div>
  );
}
