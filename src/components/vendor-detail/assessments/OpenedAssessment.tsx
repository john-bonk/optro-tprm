import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkflow } from '../../../state/WorkflowContext';
import {
  getAssessment,
  IN_PROGRESS_STATE,
  QUESTIONS,
  VENDOR_RESPONSES,
  type AssessmentDef,
  type Question,
  type QuestionStatus,
} from '../../../data/assessments';
import styles from './assessments.module.css';

type Filter = 'all' | 'gaps' | 'drafted' | 'accepted' | 'comments';

interface Props {
  assessmentId: string;
}

export default function OpenedAssessment({ assessmentId }: Props) {
  const [, setSearchParams] = useSearchParams();
  const { state } = useWorkflow();
  const def = getAssessment(assessmentId);

  const closeAssessment = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('assessment');
      return next;
    });
  };

  if (!def) {
    return (
      <div className={styles.bodyQueued}>
        <div className={styles.openedNotFound}>
          <BackChev onClick={closeAssessment} /> Assessment not found.
        </div>
      </div>
    );
  }

  const richView =
    state.workflowPhase === 'assessments_started' ||
    state.workflowPhase === 'gaps_in_flight' ||
    state.workflowPhase === 'acceptance_pending' ||
    state.workflowPhase === 'review_pending' ||
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';

  if (!richView) {
    return <QueuedView def={def} onBack={closeAssessment} />;
  }

  return <InProgressView def={def} onBack={closeAssessment} />;
}

