import styles from './overview.module.css';

export default function RequestContextCard() {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetLabel}>Request context</div>
      <div className={styles.kvList}>
        <Row k="Submitted by" v="Jorge Rivera · Marketing" />
        <Row k="Source" v="Zip · Apr 28" />
        <Row k="Service requested" v="Marketing analytics platform" />
        <Row k="Est. spend" v="$48,000/yr" />
        <Row k="Justification" v="Replace legacy tooling for Q3 campaigns" />
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
