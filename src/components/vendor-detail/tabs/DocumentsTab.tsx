import { useEffect, useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../documents/documents.module.css';

type RowState = 'received' | 'missing' | 'loading';

interface DocRow {
  name: string;
  source: string;
  state: RowState;
}

const initialRows: DocRow[] = [
  { name: 'SOC 2 Type II Report',        source: 'Trust portal', state: 'received' },
  { name: 'Penetration Test Summary',    source: '—',            state: 'missing'  },
  { name: 'Business Continuity Plan',    source: '—',            state: 'missing'  },
  { name: 'Privacy Policy',              source: 'Trust portal', state: 'received' },
  { name: 'Information Security Policy', source: 'Trust portal', state: 'received' },
  { name: 'Data Processing Addendum',    source: 'Trust portal', state: 'received' },
];

export default function DocumentsTab() {
  const { state, requestMissingDocs } = useWorkflow();
  const [rows, setRows] = useState<DocRow[]>(initialRows);
  const [requesting, setRequesting] = useState(false);

  // If the workflow already advanced past docs_pending (e.g., user revisits),
  // mirror the "all received" state.
  useEffect(() => {
    if (state.docsRequested) {
      setRows(prev => prev.map(r => r.state === 'missing' || r.state === 'loading'
        ? { ...r, source: 'Vendor upload', state: 'received' }
        : r));
      setRequesting(false);
    }
  }, [state.docsRequested]);

  const onRequest = () => {
    if (requesting || state.docsRequested) return;
    setRequesting(true);
    // Step A: spinner on missing rows
    setRows(prev => prev.map(r => r.state === 'missing' ? { ...r, state: 'loading' } : r));
    // Step B: after 1300ms, mark them received
    window.setTimeout(() => {
      setRows(prev => prev.map(r => r.state === 'loading' ? { ...r, source: 'Vendor upload', state: 'received' } : r));
    }, 1300);
    // Kick off the workflow state transitions
    requestMissingDocs();
  };

  const allReceived = state.docsRequested || requesting && rows.every(r => r.state !== 'missing');
  const docsRequestedFinal = state.docsRequested;

  return (
    <div className={styles.body}>
      <div className={styles.banner}>
        <div className={styles.bannerIcon}>
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 6.2l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={styles.bannerText}>
          {docsRequestedFinal
            ? <><strong>All documents received</strong> — 6 of 6 required documents on file.</>
            : <><strong>Auto-discovery complete</strong> — 4 of 6 required documents found, 2 missing.</>}
        </div>
      </div>

      <div className={styles.docsHdr}>
        <div className={styles.docsTitle}>Required Documents</div>
        {!allReceived && (
          <button className={styles.actionBtn} onClick={onRequest}>
            Request missing docs
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`}>
          <div className={styles.cell}>Document</div>
          <div className={styles.cell}>Source</div>
          <div className={styles.cell}>Status</div>
          <div className={`${styles.cell} ${styles.action}`} />
        </div>
        {rows.map((r, i) => (
          <div key={i} className={styles.row}>
            <div className={`${styles.cell} ${styles.doc}`}>{r.name}</div>
            <div className={`${styles.cell} ${r.source === '—' ? styles.muted : ''}`}>
              {r.state === 'loading' ? <span className={styles.spinner} /> : r.source}
            </div>
            <div className={styles.cell}>
              {r.state === 'received' && <span className={`${styles.statusPill} ${styles.received}`}>Received</span>}
              {r.state === 'missing' && <span className={`${styles.statusPill} ${styles.missing}`}>Missing</span>}
              {r.state === 'loading' && (
                <span className={`${styles.statusPill} ${styles.loading}`}>
                  <span className={styles.spinner} />
                  Requesting
                </span>
              )}
            </div>
            <div className={`${styles.cell} ${styles.action}`}>
              {r.state === 'received' && <button className={styles.rowAction}>View</button>}
              {r.state === 'missing' && <button className={styles.rowAction}>↑ Upload</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
