import { useState } from 'react';
import styles from './TrustCenterPage.module.css';

const COMPLIANCE = ['CCPA', 'GDPR', 'HIPAA', 'EU-US DPF', 'SOC 1', 'SOC 2', 'ISO 27001', 'PCI DSS'];

export default function TrustCenterPage() {
  const [completing, setCompleting] = useState(false);

  const onComplete = () => {
    if (completing) return;
    setCompleting(true);
    try {
      const ch = new BroadcastChannel('optro-trust-center');
      ch.postMessage({ type: 'trust-center-complete' });
      ch.close();
    } catch {
      // BroadcastChannel unsupported — fall back to localStorage signal
      try { localStorage.setItem('optro-trust-center', String(Date.now())); } catch { /* noop */ }
    }
    window.setTimeout(() => {
      window.close();
      // If close was blocked (e.g., not a script-opened tab), show a fallback
      window.setTimeout(() => setCompleting(false), 200);
    }, 220);
  };

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logoTile}>A</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>ACME</span>
            <span className={styles.brandSub}>Trust Center</span>
          </div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.cloudBtn}>
            Cloud
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Security review card */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewTitle}>Start your security review</div>
          <div className={styles.reviewActions}>
            <button className={styles.completeBtn} onClick={onComplete} disabled={completing}>
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {completing ? 'Completing…' : 'Complete'}
            </button>
            <button className={styles.accessBtn}>
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                <rect x="3.5" y="6.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 6.5V5a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Get access
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchBar}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input className={styles.searchInput} placeholder="Search content" />
          <span className={styles.searchHint}>⌘ K</span>
        </div>

        {/* Two-card row */}
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <div className={styles.contentHeader}>
              <div className={styles.contentIcon}>
                <svg viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.contentTitle}>Overview</div>
              <button className={styles.expandBtn} aria-label="Expand">
                <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                  <path d="M2 5V2h3M12 5V2H9M2 9v3h3M12 9v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.overviewText}>
              <p>Welcome to the Acme Trust Center, your comprehensive resource for understanding the foundational principles, practices, and controls that secure and ensure the compliance of our data streaming platform and products.</p>
              <p>At Acme, we believe that customer trust is our most valuable asset, which is why we have engineered enterprise-grade security into the very core of our products and operations, following a &ldquo;security is foundational&rdquo; philosophy. We openly share our <a className={styles.link}>Trust Principles</a> and provide transparency into our robust security architecture, operational excellence, data privacy commitments, and governance programs.</p>
              <p>Here, you can easily access key public documentation, including third-party audit reports such as our SOC 2 Type 2, ISO 27001, and ISO 27701 certifications, in addition to privacy statements and regulatory readiness information for mandates like GDPR, HIPAA, and CCPA.</p>
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.contentHeader}>
              <div className={styles.contentIcon}>
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5l5.5 2v4c0 3.2-2.4 5.6-5.5 6.5-3.1-.9-5.5-3.3-5.5-6.5v-4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.contentTitle}>Compliance</div>
              <button className={styles.expandBtn} aria-label="Expand">
                <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                  <path d="M2 5V2h3M12 5V2H9M2 9v3h3M12 9v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.complianceGrid}>
              {COMPLIANCE.map(name => (
                <div className={styles.complianceCell} key={name}>
                  <div className={styles.complianceTile}>{name}</div>
                  <div className={styles.complianceLabel}>
                    <svg className={styles.checkIcon} viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#2BB17C" />
                      <path d="M4 7.3l2 2 4-4.3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
