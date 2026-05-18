import { useState, type ReactNode } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import { ASSESSMENTS, TOTAL_GAPS } from '../../../data/assessments';
import shared from '../shared.module.css';

export default function AssessmentsBlock() {
  const { state, startAssessments, openSendGapsPanel, openSendForReviewPanel, setTab } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  const phase = state.workflowPhase;
  const visible =
    phase === 'assessments_pending' ||
    phase === 'assessments_started' ||
    phase === 'gaps_in_flight' ||
    phase === 'acceptance_pending' ||
    phase === 'review_pending';
  if (!visible) return null;

  const config = (() => {
    if (phase === 'assessments_pending') {
      return {
        title: 'Recommended Assessments — Acme Cloud Co.',
        pill: '3 queued',
        body: (
          <>
            <strong>3 assessments queued for Tier 2.</strong>{' '}
            AI will draft answers from the 6 collected documents across SIG Lite ({60} q), CSA CAIQ Lite ({84} q), and Optro&rsquo;s internal security baseline ({28} q).
          </>
        ),
        btnLabel: 'Start Assessments',
        btnIcon: (
          <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
            <path d="M3 2.5l6 3.5-6 3.5z" fill="currentColor" />
          </svg>
        ),
        onClick: startAssessments,
      };
    }
    if (phase === 'assessments_started') {
      return {
        title: 'Recommended Assessments — Acme Cloud Co.',
        pill: 'Gaps awaiting',
        body: (
          <>
            <strong>{TOTAL_GAPS} questions across {ASSESSMENTS.length} questionnaires</strong>{' '}
            need vendor input before Acme can be approved. Sending in one batch keeps Acme&rsquo;s inbox manageable.
          </>
        ),
        btnLabel: `Send ${TOTAL_GAPS} gaps to vendor`,
        btnIcon: (
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M6 8l2-2M5.5 8.5l-1 1a2 2 0 1 1-2.8-2.8l1-1M8.5 5.5l1-1a2 2 0 1 1 2.8 2.8l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        ),
        onClick: openSendGapsPanel,
      };
    }
    if (phase === 'gaps_in_flight') {
      return {
        title: 'Recommended Assessments — Acme Cloud Co.',
        pill: 'Receiving answers',
        body: (
          <>
            <strong>Gap request sent.</strong>{' '}
            Acme is responding to all {TOTAL_GAPS} questions. Open the Assessments tab to watch responses come in.
          </>
        ),
        btnLabel: '',
        btnIcon: null,
        onClick: () => {},
        hideButton: true,
      } satisfies BlockConfig;
    }
    if (phase === 'acceptance_pending') {
      return {
        title: 'Recommended Assessments — Acme Cloud Co.',
        pill: 'Awaiting acceptance',
        body: (
          <>
            <strong>All {TOTAL_GAPS} vendor responses received.</strong>{' '}
            Accept the AI-drafted answers — individually on each questionnaire or in bulk from the Assessments tab — then send for reviewer sign-off.
          </>
        ),
        btnLabel: 'Send for review',
        btnIcon: (
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M3 7l8-4-2 8-2-3-4-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        ),
        onClick: () => { setTab('assessments'); openSendForReviewPanel(); },
      };
    }
    if (phase === 'review_pending') {
      return {
        title: 'Recommended Assessments — Acme Cloud Co.',
        pill: 'Reviewers reviewing',
        body: (
          <>
            <strong>Assessment package sent for reviewer approval.</strong>{' '}
            Sarah Chen, James Park, and Maya Okafor are signing off — open the Assessments tab to watch approvals come in.
          </>
        ),
        btnLabel: '',
        btnIcon: null,
        onClick: () => {},
        hideButton: true,
      } satisfies BlockConfig;
    }
    // Fallback (shouldn't hit — visibility check above gates this).
    return {
      title: '',
      pill: '',
      body: null,
      btnLabel: '',
      btnIcon: null,
      onClick: () => {},
      hideButton: true,
    } satisfies BlockConfig;
  })();

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>{config.title}</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>{config.pill}</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>{config.body}</div>
        {!config.hideButton && (
          <div className={shared.aiTierActions}>
            <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={config.onClick}>
              {config.btnIcon}
              {config.btnLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface BlockConfig {
  title: string;
  pill: string;
  body: ReactNode;
  btnLabel: string;
  btnIcon: ReactNode;
  onClick: () => void;
  hideButton?: boolean;
}
