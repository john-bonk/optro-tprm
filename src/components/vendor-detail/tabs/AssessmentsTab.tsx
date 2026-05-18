import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../assessments/assessments.module.css';
import {
  ASSESSMENTS,
  IN_PROGRESS_STATE,
  REVIEWERS,
  REVIEWER_COLORS,
  REVIEW_PENDING_TOTAL_MS,
  REVIEW_PENDING_INTRO_MS,
  STATUS_LABEL,
  TOTAL_GAPS,
  type AssessmentDef,
  type AssessmentStatus,
} from '../../../data/assessments';
import OpenedAssessment from '../assessments/OpenedAssessment';

export default function AssessmentsTab() {
  const [searchParams] = useSearchParams();
  const openedId = searchParams.get('assessment');

  if (openedId) return <OpenedAssessment assessmentId={openedId} />;
  return <ListView />;
}

// ─────────────────────────────────────────────
// TABULAR LIST VIEW — drives both default (queued) and in-progress states
// ─────────────────────────────────────────────

type Filter = 'all' | 'drafting' | 'gaps' | 'review' | 'certified';

interface DerivedRow {
  def: AssessmentDef;
  status: AssessmentStatus;
  draftedCount: number;
  totalQuestions: number;
  gapCount: number;
  isAnimating: boolean;
}

const DRAFTING_ANIM_MS = 2400;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Per-phase target state for each assessment row.
function targetsFor(phase: typeof WORKFLOW_PHASES[number]) {
  const drafted: Record<string, number> = {};
  const gaps: Record<string, number> = {};
  ASSESSMENTS.forEach(def => {
    const p = IN_PROGRESS_STATE[def.id];
    if (phase === 'assessments_started') {
      drafted[def.id] = p.draftedCount;
      gaps[def.id] = p.gapCount;
    } else if (
      phase === 'gaps_in_flight' ||
      phase === 'acceptance_pending' ||
      phase === 'review_pending' ||
      phase === 'report_pending' ||
      phase === 'monitoring_active'
    ) {
      drafted[def.id] = def.totalQuestions;
      gaps[def.id] = 0;
    } else {
      drafted[def.id] = 0;
      gaps[def.id] = 0;
    }
  });
  return { drafted, gaps };
}

const WORKFLOW_PHASES = [
  'profile_pending',
  'tier_pending',
  'docs_pending',
  'assessments_pending',
  'assessments_started',
  'gaps_in_flight',
  'acceptance_pending',
  'review_pending',
  'report_pending',
  'monitoring_active',
] as const;

function zeros(): Record<string, number> {
  const out: Record<string, number> = {};
  ASSESSMENTS.forEach(def => { out[def.id] = 0; });
  return out;
}

