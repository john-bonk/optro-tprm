import { useWorkflow } from '../../../state/WorkflowContext';
import styles from './overview.module.css';

export default function ActivityTimeline() {
  const { state } = useWorkflow();
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetHeader}>
        <div className={styles.widgetLabel}>Recent activity</div>
        <a className={styles.widgetAction}>See all</a>
      </div>
      <div className={styles.activityList}>
        {state.activity.map(item => (
          <div key={item.id} className={styles.activityItem}>
            <div className={`${styles.activityDot} ${item.accent === 'ai' ? styles.ai : ''}`} />
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>{item.title}</div>
              {item.pill && (
                <div className={styles.activityPillRow}>
                  <span className={styles.activityPill}>{item.pill}</span>
                </div>
              )}
              <div className={styles.activityMeta}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
