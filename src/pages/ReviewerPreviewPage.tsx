import { useMemo, useState } from 'react';
import styles from './ReviewerPreviewPage.module.css';
import { ASSESSMENTS, QUESTIONS, REVIEWERS, VENDOR_RESPONSES, type Question } from '../data/assessments';

// Per-question decision in the reviewer view. Mirrors the TPRM drilldown's
// status enum but with reviewer semantics — pending → accepted | rejected.
type ReviewDecision = 'pending' | 'accepted' | 'rejected';

// Reviewer "certify view" — what a TPRM reviewer (Sarah/James/Maya) sees
// when they click the magic link from the Send-for-review email. Preview-only:
// state is local and ephemeral, no workflow side-effects.

const SUMMARY = {
  vendor: 'Acme Cloud Co.',
  uid: 'VEN-2026-042',
  tier: 'Tier 2 — Standard',
  score: 74,
  category: 'SaaS · Marketing analytics',
  owners: 'Jorge Rivera (Business) · Sarah Chen (TPRM)',
  dataClass: 'Internal',
};

const FINDINGS = [
  {
    severity: 'medium' as const,
    blocking: false,
    title: 'Sub-processor SLA undefined',
    anchor: 'CSA §STA-07 · SOC 2 §CC9',
    body: 'Vendor confirmed a 30-day advance notice for sub-processor changes via email and trust portal posting. SLA not yet captured in MSA — recommend contract addendum aligning with internal policy §6.3.',
  },
  {
    severity: 'low' as const,
    blocking: false,
    title: 'BCP/DR exercise scope narrow',
    anchor: 'ISO §A.17 · SIG Q88',
    body: 'Last full BCP/DR tabletop ran Nov 12, 2025 with 28 participants. Coverage adequate but did not include Customer Success — recommend expanded scope for May 2026 exercise.',
  },
  {
    severity: 'medium' as const,
    blocking: false,
    title: 'EU scope exclusion in SOC 2',
    anchor: 'GDPR Art. 28',
    body: 'SOC 2 Type II scope excludes EU processing region. No EU PII in current engagement scope, so non-blocking — re-evaluate if Acme begins processing EU data.',
  },
];

const RISK_DIMENSIONS = [
  { label: 'Cyber posture',         value: 35, confidence: 0.92 },
  { label: 'Financial stability',   value: 62, confidence: 0.81 },
  { label: 'Operational resilience',value: 48, confidence: 0.85 },
  { label: 'Compliance exposure',   value: 78, confidence: 0.95 },
  { label: 'Data sensitivity',      value: 55, confidence: 0.88 },
  { label: 'Geographic risk',       value: 42, confidence: 0.80 },
];

