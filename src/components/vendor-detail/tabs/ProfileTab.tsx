import { useWorkflow } from '../../../state/WorkflowContext';
import DetailsBlock from '../overview/DetailsBlock';
import AITierBlock from '../overview/AITierBlock';
import GenerateTierPrompt from '../profile/GenerateTierPrompt';
import AutoPopulateAnimation from '../profile/AutoPopulateAnimation';
import TierClassificationBlock from '../profile/TierClassificationBlock';
import overviewStyles from '../overview/overview.module.css';
import profileStyles from '../profile/profile.module.css';

export default function ProfileTab() {
  const { state, startAutoPopulate, configureProfile, dismissBanner } = useWorkflow();
  const isStarting = state.workflowPhase === 'profile_pending';
  const manualPrimed = state.profileManualPrimed;
  const autoStarted = state.profileAutoStarted;
  const bannerKey = 'profile-configured';
  const bannerDismissed = state.dismissedBanners[bannerKey] ?? false;

  // Auto-populate animation runs ~2s before the actual configure fires.
  if (isStarting && autoStarted) {
    return (
      <div className={overviewStyles.bodyFull}>
        <AutoPopulateAnimation />
      </div>
    );
  }

  // profile_pending, manual not yet primed: dual-CTA empty state. Mirrors the
  // Overview's ProfileConfigBlock so the user can drive setup from either tab.
  if (isStarting && !manualPrimed) {
    return (
      <div className={overviewStyles.bodyFull}>
        <div className={profileStyles.profileEmpty}>
          <div className={profileStyles.profileEmptyIcon}>
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
              <circle cx="14" cy="10.5" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 23.5c1.5-4.5 5-7 9-7s7.5 2.5 9 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className={profileStyles.profileEmptyTitle}>Profile not set up yet</div>
          <div className={profileStyles.profileEmptyBody}>
            Acme Cloud Co. was just imported. Populate the vendor profile to unlock tier classification, document collection, and assessments. Auto-populate from your connected Zip integration, or fill it in manually.
          </div>
          <div className={profileStyles.profileEmptyActions}>
            <button
              className={profileStyles.profileEmptyBtn}
              onClick={() => startAutoPopulate()}
            >
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                <path d="M3 6.2l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Auto-populate
            </button>
            <button
              className={profileStyles.profileEmptyBtnSecondary}
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

  // Once configured (or manual-primed): show banner + Details. Tier block only
  // after tier acceptance. Manual-primed shows the empty Details awaiting the
  // simulated-entry click.
  const sourceText =
    state.profileConfigSource === 'auto'
      ? <><strong>Profile auto-populated via Zip connection.</strong> All required fields populated from the vendor record — review and adjust below as needed.</>
      : <><strong>Profile configured manually.</strong> Required fields captured by the TPRM team — review and adjust below as needed.</>;

  return (
    <div className={overviewStyles.bodyFull}>
      {state.profileConfigured && (
        <div className={`${profileStyles.profileBanner} ${bannerDismissed ? profileStyles.profileBannerDismissed : ''}`}>
          <div className={profileStyles.profileBannerIcon}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M3 7.2l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={profileStyles.profileBannerText}>{sourceText}</div>
          <button
            className={profileStyles.profileBannerDismiss}
            onClick={() => dismissBanner(bannerKey)}
            aria-label="Dismiss banner"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      <GenerateTierPrompt />
      <AITierBlock />
      {state.tierAccepted && <TierClassificationBlock />}
      <DetailsBlock />
    </div>
  );
}
