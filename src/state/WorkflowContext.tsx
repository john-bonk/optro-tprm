import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { DataClassification, LifecyclePhase, ProfileConfigSource, SubstepStatus, Tier, VendorTab, WorkflowPhase } from '../types';
import { GAPS_IN_FLIGHT_TOTAL_MS, REVIEW_PENDING_TOTAL_MS } from '../data/assessments';

const DC_TO_TIER: Record<DataClassification, Tier> = {
  'Public': 3,
  'Internal': 2,
  'Confidential': 2,
  'Restricted / PII': 1,
};

export interface ActivityEntry {
  id: number;
  title: string;
  time: string;
  accent?: 'ai';
  pill?: string;
}

interface State {
  selectedTier: Tier;
  tierAccepted: boolean;
  dataClassification: DataClassification;
  profileConfigured: boolean;
  profileConfigSource: ProfileConfigSource;
  // User picked "Fill out manually" but hasn't yet committed the (simulated)
  // manual entry — Profile shows an empty Details block awaiting the click
  // that finalizes the entry and advances to tier_pending.
  profileManualPrimed: boolean;
  // User picked "Auto-populate" — Profile shows the AI-populate processing
  // animation for ~2s before the actual configure_profile('auto') fires
  // and the record fills in / workflow advances to tier_pending.
  profileAutoStarted: boolean;
  // Interstitial inside tier_pending — after profile setup completes, the
  // user explicitly triggers AI tier generation. tierGenerationStarted gates
  // the brief processing animation; tierGenerated gates the full AI Tier
  // Classification block. Order: !started → started/!generated → generated.
  tierGenerationStarted: boolean;
  tierGenerated: boolean;
  docsRequested: boolean;
  workflowPhase: WorkflowPhase;
  lifecyclePhase: LifecyclePhase;
  activeStep: number;
  expandedSubstep: number;
  activeTab: VendorTab;
  statusBannerTitle: string;
  statusBannerMeta: string;
  activity: ActivityEntry[];
  nextActivityId: number;
  sendGapsPanelOpen: boolean;
  // Right-panel for the "Send for review" flow — mirrors sendGapsPanelOpen.
  sendForReviewPanelOpen: boolean;
  gapsSent: boolean;
  dismissedBanners: Record<string, boolean>;
  // Assessment IDs the user has bulk-accepted from the list-view selection bar.
  // OpenedAssessment honors this on mount (every drafted question becomes accepted).
  bulkAcceptedAssessments: string[];
  // Ticker for the Monitoring substep auto-execution sim. 0 = none active,
  // 1..7 = number of Monitoring substeps completed (substep `step-1` was the
  // most recently active). Drives lifecycle substep statuses during the
  // monitoring_active workflow phase.
  monitoringSimStep: number;
  // Cross-tab flag so the Lifecycle / Overview "Generate report" CTAs can
  // launch the fullscreen executive-summary viewer hosted on ReportsTab.
  reportViewerOpen: boolean;
}

type Action =
  | { type: 'set_tier'; tier: Tier }
  | { type: 'set_data_classification'; value: DataClassification }
  | { type: 'configure_profile'; source: 'auto' | 'manual' }
  | { type: 'start_auto_populate' }
  | { type: 'complete_manual_entry' }
  | { type: 'start_tier_generation' }
  | { type: 'complete_tier_generation' }
  | { type: 'accept_tier' }
  | { type: 'docs_received' }
  | { type: 'start_assessments' }
  | { type: 'open_send_gaps_panel' }
  | { type: 'close_send_gaps_panel' }
  | { type: 'open_send_for_review_panel' }
  | { type: 'close_send_for_review_panel' }
  | { type: 'gaps_sent' }
  | { type: 'gaps_resolved' }
  | { type: 'bulk_accept_assessments'; ids: string[] }
  | { type: 'send_for_review' }
  | { type: 'review_completed' }
  | { type: 'generate_report' }
  | { type: 'monitoring_sim_advance' }
  | { type: 'open_report_viewer' }
  | { type: 'close_report_viewer' }
  | { type: 'dismiss_banner'; id: string }
  | { type: 'set_phase'; phase: LifecyclePhase }
  | { type: 'select_step'; step: number }
  | { type: 'toggle_substep'; substep: number }
  | { type: 'set_tab'; tab: VendorTab }
  | { type: 'add_activity'; title: string; time: string; accent?: 'ai'; pill?: string };

