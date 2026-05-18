import { useEffect, useRef, useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../documents/documents.module.css';
import SecureUploadPanel from '../documents/SecureUploadPanel';

type RowState = 'received' | 'missing' | 'loading';
type DocFilter = 'all' | 'missing' | 'expiring' | 'expired' | 'refresh' | 'archived';

interface DocRow {
  id: string;
  name: string;
  filename?: string;
  size?: string;
  signedVia?: string;
  notCollected?: boolean;
  type: string;
  source: 'Trust portal' | 'Zip' | 'Vendor' | null;
  issued?: string;
  expires?: string;
  expiresSub?: string;
  state: RowState;
  aiConf?: number;
}

const initialRows: DocRow[] = [
  { id: 'soc2',    name: 'SOC 2 Type II Report',        filename: 'acme-soc2-fy25.pdf',       size: '3.8 MB', type: 'SOC 2',    source: 'Trust portal', issued: 'Mar 12, 2026', expires: 'Mar 12, 2027', expiresSub: '10 months left', state: 'received', aiConf: 96 },
  { id: 'pentest', name: 'Penetration Test Summary',    notCollected: true,                                                       type: 'Pen Test', source: null,                                                                                state: 'missing' },
  { id: 'bcp',     name: 'Business Continuity Plan',    notCollected: true,                                                       type: 'BCP',      source: null,                                                                                state: 'missing' },
  { id: 'privacy', name: 'Privacy Policy',              filename: 'acme-privacy-policy.pdf',  size: '0.2 MB', type: 'Policy',   source: 'Trust portal', issued: 'Jan 14, 2026', expires: 'No expiration',                                state: 'received', aiConf: 94 },
  { id: 'infosec', name: 'Information Security Policy', filename: 'acme-infosec-policy.pdf',  size: '0.5 MB', type: 'Policy',   source: 'Trust portal', issued: 'Feb 03, 2026', expires: 'No expiration',                                state: 'received', aiConf: 92 },
  { id: 'dpa',     name: 'Data Processing Addendum',    filename: 'acme-dpa-2026.pdf',        size: '0.3 MB', signedVia: 'Zip', type: 'DPA',      source: 'Zip',          issued: 'Mar 01, 2026', expires: 'No expiration',                                state: 'received', aiConf: 89 },
];

const FILTERS: { id: DocFilter; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'missing',  label: 'Missing required' },
  { id: 'expiring', label: 'Expiring ≤ 30 days' },
  { id: 'expired',  label: 'Expired' },
  { id: 'refresh',  label: 'Refresh requested' },
  { id: 'archived', label: 'Archived versions' },
];

