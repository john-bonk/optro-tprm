import { useState } from 'react';
import styles from './overview.module.css';

export default function DetailsBlock() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`${styles.detailsBlock} ${collapsed ? styles.detailsCollapsed : ''}`}>
      <div className={styles.detailsHdr} onClick={() => setCollapsed(c => !c)}>
        <span className={styles.detailsTitle}>Details</span>
        <svg className={styles.detailsChev} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className={styles.detailsBody}>
        <div className={styles.detailsColumn}>
          <Row label="Entity name" value="Acme Cloud Co." />
          <Row label="Entity type" value="Vendors" />
          <Row label="Description" value="Acme Cloud Co. is a managed data analytics and observability platform that ingests application and infrastructure telemetry across the company's production environments. It supports real-time dashboards, anomaly detection, and incident workflows, with role-scoped access for the Engineering, SRE, and Security organizations." />
          <Row label="Business justification" empty value="— —" />
          <div className={styles.detailsRow}>
            <div className={styles.detailsLabel}>Integrated systems</div>
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <a className={styles.detailsLink}>Identity Provider (uid: identity-provider)</a>
              <a className={styles.detailsLink}>Production Telemetry (uid: prod-telemetry)</a>
              <a className={styles.detailsLink}>Incident Pipeline (uid: incident-pipeline)</a>
              <a className={styles.detailsLink}>Audit Log Export (uid: audit-export)</a>
            </div>
          </div>
        </div>
        <div className={styles.detailsColumn}>
          <Row label="Internal owners" value="Maya Okafor (Director, Platform Engineering)" />
          <Row label="Additional owners" value="David Chen (Head of Information Security)" />
          <div className={styles.detailsRow}>
            <div className={styles.detailsLabel}>Address</div>
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <span>ACME CLOUD CO.</span>
              <span>1200 Harrison Street, Suite 400</span>
              <span>San Francisco CA 94103</span>
              <span>United States</span>
            </div>
          </div>
          <Row label="City" value="San Francisco" />
          <div className={styles.detailsRow}>
            <div className={styles.detailsLabel}>TPRM — vendor type(s)</div>
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <span>Subservice Organization</span>
              <span>Software — SaaS</span>
              <span>Data Processor</span>
            </div>
          </div>
          <Row label="Contact user" value="Acme Portal (account-mgmt@acmecloud.com)" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, empty }: { label: string; value: string; empty?: boolean }) {
  return (
    <div className={styles.detailsRow}>
      <div className={styles.detailsLabel}>{label}</div>
      <div className={`${styles.detailsValue} ${empty ? styles.detailsValueEmpty : ''}`}>{value}</div>
    </div>
  );
}
