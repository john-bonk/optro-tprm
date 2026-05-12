import styles from './GutterSidebar.module.css';

export default function GutterSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.item} title="Control Testing">CT</div>
      <div className={`${styles.item} ${styles.active}`} title="TPRM">TP</div>
      <div className={styles.item} title="Risk Assessment">RA</div>
      <div className={styles.item} title="Pre-IPO Readiness">IP</div>
      <div className={styles.item} title="Evidence Collection">EV</div>
      <div className={styles.divider} />
      <div className={styles.item} title="Setup">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M8 5v3l2 2M8 1.5v1M14.5 8h-1M8 13.5v1M2.5 8h-1M12.6 3.4l-.7.7M3.4 12.6l.7-.7M12.6 12.6l-.7-.7M3.4 3.4l.7.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
      <div className={styles.spacer} />
      <div className={styles.item} title="Audit Log">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M3.5 2.5h6l3 3v8h-9v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5.5 7h5M5.5 9.5h5M5.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.item} title="Admin">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 13.5c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    </aside>
  );
}
