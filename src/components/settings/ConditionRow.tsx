import type { ReactNode } from 'react';
import styles from './settings.module.css';

type Logic = 'IF' | 'AND' | 'OR';

interface SelectProps { label: string }
function Select({ label }: SelectProps) {
  return (
    <div className={styles.conditionSelect}>
      {label}
      <svg viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface RowProps {
  logic: Logic;
  field: string;
  operator: ReactNode;
  value: string;
  operatorSym?: boolean;
}

export default function ConditionRow({ logic, field, operator, value, operatorSym }: RowProps) {
  const logicCls =
    logic === 'AND' ? styles.andLabel :
    logic === 'OR'  ? styles.orLabel  : styles.ifLabel;
  return (
    <div className={styles.conditionRow}>
      <span className={`${styles.conditionLabel} ${logicCls}`}>{logic}</span>
      <Select label={field} />
      <span className={`${styles.conditionOperator} ${operatorSym ? styles.operatorSym : ''}`}>{operator}</span>
      <Select label={value} />
    </div>
  );
}