function BackChev({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.backChev} onClick={onClick} aria-label="Back to assessments">
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
// QUEUED VIEW — shown before Start Assessments fires
// ─────────────────────────────────────────────

function QueuedView({ def, onBack }: { def: AssessmentDef; onBack: () => void }) {
  return (
    <div className={styles.bodyQueued}>
      <div className={styles.openedCard}>
        <div className={styles.openedHeader}>
          <div className={styles.openedTitleRow}>
            <BackChev onClick={onBack} />
            <h1 className={styles.openedTitle}>{def.name}</h1>
            <span className={`${styles.openedStatusPill} ${styles.openedStatusQueued}`}>QUEUED</span>
          </div>
        </div>
        <div className={styles.openedMeta}>
          <strong className={styles.metaPrimary}>{def.totalQuestions} questions</strong>
          <span className={styles.metaSep}>·</span>
          <span>Scheduled to send <strong>{def.sent}</strong> · due <strong>{def.due}</strong></span>
          <span className={styles.metaSep}>·</span>
          <span>Preparer · <strong>AI Agent</strong></span>
          <span className={styles.metaSep}>·</span>
          <span>Reviewers · <strong>{def.reviewerSummary}</strong></span>
        </div>
      </div>

      <div className={styles.queuedEmpty}>
        <div className={styles.queuedEmptyIcon}>
          <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
            <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 8.5V14l3.5 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.queuedEmptyTitle}>AI drafting hasn&rsquo;t started yet</div>
        <div className={styles.queuedEmptyBody}>
          This assessment is queued. Once the assessment workflow is started from the vendor overview, the AI will begin drafting answers from collected documents — questions, gaps, and reviewer comments will appear here.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// IN-PROGRESS VIEW — questions + comments
// ─────────────────────────────────────────────

function InProgressView({ def, onBack }: { def: AssessmentDef; onBack: () => void }) {
  const { state } = useWorkflow();
  // Post-closure: vendor has answered every gap; surface the filled state.
  // Applies to acceptance_pending, review_pending, and report_pending.
  const postClosure =
    state.workflowPhase === 'acceptance_pending' ||
    state.workflowPhase === 'review_pending' ||
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';

  const progressData = postClosure
    ? { status: 'certified' as const, draftedCount: def.totalQuestions, gapCount: 0 }
    : IN_PROGRESS_STATE[def.id];

  const currentQuestions: Question[] = useMemo(() => {
    if (!postClosure) return QUESTIONS;
    return QUESTIONS.map(q => q.status === 'gap'
      ? {
          ...q,
          status: 'drafted' as const,
          draftAnswer: VENDOR_RESPONSES[q.id] ?? q.draftAnswer,
          source: 'Vendor response',
          confidence: 'High' as const,
        }
      : q);
  }, [postClosure]);

  // If the user bulk-accepted this assessment from the list-view selection bar,
  // every drafted answer starts in the 'approved' state. Also, once review has
  // completed and we're in report_pending, everything is effectively accepted.
  const preAccepted =
    state.bulkAcceptedAssessments.includes(def.id) ||
    state.workflowPhase === 'review_pending' ||
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';

  // TPRM-internal drilldown is read-only on accept/gap state — reviewers do
  // the deciding in the review phase. Derive statuses from QUESTIONS once.
  const questionStatuses = useMemo<Record<string, QuestionStatus>>(
    () => Object.fromEntries(currentQuestions.map(q => [
      q.id,
      preAccepted && q.status === 'drafted' ? ('approved' as QuestionStatus) : q.status,
    ])),
    [currentQuestions, preAccepted]
  );
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c = { all: 0, gaps: 0, drafted: 0, accepted: 0, comments: 0 };
    currentQuestions.forEach(q => {
      c.all++;
      const status = questionStatuses[q.id];
      if (status === 'gap') c.gaps++;
      if (status === 'drafted') c.drafted++;
      if (status === 'approved') c.accepted++;
      if (q.commentCount && q.commentCount > 0) c.comments++;
    });
    return c;
  }, [questionStatuses, currentQuestions]);

  const filtered = useMemo(() => {
    return currentQuestions.filter(q => {
      const status = questionStatuses[q.id];
      switch (filter) {
        case 'all':      return true;
        case 'gaps':     return status === 'gap';
        case 'drafted':  return status === 'drafted';
        case 'accepted': return status === 'approved';
        case 'comments': return (q.commentCount ?? 0) > 0;
      }
    });
  }, [filter, questionStatuses, currentQuestions]);

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: 'all',      label: 'All',          count: counts.all },
    { id: 'gaps',     label: 'Gaps',         count: counts.gaps },
    { id: 'drafted',  label: 'Drafted',      count: counts.drafted },
    { id: 'accepted', label: 'Accepted',     count: counts.accepted },
    { id: 'comments', label: 'Has comments', count: counts.comments },
  ];

  const isGapStatus = progressData.status === 'gaps';
  // "In Review" — primed once gaps are closed and through the reviewer sim.
  const isInReviewStatus =
    state.workflowPhase === 'acceptance_pending' ||
    state.workflowPhase === 'review_pending';
  // "Certified" — once reviewer sign-off completes (and stays certified once
  // monitoring kicks in).
  const isCertifiedStatus =
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';
  const statusPillClass =
    isGapStatus       ? styles.openedStatusGaps :
    isCertifiedStatus ? styles.openedStatusCertified :
    isInReviewStatus  ? styles.openedStatusReview :
                        styles.openedStatusDrafting;
  const statusPillLabel =
    isGapStatus       ? 'GAPS AWAITING' :
    isCertifiedStatus ? 'CERTIFIED' :
    isInReviewStatus  ? 'IN REVIEW' :
                        'AI DRAFTING';
  const draftedPct = Math.round((progressData.draftedCount / def.totalQuestions) * 100);

  return (
    <div className={styles.openedLayout}>
      <div className={styles.openedMain}>
        <div className={styles.openedCard}>
          <div className={styles.openedHeader}>
            <div className={styles.openedTitleRow}>
              <BackChev onClick={onBack} />
              <h1 className={styles.openedTitle}>{def.name}</h1>
              <span className={`${styles.openedStatusPill} ${statusPillClass}`}>{statusPillLabel}</span>
            </div>
            <div className={styles.openedActions}>
              <button className={styles.btnSecondary}>Re-draft all</button>
              {progressData.gapCount > 0 && (
                <button className={styles.btnPrimary}>Send  {progressData.gapCount}  gaps to Acme</button>
              )}
            </div>
          </div>

          <div className={styles.openedMeta}>
            <strong className={styles.metaPrimary}>
              {postClosure
                ? <>{def.totalQuestions} questions · {def.totalQuestions} answered · 0 gaps</>
                : isGapStatus
                  ? <>{def.totalQuestions} questions · {progressData.draftedCount} drafted · {progressData.gapCount} gaps</>
                  : <>{def.totalQuestions} questions · {progressData.draftedCount} drafted</>}
            </strong>
            <span className={styles.metaSep}>·</span>
            <span>Sent <strong>{def.sent}</strong> · due <strong>{def.due}</strong></span>
            <span className={styles.metaSep}>·</span>
            <span>Preparer · <strong>AI Agent</strong></span>
            <span className={styles.metaSep}>·</span>
            <span>Reviewers · <strong>{def.reviewerSummary}</strong></span>
          </div>

          <div className={styles.openedProgress}>
            <span className={styles.openedProgressLeftLabel}>
              {isCertifiedStatus
                ? 'Reviewers signed off · 100% certified'
                : isInReviewStatus
                  ? 'All responses received · awaiting reviewer sign-off'
                  : isGapStatus
                    ? 'AI Drafting complete'
                    : `Drafting ${draftedPct}% complete`}
            </span>
            <div className={styles.openedProgressBar}>
              <div className={styles.openedProgressFill} style={{ width: `${draftedPct}%` }} />
            </div>
            {isGapStatus && progressData.gapCount > 0 && (
              <span className={styles.openedProgressRightLabel}>{progressData.gapCount} gaps to send</span>
            )}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterRowLabel}>Filter:</span>
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

        <div className={styles.questionList}>
          {filtered.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              currentStatus={questionStatuses[q.id]}
            />
          ))}
          {filtered.length === 0 && (
            <div className={styles.questionEmpty}>No questions match this filter.</div>
          )}
        </div>
      </div>

      <CommentsPanel />
    </div>
  );
}

