import styles from './overview.module.css';

export default function KeyDatesStakeholders() {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetSection}>
        <div className={styles.widgetLabel}>Key dates</div>
        <div className={styles.kvList}>
          <Row k="Onboarded" v="May 8, 2026" />
          <Row k="Last assessed" v="—" muted />
          <Row k="Next reassessment" v="Set after first assessment" />
          <Row k="SOC 2 expires" v="Aug 12, 2026" />
        </div>
      </div>
      <div className={styles.widgetDivider} />
      <div className={styles.widgetSection}>
        <div className={styles.widgetLabel}>Stakeholders</div>
        <div className={styles.kvList}>
          <Row k="Business owner" v="Jorge Rivera" />
          <Row k="TPRM owner" v="Sarah Chen" />
          <Row k="Vendor contact" v="security@acmecloud.com" />
        </div>
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
