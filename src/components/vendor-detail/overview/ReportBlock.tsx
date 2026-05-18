import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';

export default function ReportBlock() {
  const { state, setTab } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  // Stay visible during report_pending (CTA) and monitoring_active (read-out
  // confirming the report has been generated). Both are useful overview states.
  if (state.workflowPhase !== 'report_pending' && state.workflowPhase !== 'monitoring_active') return null;
  const generated = state.workflowPhase === 'monitoring_active';

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>Vendor Risk Report — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>{generated ? 'Generated' : 'Ready to generate'}</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          {generated ? (
            <>
              <strong>Verdict issued: Approve with conditions.</strong>{' '}
              The vendor risk report is on file and Acme has entered Monitoring. Reopen the report from the Reports tab any time.
            </>
          ) : (
            <>
              <strong>Assessment step complete.</strong>{' '}
              All vendor responses received and gaps closed. The risk report is ready to generate for committee review.
            </>
          )}
        </div>
        <div className={shared.aiTierActions}>
          <button
            className={`${shared.aiTierBtn} ${shared.btnPrimary}`}
            onClick={() => setTab('reports')}
          >
            {generated ? 'Open report' : 'Generate Report'}
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
