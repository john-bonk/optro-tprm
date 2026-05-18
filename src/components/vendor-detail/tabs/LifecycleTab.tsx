import { useWorkflow } from '../../../state/WorkflowContext';
import { phaseData } from '../../../data/phase-data';
import lifecycle from '../lifecycle/lifecycle.module.css';
import SubstepCard from '../lifecycle/SubstepCard';

export default function LifecycleTab() {
  const { state, setPhase, selectStep, toggleSubstep, getSubstepStatus } = useWorkflow();
  const steps = phaseData[state.lifecyclePhase];
  const activeStep = steps[state.activeStep];

  // Phase selector temporarily hidden from the lifecycle view — kept in code
  // so we can re-enable when monitoring / recurring views come back online.
  const SHOW_PHASE_SELECTOR = false;

  return (
    <div className={lifecycle.body}>
      {SHOW_PHASE_SELECTOR && (
        <div className={lifecycle.wfSelector}>
          <span className={lifecycle.wfLabel}>Phase</span>
          <div className={lifecycle.wfOptions}>
            <span
              className={`${lifecycle.wfOption} ${lifecycle.wfOptionClickable} ${state.lifecyclePhase === 'vendor_intake' ? lifecycle.wfOptionActive : ''}`}
              onClick={() => setPhase('vendor_intake')}
            >
              New Vendor Intake
            </span>
            <span
              className={`${lifecycle.wfOption} ${lifecycle.wfOptionClickable} ${state.lifecyclePhase === 'continuous_monitoring' ? lifecycle.wfOptionActive : ''}`}
              onClick={() => setPhase('continuous_monitoring')}
            >
              Continuous Monitoring
            </span>
            <span className={lifecycle.wfOption}>Recurring Assessment</span>
          </div>
        </div>
      )}

      <div className={lifecycle.stepper}>
        {steps.map((step, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <div
              key={i}
              className={`${lifecycle.stepCell} ${i === state.activeStep ? lifecycle.stepCellActive : ''}`}
              onClick={() => selectStep(i)}
            >
              <div className={lifecycle.stepNum}>{num}</div>
              <div className={lifecycle.stepName}>{step.name}</div>
            </div>
          );
        })}
      </div>

      <div className={lifecycle.substepList}>
        {activeStep.substeps.map((s, i) => {
          let acceptedBadge: 'tier' | 'docs' | null = null;
          if (s.name === 'Confirm assigned tier' && state.tierAccepted) acceptedBadge = 'tier';
          else if (s.name === 'Surface required documents' && state.docsRequested) acceptedBadge = 'docs';
          return (
            <SubstepCard
              key={i}
              substep={s}
              index={i}
              expanded={state.expandedSubstep === i}
              status={getSubstepStatus(state.activeStep, i)}
              onToggle={() => toggleSubstep(i)}
              acceptedBadge={acceptedBadge}
            />
          );
        })}
      </div>
    </div>
  );
}
