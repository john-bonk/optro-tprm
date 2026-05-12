import type { SubstepOutput } from '../../../types';
import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import styles from './lifecycle.module.css';
import TierOverrideMenu from '../overview/TierOverrideMenu';

interface Props {
  out: SubstepOutput;
}

export default function SubstepOutputRenderer({ out }: Props) {
  if (out.kind === 'text') {
    return <div className={styles.pvText}>{out.content}</div>;
  }
  if (out.kind === 'table' || out.kind === 'annotated') {
    const cols = out.headers.length;
    const grid = { gridTemplateColumns: Array(cols).fill('1fr').join(' ') };
    return (
      <div className={styles.pvTable}>
        <div className={`${styles.pvTableRow} ${styles.head}`} style={grid}>
          {out.headers.map((h, i) => <div key={i} className={styles.pvTableCell}>{h}</div>)}
        </div>
        {out.rows.map((row, ri) => (
          <div key={ri} className={styles.pvTableRow} style={grid}>
            {row.map((c, ci) => {
              let val: string = c;
              let cls = '';
              if (out.kind === 'annotated' && ci === row.length - 1) {
                if (c === 'pass') { cls = styles.pvResultPass; val = '✓ Pass'; }
                else if (c === 'flag') { cls = styles.pvResultFlag; val = '⚑ Flag'; }
                else if (c === 'fail') { cls = styles.pvResultFlag; val = '✗ Fail'; }
              }
              return <div key={ci} className={`${styles.pvTableCell} ${cls}`}>{val}</div>;
            })}
          </div>
        ))}
      </div>
    );
  }
  if (out.kind === 'chart') {
    const max = Math.max(...out.values, 100);
    return (
      <div className={styles.pvChart}>
        <div className={styles.pvChartBars}>
          {out.values.map((v, i) => (
            <div key={i} className={styles.pvBar} style={{ height: `${(v / max) * 100}%` }} />
          ))}
        </div>
        <div className={styles.pvChartAxis}>
          {out.labels.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    );
  }
  if (out.kind === 'hitl') {
    return (
      <div className={styles.pvHitl}>
        <div className={styles.pvHitlFlag}>⚑ Awaiting input</div>
        <div className={styles.pvHitlTitle}>{out.title}</div>
        <div className={styles.pvHitlBody}>{out.body}</div>
        <div className={styles.pvHitlActions}>
          {out.actions.map((a, i) => {
            const cls =
              i === 0 ? styles.pvBtnPrimary :
              (i === out.actions.length - 1 && out.actions.length > 2) ? styles.pvBtnDanger : styles.pvBtnSecondary;
            return <button key={a} className={`${styles.pvBtn} ${cls}`}>{a}</button>;
          })}
        </div>
      </div>
    );
  }
  if (out.kind === 'link') {
    return (
      <div className={styles.pvText} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {out.links.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    );
  }
  if (out.kind === 'tier') {
    return <TierOutput />;
  }
  if (out.kind === 'documents') {
    return <DocumentsOutput summaryDefault={out.summary} rows={out.rows} />;
  }
  return null;
}

function TierOutput() {
  const { state, acceptTier } = useWorkflow();
  const data = tierData[state.selectedTier];
  const grid = { gridTemplateColumns: '70px 1fr' };
  return (
    <div className={styles.pvResult}>
      <div className={styles.pvResultHeader}>
        <span className={styles.pvTierValue}>{data.label}</span>
        <span className={styles.pvTierMeta}>{data.confidence} · {data.subtitle}</span>
        {state.tierAccepted ? (
          <span className={`${styles.pvTierStatus} ${styles.pvTierStatusAccepted}`}>✓ Accepted</span>
        ) : (
          <span className={`${styles.pvTierStatus} ${styles.pvTierStatusPending}`}>Awaiting acceptance</span>
        )}
      </div>
      <div className={styles.pvResultTable}>
        <div className={`${styles.pvResultRow} ${styles.head}`} style={grid}>
          <div className={styles.pvResultCell}>Source</div>
          <div className={styles.pvResultCell}>Signal</div>
        </div>
        {tierSignals.map((s, i) => (
          <div key={i} className={styles.pvResultRow} style={grid}>
            <div className={`${styles.pvResultCell} ${styles.pvSource}`}>{s.source}</div>
            <div className={styles.pvResultCell}>{s.text}</div>
          </div>
        ))}
      </div>
      {!state.tierAccepted && (
        <div className={styles.pvResultActions}>
          <button className={`${styles.pvActionBtn} ${styles.pvActionPrimary}`} onClick={acceptTier}>
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M2.5 6.2l2.5 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accept {data.label}
          </button>
          <TierOverrideMenu>
            {(toggle) => (
              <button className={`${styles.pvActionBtn} ${styles.pvActionSecondary}`} onClick={toggle}>
                Override
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </TierOverrideMenu>
          <button className={`${styles.pvActionBtn} ${styles.pvActionDanger}`}>Escalate</button>
        </div>
      )}
    </div>
  );
}

const tierSignals = [
  { source: 'Zip', text: 'Spend $48,000 — exceeds Tier 3 threshold ($25K), below Tier 1 threshold ($100K)' },
  { source: 'Zip', text: 'Category: SaaS — requires security questionnaire per policy §4.1' },
  { source: 'AI',  text: 'No PII handling indicated — if PII present, would escalate to Tier 1' },
  { source: 'AI',  text: 'New vendor, no prior assessment history — conservative classification' },
];

interface DocumentsOutputProps {
  summaryDefault: string;
  rows: { name: string; source: string; status: 'received' | 'missing' }[];
}

function DocumentsOutput({ summaryDefault, rows }: DocumentsOutputProps) {
  const { state, requestMissingDocs } = useWorkflow();
  const grid = { gridTemplateColumns: '1.6fr 1fr 110px' };
  const effectiveRows = state.docsRequested
    ? rows.map(r => r.status === 'missing' ? { ...r, source: 'Vendor upload', status: 'received' as const } : r)
    : rows;
  const summary = state.docsRequested ? 'All 6 required documents received' : summaryDefault;
  return (
    <div className={styles.pvResult}>
      <div className={styles.pvResultHeader}>
        <span className={styles.pvDocsSummary}>{summary}</span>
        {!state.docsRequested && (
          <button
            className={`${styles.pvActionBtn} ${styles.pvActionSecondary}`}
            style={{ marginLeft: 'auto' }}
            onClick={requestMissingDocs}
          >
            Request missing docs
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <div className={styles.pvResultTable}>
        <div className={`${styles.pvResultRow} ${styles.head}`} style={grid}>
          <div className={styles.pvResultCell}>Document</div>
          <div className={styles.pvResultCell}>Source</div>
          <div className={styles.pvResultCell}>Status</div>
        </div>
        {effectiveRows.map((r, i) => {
          const statusEl = r.status === 'received'
            ? <span className={styles.pvResultPass}>✓ Received</span>
            : <span className={styles.pvResultFlag}>⚑ Missing</span>;
          const sourceCls = r.source === '—' ? styles.pvEmpty : '';
          return (
            <div key={i} className={styles.pvResultRow} style={grid}>
              <div className={`${styles.pvResultCell} ${styles.pvDocName}`}>{r.name}</div>
              <div className={`${styles.pvResultCell} ${sourceCls}`}>{r.source}</div>
              <div className={styles.pvResultCell}>{statusEl}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
