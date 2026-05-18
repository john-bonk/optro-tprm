import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';

export default function ProfileConfigBlock() {
  const { state, startAutoPopulate, configureProfile } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  if (state.workflowPhase !== 'profile_pending') return null;
  // While the auto-populate animation is running we hand the surface over to
  // the Profile tab — the user has already been routed there.
  if (state.profileAutoStarted) return null;

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>Get started — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>Setup required</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>Acme Cloud Co. was just added.</strong>{' '}
          Populate the vendor profile to unlock tier classification, document collection, and assessments. Auto-populate from your connected Zip integration, or fill it in manually if a connection isn&rsquo;t available.
        </div>
        <div className={shared.aiTierActions}>
          <button
            className={`${shared.aiTierBtn} ${shared.btnPrimary}`}
            onClick={() => startAutoPopulate()}
          >
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6.2l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Auto-populate
          </button>
          <button
            className={`${shared.aiTierBtn} ${shared.btnSecondary}`}
            onClick={() => configureProfile('manual')}
          >
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M2 11.5l1-3 6-6 2 2-6 6-3 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            Fill out manually
          </button>
        </div>
      </div>
    </div>
  );
}