interface QCardProps {
  question: Question;
  currentStatus: QuestionStatus;
}

// TPRM-internal drilldown — read-only with respect to accept/gap state.
// Accept / Mark-as-gap belong to reviewers in the review phase; this view
// surfaces the AI-drafted answer + source + comments for context only.
// Re-draft remains since that's a TPRM action upstream of review.
function QuestionCard({ question, currentStatus }: QCardProps) {
  const [expanded, setExpanded] = useState(true);
  const isGap = currentStatus === 'gap';
  const isApproved = currentStatus === 'approved';
  const isDrafted = currentStatus === 'drafted';

  return (
    <div className={`${styles.qCard} ${isGap ? styles.qCardGap : ''} ${isApproved ? styles.qCardApproved : ''}`}>
      <div className={styles.qHeader}>
        <button className={styles.qChev} onClick={() => setExpanded(e => !e)} aria-label={expanded ? 'Collapse' : 'Expand'}>
          <svg viewBox="0 0 12 12" fill="none" width="11" height="11" style={{ transform: expanded ? 'rotate(0)' : 'rotate(-90deg)' }}>
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.qNum}>{question.num}</div>
        <div className={styles.qHeaderText}>
          <div className={styles.qText}>{question.text}</div>
          <div className={styles.qSub}>{question.draftAnswer}</div>
        </div>
        <div className={styles.qHeaderRight}>
          {isDrafted   && <span className={`${styles.qStatusPill} ${styles.qStatusDrafted}`}>DRAFTED</span>}
          {isGap       && <span className={`${styles.qStatusPill} ${styles.qStatusGap}`}>GAP</span>}
          {isApproved  && <span className={`${styles.qStatusPill} ${styles.qStatusApproved}`}>ACCEPTED</span>}
          {question.commentCount && question.commentCount > 0 && (
            <span className={styles.qCommentBadge}>
              <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                <path d="M2.5 3.5h9v6h-5l-3 2.5v-2.5h-1v-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <span>{question.commentCount}</span>
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className={styles.qBody}>
          <div className={styles.qAnswerBox}>{question.draftAnswer}</div>
          <div className={styles.qSourceRow}>
            <span className={styles.qSourceLabel}>Sourced from:</span>
            {question.source
              ? <span className={styles.qSourcePill}>{question.source}</span>
              : <span className={styles.qSourcePillEmpty}>no source found</span>}
          </div>
          <div className={styles.qActions}>
            <button className={`${styles.qBtn} ${styles.qBtnSecondary}`}>Re-draft</button>
            <div className={styles.qConfidence}>
              AI confidence · <strong>{question.confidence}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsPanel() {
  return (
    <aside className={styles.commentsPanel}>
      <div className={styles.commentsTitle}>Comments</div>
      <button className={styles.questionSelector}>
        <span className={styles.questionSelectorText}>
          <strong>Q88</strong> · When was your last full BCP/DR tablet…
        </span>
        <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.commentsTabs}>
        <button className={`${styles.commentsTab} ${styles.commentsTabActive}`}>
          Open <span className={styles.commentsTabCount}>1</span>
        </button>
        <button className={styles.commentsTab}>
          Closed <span className={styles.commentsTabCount}>0</span>
        </button>
      </div>

      <div className={styles.commentList}>
        <div className={styles.comment}>
          <div className={styles.commentAvatar} style={{ background: '#E85E36' }}>JP</div>
          <div className={styles.commentBody}>
            <div className={styles.commentMeta}>
              <strong className={styles.commentAuthor}>James Park</strong>
              <span className={styles.commentRole}>TPRM ADMIN</span>
              <span className={styles.commentTime}>3h ago</span>
            </div>
            <div className={styles.commentText}>
              Same BCP/DR question as CSA BCR-11 — keep separate or merge in the email?
            </div>
          </div>
        </div>
      </div>

      <div className={styles.commentForm}>
        <textarea
          className={styles.commentInput}
          placeholder="Add a comment. Tag with @name or @team:name."
          rows={3}
        />
        <div className={styles.commentFormFooter}>
          <span className={styles.commentVisibility}>Visible internally only · vendor can&rsquo;t see this thread</span>
          <button className={styles.commentReplyBtn}>Reply</button>
        </div>
      </div>
    </aside>
  );
}
