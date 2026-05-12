import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import styles from './overview.module.css';

export default function HealthGrid() {
  const { state } = useWorkflow();
  const t = state.tierAccepted ? tierData[state.selectedTier] : null;
  const pillClassMap = {
    'pill-critical': styles.pillCritical,
    'pill-standard': styles.pillStandard,
    'pill-low':      styles.pillLow,
  };
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetLabel}>Health</div>
      <div className={styles.healthGrid}>
        <div className={styles.healthCell}>
          <div className={styles.healthCellLabel}>Risk</div>
          <div className={`${styles.healthCellValue} ${styles.muted}`}>—</div>
          <div className={`${styles.healthCellPill} ${styles.pillPending}`}>Pending</div>
        </div>
        <div className={styles.healthCell}>
          <div className={styles.healthCellLabel}>Tier</div>
          {t ? (
            <>
              <div className={styles.healthCellValue}>{t.label}</div>
              <div className={`${styles.healthCellPill} ${pillClassMap[t.pillClass]}`}>{t.name}</div>
            </>
          ) : (
            <>
              <div className={`${styles.healthCellValue} ${styles.muted}`}>—</div>
              <div className={`${styles.healthCellPill} ${styles.pillPending}`}>Pending</div>
            </>
          )}
        </div>
        <div className={styles.healthCell}>
          <div className={styles.healthCellLabel}>BitSight</div>
          <div className={styles.healthCellValue}>690</div>
          <div className={`${styles.healthCellPill} ${styles.pillIntermediate}`}>Intermediate</div>
        </div>
        <div className={styles.healthCell}>
          <div className={styles.healthCellLabel}>Maturity</div>
          <div className={`${styles.healthCellValue} ${styles.muted}`}>—</div>
          <div className={`${styles.healthCellPill} ${styles.pillPending}`}>Pending</div>
        </div>
      </div>
    </div>
  );
}
