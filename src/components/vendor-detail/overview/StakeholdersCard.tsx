import styles from './overview.module.css';

export default function StakeholdersCard() {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetHeader}>
        <div className={styles.widgetLabel}>Stakeholders</div>
        <a className={styles.widgetAction}>Manage</a>
      </div>
      <div className={styles.kvList}>
        <Row k="Business owner" v="Jorge Rivera" />
        <Row k="TPRM owner" v="Sarah Chen" />
        <div className={styles.kvRow}>
          <span className={styles.kvKey}>Vendor contact</span>
          <span className={styles.kvValRow}>
            <span className={styles.muted}>—</span>
            <a className={styles.widgetAction}>Add</a>
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className={styles.kvRow}>
      <span className={styles.kvKey}>{k}</span>
      <span className={styles.kvVal}>{v}</span>
    </div>
  );
}
