import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import shared from '../shared.module.css';
import TierOverrideMenu from './TierOverrideMenu';

export default function AITierBlock() {
  const { state, acceptTier } = useWorkflow();
  const [collapsed, setCollapsed] = useState(false);

  // Only the tier acceptance step shows this block. Hidden during profile setup
  // (earlier), during the tier-generation interstitial (the GenerateTierPrompt
  // takes the surface in those sub-states), and once tier is accepted (later).
  if (state.workflowPhase !== 'tier_pending') return null;
  if (!state.tierGenerated) return null;
  if (state.tierAccepted) return null;

  const data = tierData[state.selectedTier];

  return (
    <div className={`${shared.aiTierBlock} ${collapsed ? shared.collapsed : ''}`}>
      <div className={shared.aiTierHdr} onClick={() => setCollapsed(c => !c)}>
        <div className={shared.aiTierTitle}>AI Tier Classification — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>AI Suggestion</div>
          <svg className={shared.reqChev} viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.aiTierResult}>
          <div className={shared.aiTierValue}>{data.label}</div>
          <div className={shared.aiTierMeta}>{data.confidence} · {data.subtitle}</div>
        </div>
        <div className={shared.aiTierSignals}>
          <div className={shared.aiTierSignal}>
            <span className={shared.aiTierSignalTag}>Zip</span>
            <span>Spend $48,000 — exceeds Tier 3 threshold ($25K), below Tier 1 threshold ($100K)</span>
          </div>
          <div className={shared.aiTierSignal}>
            <span className={shared.aiTierSignalTag}>Zip</span>
            <span>Category: SaaS — requires security questionnaire per policy §4.1</span>
          </div>
          <div className={shared.aiTierSignal}>
            <span className={shared.aiTierSignalTag}>AI</span>
            <span>No PII handling indicated — if PII present, would escalate to Tier 1</span>
          </div>
          <div className={shared.aiTierSignal}>
            <span className={shared.aiTierSignalTag}>AI</span>
            <span>New vendor, no prior assessment history — conservative classification</span>
          </div>
        </div>
        <div className={shared.aiTierActions}>
          <button className={`${shared.aiTierBtn} ${shared.btnPrimary}`} onClick={acceptTier}>
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M2.5 6.2l2.5 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Accept {data.label}</span>
          </button>
          <TierOverrideMenu>
            {(toggle) => (
              <button className={`${shared.aiTierBtn} ${shared.btnSecondary}`} onClick={toggle}>
                Override
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </TierOverrideMenu>
        </div>
      </div>
    </div>
  );
}
