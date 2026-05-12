import type { ManagedStatus } from '../../types';
import styles from './pills.module.css';

const statusCls: Record<ManagedStatus, string> = {
  Intake: styles.intake,
  Approved: styles.approved,
  'In Review': styles.inReview,
  Archived: styles.archived,
};

export default function StatusPill({ status }: { status: ManagedStatus }) {
  return <span className={`${styles.status} ${statusCls[status]}`}>{status}</span>;
}
