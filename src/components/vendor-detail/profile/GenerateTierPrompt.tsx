import { useWorkflow } from '../../../state/WorkflowContext';
import shared from '../shared.module.css';

// Interstitial between profile setup and AI tier generation. Mirrors the
// ProfileConfigBlock / RequiredDocsBlock card shape so the surface stays
// consistent across the Inherent Risk step.
//
// Three render states:
//   • !tierGenerationStarted → CTA card prompting the user to generate
//   • tierGenerationStarted && !tierGenerated → brief processing animation
//   • tierGenerated → null (the full AITierBlock takes over)
export default function GenerateTierPrompt() {
  const { state, startTierGeneration } = useWorkflow();

  if (state.workflowPhase !== 'tier_pending') return null;
  if (state.tierGenerated) return null;

  if (state.tierGenerationStarted) {
    return <GeneratingAnimation />;
  }

  return (
    <div className={shared.aiTierBlock}>
      <div className={shared.aiTierHdr}>
        <div className={shared.aiTierTitle}>AI Tier Classification — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={shared.aiTierPill}>Ready to generate</div>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>Profile is complete.</strong>{' '}
          Run the AI tier classification to size up inherent risk from the vendor record, attached evidence, and external signals. The recommendation will appear here for your review.
        </div>
        <div className={shared.aiTierActions}>
          <button
            className={`${shared.aiTierBtn} ${shared.btnPrimary}`}
            onClick={startTierGeneration}
          >
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M2.5 6L5 8.5l4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Generate tier classification
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneratingAnimation() {
  return (
    <div className={shared.aiTierBlock}>
      <div className={shared.aiTierHdr}>
        <div className={shared.aiTierTitle}>AI Tier Classification — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={`${shared.aiTierPill} ${shared.aiTierPillRunning}`}>
            <span className={shared.aiTierSpinner} aria-hidden>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5a6.5 6.5 0 1 1-6.4 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            Generating…
          </div>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>Analyzing inherent-risk signals.</strong>{' '}
          The AI is weighing tiering dimensions across the vendor record, attached evidence, and external sources to produce a tier recommendation with confidence and signal-level rationale.
        </div>
        <ul className={shared.aiTierProgressList}>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Evaluating tiering dimensions
          </li>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Reconciling external signals
          </li>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Drafting recommendation rationale
          </li>
        </ul>
      </div>
    </div>
  );
}
