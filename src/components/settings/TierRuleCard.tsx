import { useState, type ReactNode } from 'react';
import styles from './settings.module.css';

interface Props {
  tier: 1 | 2 | 3;
  tierLabel: string;
  children: ReactNode;
}

export default function TierRuleCard({ tier, tierLabel, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const tierCls = tier === 1 ? styles.tier1 : tier === 2 ? styles.tier2 : styles.tier3;
  return (
    <div className={`${styles.tierRuleCard} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.tierRuleHdr}>
        <span className={styles.ifArrow}>IF →</span>
        <span className={`${styles.tierPill} ${tierCls}`}>{tierLabel}</span>
        <span className={styles.fromPolicy}>
          <svg viewBox="0 0 10 10" fill="none">
            <path d="M5 1l1.2 2.5L9 4l-2 2 .5 3L5 7.5 2.5 9 3 6 1 4l2.8-.5z" fill="currentColor" />
          </svg>
          from policy
        </span>
        <div className={styles.tierRuleSpacer} />
        <button className={styles.tierRuleAction} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
        <button className={styles.tierRuleAction}>Delete</button>
      </div>
      <div className={styles.tierRuleConditions}>
        {children}
        <div className={styles.addCondition}>+ Add condition</div>
      </div>
    </div>
  );
}
