import styles from '../intelligence/intelligence.module.css';
import docStyles from '../documents/documents.module.css';

export default function IntelligenceTab() {
  return (
    <div className={styles.body}>
      <div className={styles.reconBanner}>
        <div className={styles.reconBannerBody}>
          <strong>4 signals reconciled across sources</strong> — no conflicting indicators. 2 low-severity adverse news events in the past 12 months. No data absence flags raised. Last refreshed today at 9:14 AM.
        </div>
      </div>

      <div className={styles.intelGrid}>
        {/* Sanctions & Watchlists */}
        <div className={styles.card}>
          <div className={styles.label}>Sanctions &amp; Watchlists</div>
          <div className={styles.list}>
            {['OFAC', 'EU Sanctions', 'UN Sanctions', 'PEP screening'].map(label => (
              <div className={styles.row} key={label}>
                <div className={styles.rowLabel}>{label}</div>
                <div className={styles.rowValue}>
                  <span className={`${docStyles.statusPill} ${docStyles.received}`}>No matches</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cyber Risk Posture */}
        <div className={styles.card}>
          <div className={styles.label}>Cyber Risk Posture</div>
          <div className={styles.score}>
            <div className={styles.scoreValue}>690</div>
            <div className={styles.scoreMeta}>BitSight · Intermediate</div>
          </div>
          <div className={styles.chartWrap}>
            <div className={styles.bars}>
              {[72, 68, 81, 65, 70].map((h, i) => (
                <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={styles.axis}>
              <div>Total</div><div>Posture</div><div>Patch</div><div>Net</div><div>App</div>
            </div>
          </div>
        </div>

        {/* Adverse News */}
        <div className={styles.card}>
          <div className={styles.label}>Adverse News Signals</div>
          <div className={styles.news}>
            <div className={styles.newsItem}>
              <div className={styles.newsMeta}>2026-02-14 · Reuters</div>
              <div className={styles.newsTitle}>Minor cloud outage reported</div>
              <span className={`${styles.newsPill} ${styles.newsLow}`}>Low</span>
            </div>
            <div className={styles.newsItem}>
              <div className={styles.newsMeta}>2025-11-08 · TechCrunch</div>
              <div className={styles.newsTitle}>Senior engineering exec departure</div>
              <span className={`${styles.newsPill} ${styles.newsLow}`}>Low</span>
            </div>
          </div>
        </div>

        {/* Geographic */}
        <div className={styles.card}>
          <div className={styles.label}>Geographic &amp; Regulatory</div>
          <div className={styles.list}>
            <div className={styles.row}>
              <div className={styles.rowLabel}>Primary HQ</div>
              <div className={styles.rowValue}>San Francisco, US</div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowLabel}>Data residency</div>
              <div className={styles.rowValue}>US-East, US-West, EU-West</div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowLabel}>Geographic risk</div>
              <div className={styles.rowValue}>
                <span className={`${docStyles.statusPill} ${docStyles.received}`}>Low</span>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowLabel}>Regulatory exposure</div>
              <div className={styles.rowValue}>SOC 2, GDPR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
