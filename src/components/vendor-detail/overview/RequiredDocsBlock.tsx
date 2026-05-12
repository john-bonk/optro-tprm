import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';

export default function RequiredDocsBlock() {
  const { state, setTab } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  // Visible after tier accepted, hidden once docs received & assessments unlocked
  if (!state.tierAccepted) return null;
  if (state.workflowPhase === 'assessments_pending' || state.workflowPhase === 'assessments_started') return null;

  const pillText = state.docsRequested ? 'All received' : '2 missing';

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>Required Documents — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>{pillText}</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>2 of 6 required documents missing.</strong>{' '}
          Penetration Test Summary and Business Continuity Plan need to be collected from the vendor before Due Diligence can begin.
        </div>
        <div className={shared.aiTierActions}>
          <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={() => setTab('documents')}>
            Go to Documents
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
