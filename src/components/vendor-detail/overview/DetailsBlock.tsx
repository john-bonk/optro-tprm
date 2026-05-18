import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import type { DataClassification } from '../../../types';
import styles from '../profile/profile.module.css';

const DATA_CLASSIFICATION_OPTIONS: DataClassification[] = [
  'Public',
  'Internal',
  'Confidential',
  'Restricted / PII',
];

// Lets every Row inside the block render an empty placeholder when manual
// entry is primed but not yet committed.
const ManualEmptyContext = createContext(false);

export default function DetailsBlock() {
  const { state, completeManualEntry } = useWorkflow();
  // Manual entry primed but not yet committed → render empty placeholders and
  // make the whole block click-to-simulate the entry.
  const manualEmpty = state.profileManualPrimed && !state.profileConfigured;

  return (
    <div
      className={`${styles.detailsBlock} ${manualEmpty ? styles.detailsBlockClickable : ''}`}
      onClick={manualEmpty ? completeManualEntry : undefined}
      role={manualEmpty ? 'button' : undefined}
      tabIndex={manualEmpty ? 0 : undefined}
      onKeyDown={manualEmpty ? (e) => { if (e.key === 'Enter' || e.key === ' ') completeManualEntry(); } : undefined}
      title={manualEmpty ? 'Click anywhere to simulate manual entry' : undefined}
    >
      <div className={styles.detailsHdr}>
        <span className={styles.detailsTitle}>Details</span>
        {manualEmpty ? (
          <span className={styles.detailsManualHint}>
            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
              <path d="M2 11.5l1-3 6-6 2 2-6 6-3 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            Click anywhere to simulate manual entry
          </span>
        ) : (
          <button className={styles.customizeBtn}>
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 1.5v1.5M7 11v1.5M1.5 7h1.5M11 7h1.5M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Customize Field Layout
          </button>
        )}
      </div>

      <ManualEmptyContext.Provider value={manualEmpty}>
      <div className={styles.detailsBody}>
        {/* Left column */}
        <div className={styles.detailsColumn}>
          <Row label="Entity name" value="Acme Cloud Co." />
          <Row label="UID" value="VEN-2026-042" />
          <Row label="Entity type" value="Vendors" />
          <Row label="Description"
            value="Acme Cloud Co. is a managed data analytics and observability platform that ingests application and infrastructure telemetry across the company's production environments. It supports real-time dashboards, anomaly detection, and incident workflows, with role-scoped access for the Engineering, SRE, and Security organizations." />
          <Row label="Vendor services" value="Marketing analytics platform" />
          <Row label="Impacted regions" value="North America" />
          <Row label="Business justification" value="— —" empty />
          <RowNode label="Integrated systems">
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <a className={styles.detailsLink}>Identity Provider (uid: identity-provider)</a>
              <a className={styles.detailsLink}>Production Telemetry (uid: prod-telemetry)</a>
              <a className={styles.detailsLink}>Incident Pipeline (uid: incident-pipeline)</a>
              <a className={styles.detailsLink}>Audit Log Export (uid: audit-export)</a>
            </div>
          </RowNode>
          <Row label="Controls" value="—" empty />
          <Row label="Framework requirements" value="—" empty />
        </div>

        {/* Right column */}
        <div className={styles.detailsColumn}>
          <DataClassificationRow />
          <Row label="Category" value="SaaS" />
          <Row label="Est. spend" value="$48,000/yr" />
          <Row label="Affected by third party breach" value="—" empty />
          <Row label="Business owner" value="Jorge Rivera" />
          <Row label="TPRM owner" value="Sarah Chen" />
          <Row label="Internal owners" value="Maya Okafor (Director, Platform Engineering)" />
          <Row label="Additional owners" value="David Chen (Head of Information Security)" />
          <RowNode label="Address">
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <span>ACME CLOUD CO.</span>
              <span>1200 Harrison Street, Suite 400</span>
              <span>San Francisco CA 94103</span>
              <span>United States</span>
            </div>
          </RowNode>
          <Row label="City" value="San Francisco" />
          <RowNode label="TPRM — vendor type(s)">
            <div className={`${styles.detailsValue} ${styles.detailsValueMulti}`}>
              <span>Subservice Organization</span>
              <span>Software — SaaS</span>
              <span>Data Processor</span>
            </div>
          </RowNode>
          <Row label="Contact user" value="Acme Portal (account-mgmt@acmecloud.com)" />
        </div>
      </div>
      </ManualEmptyContext.Provider>
    </div>
  );
}

function Row({ label, value, empty }: { label: string; value: string; empty?: boolean }) {
  const manualEmpty = useContext(ManualEmptyContext);
  const display = manualEmpty ? '—' : value;
  const isEmpty = empty || manualEmpty;
  return (
    <div className={styles.detailsRow}>
      <div className={styles.detailsLabel}>{label}</div>
      <div className={`${styles.detailsValue} ${isEmpty ? styles.detailsValueEmpty : ''}`}>{display}</div>
    </div>
  );
}

function RowNode({ label, children }: { label: string; children: ReactNode }) {
  const manualEmpty = useContext(ManualEmptyContext);
  return (
    <div className={styles.detailsRow}>
      <div className={styles.detailsLabel}>{label}</div>
      {manualEmpty
        ? <div className={`${styles.detailsValue} ${styles.detailsValueEmpty}`}>—</div>
        : children}
    </div>
  );
}

function DataClassificationRow() {
  const { state, setDataClassification } = useWorkflow();
  const manualEmpty = useContext(ManualEmptyContext);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  if (manualEmpty) {
    return (
      <div className={styles.detailsRow}>
        <div className={styles.detailsLabel}>
          Data classification<span className={styles.required}>*</span>
        </div>
        <div className={`${styles.detailsValue} ${styles.detailsValueEmpty}`}>—</div>
      </div>
    );
  }

  return (
    <div className={styles.detailsRow}>
      <div className={styles.detailsLabel}>
        Data classification<span className={styles.required}>*</span>
      </div>
      <div className={styles.dcSelectWrap} ref={wrapRef}>
        <button className={styles.dcButton} onClick={() => setOpen(o => !o)}>
          {state.dataClassification}
          <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div className={styles.dcMenu}>
            {DATA_CLASSIFICATION_OPTIONS.map(opt => {
              const sel = state.dataClassification === opt;
              return (
                <button
                  key={opt}
                  className={`${styles.dcOption} ${sel ? styles.selected : ''}`}
                  onClick={() => { setDataClassification(opt); setOpen(false); }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
