import type { Tier } from '../../types';
import styles from './pills.module.css';

const tierCls: Record<Tier, string> = {
  1: styles.tier1,
  2: styles.tier2,
  3: styles.tier3,
};

export default function TierPill({ tier }: { tier: Tier }) {
  return <span className={`${styles.tier} ${tierCls[tier]}`}>Tier {tier}</span>;
}