function ListView() {
  const { state, startAssessments, openSendGapsPanel, bulkAcceptAssessments, openSendForReviewPanel, dismissBanner } = useWorkflow();
  const resolvedBannerDismissed = state.dismissedBanners['assessments-resolved'] ?? false;
  const reportReadyBannerDismissed = state.dismissedBanners['assessments-report-ready'] ?? false;
  // Hard lock — full empty state shown before tier acceptance.
  const isHardLocked =
    state.workflowPhase === 'profile_pending' ||
    state.workflowPhase === 'tier_pending';
  // Soft lock — table visible but Open/Add disabled while docs are still being collected.
  const isLocked = isHardLocked || state.workflowPhase === 'docs_pending';
  const inProgress =
    state.workflowPhase === 'assessments_started' ||
    state.workflowPhase === 'gaps_in_flight' ||
    state.workflowPhase === 'acceptance_pending' ||
    state.workflowPhase === 'review_pending' ||
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';
  const canStart = state.workflowPhase === 'assessments_pending';
  const canAccept = state.workflowPhase === 'acceptance_pending';

  // Initial animated state matches the phase's terminal state — so users who
  // mount the page mid-phase see the right numbers without playing the animation.
  const initialTargets = useMemo(() => targetsFor(state.workflowPhase), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [animatedDrafted, setAnimatedDrafted] = useState<Record<string, number>>(initialTargets.drafted);
  const [animatedGaps, setAnimatedGaps] = useState<Record<string, number>>(initialTargets.gaps);
  const [animKind, setAnimKind] = useState<'idle' | 'drafting' | 'closing-gaps'>('idle');
  const prevPhaseRef = useRef(state.workflowPhase);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = state.workflowPhase;

    type Transition = {
      kind: 'drafting' | 'closing-gaps';
      from: { drafted: Record<string, number>; gaps: Record<string, number> };
      to:   { drafted: Record<string, number>; gaps: Record<string, number> };
      introDelay: number;
      duration: number;
      hold: number;
    };

    let plan: Transition | null = null;
    if (prevPhase === 'assessments_pending' && state.workflowPhase === 'assessments_started') {
      plan = {
        kind: 'drafting',
        from: { drafted: zeros(), gaps: zeros() },
        to:   targetsFor('assessments_started'),
        introDelay: 0,
        duration: DRAFTING_ANIM_MS,
        hold: 0,
      };
    } else if (prevPhase === 'assessments_started' && state.workflowPhase === 'gaps_in_flight') {
      // Vendor responses come back: drafted → total, gaps → 0.
      plan = {
        kind: 'closing-gaps',
        from: targetsFor('assessments_started'),
        to:   targetsFor('gaps_in_flight'),
        introDelay: 700, // brief "awaiting response" pause
        duration: 2100,
        hold: 400,
      };
    }
    if (!plan) return;

    // Snap to "from" so the animation starts cleanly.
    setAnimatedDrafted(plan.from.drafted);
    setAnimatedGaps(plan.from.gaps);
    setAnimKind(plan.kind);

    let rafId = 0;
    let startTime = 0;
    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const elapsed = now - startTime - plan!.introDelay;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / plan!.duration, 1);
      const eased = easeOutCubic(t);
      const nextDrafted: Record<string, number> = {};
      const nextGaps: Record<string, number> = {};
      ASSESSMENTS.forEach(def => {
        const dFrom = plan!.from.drafted[def.id];
        const dTo   = plan!.to.drafted[def.id];
        const gFrom = plan!.from.gaps[def.id];
        const gTo   = plan!.to.gaps[def.id];
        nextDrafted[def.id] = Math.round(dFrom + eased * (dTo - dFrom));
        nextGaps[def.id]    = Math.round(gFrom + eased * (gTo - gFrom));
      });
      setAnimatedDrafted(nextDrafted);
      setAnimatedGaps(nextGaps);
      if (elapsed < plan!.duration + plan!.hold) {
        rafId = requestAnimationFrame(tick);
      } else {
        setAnimKind('idle');
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [state.workflowPhase]);

  const isAnimating = animKind !== 'idle';

  const rows: DerivedRow[] = useMemo(() => ASSESSMENTS.map(def => {
    if (!inProgress) {
      return {
        def,
        status: 'queued' as const,
        draftedCount: 0,
        totalQuestions: def.totalQuestions,
        gapCount: 0,
        isAnimating: false,
      };
    }
    let status: AssessmentStatus;
    if (state.workflowPhase === 'assessments_started') {
      status = animKind === 'drafting' ? 'drafting' : 'gaps';
    } else if (state.workflowPhase === 'gaps_in_flight') {
      // Vendor is actively filling the gaps we sent.
      status = 'filling_gaps';
    } else if (state.workflowPhase === 'acceptance_pending') {
      // All responses in; proto user is accepting drafts before reviewer route.
      status = 'ready_for_review';
    } else if (state.workflowPhase === 'review_pending') {
      // Package sent · reviewers signing off.
      status = 'review';
    } else {
      // report_pending / monitoring_active — reviewers approved.
      status = 'certified';
    }
    return {
      def,
      status,
      draftedCount: animatedDrafted[def.id] ?? def.totalQuestions,
      totalQuestions: def.totalQuestions,
      gapCount: animatedGaps[def.id] ?? 0,
      isAnimating,
    };
  }), [inProgress, animatedDrafted, animatedGaps, animKind, isAnimating, state.workflowPhase]);

  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // The "active" filter spans the three middle statuses so users can keep a
  // single filter active as the workflow progresses through filling_gaps →
  // ready_for_review → in_review.
  const isActiveStatus = (s: AssessmentStatus) =>
    s === 'filling_gaps' || s === 'ready_for_review' || s === 'review';

  const counts: Record<Filter, number> = {
    all:       rows.length,
    drafting:  rows.filter(r => r.status === 'drafting').length,
    gaps:      rows.filter(r => r.status === 'gaps').length,
    review:    rows.filter(r => isActiveStatus(r.status)).length,
    certified: rows.filter(r => r.status === 'certified').length,
  };

  const visible = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'review') return rows.filter(r => isActiveStatus(r.status));
    const map: Record<Exclude<Filter, 'all' | 'review'>, AssessmentStatus> = {
      drafting: 'drafting', gaps: 'gaps', certified: 'certified',
    };
    return rows.filter(r => r.status === map[filter]);
  }, [filter, rows]);

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Filter label adapts to the current workflow moment so the pill reads
  // accurately when the user is filtering during each sub-phase.
  const activeFilterLabel =
    state.workflowPhase === 'gaps_in_flight'     ? 'Filling Gaps' :
    state.workflowPhase === 'acceptance_pending' ? 'Ready for Review' :
    state.workflowPhase === 'review_pending'     ? 'In Review' :
                                                   'In Review';

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'drafting',  label: 'AI Drafting' },
    { id: 'gaps',      label: 'Gaps Awaiting' },
    { id: 'review',    label: activeFilterLabel },
    { id: 'certified', label: 'Certified' },
  ];

  // Banners are mutually exclusive across the phase chain.
  const showGapsBanner = state.workflowPhase === 'assessments_started' && !isAnimating && !state.gapsSent && TOTAL_GAPS > 0;
  const showInFlightBanner = state.workflowPhase === 'gaps_in_flight';
  const showResolvedBanner = state.workflowPhase === 'acceptance_pending';
  const showReviewInFlightBanner = state.workflowPhase === 'review_pending';
  const showReportReadyBanner = state.workflowPhase === 'report_pending';

  // Derive the in-flight banner message from the actual row animation so the
  // counter in the banner stays in lockstep with the row gap counters ticking down.
  const totalRemainingGaps = ASSESSMENTS.reduce((s, def) => s + (animatedGaps[def.id] ?? 0), 0);
  const totalAnswered = TOTAL_GAPS - totalRemainingGaps;
  const inFlightPct = TOTAL_GAPS === 0 ? 1 : totalAnswered / TOTAL_GAPS;

  if (isHardLocked) {
    return (
      <div className={styles.body}>
        <div className={styles.hardLockedEmpty}>
          <div className={styles.hardLockedIcon}>
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
              <rect x="6" y="12" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 12V9a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.hardLockedTitle}>Recommended assessments will appear after setup</div>
          <div className={styles.hardLockedBody}>
            Set up the vendor profile and accept the risk tier classification to populate the recommended assessment questionnaires.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      {isLocked && (
        <div className={styles.lockedBanner}>
          <div className={styles.lockedBannerIcon}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <rect x="3" y="6.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 6.5V5a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.lockedBannerText}>
            Assessments unlock once required documents are collected. Recommended questionnaires are previewed below.
          </div>
        </div>
      )}

      {showGapsBanner && (
        <div className={styles.gapsBanner}>
          <div className={styles.gapsBannerIcon}>
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path d="M7 1.5l5.5 9.5h-11z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M7 5.5v2.8M7 9.6h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.gapsBannerText}>
            <strong>{TOTAL_GAPS} questions across {ASSESSMENTS.length} questionnaires</strong> need vendor input before Acme can be approved. Sending in one batch keeps Acme&rsquo;s inbox manageable.
          </div>
          <button className={styles.gapsBannerBtn} onClick={openSendGapsPanel}>
            Send all  {TOTAL_GAPS}  gaps to Acme
          </button>
        </div>
      )}

      {showInFlightBanner && (
        <div className={styles.inFlightBanner}>
          <div className={styles.inFlightSpinner}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 1.5a6.5 6.5 0 1 1-6.4 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.inFlightTextCol}>
            <div className={styles.inFlightText}>
              {totalAnswered === 0
                ? <><strong>Gap request sent to Acme</strong> · awaiting vendor responses…</>
                : totalAnswered < TOTAL_GAPS
                  ? <><strong>Receiving vendor responses</strong> · <span className={styles.inFlightCounter}>{totalAnswered} of {TOTAL_GAPS}</span> answers received · closing gaps</>
                  : <><strong>All {TOTAL_GAPS} responses received</strong> · finalizing assessment…</>}
            </div>
            <div className={styles.inFlightProgressBar}>
              <div className={styles.inFlightProgressFill} style={{ width: `${Math.round(inFlightPct * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {showResolvedBanner && (
        <div className={`${styles.resolvedBanner} ${resolvedBannerDismissed ? styles.resolvedBannerDismissed : ''}`}>
          <div className={styles.resolvedBannerIcon}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M3 7.2l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.resolvedBannerText}>
            <strong>All {TOTAL_GAPS} vendor responses received · gaps closed.</strong>{' '}
            Accept the answers — individually or in bulk — then send the package to reviewers for sign-off.
          </div>
          <button
            className={styles.resolvedBannerDismiss}
            onClick={() => dismissBanner('assessments-resolved')}
            aria-label="Dismiss banner"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {showReviewInFlightBanner && (
        <ReviewerSimBanner />
      )}

      {showReportReadyBanner && (
        <div className={`${styles.resolvedBanner} ${reportReadyBannerDismissed ? styles.resolvedBannerDismissed : ''}`}>
          <div className={styles.resolvedBannerIcon}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M3 7.2l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.resolvedBannerText}>
            <strong>Reviewers approved the assessment package</strong> · all answers accepted and sign-off complete. Acme is fully reviewed — ready to generate the risk report.
          </div>
          <button
            className={styles.resolvedBannerDismiss}
            onClick={() => dismissBanner('assessments-report-ready')}
            aria-label="Dismiss banner"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

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
                <span className={`${styles.filterCount} ${active ? styles.filterCountActive : ''}`}>{counts[f.id]}</span>
              </button>
            );
          })}
        </div>
        {canStart && (
          <button className={styles.startAssessmentsBtn} onClick={startAssessments}>
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 2.5l6 3.5-6 3.5z" fill="currentColor" />
            </svg>
            Start Assessments
          </button>
        )}
        {canAccept && (
          <button className={styles.startAssessmentsBtn} onClick={() => openSendForReviewPanel()}>
            Send for review
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`}>
          <div className={styles.cellCheck}><input type="checkbox" disabled /></div>
          <div className={styles.cell}>Questionnaire</div>
          <div className={styles.cell}>Status</div>
          <div className={styles.cell}>Progress</div>
          <div className={styles.cell}>Gaps</div>
          <div className={styles.cell}>Sent</div>
          <div className={styles.cell}>Due</div>
          <div className={styles.cell}>Preparer</div>
          <div className={styles.cell}>Reviewers</div>
          <div className={styles.cell} />
        </div>
        {visible.map(r => (
          <AssessmentTableRow
            key={r.def.id}
            row={r}
            checked={selected.has(r.def.id)}
            onToggle={() => toggleRow(r.def.id)}
            disabled={isLocked}
          />
        ))}
        {visible.length === 0 && (
          <div className={styles.emptyState}>No assessments match this filter.</div>
        )}
      </div>

      <button
        className={styles.addQuestionnaireSubtle}
        disabled={isLocked}
        aria-disabled={isLocked}
      >
        + Add questionnaire
      </button>

      {selected.size > 0 && (
        <div className={styles.selectionBar}>
          <div className={styles.selectionLeft}>
            <button className={styles.selectionBack} onClick={() => setSelected(new Set())} aria-label="Clear selection">
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className={styles.selectionCount}>{selected.size} selected</span>
            <button className={styles.selectionLink} onClick={() => setSelected(new Set(visible.map(r => r.def.id)))}>
              Select all
            </button>
            <button className={styles.selectionLink} onClick={() => setSelected(new Set())}>
              Deselect all
            </button>
          </div>
          <div className={styles.selectionRight}>
            {canAccept && (
              <button
                className={`${styles.selectionAction} ${styles.selectionPrimary}`}
                onClick={() => {
                  bulkAcceptAssessments(Array.from(selected));
                  setSelected(new Set());
                }}
              >
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                  <path d="M2.5 6.2l2.5 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Accept all values
              </button>
            )}
            <button className={styles.selectionAction}>Reassign reviewer…</button>
            <button className={styles.selectionAction}>Resend</button>
            <button className={`${styles.selectionAction} ${styles.selectionDanger}`}>Remove from Acme</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// REVIEWER SIM BANNER — runs during review_pending
// ─────────────────────────────────────────────

function ReviewerSimBanner() {
  // Drives the per-reviewer "approved" ticks across the sim window. We tick
  // through REVIEWERS at evenly-spaced moments so the banner copy ratchets up
  // from "sent" → "Sarah approved" → "James approved" → "all approved".
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    const total = REVIEWERS.length;
    const stepDuration = (REVIEW_PENDING_TOTAL_MS - REVIEW_PENDING_INTRO_MS) / total;
    const timers: number[] = [];
    for (let i = 0; i < total; i++) {
      timers.push(window.setTimeout(() => {
        setApprovedCount(i + 1);
      }, REVIEW_PENDING_INTRO_MS + stepDuration * (i + 1) * 0.9));
    }
    return () => timers.forEach(t => window.clearTimeout(t));
  }, []);

  const pct = Math.round((approvedCount / REVIEWERS.length) * 100);
  const last = REVIEWERS[Math.max(0, approvedCount - 1)];

  return (
    <div className={styles.inFlightBanner}>
      <div className={styles.inFlightSpinner}>
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
          <path d="M8 1.5a6.5 6.5 0 1 1-6.4 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.inFlightTextCol}>
        <div className={styles.inFlightText}>
          {approvedCount === 0
            ? <><strong>Sent to {REVIEWERS.length} reviewers</strong> · awaiting approvals…</>
            : approvedCount < REVIEWERS.length
              ? <><strong>{last.name} ({last.role}) approved</strong> · <span className={styles.inFlightCounter}>{approvedCount} of {REVIEWERS.length}</span> reviewers signed off · finalizing…</>
              : <><strong>All {REVIEWERS.length} reviewers approved</strong> · sign-off complete · routing to report generation…</>}
        </div>
        <div className={styles.inFlightProgressBar}>
          <div className={styles.inFlightProgressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  row: DerivedRow;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function AssessmentTableRow({ row, checked, onToggle, disabled }: RowProps) {
  const [, setSearchParams] = useSearchParams();
  const { def, status, draftedCount, totalQuestions, gapCount } = row;

  const openAssessment = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('assessment', def.id);
      return next;
    });
  };

  const statusClass =
    status === 'queued'            ? styles.statusPillQueued :
    status === 'drafting'          ? styles.statusPillDrafting :
    status === 'gaps'              ? styles.statusPillGaps :
    status === 'filling_gaps'      ? styles.statusPillFillingGaps :
    status === 'ready_for_review'  ? styles.statusPillReadyForReview :
    status === 'review'            ? styles.statusPillReview :
                                     styles.statusPillCertified;

  const draftedPct = totalQuestions === 0 ? 0 : (draftedCount / totalQuestions) * 100;
  const showProgressVisual = status !== 'queued';
  const progressLabel = status === 'queued'
    ? 'Not started'
    : `${draftedCount} of ${totalQuestions} · ${Math.round(draftedPct)}%`;
  const gapsLabel = status === 'queued' || gapCount === 0 ? '—' : `${gapCount} gaps`;

  return (
    <div className={`${styles.row} ${checked ? styles.rowChecked : ''} ${disabled ? styles.rowDisabled : ''}`}>
      <div className={styles.cellCheck}>
        <input type="checkbox" checked={checked} onChange={onToggle} disabled={disabled} />
      </div>
      <div className={styles.cell}>
        <div className={styles.qName}>{def.name}</div>
        <div className={styles.qSub}>{def.sub}</div>
      </div>
      <div className={styles.cell}>
        <span className={`${styles.statusPill} ${statusClass}`}>{STATUS_LABEL[status]}</span>
      </div>
      <div className={styles.cell}>
        <span className={status === 'queued' ? styles.progressCell : styles.progressCellActive}>{progressLabel}</span>
        {showProgressVisual && (
          <div className={styles.rowProgressBar}>
            <div className={styles.rowProgressFill} style={{ width: `${draftedPct}%` }} />
          </div>
        )}
      </div>
      <div className={styles.cell}>
        <span className={gapsLabel === '—' ? styles.gapsCell : styles.gapsCellActive}>{gapsLabel}</span>
      </div>
      <div className={styles.cell}>{def.sent}</div>
      <div className={styles.cell}>{def.due}</div>
      <div className={styles.cell}>
        <div className={styles.preparer}>
          <Avatar initials="AI" color={REVIEWER_COLORS.AI} />
          <span>AI Agent</span>
        </div>
      </div>
      <div className={styles.cell}>
        <div className={styles.reviewers}>
          <div className={styles.reviewerStack}>
            {def.reviewers.map((rev, i) => (
              <Avatar key={i} initials={rev.initials} color={rev.color} stacked />
            ))}
            {def.reviewerOverflow && (
              <div className={`${styles.avatar} ${styles.avatarStacked} ${styles.avatarOverflow}`}>
                +{def.reviewerOverflow}
              </div>
            )}
          </div>
          <span className={styles.reviewerSummary}>{def.reviewerSummary}</span>
        </div>
      </div>
      <div className={styles.cellAction}>
        <a
          className={`${styles.actionLink} ${disabled ? styles.actionLinkDisabled : ''}`}
          onClick={disabled ? undefined : openAssessment}
        >
          Open
          <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
            <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Avatar({ initials, color, stacked }: { initials: string; color: string; stacked?: boolean }) {
  return (
    <div
      className={`${styles.avatar} ${stacked ? styles.avatarStacked : ''}`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

