import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VendorListPage.module.css';
import { requestedVendorsSeed } from '../data/requested-vendors';
import { managedVendorsSeed } from '../data/managed-vendors';
import type { ManagedVendor, RequestedVendor } from '../types';
import SourcePill from '../components/vendor-list/SourcePill';
import StatusPill from '../components/vendor-list/StatusPill';
import TierPill from '../components/vendor-list/TierPill';
import RiskScorePill from '../components/vendor-list/RiskScorePill';
import Toast from '../components/vendor-list/Toast';

type ListTab = 'requested' | 'managed';
type RowAnim = { state: 'accepting' | 'rejecting' | 'removing' | 'arriving' };

export default function VendorListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ListTab>('requested');
  const [requested, setRequested] = useState<RequestedVendor[]>(() => requestedVendorsSeed.map(v => ({ ...v })));
  const [managed, setManaged] = useState<ManagedVendor[]>(() => managedVendorsSeed.map(v => ({ ...v })));
  const [rowAnim, setRowAnim] = useState<Record<string, RowAnim>>({});
  const [toast, setToast] = useState<string | null>(null);

  const visibleRequested = useMemo(() => requested.filter(v => !v._removed), [requested]);
  const visibleManaged = useMemo(() => managed.filter(v => !v.hidden), [managed]);
  const reqCount = visibleRequested.length;
  const mngCount = visibleManaged.length;

  const setAnim = useCallback((id: string, state: RowAnim['state'] | null) => {
    setRowAnim(prev => {
      const next = { ...prev };
      if (state === null) delete next[id];
      else next[id] = { state };
      return next;
    });
  }, []);

  const acceptVendor = useCallback((id: string) => {
    setAnim(id, 'accepting');
    window.setTimeout(() => setAnim(id, 'removing'), 700);
    window.setTimeout(() => {
      const v = requested.find(r => r.id === id);
      setRequested(prev => prev.map(r => r.id === id ? { ...r, _removed: true } : r));

      // Reveal in managed if present
      const mv = managed.find(m => m.id === id);
      if (mv && mv.hidden) {
        // Switch to managed first so user sees the arrival animation
        setTab('managed');
        setManaged(prev => prev.map(m => m.id === id ? { ...m, hidden: false } : m));
        setAnim(id, 'arriving');
        window.setTimeout(() => setAnim(id, null), 1400);
      }

      setToast(`${(v && v.name) || 'Vendor'} moved to Managed Vendors`);
    }, 1100);
  }, [requested, managed, setAnim]);

  const rejectVendor = useCallback((id: string) => {
    setAnim(id, 'rejecting');
    window.setTimeout(() => setAnim(id, 'removing'), 600);
    window.setTimeout(() => {
      setRequested(prev => prev.map(r => r.id === id ? { ...r, _removed: true } : r));
    }, 1000);
  }, [setAnim]);

  const navToVendor = useCallback((id: string) => {
    if (id !== 'acme') return;
    navigate(`/vendors/${id}`);
  }, [navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.hdr}>
          <h1 className={styles.title}>Third Parties</h1>
          <button className={styles.addBtn}>
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Add Vendor
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'requested' ? styles.tabActive : ''}`}
            onClick={() => setTab('requested')}
          >
            Requested <span className={`${styles.count}`}>{reqCount}</span>
          </button>
          <button
            className={`${styles.tab} ${tab === 'managed' ? styles.tabActive : ''}`}
            onClick={() => setTab('managed')}
          >
            Managed Vendors <span className={`${styles.count} ${styles.countManaged}`}>{mngCount}</span>
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className={styles.search}
              placeholder={tab === 'requested' ? 'Search requested vendors...' : 'Search vendors...'}
            />
          </div>
          <button className={styles.filterBtn}>
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Filter
          </button>
          <div style={{ flex: 1 }} />
          <button className={styles.colsBtn}>
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M2.8 11.2l1.1-1.1M10.1 3.9l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Manage Columns
          </button>
          <button className={styles.moreBtn}>⋯</button>
        </div>

        {tab === 'requested' && (
          <div className={styles.tableWrap}>
            <div className={`${styles.row} ${styles.headRow} ${styles.requested}`}>
              <div className={styles.cellCheck}><input type="checkbox" disabled /></div>
              <div className={styles.cell}>Vendor Name</div>
              <div className={styles.cell}>Source</div>
              <div className={styles.cell}>Business Owner</div>
              <div className={styles.cell}>Category</div>
              <div className={styles.cell}>Est. Spend</div>
              <div className={styles.cell}>Date Requested</div>
              <div className={styles.cell}>Actions</div>
            </div>
            {requested.map(v => {
              if (v._removed) {
                // Keep removed rows hidden (display:none) once animation completes
                const anim = rowAnim[v.id];
                if (!anim) return null;
              }
              const anim = rowAnim[v.id];
              const animClass =
                anim?.state === 'accepting' ? styles.rowAccepting :
                anim?.state === 'rejecting' ? styles.rowRejecting :
                anim?.state === 'removing'  ? styles.rowRemoving  : '';
              return (
                <div
                  key={v.id}
                  className={`${styles.row} ${styles.requested} ${animClass}`}
                >
                  <div className={styles.cellCheck}><input type="checkbox" /></div>
                  <div className={`${styles.cell} ${styles.vendorName}`}>{v.name}</div>
                  <div className={styles.cell}><SourcePill source={v.source} /></div>
                  <div className={styles.cell}>{v.owner}</div>
                  <div className={styles.cell}>{v.category}</div>
                  <div className={styles.cell}>{v.spend}</div>
                  <div className={styles.cell}>{v.date}</div>
                  <div className={`${styles.cell} ${styles.actions}`}>
                    <button className={styles.actionAccept} onClick={() => acceptVendor(v.id)}>Accept</button>
                    <button className={styles.actionReject} onClick={() => rejectVendor(v.id)}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'managed' && (
          <div className={styles.tableWrap}>
            <div className={`${styles.row} ${styles.headRow} ${styles.managed}`}>
              <div className={styles.cellCheck}><input type="checkbox" disabled /></div>
              <div className={styles.cell}>Name</div>
              <div className={styles.cell}>Type</div>
              <div className={styles.cell}>Status</div>
              <div className={styles.cell}>Criticality</div>
              <div className={styles.cell}>Risk Score</div>
              <div className={styles.cell}>Last Questionnaire</div>
              <div className={styles.cell}>Owner</div>
              <div className={styles.cellMenu} />
            </div>
            {managed.map(v => {
              if (v.hidden) return null;
              const anim = rowAnim[v.id];
              const animClass = anim?.state === 'arriving' ? styles.rowArriving : '';
              return (
                <div
                  key={v.id}
                  className={`${styles.row} ${styles.managed} ${animClass}`}
                >
                  <div className={styles.cellCheck}><input type="checkbox" /></div>
                  <div className={styles.cell}>
                    {v.link
                      ? <a className={styles.vendorLink} onClick={() => navToVendor(v.id)}>{v.name}</a>
                      : <a className={styles.vendorLink}>{v.name}</a>}
                  </div>
                  <div className={styles.cell}>{v.type}</div>
                  <div className={styles.cell}><StatusPill status={v.status} /></div>
                  <div className={styles.cell}><TierPill tier={v.tier} /></div>
                  <div className={styles.cell}>
                    {v.score == null ? <span className={styles.dash}>—</span> : <RiskScorePill score={v.score} />}
                  </div>
                  <div className={styles.cell}>{v.lastQ ?? <span className={styles.dash}>—</span>}</div>
                  <div className={styles.cell}>{v.owner}</div>
                  <div className={styles.cellMenu}><button className={styles.menuBtn}>⋮</button></div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.pagination}>
          <span className={styles.pagLabel}>Rows per page</span>
          <div className={styles.pagSelect}>
            50
            <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.pagMeta}>{`1–${tab === 'managed' ? mngCount : reqCount} of ${tab === 'managed' ? mngCount : reqCount}`}</span>
          <button className={styles.pagArrow} disabled>
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path d="M7.5 3L4.5 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className={styles.pagArrow} disabled>
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
