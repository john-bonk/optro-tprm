import shared from '../shared.module.css';

// Mirrors the GeneratingAnimation card from GenerateTierPrompt — used during
// the auto-populate interstitial so the user doesn't see an instant jump from
// "click auto-populate" to "fully populated profile".
export default function AutoPopulateAnimation() {
  return (
    <div className={shared.aiTierBlock}>
      <div className={shared.aiTierHdr}>
        <div className={shared.aiTierTitle}>Vendor Profile — Acme Cloud Co.</div>
        <div className={shared.reqHdrRight}>
          <div className={`${shared.aiTierPill} ${shared.aiTierPillRunning}`}>
            <span className={shared.aiTierSpinner} aria-hidden>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5a6.5 6.5 0 1 1-6.4 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            Populating…
          </div>
        </div>
      </div>
      <div className={shared.aiTierBody}>
        <div className={shared.overviewActionText}>
          <strong>Pulling vendor record from the Zip integration.</strong>{' '}
          AI is parsing attached evidence (MSA, SOW, DPA), pre-filling fields from the procurement payload, and flagging any inconsistencies between the request and the documents.
        </div>
        <ul className={shared.aiTierProgressList}>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Parsing attached evidence
          </li>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Pre-filling vendor record fields
          </li>
          <li className={shared.aiTierProgressActive}>
            <span className={shared.aiTierProgressDot} /> Flagging inconsistencies and missing fields
          </li>
        </ul>
      </div>
    </div>
  );
}
