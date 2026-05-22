import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkflowProvider, useWorkflow } from '../state/WorkflowContext';
import styles from './VendorDetailPage.module.css';
import OverviewTab from '../components/vendor-detail/tabs/OverviewTab';
import ProfileTab from '../components/vendor-detail/tabs/ProfileTab';
import LifecycleTab from '../components/vendor-detail/tabs/LifecycleTab';
import DocumentsTab from '../components/vendor-detail/tabs/DocumentsTab';
import IntelligenceTab from '../components/vendor-detail/tabs/IntelligenceTab';
import AssessmentsTab from '../components/vendor-detail/tabs/AssessmentsTab';
import ReportsTab from '../components/vendor-detail/tabs/ReportsTab';
import SendGapsPanel from '../components/vendor-detail/assessments/SendGapsPanel';
import SendForReviewPanel from '../components/vendor-detail/assessments/SendForReviewPanel';
import type { VendorTab } from '../types';

type TabDef =
  | { kind: 'tab'; id: VendorTab; label: string }
  | { kind: 'visual'; label: string }
  | { kind: 'divider' };

const TAB_LAYOUT: TabDef[] = [
  { kind: 'tab', id: 'overview',     label: 'Overview' },
  { kind: 'tab', id: 'profile',      label: 'Profile' },
  { kind: 'tab', id: 'lifecycle',    label: 'Lifecycle' },
  { kind: 'divider' },
  { kind: 'tab', id: 'documents',    label: 'Documents' },
  { kind: 'tab', id: 'assessments',  label: 'Assessments' },
  { kind: 'tab', id: 'reports',      label: 'Reports' },
  { kind: 'tab', id: 'intelligence', label: 'Intelligence' },
  { kind: 'visual',                  label: 'Relationships' },
  { kind: 'visual',                  label: 'Contracts' },
];

