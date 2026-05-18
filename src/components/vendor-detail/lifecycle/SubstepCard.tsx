import type { Substep, SubstepStatus } from '../../../types';
import styles from './lifecycle.module.css';
import StatusIcon from './StatusIcon';
import SubstepOutputRenderer from './SubstepOutput';

interface Props {
  substep: Substep;
  index: number;
  expanded: boolean;
  status: SubstepStatus;
  onToggle: () => void;
  acceptedBadge?: 'tier' | 'docs' | null;
}

export default function SubstepCard({ substep, index, expanded, status, onToggle, acceptedBadge }: Props) {
  const num = String(index + 1).padStart(2, '0');
  const flow = substep.flow;
  const flowTitle = flow === 'parallel' ? 'Parallel · runs concurrently' : 'Sequential · depends on prior substep';
  const tagClass =
    substep.type === 'agentic' ? styles.tagAgentic :
    substep.type === 'automated' ? styles.tagAutomated :
    substep.type === 'hitl' ? styles.tagHitl : styles.tagManual;

  return (
    <div className={`${styles.substepCard} ${expanded ? styles.substepCardExpanded : ''} ${flow === 'parallel' ? styles.flowParallel : ''}`}>
      <div className={styles.substepHdr} onClick={onToggle}>
        <span className={styles.substepStatus}><StatusIcon status={status} /></span>
        <span className={styles.substepNum}>{num}</span>
        <span className={styles.substepName}>
          {substep.name}
          {acceptedBadge === 'tier' && <span className={styles.substepAccepted}>✓ Accepted</span>}
          {acceptedBadge === 'docs' && <span className={styles.substepAccepted}>✓ Collected</span>}
        </span>
        <span className={styles.substepFlow} title={flowTitle}>
          {flow === 'parallel' ? (
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M4 2L4 10M2 8L4 10L6 8M10 2L10 10M8 8L10 10L12 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M7 2L7 10M4 8L7 11L10 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={`${styles.substepTag} ${tagClass}`}>{substep.type}</span>
        <svg className={styles.substepChev} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {expanded && (
        <div className={styles.substepBody}>
          <div className={styles.previewLabel}>UI pattern output · {substep.pattern}</div>
          <SubstepOutputRenderer substep={substep} status={status} />
        </div>
      )}
    </div>
  );
}
