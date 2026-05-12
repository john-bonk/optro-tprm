import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';

export default function AssessmentsBlock() {
  const { state, startAssessments, setTab } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  // Visible once docs are gathered
  if (state.workflowPhase !== 'assessments_pending' && state.workflowPhase !== 'assessments_started') return null;

  const inProgress = state.workflowPhase === 'assessments_started';
  const pillText = inProgress ? 'In progress' : '3 queued';

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>Recommended Assessments — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>{pillText}</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        {!inProgress && (
          <>
            <div className={shared.overviewActionText}>
              <strong>3 assessments queued for Tier 2.</strong>{' '}
              AI will draft answers from the 6 collected documents across SIG Lite (123 q), CSA CAIQ (261 q), and Optro&apos;s internal security baseline (42 q).
            </div>
            <div className={shared.aiTierActions}>
              <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={startAssessments}>
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                  <path d="M3 2.5l6 3.5-6 3.5z" fill="currentColor" />
                </svg>
                Start Assessments
              </button>
            </div>
          </>
        )}
        {inProgress && (
          <>
            <div className={shared.overviewActionText}>
              <strong>3 assessments in progress for Tier 2.</strong>{' '}
              AI has drafted 390 of 426 answers across SIG Lite (123 q), CSA CAIQ (261 q), and Optro&apos;s internal security baseline (42 q). 36 gaps remain to be filled by the vendor.
            </div>
            <div className={shared.aiTierActions}>
              <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={() => setTab('assessments')}>
                View Assessments
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                  <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
