import { useWorkflow } from '../../../state/WorkflowContext';
import { tierData } from '../../../data/tier-data';
import styles from './overview.module.css';

export default function HealthGrid() {
  const { state } = useWorkflow();
  const tier = tierData[state.selectedTier];
  const tierColorClass =
    state.selectedTier === 1 ? styles.tierValueT1 :
    state.selectedTier === 2 ? styles.tierValueT2 : styles.tierValueT3;
  const tierPending = state.workflowPhase === 'profile_pending';

  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetLabel}>Health</div>
      <div className={styles.healthGrid}>
        <Cell label="Risk" value="—" sub="Pending tier" valueMuted />
        {tierPending ? (
          <Cell label="Tier" value="—" sub="Pending" valueMuted />
        ) : (
          <Cell
            label="Tier"
            value={state.tierAccepted ? tier.label : `T${state.selectedTier}`}
            sub={state.tierAccepted ? tier.name : `AI 87% · unconfirmed`}
            valueClass={tierColorClass}
          />
        )}
        <Cell label="BitSight" value="690" sub="Intermediate" />
        <Cell label="Maturity" value="—" sub="Pending" valueMuted />
      </div>
    </div>
  );
}

interface CellProps {
  label: string;
  value: string;
  sub: string;
  valueMuted?: boolean;
  valueClass?: string;
}

function Cell({ label, value, sub, valueMuted, valueClass }: CellProps) {
  return (
    <div className={styles.healthCell}>
      <div className={styles.healthCellLabel}>{label}</div>
      <div className={`${styles.healthCellValue} ${valueMuted ? styles.muted : ''} ${valueClass ?? ''}`}>{value}</div>
      <div className={styles.healthCellSub}>{sub}</div>
    </div>
  );
}
