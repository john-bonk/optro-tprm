import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PortalGapsPage.module.css';

interface GapQuestion {
  id: string;
  category: 'CSA CAIQ' | 'SIG Lite' | 'Internal Risk';
  code: string;
  text: string;
}

// 8 questions matching the prototype's TOTAL_GAPS — three CAIQ, two SIG Lite, three Internal Risk.
const GAP_QUESTIONS: GapQuestion[] = [
  { id: 'caiq-dsi07', category: 'CSA CAIQ',      code: 'DSI-07', text: 'Where is customer data physically stored (region/country list)?' },
  { id: 'caiq-sef04', category: 'CSA CAIQ',      code: 'SEF-04', text: 'Have you experienced a confirmed security incident in the past 24 months?' },
  { id: 'caiq-iam12', category: 'CSA CAIQ',      code: 'IAM-12', text: 'How is MFA enforced for privileged administrative roles?' },
  { id: 'sig-q42',    category: 'SIG Lite',      code: 'Q42',    text: 'What is your sub-processor change notification SLA to customers?' },
  { id: 'sig-q88',    category: 'SIG Lite',      code: 'Q88',    text: 'When was your last full BCP/DR tabletop exercise?' },
  { id: 'int-ir03',   category: 'Internal Risk', code: 'IR-03',  text: 'What is your incident response SLA for severity-1 issues?' },
  { id: 'int-ir11',   category: 'Internal Risk', code: 'IR-11',  text: 'How do you isolate customer data between tenants?' },
  { id: 'int-ir19',   category: 'Internal Risk', code: 'IR-19',  text: 'Provide a list of regions where you process customer PII.' },
];

export default function PortalGapsPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const total = GAP_QUESTIONS.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter(v => v.trim().length > 0).length,
    [answers]
  );
  const pct = total === 0 ? 0 : (answeredCount / total) * 100;

  const onAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const onToggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onBack = () => {
    window.location.href = '/vendors/acme';
  };

  return (
    <div className={styles.page}>
      {/* Dark top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.protoBadge}>PROTOTYPE</span>
          <button className={styles.backLink} onClick={onBack}>← Back to Buyer view (Optro)</button>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.vendorAsLabel}>VENDOR AS:</span>
          <button className={styles.vendorAsPill} onClick={() => navigate('/portal/upload')}>Doc upload</button>
          <button className={`${styles.vendorAsPill} ${styles.vendorAsActive}`}>Q&amp;A gaps</button>
        </div>
      </header>

      {/* Brand bar — Acme Corp branded, sourced from Optro */}
      <div className={styles.brandBar}>
        <div className={styles.brandLeft}>
          <div className={styles.logoTile}>A</div>
          <div className={styles.brandName}>Acme Corp</div>
        </div>
        <div className={styles.brandRight}>
          Secure questionnaire from <span className={styles.optro}>Optro</span>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.contentCol}>
          {/* Intro card */}
          <section className={styles.introCard}>
            <h1 className={styles.title}>
              Optro needs your input on <span className={styles.titleAccent}>{total} questions</span>
            </h1>
            <p className={styles.intro}>
              Hi Acme team — we drafted answers for most of our security review from the docs you shared. A handful of questions still need your input. The link below opens a focused page (~10 min, expires in 14 days). Answers come straight back to us — no login required.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 4.5V7l1.6 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                ~10 min to complete
              </span>
              <span className={styles.metaItem}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <rect x="3" y="6.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 6.5V5a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Encrypted in transit · 14d link expiry
              </span>
              <span className={styles.metaItem}>Auto-attached to AuditBoard</span>
            </div>
          </section>

          {/* Progress */}
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>
              <strong>{answeredCount}</strong> of {total} answered
            </span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Question list */}
          <div className={styles.questionList}>
            {GAP_QUESTIONS.map(q => {
              const isCollapsed = collapsed.has(q.id);
              return (
                <div key={q.id} className={styles.qCard}>
                  <div className={styles.qHeader}>
                    <span className={`${styles.catPill} ${categoryClass(q.category, styles)}`}>{q.category}</span>
                    <span className={styles.qCode}>{q.code}</span>
                    <button
                      className={styles.qCollapseBtn}
                      onClick={() => onToggle(q.id)}
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                        {isCollapsed
                          ? <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          : <path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
                      </svg>
                    </button>
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className={styles.qText}>{q.text}</div>
                      <textarea
                        className={styles.qAnswer}
                        placeholder="Your answer..."
                        value={answers[q.id] ?? ''}
                        onChange={e => onAnswer(q.id, e.target.value)}
                        rows={3}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarText}>
          <strong>{answeredCount}</strong> of {total} answered · You can save and return any time before <strong>May 20, 2026</strong>.
        </div>
        <div className={styles.actionBarBtns}>
          <button className={styles.saveBtn}>Save</button>
          <button className={styles.submitBtn} disabled={answeredCount < total}>Submit answers</button>
        </div>
      </div>

      {/* Corner pill */}
      <div className={styles.cornerPill}>Prototype · Vendor view</div>
    </div>
  );
}

function categoryClass(category: GapQuestion['category'], styles: Record<string, string>): string {
  switch (category) {
    case 'CSA CAIQ':      return styles.catCaiq;
    case 'SIG Lite':      return styles.catSig;
    case 'Internal Risk': return styles.catInternal;
  }
}
