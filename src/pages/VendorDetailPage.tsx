import { WorkflowProvider, useWorkflow } from '../state/WorkflowContext';
import styles from './VendorDetailPage.module.css';
import OverviewTab from '../components/vendor-detail/tabs/OverviewTab';
import LifecycleTab from '../components/vendor-detail/tabs/LifecycleTab';
import DocumentsTab from '../components/vendor-detail/tabs/DocumentsTab';
import IntelligenceTab from '../components/vendor-detail/tabs/IntelligenceTab';
import AssessmentsTab from '../components/vendor-detail/tabs/AssessmentsTab';
import type { VendorTab } from '../types';

const TABS: { id: VendorTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'lifecycle', label: 'Lifecycle' },
];
const SECOND_GROUP: { id: VendorTab; label: string }[] = [
  { id: 'documents', label: 'Documents' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'assessments', label: 'Assessments' },
];
const VISUAL_ONLY = ['Relationships', 'Contracts', 'Reports', 'Audit Log'];

function VendorDetailInner() {
  const { state, setTab } = useWorkflow();
  return (
    <div className={styles.page}>
      <section className={styles.objHero}>
        <div className={styles.objNameRow}>
          <h1 className={styles.objName}>Acme Cloud Co.</h1>
        </div>
      </section>

      <nav className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${state.activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <span className={styles.tabDivider}>•</span>
        {SECOND_GROUP.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${state.activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        {VISUAL_ONLY.map(t => (
          <button key={t} className={styles.tabBtn}>{t}</button>
        ))}
      </nav>

      <div className={styles.tabContent}>
        {state.activeTab === 'overview' && <OverviewTab />}
        {state.activeTab === 'lifecycle' && <LifecycleTab />}
        {state.activeTab === 'documents' && <DocumentsTab />}
        {state.activeTab === 'intelligence' && <IntelligenceTab />}
        {state.activeTab === 'assessments' && <AssessmentsTab />}
      </div>
    </div>
  );
}

export default function VendorDetailPage() {
  return (
    <WorkflowProvider>
      <VendorDetailInner />
    </WorkflowProvider>
  );
}
