import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../intelligence/intelligence.module.css';
import docStyles from '../documents/documents.module.css';

export default function IntelligenceTab() {
  const { state, dismissBanner } = useWorkflow();
  const bannerDismissed = state.dismissedBanners['intelligence-reconciliation'] ?? false;
  const isLocked = state.workflowPhase === 'profile_pending' || state.workflowPhase === 'tier_pending';

  if (isLocked) {
    return (
      <div className={styles.body}>
        <div className={styles.lockedEmpty}>
          <div className={styles.lockedEmptyIcon}>
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
              <rect x="6" y="12" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 12V9a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.lockedEmptyTitle}>Intelligence signals will appear after setup</div>
          <div className={styles.lockedEmptyBody}>
            Set up the vendor profile and accept the risk tier classification to begin gathering external intelligence signals.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={`${styles.reconBanner} ${bannerDismissed ? styles.reconBannerDismissed : ''}`}>
        <div className={styles.reconBannerBody}>
          <strong>4 signals reconciled across sources</strong> — no conflicting indicators. 2 low-severity adverse news events in the past 12 months. No data absence flags raised. Last refreshed today at 9:14 AM.
        </div>
        <button
          className={styles.reconBannerDismiss}
          onClick={() => dismissBanner('intelligence-reconciliation')}
          aria-label="Dismiss banner"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
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
