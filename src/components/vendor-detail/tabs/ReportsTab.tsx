import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../reports/reports.module.css';
import ExecutiveSummaryViewer from '../reports/ExecutiveSummaryViewer';

interface ReportType {
  id: string;
  title: string;
  description: string;
  primary?: boolean;
}

const REPORTS: ReportType[] = [
  {
    id: 'vendor-risk',
    title: 'Vendor Risk Report',
    description: 'Comprehensive risk profile combining tier classification, intelligence signals, document controls, and questionnaire responses. The canonical artifact for risk committee review.',
    primary: true,
  },
  {
    id: 'compliance-summary',
    title: 'Compliance Summary',
    description: 'Framework coverage snapshot — SOC 2, ISO 27001, GDPR posture mapped to your control library.',
  },
  {
    id: 'tier-justification',
    title: 'Tier Justification',
    description: 'AI-explained tier decision with the policy signals, override history, and reviewer sign-offs.',
  },
  {
    id: 'audit-trail',
    title: 'Audit Trail',
    description: 'Chronological log of every workflow step, document received, and reviewer action for this vendor.',
  },
];

export default function ReportsTab() {
  const { state, generateReport, openReportViewer, closeReportViewer } = useWorkflow();
  const reportReady =
    state.workflowPhase === 'report_pending' ||
    state.workflowPhase === 'monitoring_active';
  const viewerOpen = state.reportViewerOpen;

  if (!reportReady) {
    return (
      <div className={styles.body}>
        <div className={styles.lockedEmpty}>
          <div className={styles.lockedEmptyIcon}>
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
              <rect x="6" y="12" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 12V9a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.lockedEmptyTitle}>Reports will appear after the assessment is complete</div>
          <div className={styles.lockedEmptyBody}>
            Complete the vendor onboarding workflow — profile setup, tier acceptance, document collection, and assessments — to generate the vendor risk report.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>
          Generate compliance and risk reports for Acme Cloud Co.
        </p>
      </div>

      <div className={styles.grid}>
        {REPORTS.map(r => (
          <div
            key={r.id}
            className={`${styles.card} ${r.primary ? styles.cardPrimary : ''}`}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                <path d="M5 2.5h6l3 3v10h-9v-13z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M11 2.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M7 9h4M7 11.5h4M7 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{r.title}</div>
              <div className={styles.cardDesc}>{r.description}</div>
            </div>
            <button
              className={`${styles.generateBtn} ${r.primary ? styles.generateBtnPrimary : ''}`}
              onClick={r.primary ? () => {
                // First generation flips the workflow into monitoring_active
                // and kicks off the Monitoring substep sim. Reopens after
                // that point only need to surface the viewer.
                if (state.workflowPhase === 'report_pending') generateReport();
                openReportViewer();
              } : undefined}
            >
              {r.primary ? 'Generate Report' : 'Generate'}
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footnote}>
        Report templates are managed in <a className={styles.footnoteLink}>Settings → Report templates</a>. Generated reports are auto-attached to the vendor record and shared with reviewers per policy.
      </div>

      {viewerOpen && <ExecutiveSummaryViewer onClose={closeReportViewer} />}
    </div>
  );
}
