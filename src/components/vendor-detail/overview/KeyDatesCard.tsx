import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import styles from './overview.module.css';

export default function KeyDatesCard() {
  const { state } = useWorkflow();
  const tierAcceptedLabel = state.tierAccepted ? `${tierData[state.selectedTier].label} · Today` : '—';
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetLabel}>Key dates</div>
      <div className={styles.kvList}>
        <Row k="Onboarded" v="Today" />
        <Row k="Tier accepted" v={tierAcceptedLabel} muted={!state.tierAccepted} />
        <Row k="Next milestone" v="Send DDQs" />
      </div>
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={styles.kvRow}>
      <span className={styles.kvKey}>{k}</span>
      <span className={`${styles.kvVal} ${muted ? styles.muted : ''}`}>{v}</span>
    </div>
  );
}