function VendorDetailInner() {
  const { state, setTab, openSendGapsPanel, openSendForReviewPanel } = useWorkflow();
  const [, setSearchParams] = useSearchParams();

  const clearAssessmentParam = useCallback(() => {
    setSearchParams(prev => {
      if (!prev.has('assessment')) return prev;
      const next = new URLSearchParams(prev);
      next.delete('assessment');
      return next;
    });
  }, [setSearchParams]);

  const handleTabClick = useCallback((id: VendorTab) => {
    setTab(id);
    // Clicking any tab clears the opened-assessment param — so clicking
    // Assessments while a child assessment is open returns to the list.
    clearAssessmentParam();
  }, [setTab, clearAssessmentParam]);

  // Map current workflow phase → status pill + next-step action.
  // `homeTabs` are tabs where this action's UI lives natively — when the user
  // is on any of them the button collapses to a status-only pill, since an
  // action button would be redundant with the in-tab control.
  const heroAction = (() => {
    switch (state.workflowPhase) {
      case 'profile_pending':
        // While the auto-populate animation runs, the workflow has no
        // user-actionable next step — collapse the button to status only.
        if (state.profileAutoStarted) {
          return {
            status: 'Populating',
            tone: 'indigo' as const,
            label: '',
            onClick: () => {},
            homeTabs: [] as VendorTab[],
            hideAction: true,
          };
        }
        return {
          status: 'Setup pending',
          tone: 'amber' as const,
          label: 'Overview',
          // Overview and Profile both host the dual-action setup CTAs; the
          // hero collapses on either so it never duplicates an in-tab control.
          onClick: () => { setTab('overview'); clearAssessmentParam(); },
          homeTabs: ['overview', 'profile'] as VendorTab[],
          hideAction: false,
        };
      case 'tier_pending':
        // Three sub-states inside tier_pending: pre-generation (CTA on Profile
        // to fire AI), generation animation (status only, no action), and
        // tier-generated awaiting acceptance (router to Profile).
        if (!state.tierGenerationStarted) {
          return {
            status: 'Ready to generate',
            tone: 'sky' as const,
            label: 'Profile',
            onClick: () => { setTab('profile'); clearAssessmentParam(); },
            // Overview's TierCalloutBlock and Profile's AITierBlock both
            // host the in-tab CTA — hero collapses on either.
            homeTabs: ['overview', 'profile'] as VendorTab[],
            hideAction: false,
          };
        }
        if (!state.tierGenerated) {
          return {
            status: 'Generating tier',
            tone: 'indigo' as const,
            label: '',
            onClick: () => {},
            homeTabs: [] as VendorTab[],
            hideAction: true,
          };
        }
        return {
          status: 'Tier pending',
          tone: 'amber' as const,
          label: 'Profile',
          // Profile hosts the full AI Tier Classification block (signals,
          // Accept, Override). Overview's TierCalloutBlock has its own
          // routing CTA. Hero collapses on either to avoid duplication.
          onClick: () => { setTab('profile'); clearAssessmentParam(); },
          homeTabs: ['overview', 'profile'] as VendorTab[],
          hideAction: false,
        };
      case 'docs_pending':
        return {
          status: 'Docs pending',
          tone: 'amber' as const,
          label: 'Documents',
          onClick: () => { setTab('documents'); clearAssessmentParam(); },
          // Overview hosts the Required Docs Block CTA — collapse the hero there too.
          homeTabs: ['overview', 'documents'] as VendorTab[],
          hideAction: false,
        };
      case 'assessments_pending':
        return {
          status: 'Ready to assess',
          tone: 'sky' as const,
          label: 'Assessments',
          // Hero button is a router only — the in-tab CTA actually fires startAssessments().
          onClick: () => { setTab('assessments'); clearAssessmentParam(); },
          homeTabs: ['overview', 'assessments'] as VendorTab[],
          hideAction: false,
        };
      case 'assessments_started':
        return {
          status: 'Gaps awaiting',
          tone: 'indigo' as const,
          label: 'Assessments',
          // Route to Assessments and open the SendGapsPanel; the panel is
          // contextually tied to the Assessments tab so we land there first.
          onClick: () => { setTab('assessments'); clearAssessmentParam(); openSendGapsPanel(); },
          homeTabs: ['assessments'] as VendorTab[],
          hideAction: false,
        };
      case 'gaps_in_flight':
        return {
          status: 'Filling gaps',
          tone: 'indigo' as const,
          label: '',
          // Vendor is filling gaps — status only, no actionable next step.
          onClick: () => {},
          homeTabs: [] as VendorTab[],
          hideAction: true,
        };
      case 'acceptance_pending':
        return {
          status: 'Ready for review',
          tone: 'sky' as const,
          label: 'Assessments',
          // Assessments tab hosts the banner CTA + a persistent toolbar CTA —
          // hero collapses there to avoid redundancy.
          onClick: () => { setTab('assessments'); clearAssessmentParam(); openSendForReviewPanel(); },
          homeTabs: ['assessments'] as VendorTab[],
          hideAction: false,
        };
      case 'review_pending':
        return {
          status: 'In review',
          tone: 'indigo' as const,
          label: '',
          // Reviewers are working — status only, no actionable next step.
          onClick: () => {},
          homeTabs: [] as VendorTab[],
          hideAction: true,
        };
      case 'report_pending':
        return {
          status: 'Ready to report',
          tone: 'sky' as const,
          label: 'Reports',
          // Overview's ReportBlock and the Reports tab both host Generate-Report CTAs.
          onClick: () => { setTab('reports'); clearAssessmentParam(); },
          homeTabs: ['overview', 'reports'] as VendorTab[],
          hideAction: false,
        };
      case 'monitoring_active':
        return {
          status: 'Watching live',
          tone: 'indigo' as const,
          label: '',
          // Vendor is approved and live; no actionable next step at this surface.
          onClick: () => {},
          homeTabs: [] as VendorTab[],
          hideAction: true,
        };
    }
  })();

  const buttonVisible = !heroAction.hideAction && !heroAction.homeTabs.includes(state.activeTab);
  const toneClass =
    heroAction.tone === 'amber'  ? styles.heroStatusAmber  :
    heroAction.tone === 'sky'    ? styles.heroStatusSky    : styles.heroStatusIndigo;

  // Primary-step pill anchors the hero header to the lifecycle map: every
  // workflow phase belongs to exactly one of the four primary steps. The pill
  // updates in lockstep with phase transitions and stays neutral-toned so it
  // doesn't compete with the substep-status pill's amber/sky/indigo signal.
  const primaryStep = (() => {
    switch (state.workflowPhase) {
      case 'profile_pending':       return 'Vendor Intake';
      case 'tier_pending':          return 'Inherent Risk';
      case 'docs_pending':
      case 'assessments_pending':
      case 'assessments_started':
      case 'gaps_in_flight':
      case 'acceptance_pending':
      case 'review_pending':
      case 'report_pending':        return 'Due Diligence';
      case 'monitoring_active':     return 'Monitoring';
    }
  })();

  return (
    <div className={styles.page}>
      <section className={styles.objHero}>
        <div className={styles.objNameRow}>
          <h1 className={styles.objName}>Acme Cloud Co.</h1>
          <div className={styles.heroAction}>
            <span className={`${styles.heroStatus} ${styles.heroStepPill}`}>{primaryStep}</span>
            <span className={`${styles.heroStatus} ${toneClass}`}>{heroAction.status}</span>
            <button
              className={`${styles.heroActionBtn} ${buttonVisible ? '' : styles.heroActionBtnHidden}`}
              onClick={heroAction.onClick}
              aria-hidden={!buttonVisible}
              tabIndex={buttonVisible ? 0 : -1}
            >
              {heroAction.label}
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <nav className={styles.tabRow}>
        {TAB_LAYOUT.map((t, i) => {
          if (t.kind === 'divider') {
            return <span key={`d-${i}`} className={styles.tabDivider}>•</span>;
          }
          if (t.kind === 'visual') {
            return <button key={`v-${i}`} className={styles.tabBtn}>{t.label}</button>;
          }
          return (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${state.activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.tabContent}>
        {state.activeTab === 'overview' && <OverviewTab />}
        {state.activeTab === 'profile' && <ProfileTab />}
        {state.activeTab === 'lifecycle' && <LifecycleTab />}
        {state.activeTab === 'documents' && <DocumentsTab />}
        {state.activeTab === 'intelligence' && <IntelligenceTab />}
        {state.activeTab === 'assessments' && <AssessmentsTab />}
        {state.activeTab === 'reports' && <ReportsTab />}
      </div>

      <SendGapsPanel />
      <SendForReviewPanel />
    </div>
  );
}

export default function VendorDetailPage() {
  return (
    <WorkflowProvider>
      <VendorDetailInner />
    </WorkflowProvider>
  );
}