export default function ReviewerPreviewPage() {
  const [decision, setDecision] = useState<'approve_conditions' | 'approve' | 'reject' | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const totalQuestions = useMemo(
    () => ASSESSMENTS.reduce((s, a) => s + a.totalQuestions, 0),
    []
  );

  const onBack = () => {
    window.location.href = `${import.meta.env.BASE_URL}vendors/acme`;
  };

  return (
    <div className={styles.page}>
      {/* Dark prototype top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.protoBadge}>PROTOTYPE</span>
          <button className={styles.backLink} onClick={onBack}>← Back to Buyer view (Optro)</button>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.vendorAsLabel}>REVIEWING AS:</span>
          <button className={`${styles.vendorAsPill} ${styles.vendorAsActive}`}>Sarah Chen · TPRM Lead</button>
        </div>
      </header>

      {/* Brand bar — internal reviewer surface */}
      <div className={styles.brandBar}>
        <div className={styles.brandLeft}>
          <div className={styles.logoTile}>O</div>
          <div className={styles.brandName}>Optro · Reviewer Certify</div>
        </div>
        <div className={styles.brandRight}>
          Approval requested by <span className={styles.optro}>Akarsh Kaur</span> · 48-hour SLA
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.contentCol}>
          <section className={styles.introCard}>
            <h1 className={styles.title}>
              Sign off on the assessment package for <span className={styles.titleAccent}>{SUMMARY.vendor}</span>
            </h1>
            <p className={styles.intro}>
              The TPRM team has accepted all AI-drafted answers and closed every vendor gap. Review the residual-risk
              picture below, scan the three findings, and issue your decision. Approvals are sequential — Sarah, then
              James, then Maya. The package moves to report generation after the third sign-off.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 4.5V7l1.6 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                ~8 min to review
              </span>
              <span className={styles.metaItem}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <rect x="3" y="6.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 6.5V5a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Sequential reviewer chain · 3 approvals required
              </span>
              <span className={styles.metaItem}>Auto-recorded to vendor audit trail</span>
            </div>
          </section>

          {/* Vendor summary */}
          <section className={styles.summaryCard}>
            <div className={styles.summaryHead}>
              <div>
                <div className={styles.summaryLabel}>VENDOR</div>
                <div className={styles.summaryName}>{SUMMARY.vendor}</div>
                <div className={styles.summarySub}>{SUMMARY.uid} · {SUMMARY.category}</div>
              </div>
              <div className={styles.summaryFacts}>
                <Fact label="Tier"            value={SUMMARY.tier}                  tone="amber" />
                <Fact label="Composite score" value={`${SUMMARY.score} / 100`}      tone="amber" />
                <Fact label="Data class"      value={SUMMARY.dataClass}             tone="neutral" />
                <Fact label="Findings"        value="3 · 0 blocking"                tone="amber" />
              </div>
            </div>
            <div className={styles.summaryOwners}>
              <span className={styles.summaryLabel}>OWNERS</span>
              <span>{SUMMARY.owners}</span>
            </div>
          </section>

          {/* Suggested verdict */}
          <section className={styles.verdictCard}>
            <div className={styles.verdictHead}>
              <div>
                <div className={styles.verdictLabel}>SUGGESTED VERDICT</div>
                <div className={styles.verdictTitle}>Approve with conditions</div>
              </div>
              <div className={styles.aiTag}>AI-DRAFTED</div>
            </div>
            <div className={styles.verdictBody}>
              Acme presents <strong>moderate-to-elevated residual risk</strong> driven primarily by regulatory exposure
              (78) and data sensitivity (55). Cyber posture (35) and operational resilience (48) are acceptable for
              Tier 2. All three findings are non-blocking; the sub-processor SLA closes via a contract addendum prior
              to MSA execution.
            </div>
          </section>

          {/* Risk dimensions */}
          <section className={styles.card}>
            <div className={styles.cardHead}>RESIDUAL RISK SCORECARD</div>
            <div className={styles.dimensionGrid}>
              {RISK_DIMENSIONS.map(d => (
                <div key={d.label} className={styles.dimension}>
                  <div className={styles.dimensionLabel}>{d.label}</div>
                  <div className={styles.dimensionValueRow}>
                    <div className={styles.dimensionBar}>
                      <div className={styles.dimensionFill} style={{ width: `${d.value}%`, background: barColor(d.value) }} />
                    </div>
                    <span className={styles.dimensionNum}>{d.value}</span>
                  </div>
                  <div className={styles.dimensionConf}>Confidence {d.confidence.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Question-level review drilldown — the reviewer's primary
              decision surface. Per-question accept/reject and bulk
              accept/reject all live here. */}
          <QuestionReview totalQuestions={totalQuestions} />


          {/* Findings */}
          <section className={styles.card}>
            <div className={styles.cardHeadRow}>
              <span className={styles.cardHead}>FINDINGS</span>
              <span className={styles.cardCount}>3 · 0 blocking</span>
            </div>
            <div className={styles.findingList}>
              {FINDINGS.map((f, i) => (
                <div key={i} className={styles.finding}>
                  <div className={styles.findingHead}>
                    <span className={`${styles.severityPill} ${f.severity === 'medium' ? styles.sevMedium : styles.sevLow}`}>
                      {f.severity.toUpperCase()}
                    </span>
                    <span className={styles.nonBlockingPill}>Non-blocking</span>
                    <span className={styles.findingTitle}>{f.title}</span>
                    <span className={styles.findingAnchor}>{f.anchor}</span>
                  </div>
                  <div className={styles.findingBody}>{f.body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviewer chain */}
          <section className={styles.card}>
            <div className={styles.cardHead}>REVIEWER CHAIN</div>
            <div className={styles.reviewerChain}>
              {REVIEWERS.map((r, i) => (
                <div key={r.initials} className={styles.reviewerChainItem}>
                  <div className={styles.reviewerOrder}>{i + 1}</div>
                  <div className={styles.reviewerAvatar} style={{ background: r.color }}>{r.initials}</div>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerName}>{r.name}</div>
                    <div className={styles.reviewerRole}>{r.role}</div>
                  </div>
                  <div className={i === 0 ? styles.reviewerStatusActive : styles.reviewerStatusPending}>
                    {i === 0 ? 'Awaiting your decision' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Decision */}
          <section className={styles.decisionCard}>
            <div className={styles.cardHead}>YOUR DECISION</div>
            <div className={styles.decisionOptions}>
              <button
                className={`${styles.decisionBtn} ${styles.decisionApproveConditions} ${decision === 'approve_conditions' ? styles.decisionSelected : ''}`}
                onClick={() => setDecision('approve_conditions')}
              >
                <div className={styles.decisionBtnLabel}>Approve with conditions</div>
                <div className={styles.decisionBtnDesc}>Vendor moves to Monitoring · 3 findings persist as Issues</div>
              </button>
              <button
                className={`${styles.decisionBtn} ${decision === 'approve' ? styles.decisionSelected : ''}`}
                onClick={() => setDecision('approve')}
              >
                <div className={styles.decisionBtnLabel}>Approve</div>
                <div className={styles.decisionBtnDesc}>Vendor moves to Monitoring · no open Issues</div>
              </button>
              <button
                className={`${styles.decisionBtn} ${styles.decisionReject} ${decision === 'reject' ? styles.decisionSelected : ''}`}
                onClick={() => setDecision('reject')}
              >
                <div className={styles.decisionBtnLabel}>Reject</div>
                <div className={styles.decisionBtnDesc}>Vendor moves to Rejected status · workflow ends</div>
              </button>
            </div>
            <div className={styles.noteField}>
              <label className={styles.noteLabel}>REVIEWER NOTE (optional)</label>
              <textarea
                className={styles.noteInput}
                placeholder="Add context for the audit trail — visible to TPRM, the next reviewer, and the final report."
                value={reviewerNote}
                onChange={e => setReviewerNote(e.target.value)}
                rows={3}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarText}>
          {decision ? <><strong>Decision queued.</strong> Will route to James Park after submission.</> : <>Select a decision to submit · SLA <strong>48 hours</strong></>}
        </div>
        <div className={styles.actionBarBtns}>
          <button className={styles.saveBtn}>Save draft</button>
          <button className={styles.submitBtn} disabled={!decision}>Submit sign-off</button>
        </div>
      </div>

      <div className={styles.cornerPill}>Prototype · Reviewer view</div>
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'green' | 'neutral' }) {
  const cls =
    tone === 'amber'   ? styles.factAmber :
    tone === 'green'   ? styles.factGreen : styles.factNeutral;
  return (
    <div className={`${styles.fact} ${cls}`}>
      <div className={styles.factLabel}>{label}</div>
      <div className={styles.factValue}>{value}</div>
    </div>
  );
}

function barColor(v: number) {
  if (v >= 70) return 'var(--danger-solid)';
  if (v >= 50) return 'var(--t2-text)';
  return 'var(--green-emerald)';
}

// ──────────────────────────────────────────────────────────────
// QUESTION REVIEW — per-questionnaire drilldown with per-question
// Accept/Reject and bulk Accept all / Reject all controls.
// ──────────────────────────────────────────────────────────────

interface QuestionReviewProps { totalQuestions: number }

function QuestionReview({ totalQuestions }: QuestionReviewProps) {
  const [activeAssessmentId, setActiveAssessmentId] = useState(ASSESSMENTS[0].id);
  const activeAssessment = ASSESSMENTS.find(a => a.id === activeAssessmentId)!;

  // Questions are presented as a representative slice of each questionnaire
  // (same convention as the TPRM drilldown). Reviewer decisions are keyed by
  // questionnaire id + question id so switching questionnaires doesn't lose
  // state.
  const visibleQuestions = useMemo<Question[]>(() => {
    return QUESTIONS.map(q => q.status === 'gap'
      ? { ...q, status: 'drafted' as const, draftAnswer: VENDOR_RESPONSES[q.id] ?? q.draftAnswer, source: 'Vendor response', confidence: 'High' as const }
      : q);
  }, []);

  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const keyOf = (qid: string) => `${activeAssessmentId}::${qid}`;
  const decisionFor = (qid: string): ReviewDecision => decisions[keyOf(qid)] ?? 'pending';

  const setDecision = (qid: string, d: ReviewDecision) => {
    setDecisions(prev => ({ ...prev, [keyOf(qid)]: d }));
  };

  const acceptAllInActive = () => {
    setDecisions(prev => {
      const next = { ...prev };
      visibleQuestions.forEach(q => { next[keyOf(q.id)] = 'accepted'; });
      return next;
    });
  };
  const rejectAllInActive = () => {
    setDecisions(prev => {
      const next = { ...prev };
      visibleQuestions.forEach(q => { next[keyOf(q.id)] = 'rejected'; });
      return next;
    });
  };
  const acceptAllInPackage = () => {
    setDecisions(prev => {
      const next = { ...prev };
      ASSESSMENTS.forEach(a => visibleQuestions.forEach(q => { next[`${a.id}::${q.id}`] = 'accepted'; }));
      return next;
    });
  };
  const rejectAllInPackage = () => {
    setDecisions(prev => {
      const next = { ...prev };
      ASSESSMENTS.forEach(a => visibleQuestions.forEach(q => { next[`${a.id}::${q.id}`] = 'rejected'; }));
      return next;
    });
  };

  // Tallies for the current questionnaire + the whole package.
  const tally = (prefix: string) => {
    let accepted = 0;
    let rejected = 0;
    Object.entries(decisions).forEach(([k, v]) => {
      if (!k.startsWith(prefix)) return;
      if (v === 'accepted') accepted += 1;
      if (v === 'rejected') rejected += 1;
    });
    return { accepted, rejected };
  };
  const activeTally  = tally(`${activeAssessmentId}::`);
  const packageTally = ASSESSMENTS.reduce((acc, a) => {
    const t = tally(`${a.id}::`);
    return { accepted: acc.accepted + t.accepted, rejected: acc.rejected + t.rejected };
  }, { accepted: 0, rejected: 0 });

  return (
    <section className={styles.card}>
      <div className={styles.cardHeadRow}>
        <span className={styles.cardHead}>QUESTION-LEVEL REVIEW</span>
        <span className={styles.cardCount}>
          {packageTally.accepted} accepted · {packageTally.rejected} rejected · {totalQuestions - packageTally.accepted - packageTally.rejected} pending
        </span>
      </div>

      {/* Package-level bulk controls */}
      <div className={styles.bulkRow}>
        <button className={`${styles.bulkBtn} ${styles.bulkBtnAccept}`} onClick={acceptAllInPackage}>
          Accept all questionnaires
        </button>
        <button className={`${styles.bulkBtn} ${styles.bulkBtnReject}`} onClick={rejectAllInPackage}>
          Reject all questionnaires
        </button>
      </div>

      {/* Questionnaire selector */}
      <div className={styles.qSelector}>
        {ASSESSMENTS.map(a => {
          const t = tally(`${a.id}::`);
          const active = a.id === activeAssessmentId;
          return (
            <button
              key={a.id}
              className={`${styles.qSelectorBtn} ${active ? styles.qSelectorBtnActive : ''}`}
              onClick={() => setActiveAssessmentId(a.id)}
            >
              <div className={styles.qSelectorName}>{a.name}</div>
              <div className={styles.qSelectorMeta}>
                {a.totalQuestions} questions · {t.accepted}✓ · {t.rejected}✗
              </div>
            </button>
          );
        })}
      </div>

      {/* Per-questionnaire bulk controls + meta */}
      <div className={styles.qMeta}>
        <span><strong>{activeAssessment.name}</strong> · {activeAssessment.sub}</span>
        <span className={styles.qMetaSpacer} />
        <button className={`${styles.bulkBtn} ${styles.bulkBtnAccept} ${styles.bulkBtnSmall}`} onClick={acceptAllInActive}>
          Accept all {activeAssessment.totalQuestions}
        </button>
        <button className={`${styles.bulkBtn} ${styles.bulkBtnReject} ${styles.bulkBtnSmall}`} onClick={rejectAllInActive}>
          Reject all {activeAssessment.totalQuestions}
        </button>
      </div>

      <div className={styles.qSampleNote}>
        Showing a representative {visibleQuestions.length}-question slice of the {activeAssessment.totalQuestions}-question {activeAssessment.name} questionnaire. Per-question decisions persist across questionnaires for this preview.
      </div>

      {/* Question cards */}
      <div className={styles.qReviewList}>
        {visibleQuestions.map(q => {
          const d = decisionFor(q.id);
          return (
            <article
              key={q.id}
              className={`${styles.qReviewCard} ${d === 'accepted' ? styles.qReviewCardAccepted : d === 'rejected' ? styles.qReviewCardRejected : ''}`}
            >
              <header className={styles.qReviewHead}>
                <span className={styles.qReviewNum}>{q.num}</span>
                <div className={styles.qReviewText}>{q.text}</div>
                {d === 'accepted' && <span className={styles.qReviewStatus} data-status="accepted">ACCEPTED</span>}
                {d === 'rejected' && <span className={styles.qReviewStatus} data-status="rejected">REJECTED</span>}
                {d === 'pending'  && <span className={styles.qReviewStatus} data-status="pending">PENDING</span>}
              </header>
              <div className={styles.qReviewAnswer}>{q.draftAnswer}</div>
              <div className={styles.qReviewSourceRow}>
                <span>Sourced from:</span>
                {q.source
                  ? <span className={styles.qReviewSource}>{q.source}</span>
                  : <span className={styles.qReviewSourceEmpty}>no source found</span>}
                <span className={styles.qReviewConfidence}>AI confidence · <strong>{q.confidence}</strong></span>
              </div>
              <div className={styles.qReviewActions}>
                <button
                  className={`${styles.reviewBtn} ${styles.reviewBtnAccept} ${d === 'accepted' ? styles.reviewBtnSelected : ''}`}
                  onClick={() => setDecision(q.id, 'accepted')}
                >
                  {d === 'accepted' ? '✓ Accepted' : 'Accept'}
                </button>
                <button
                  className={`${styles.reviewBtn} ${styles.reviewBtnReject} ${d === 'rejected' ? styles.reviewBtnSelected : ''}`}
                  onClick={() => setDecision(q.id, 'rejected')}
                >
                  {d === 'rejected' ? '✗ Rejected' : 'Reject'}
                </button>
                {d !== 'pending' && (
                  <button className={styles.reviewBtnGhost} onClick={() => setDecision(q.id, 'pending')}>
                    Clear
                  </button>
                )}
                <span className={styles.reviewCommentLink}>Add comment</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.qReviewFooter}>
        <strong>{activeTally.accepted}</strong> accepted · <strong>{activeTally.rejected}</strong> rejected · <strong>{visibleQuestions.length - activeTally.accepted - activeTally.rejected}</strong> pending in this questionnaire
      </div>
    </section>
  );
}

