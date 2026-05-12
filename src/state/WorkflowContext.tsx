import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { LifecyclePhase, SubstepStatus, Tier, VendorTab, WorkflowPhase } from '../types';

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
}

type Action =
  | { type: 'set_tier'; tier: Tier }
  | { type: 'accept_tier' }
  | { type: 'docs_received_phase1' }
  | { type: 'docs_received_phase2' }
  | { type: 'start_assessments' }
  | { type: 'set_phase'; phase: LifecyclePhase }
  | { type: 'select_step'; step: number }
  | { type: 'toggle_substep'; substep: number }
  | { type: 'set_tab'; tab: VendorTab }
  | { type: 'add_activity'; title: string; time: string; accent?: 'ai'; pill?: string };

const initialState: State = {
  selectedTier: 2,
  tierAccepted: false,
  docsRequested: false,
  workflowPhase: 'tier_pending',
  lifecyclePhase: 'vendor_intake',
  activeStep: 0,
  expandedSubstep: -1,
  activeTab: 'overview',
  statusBannerTitle: 'Setup',
  statusBannerMeta: 'Onboarded today · awaiting tier acceptance',
  activity: [
    { id: 1, title: 'Vendor imported from Zip', time: 'Today · 9:14 AM' },
    { id: 2, title: 'AI suggested Tier 2 classification', time: 'Today · 9:15 AM', accent: 'ai', pill: '87% confidence' },
  ],
  nextActivityId: 3,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_tier':
      return { ...state, selectedTier: action.tier };
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
    case 'docs_received_phase1': {
      // Step B in animation chain — just an interim flag isn't needed; phase2 progresses state.
      return state;
    }
    case 'docs_received_phase2': {
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
  }
}

interface WorkflowContextValue {
  state: State;
  setTier: (tier: Tier) => void;
  acceptTier: () => void;
  requestMissingDocs: () => void;
  startAssessments: () => void;
  setPhase: (phase: LifecyclePhase) => void;
  selectStep: (step: number) => void;
  toggleSubstep: (substep: number) => void;
  setTab: (tab: VendorTab) => void;
  getSubstepStatus: (stepIdx: number, substepIdx: number) => SubstepStatus;
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
        dispatch({ type: 'docs_received_phase2' });
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

  const getSubstepStatus = useCallback((stepIdx: number, substepIdx: number): SubstepStatus => {
    if (state.lifecyclePhase !== 'vendor_intake') return 'not_started';
    switch (state.workflowPhase) {
      case 'tier_pending':
        if (stepIdx === 0 && substepIdx < 3) return 'complete';
        if (stepIdx === 0 && substepIdx === 3) return 'in_progress';
        return 'not_started';
      case 'docs_pending':
        if (stepIdx === 0 && substepIdx < 4) return 'complete';
        if (stepIdx === 0 && substepIdx === 4) return 'in_progress';
        return 'not_started';
      case 'assessments_pending':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        return 'not_started';
      case 'assessments_started':
        if (stepIdx === 0 || stepIdx === 1) return 'complete';
        if (stepIdx === 2 && substepIdx === 0) return 'in_progress';
        return 'not_started';
    }
  }, [state.lifecyclePhase, state.workflowPhase]);

  const value = useMemo<WorkflowContextValue>(() => ({
    state,
    setTier,
    acceptTier,
    requestMissingDocs,
    startAssessments,
    setPhase,
    selectStep,
    toggleSubstep,
    setTab,
    getSubstepStatus,
  }), [state, setTier, acceptTier, requestMissingDocs, startAssessments, setPhase, selectStep, toggleSubstep, setTab, getSubstepStatus]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}