const initialState: State = {
  selectedTier: 2,
  tierAccepted: false,
  dataClassification: 'Internal',
  profileConfigured: false,
  profileConfigSource: null,
  profileManualPrimed: false,
  profileAutoStarted: false,
  tierGenerationStarted: false,
  tierGenerated: false,
  docsRequested: false,
  workflowPhase: 'profile_pending',
  lifecyclePhase: 'vendor_intake',
  activeStep: 0,
  expandedSubstep: -1,
  activeTab: 'overview',
  statusBannerTitle: 'Setup',
  statusBannerMeta: 'Vendor imported · awaiting profile configuration',
  activity: [
    { id: 1, title: 'Vendor imported from Zip', time: 'Today · 9:14 AM' },
  ],
  nextActivityId: 2,
  sendGapsPanelOpen: false,
  sendForReviewPanelOpen: false,
  gapsSent: false,
  dismissedBanners: {},
  bulkAcceptedAssessments: [],
  monitoringSimStep: 0,
  reportViewerOpen: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_tier':
      return { ...state, selectedTier: action.tier };
    case 'set_data_classification':
      return { ...state, dataClassification: action.value, selectedTier: DC_TO_TIER[action.value] };
    case 'configure_profile': {
      if (action.source === 'manual') {
        // Manual primes the Profile tab's empty Details form — workflow stays
        // in profile_pending until the user clicks the Details block to
        // simulate the entry (dispatching 'complete_manual_entry').
        return {
          ...state,
          profileManualPrimed: true,
          profileConfigSource: 'manual',
          activeTab: 'profile',
          statusBannerTitle: 'Setup',
          statusBannerMeta: 'Manual entry primed · awaiting Details completion',
        };
      }
      // Auto: AI fully populates the record from the Zip integration. Fires
      // once the AutoPopulateAnimation sim window completes; the record fills
      // in and the workflow advances into the tier generation interstitial.
      return {
        ...state,
        profileConfigured: true,
        profileConfigSource: 'auto',
        profileAutoStarted: false,
        workflowPhase: 'tier_pending',
        tierGenerationStarted: false,
        tierGenerated: false,
        activeTab: 'profile',
        statusBannerTitle: 'Setup',
        statusBannerMeta: 'Profile auto-populated from Zip · ready to generate tier',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'Profile auto-populated from Zip', time: 'Today · 9:15 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    }
    case 'start_auto_populate':
      // Profile shows the AI-populate animation; the actual configure_profile
      // fires automatically after the sim window completes.
      return {
        ...state,
        profileAutoStarted: true,
        activeTab: 'profile',
        statusBannerTitle: 'Setup',
        statusBannerMeta: 'AI populating vendor record from Zip integration',
      };
    case 'complete_manual_entry':
      return {
        ...state,
        profileConfigured: true,
        profileManualPrimed: false,
        profileConfigSource: 'manual',
        workflowPhase: 'tier_pending',
        tierGenerationStarted: false,
        tierGenerated: false,
        activeTab: 'profile',
        statusBannerTitle: 'Setup',
        statusBannerMeta: 'Profile configured manually · ready to generate tier',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'Profile configured manually', time: 'Today · 9:15 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'start_tier_generation':
      return {
        ...state,
        tierGenerationStarted: true,
        // Auto-dismiss the post-setup confirmation banner — the user has
        // moved on to the next step, so it no longer warrants the surface.
        dismissedBanners: { ...state.dismissedBanners, 'profile-configured': true },
        statusBannerTitle: 'Setup',
        statusBannerMeta: 'AI analyzing vendor signals · generating tier suggestion',
      };
    case 'complete_tier_generation':
      return {
        ...state,
        tierGenerated: true,
        statusBannerTitle: 'Setup',
        statusBannerMeta: 'AI tier suggestion ready · awaiting acceptance',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'AI suggested Tier 2 classification', time: 'Today · 9:16 AM', accent: 'ai', pill: '87% confidence' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'accept_tier': {
      const tierLabel = `Tier ${state.selectedTier}`;
      return {
        ...state,
        tierAccepted: true,
        workflowPhase: 'docs_pending',
        statusBannerTitle: 'Onboarding',
        statusBannerMeta: `${tierLabel} accepted · gathering required documents`,
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: `${tierLabel} classification accepted`, time: 'Today · 9:16 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    }
    case 'docs_received': {
      return {
        ...state,
        docsRequested: true,
        workflowPhase: 'assessments_pending',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Documents collected · intel reconciled · awaiting assessments',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'All required documents received', time: 'Today · 9:18 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    }
    case 'start_assessments': {
      return {
        ...state,
        workflowPhase: 'assessments_started',
        activeTab: 'assessments',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Assessments running · 390 of 426 answered · 36 gaps pending vendor',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'Assessments started · AI drafting 426 questions', time: 'Today · 9:24 AM', accent: 'ai' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    }
    case 'set_phase':
      if (state.lifecyclePhase === action.phase) return state;
      return { ...state, lifecyclePhase: action.phase, activeStep: 0, expandedSubstep: -1 };
    case 'select_step':
      return { ...state, activeStep: action.step, expandedSubstep: -1 };
    case 'toggle_substep':
      return { ...state, expandedSubstep: state.expandedSubstep === action.substep ? -1 : action.substep };
    case 'set_tab':
      return { ...state, activeTab: action.tab };
    case 'add_activity':
      return {
        ...state,
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: action.title, time: action.time, accent: action.accent, pill: action.pill },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'open_send_gaps_panel':
      return { ...state, sendGapsPanelOpen: true };
    case 'close_send_gaps_panel':
      return { ...state, sendGapsPanelOpen: false };
    case 'open_send_for_review_panel':
      return { ...state, sendForReviewPanelOpen: true };
    case 'close_send_for_review_panel':
      return { ...state, sendForReviewPanelOpen: false };
    case 'dismiss_banner':
      return { ...state, dismissedBanners: { ...state.dismissedBanners, [action.id]: true } };
    case 'gaps_sent':
      return {
        ...state,
        sendGapsPanelOpen: false,
        gapsSent: true,
        workflowPhase: 'gaps_in_flight',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Gaps sent · awaiting vendor responses',
      };
    case 'gaps_resolved':
      return {
        ...state,
        workflowPhase: 'acceptance_pending',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Gap responses received · accept answers and send for reviewer approval',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'All vendor responses received · gaps closed', time: 'Today · 9:42 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'bulk_accept_assessments': {
      const merged = new Set([...state.bulkAcceptedAssessments, ...action.ids]);
      return { ...state, bulkAcceptedAssessments: Array.from(merged) };
    }
    case 'send_for_review':
      return {
        ...state,
        sendForReviewPanelOpen: false,
        workflowPhase: 'review_pending',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Sent to reviewers · awaiting approval',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'Assessment package sent for reviewer approval', time: 'Today · 9:48 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'review_completed':
      return {
        ...state,
        workflowPhase: 'report_pending',
        statusBannerTitle: 'Review',
        statusBannerMeta: 'Reviewers approved · ready for report generation',
        activity: [
          ...state.activity,
          { id: state.nextActivityId, title: 'Reviewer approvals received · assessment package signed off', time: 'Today · 9:51 AM' },
        ],
        nextActivityId: state.nextActivityId + 1,
      };
    case 'generate_report':
      return {
        ...state,
        workflowPhase: 'monitoring_active',
        statusBannerTitle: 'Monitoring',
        statusBannerMeta: 'Verdict: Approve with conditions · monitoring kickoff in flight',
        monitoringSimStep: 0,
        activity: [
          ...state.activity,
          { id: state.nextActivityId,     title: 'Vendor risk report generated · committee draft', time: 'Today · 9:52 AM' },
          { id: state.nextActivityId + 1, title: 'Verdict issued: Approve with conditions',         time: 'Today · 9:52 AM' },
        ],
        nextActivityId: state.nextActivityId + 2,
      };
    case 'monitoring_sim_advance':
      return { ...state, monitoringSimStep: Math.min(state.monitoringSimStep + 1, 7) };
    case 'open_report_viewer':
      return { ...state, reportViewerOpen: true };
    case 'close_report_viewer':
      return { ...state, reportViewerOpen: false };
  }
}

interface WorkflowContextValue {
  state: State;
  setTier: (tier: Tier) => void;
  setDataClassification: (value: DataClassification) => void;
  configureProfile: (source: 'auto' | 'manual') => void;
  startAutoPopulate: () => void;
  completeManualEntry: () => void;
  startTierGeneration: () => void;
  acceptTier: () => void;
  requestMissingDocs: () => void;
  startAssessments: () => void;
  setPhase: (phase: LifecyclePhase) => void;
  selectStep: (step: number) => void;
  toggleSubstep: (substep: number) => void;
  setTab: (tab: VendorTab) => void;
  getSubstepStatus: (stepIdx: number, substepIdx: number) => SubstepStatus;
  openSendGapsPanel: () => void;
  closeSendGapsPanel: () => void;
  sendGaps: () => void;
  openSendForReviewPanel: () => void;
  closeSendForReviewPanel: () => void;
  bulkAcceptAssessments: (ids: string[]) => void;
  sendForReview: () => void;
  generateReport: () => void;
  openReportViewer: () => void;
  closeReportViewer: () => void;
  dismissBanner: (id: string) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const docsTimers = useRef<number[]>([]);

  const setTier = useCallback((tier: Tier) => dispatch({ type: 'set_tier', tier }), []);
  const setDataClassification = useCallback((value: DataClassification) => dispatch({ type: 'set_data_classification', value }), []);
  const configureProfile = useCallback((source: 'auto' | 'manual') => dispatch({ type: 'configure_profile', source }), []);
  const startAutoPopulate = useCallback(() => dispatch({ type: 'start_auto_populate' }), []);
  const completeManualEntry = useCallback(() => dispatch({ type: 'complete_manual_entry' }), []);
  const startTierGeneration = useCallback(() => dispatch({ type: 'start_tier_generation' }), []);
  const acceptTier = useCallback(() => dispatch({ type: 'accept_tier' }), []);
  const setPhase = useCallback((phase: LifecyclePhase) => dispatch({ type: 'set_phase', phase }), []);
  const selectStep = useCallback((step: number) => dispatch({ type: 'select_step', step }), []);
  const toggleSubstep = useCallback((substep: number) => dispatch({ type: 'toggle_substep', substep }), []);
  const setTab = useCallback((tab: VendorTab) => dispatch({ type: 'set_tab', tab }), []);

  const requestMissingDocs = useCallback(() => {
    // Phase 1: triggered immediately (UI handles spinner state visually)
    // Phase 2 fires after 1300 + 1100 = 2400ms
    docsTimers.current.forEach(t => window.clearTimeout(t));
    docsTimers.current = [];
    docsTimers.current.push(window.setTimeout(() => {
      docsTimers.current.push(window.setTimeout(() => {
        dispatch({ type: 'docs_received' });
        // 700ms after that, outside-in intel activity
        docsTimers.current.push(window.setTimeout(() => {
          dispatch({
            type: 'add_activity',
            title: 'Outside-in intel completed · 4 signals reconciled',
            time: 'Today · 9:19 AM',
            accent: 'ai',
          });
        }, 700));
      }, 1100));
    }, 1300));
  }, []);

  const startAssessments = useCallback(() => dispatch({ type: 'start_assessments' }), []);
  const openSendGapsPanel = useCallback(() => dispatch({ type: 'open_send_gaps_panel' }), []);
  const closeSendGapsPanel = useCallback(() => dispatch({ type: 'close_send_gaps_panel' }), []);
  const sendGaps = useCallback(() => dispatch({ type: 'gaps_sent' }), []);
  const openSendForReviewPanel = useCallback(() => dispatch({ type: 'open_send_for_review_panel' }), []);
  const closeSendForReviewPanel = useCallback(() => dispatch({ type: 'close_send_for_review_panel' }), []);
  const bulkAcceptAssessments = useCallback((ids: string[]) => dispatch({ type: 'bulk_accept_assessments', ids }), []);
  const sendForReview = useCallback(() => dispatch({ type: 'send_for_review' }), []);
  const generateReport = useCallback(() => dispatch({ type: 'generate_report' }), []);
  const openReportViewer = useCallback(() => dispatch({ type: 'open_report_viewer' }), []);
  const closeReportViewer = useCallback(() => dispatch({ type: 'close_report_viewer' }), []);
  const dismissBanner = useCallback((id: string) => dispatch({ type: 'dismiss_banner', id }), []);

  // Cross-tab signal from the Trust Center "Complete" button → kick off the same
  // doc-received flow as the in-app Send secure upload link path.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('optro-trust-center');
    ch.onmessage = (e) => {
      if (e?.data?.type === 'trust-center-complete') requestMissingDocs();
    };
    return () => ch.close();
  }, [requestMissingDocs]);

  // Auto-advance the gaps-in-flight interstitial → acceptance_pending once the
  // simulated "vendor responses received" animation completes.
  useEffect(() => {
    if (state.workflowPhase !== 'gaps_in_flight') return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'gaps_resolved' });
    }, GAPS_IN_FLIGHT_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [state.workflowPhase]);

  // Auto-advance the review_pending interstitial → report_pending after the
  // simulated reviewer-approval window completes.
  useEffect(() => {
    if (state.workflowPhase !== 'review_pending') return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'review_completed' });
    }, REVIEW_PENDING_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [state.workflowPhase]);

  // Tier generation interstitial — once the user fires startTierGeneration,
  // hold the animation card for ~2s then reveal the full AI Tier block.
  useEffect(() => {
    if (state.workflowPhase !== 'tier_pending') return;
    if (!state.tierGenerationStarted) return;
    if (state.tierGenerated) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'complete_tier_generation' });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [state.workflowPhase, state.tierGenerationStarted, state.tierGenerated]);

  // Auto-populate interstitial — once the user fires startAutoPopulate, hold
  // the AI-populate animation for ~2s then run the actual configure_profile
  // (advances to tier_pending with the record filled in).
  useEffect(() => {
    if (state.workflowPhase !== 'profile_pending') return;
    if (!state.profileAutoStarted) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'configure_profile', source: 'auto' });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [state.workflowPhase, state.profileAutoStarted]);

  // Monitoring kickoff sim. Once the user generates the report, advance
  // through the seven Monitoring substeps on a tick so the lifecycle stepper
  // visibly ramps the new phase up (cadence → feeds → drift → news → expiry
  // → re-eval → escalation triggers).
  useEffect(() => {
    if (state.workflowPhase !== 'monitoring_active') return;
    if (state.monitoringSimStep >= 7) return;
    const id = window.setTimeout(() => {
      dispatch({ type: 'monitoring_sim_advance' });
    }, 600);
    return () => window.clearTimeout(id);
  }, [state.workflowPhase, state.monitoringSimStep]);

  const getSubstepStatus = useCallback((stepIdx: number, substepIdx: number): SubstepStatus => {
    if (state.lifecyclePhase !== 'vendor_intake') return 'not_started';
    // Step layout (4 primary steps · substeps map 1:1 to workflow phases):
    //   0 · Vendor Intake   (5 substeps · agentic 0-3 auto-complete · HITL 4)
    //   1 · Inherent Risk   (7 substeps · tier 0-2 · outside-in 3-6)
    //   2 · Due Diligence   (10 substeps · one per workflow phase below)
    //   3 · Monitoring      (7 substeps · sim-advance during monitoring_active)
    //
    // Due Diligence substep ↔ workflow phase:
    //   0 Surface required documents          (agentic · auto-complete)
    //   1 Collect missing vendor evidence     · docs_pending
    //   2 Queue tier-appropriate questionnaires · assessments_pending
    //   3 Generate AI assessment drafts       · assessments_started
    //   4 Resolve question gaps with vendor   · gaps_in_flight
    //   5 Review and accept AI-drafted answers · acceptance_pending
    //   6 Route to reviewers and certify      · review_pending
    //   7 Map findings to control framework   (agentic · auto-complete at report_pending)
    //   8 Compute residual-risk score         (agentic · auto-complete at report_pending)
    //   9 Issue verdict and generate report   · report_pending
    switch (state.workflowPhase) {
      case 'profile_pending': {
        // 1.1 is the HITL gate where the user picks how the record gets
        // populated (Auto-populate / Fill out manually / Reject). Once they
        // act on it, the agentic substeps 1.2–1.5 (Ingest, Parse, Pre-fill,
        // Flag) flip to in_progress while the populate sim runs.
        if (stepIdx !== 0) return 'not_started';
        const picked = state.profileAutoStarted || state.profileManualPrimed;
        if (substepIdx === 0) return picked ? 'complete' : 'in_progress';
        return picked ? 'in_progress' : 'not_started';
      }
      case 'tier_pending':
        // Three sub-states inside tier_pending track the AI tier generation
        // interstitial: !started → started/!generated → generated. Each
        // maps cleanly onto the Inherent Risk substep statuses. There's
        // always exactly one in_progress substep so the lifecycle never
        // shows an idle Inherent Risk step.
        if (stepIdx === 0) return 'complete';
        if (!state.tierGenerationStarted) {
          // 2.1 is the HITL "Generate tier classification" gate — awaiting
          // the user to fire the analysis from any of the parallel surfaces.
          if (stepIdx === 1 && substepIdx === 0) return 'in_progress';
          return 'not_started';
        }
        if (!state.tierGenerated) {
          // After generation kickoff: 2.1 complete, 2.2 (Apply AI tier
          // classification) is the agentic work running during the animation.
          if (stepIdx === 1 && substepIdx === 0) return 'complete';
          if (stepIdx === 1 && substepIdx === 1) return 'in_progress';
          return 'not_started';
        }
        // Tier generated; awaiting human acceptance on Confirm assigned tier.
        if (stepIdx === 1 && substepIdx < 2) return 'complete';
        if (stepIdx === 1 && substepIdx === 2) return 'in_progress';
        return 'not_started';
      case 'docs_pending':
        // Tier accepted. All agentic prep work auto-completed: outside-in
        // signals reconciled, required-doc list surfaced. Active substep is
        // "Collect missing vendor evidence" — gated on Documents tab action.
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx === 0) return 'complete';
        if (stepIdx === 2 && substepIdx === 1) return 'in_progress';
        return 'not_started';
      case 'assessments_pending':
        // Docs collected. Questionnaires queued for proto user to start.
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 1) return 'complete';
        if (stepIdx === 2 && substepIdx === 2) return 'in_progress';
        return 'not_started';
      case 'assessments_started':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 2) return 'complete';
        if (stepIdx === 2 && substepIdx === 3) return 'in_progress';
        return 'not_started';
      case 'gaps_in_flight':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 3) return 'complete';
        if (stepIdx === 2 && substepIdx === 4) return 'in_progress';
        return 'not_started';
      case 'acceptance_pending':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 4) return 'complete';
        if (stepIdx === 2 && substepIdx === 5) return 'in_progress';
        return 'not_started';
      case 'review_pending':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 5) return 'complete';
        if (stepIdx === 2 && substepIdx === 6) return 'in_progress';
        return 'not_started';
      case 'report_pending':
        // Reviewers signed off. Agentic findings-mapping + scoring substeps
        // auto-complete at this transition. Active substep is "Issue verdict
        // and generate report" — gated on user clicking Generate Report.
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx <= 8) return 'complete';
        if (stepIdx === 2 && substepIdx === 9) return 'in_progress';
        return 'not_started';
      case 'monitoring_active': {
        // Verdict issued · report generated · Due Diligence complete.
        // Monitoring substeps auto-execute via the sim ticker.
        if (stepIdx === 0 || stepIdx === 1 || stepIdx === 2) return 'complete';
        if (stepIdx === 3) {
          if (substepIdx < state.monitoringSimStep) return 'complete';
          if (substepIdx === state.monitoringSimStep) return 'in_progress';
          return 'not_started';
        }
        return 'not_started';
      }
    }
  }, [state.lifecyclePhase, state.workflowPhase, state.monitoringSimStep]);

  const value = useMemo<WorkflowContextValue>(() => ({
    state,
    setTier,
    setDataClassification,
    configureProfile,
    startAutoPopulate,
    completeManualEntry,
    startTierGeneration,
    acceptTier,
    requestMissingDocs,
    startAssessments,
    setPhase,
    selectStep,
    toggleSubstep,
    setTab,
    getSubstepStatus,
    openSendGapsPanel,
    closeSendGapsPanel,
    sendGaps,
    openSendForReviewPanel,
    closeSendForReviewPanel,
    bulkAcceptAssessments,
    sendForReview,
    generateReport,
    openReportViewer,
    closeReportViewer,
    dismissBanner,
  }), [state, setTier, setDataClassification, configureProfile, startAutoPopulate, completeManualEntry, startTierGeneration, acceptTier, requestMissingDocs, startAssessments, setPhase, selectStep, toggleSubstep, setTab, getSubstepStatus, openSendGapsPanel, closeSendGapsPanel, sendGaps, openSendForReviewPanel, closeSendForReviewPanel, bulkAcceptAssessments, sendForReview, generateReport, openReportViewer, closeReportViewer, dismissBanner]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}
