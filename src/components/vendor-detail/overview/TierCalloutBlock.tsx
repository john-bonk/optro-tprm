import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import shared from '../shared.module.css';

// Overview surface for the Inherent Risk step. The detailed signals + Accept
// / Override controls live on the Profile tab — this block is the simpler
// callout that routes there. Mirrors the ProfileConfigBlock / RequiredDocsBlock
// pattern (header pill + body + single primary CTA).
export default function TierCalloutBlock() {
  const { state, setTab } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  if (state.workflowPhase !== 'tier_pending') return null;
  if (state.tierAccepted) return null;

  const data = tierData[state.selectedTier];

  // Pre-generation interstitial state — mirror the Profile-tab CTA so the
  // user can navigate over to fire the generation. Animation + full suggestion
  // both live on Profile.
  if (!state.tierGenerated) {
    const generating = state.tierGenerationStarted;
    return (
      <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
        <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
          <div className={shared.aiTierTitle}>Tier Classification — Acme Cloud Co.</div>
          <div className={shared.reqHdrRight}>
            <div className={`${shared.aiTierPill} ${generating ? shared.aiTierPillRunning : ''}`}>
              {generating && (
                <span className={shared.aiTierSpinner} aria-hidden>
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5a6.5 6.5 0 1 1-6.4 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              )}
              {generating ? 'Generating…' : 'Ready to generate'}
            </div>
            <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className={shared.aiTierBody}>
          <div className={shared.overviewActionText}>
            {generating ? (
              <><strong>AI is analyzing inherent-risk signals.</strong>{' '}
              The tier recommendation will be ready momentarily. Head to the Profile tab to review and accept once it lands.</>
            ) : (
              <><strong>Profile is complete · tier classification ready to generate.</strong>{' '}
              Run AI tier classification from the Profile tab to size up inherent risk and produce the tier recommendation with confidence and signal-level rationale.</>
            )}
          </div>
          <div className={shared.aiTierActions}>
            <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={() => setTab('profile')}>
              {generating ? 'View on Profile' : 'Generate on Profile'}
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>Tier Classification — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>AI Suggestion · {data.confidence}</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>AI has suggested {data.label} — {data.name}.</strong>{' '}
          {data.subtitle}. Review the full signal-level rationale and accept (or override) the classification on the Profile tab to advance to Due Diligence.
        </div>
        <div className={shared.aiTierActions}>
          <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={() => setTab('profile')}>
            Review on Profile
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
