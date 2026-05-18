import { useMemo, useState } from 'react';
import styles from './InboxPage.module.css';
import { INBOX_COUNTS, inboxItems, type InboxItem, type InboxType } from '../data/inbox';

type Filter = 'all' | InboxType;

const FILTERS: { id: Filter; label: string; count: number }[] = [
  { id: 'all',      label: 'All',                             count: INBOX_COUNTS.all },
  { id: 'expiring', label: 'Expiring Documents',              count: INBOX_COUNTS.expiring },
  { id: 'gaps',     label: 'Questionnaire Gaps for Vendors',  count: INBOX_COUNTS.gaps },
  { id: 'signoff',  label: 'Awaiting TPRM signoff',           count: INBOX_COUNTS.signoff },
];

export default function InboxPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const base = filter === 'all' ? inboxItems : inboxItems.filter(i => i.type === filter);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(i =>
      i.vendor.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.subtitle.toLowerCase().includes(q));
  }, [filter, query]);

  const allChecked = filtered.length > 0 && filtered.every(i => selected.has(i.id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach(i => next.delete(i.id));
      else filtered.forEach(i => next.add(i.id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.hdr}>
          <h1 className={styles.title}>Inbox</h1>
          <button className={styles.settingsBtn} aria-label="Inbox settings">
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 1.5v1.5M7 11v1.5M1.5 7h1.5M11 7h1.5M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className={styles.intro}>
          Cross-vendor work waiting on TPRM. AI drafts the action where it can; you approve and send.
        </p>

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
                <span className={`${styles.filterCount} ${active ? styles.filterCountActive : ''}`}>{f.count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              placeholder="Search inbox..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className={styles.filterBtn}>
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Filter
          </button>
          <div style={{ flex: 1 }} />
          <button className={styles.sendSelectedBtn}>
            Send selected ( {selected.size} )
          </button>
        </div>

        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <div className={styles.cellCheck}>
              <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            </div>
            <div className={styles.cell}>Type</div>
            <div className={styles.cell}>Vendor</div>
            <div className={styles.cell}>Item</div>
            <div className={styles.cell}>When</div>
            <div className={styles.cell}>Action</div>
          </div>
          {filtered.map(item => (
            <InboxRow
              key={item.id}
              item={item}
              checked={selected.has(item.id)}
              onToggle={() => toggleRow(item.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className={styles.emptyState}>No items match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  item: InboxItem;
  checked: boolean;
  onToggle: () => void;
}

function InboxRow({ item, checked, onToggle }: RowProps) {
  const typeClass =
    item.type === 'expiring' ? styles.typeExpiring :
    item.type === 'gaps' ? styles.typeGaps : styles.typeSignoff;
  const typeLabel =
    item.type === 'expiring' ? 'Expiring Documents' :
    item.type === 'gaps' ? 'Questionnaire Gaps for Vendors' : 'Awaiting TPRM signoff';
  const actionLabel = item.action === 'signoff' ? 'Review and sign-off' : 'Review & send';

  return (
    <div className={styles.row}>
      <div className={styles.cellCheck}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </div>
      <div className={styles.cell}>
        <span className={`${styles.typePill} ${typeClass}`}>{typeLabel}</span>
      </div>
      <div className={styles.cell}>
        <a className={styles.vendorLink}>{item.vendor}</a>
      </div>
      <div className={styles.cell}>
        <div className={styles.itemTitle}>{item.title}</div>
        <div className={styles.itemSub}>{item.subtitle}</div>
      </div>
      <div className={styles.cell}>
        <div className={`${styles.whenLabel} ${item.whenAccent ? styles.whenAccent : ''}`}>{item.whenLabel}</div>
        {item.whenSub && <div className={styles.whenSub}>{item.whenSub}</div>}
      </div>
      <div className={styles.cell}>
        <a className={styles.actionLink}>{actionLabel}</a>
      </div>
    </div>
  );
}