export default function DocumentsTab() {
  const { state, requestMissingDocs, dismissBanner } = useWorkflow();
  const bannerDismissed = state.dismissedBanners['documents-auto-discovery'] ?? false;
  const [rows, setRows] = useState<DocRow[]>(initialRows);
  const [requesting, setRequesting] = useState(false);
  const [filter, setFilter] = useState<DocFilter>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRequestRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (state.docsRequested) {
      setRows(prev => prev.map(r => r.state !== 'received'
        ? { ...r, source: 'Vendor' as const, filename: r.filename || `acme-${r.id}.pdf`, size: r.size || '0.4 MB', notCollected: false, issued: r.issued || 'May 13, 2026', expires: r.expires || 'No expiration', aiConf: r.aiConf || 88, state: 'received' as RowState }
        : r));
      setRequesting(false);
    }
  }, [state.docsRequested]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(e.target as Node)) return;
      setDropdownOpen(false);
    }
    if (dropdownOpen) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dropdownOpen]);

  // When the Trust Center tab posts Complete, run the same local spinner flow
  // so the user sees the upload animation in this tab too.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('optro-trust-center');
    ch.onmessage = (e) => {
      if (e?.data?.type === 'trust-center-complete') {
        triggerRequestRef.current?.();
      }
    };
    return () => ch.close();
  }, []);

  const triggerRequest = () => {
    if (requesting || state.docsRequested) return;
    setRequesting(true);
    setDropdownOpen(false);
    setRows(prev => prev.map(r => r.state === 'missing' ? { ...r, state: 'loading' } : r));
    window.setTimeout(() => {
      setRows(prev => prev.map(r =>
        r.state === 'loading'
          ? {
              ...r,
              state: 'received' as RowState,
              source: 'Vendor' as const,
              filename: `acme-${r.id}.pdf`,
              size: '0.4 MB',
              notCollected: false,
              issued: 'May 13, 2026',
              expires: 'No expiration',
              aiConf: 88,
            }
          : r));
    }, 1300);
    requestMissingDocs();
  };
  triggerRequestRef.current = triggerRequest;

  const counts = {
    all: rows.length,
    missing: rows.filter(r => r.state === 'missing').length,
    expiring: 0,
    expired: 0,
    refresh: 0,
    archived: 0,
  };

  const visibleRows = filter === 'missing'
    ? rows.filter(r => r.state !== 'received')
    : filter === 'all'
      ? rows
      : [];

  const allReceived = state.docsRequested || rows.every(r => r.state !== 'missing');

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
          <div className={styles.lockedEmptyTitle}>Required documents will appear after setup</div>
          <div className={styles.lockedEmptyBody}>
            Set up the vendor profile and accept the risk tier classification to generate the required documents list.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={`${styles.banner} ${bannerDismissed ? styles.bannerDismissed : ''}`}>
        <div className={styles.bannerIcon}>
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 6.2l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={styles.bannerText}>
          {state.docsRequested
            ? <><strong>All documents received</strong> — 6 of 6 required documents on file.</>
            : <><strong>Auto-discovery complete</strong> — 4 of 6 required documents found via Acme&apos;s trust portal. 2 still missing.</>}
        </div>
        <button
          className={styles.bannerDismiss}
          onClick={() => dismissBanner('documents-auto-discovery')}
          aria-label="Dismiss banner"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterPills}>
          {FILTERS.map(f => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                className={`${styles.filterPill} ${active ? styles.filterPillActive : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className={`${styles.filterCount} ${active ? styles.filterCountActive : ''}`}>
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        {!allReceived && (
          <div className={styles.dropdownWrap} ref={dropdownRef}>
            <button className={styles.requestBtn} onClick={() => setDropdownOpen(o => !o)}>
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                <path d="M6 8l2-2M5.5 8.5l-1 1a2 2 0 1 1-2.8-2.8l1-1M8.5 5.5l1-1a2 2 0 1 1 2.8 2.8l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Request missing
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownOption}
                  onClick={() => { setDropdownOpen(false); setPanelOpen(true); }}
                >
                  <span className={styles.dropdownIcon}>
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path d="M6 8l2-2M5.5 8.5l-1 1a2 2 0 1 1-2.8-2.8l1-1M8.5 5.5l1-1a2 2 0 1 1 2.8 2.8l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Send secure upload link</div>
                    <div className={styles.dropdownDesc}>Email the vendor a one-click upload page · 14d expiry</div>
                  </div>
                </button>
                <button
                  className={styles.dropdownOption}
                  onClick={() => {
                    setDropdownOpen(false);
                    window.open('/trust-center', '_blank');
                  }}
                >
                  <span className={styles.dropdownIcon}>
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <rect x="3.5" y="6.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5 6.5V5a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Open Acme&apos;s trust center</div>
                    <div className={styles.dropdownDesc}>Request access to gated documents</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {panelOpen && (
        <SecureUploadPanel
          onClose={() => setPanelOpen(false)}
          onSend={() => { setPanelOpen(false); triggerRequest(); }}
        />
      )}

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`}>
          <div className={styles.cell}>Document</div>
          <div className={styles.cell}>Type</div>
          <div className={styles.cell}>Source</div>
          <div className={styles.cell}>Issued</div>
          <div className={styles.cell}>Expires</div>
          <div className={styles.cell}>Status</div>
          <div className={styles.cell}>AI Conf.</div>
          <div className={styles.cell} />
        </div>
        {visibleRows.map(r => (
          <div key={r.id} className={styles.row}>
            <div className={`${styles.cell} ${styles.cellDoc}`}>
              <div className={styles.docMeta}>
                <div className={styles.docName}>{r.name}</div>
                <div className={styles.docSub}>
                  {r.notCollected
                    ? 'Not yet collected'
                    : <>
                        {r.filename}
                        {r.size && <> · {r.size}</>}
                        {r.signedVia && <> · signed via {r.signedVia}</>}
                      </>}
                </div>
              </div>
            </div>
            <div className={styles.cell}>
              <span className={styles.typeChip}>{r.type}</span>
            </div>
            <div className={styles.cell}>
              {r.source === 'Trust portal' && <span className={`${styles.sourceChip} ${styles.sourceTrust}`}>Trust portal</span>}
              {r.source === 'Zip' && <span className={`${styles.sourceChip} ${styles.sourceZip}`}>Zip</span>}
              {r.source === 'Vendor' && <span className={`${styles.sourceChip} ${styles.sourceVendor}`}>Vendor</span>}
              {r.source === null && (r.state === 'loading' ? <span className={styles.spinner} /> : <span className={styles.dash}>—</span>)}
            </div>
            <div className={styles.cell}>
              {r.issued ? r.issued : <span className={styles.dash}>—</span>}
            </div>
            <div className={styles.cell}>
              {r.expires
                ? <>
                    <div>{r.expires}</div>
                    {r.expiresSub && <div className={styles.expiresSub}>{r.expiresSub}</div>}
                  </>
                : <span className={styles.dash}>—</span>}
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
            <div className={styles.cell}>
              {r.aiConf != null
                ? <span className={styles.aiConf}>{r.aiConf}%</span>
                : <span className={styles.dash}>—</span>}
            </div>
            <div className={`${styles.cell} ${styles.cellAction}`}>
              {r.state === 'received' && <a className={styles.actionLink}>View</a>}
              {r.state === 'missing' && <a className={styles.actionLink} onClick={triggerRequest}>Request</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
