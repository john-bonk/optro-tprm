import { useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import styles from '../assessments/assessments.module.css';

export default function AssessmentsTab() {
  const { state } = useWorkflow();
  if (state.workflowPhase !== 'assessments_started') {
    return <NotStartedView />;
  }
  return <InProgressView />;
}

function NotStartedView() {
  return (
    <div className={styles.body}>
      <div className={styles.assessIntro}>
        <div className={styles.assessIntroBody}>
          <strong>3 assessments queued for Tier 2</strong> — AI will draft answers from the 6 collected documents once you start.
        </div>
      </div>
      <div className={styles.questionnaireList}>
        <QuestionnaireCard
          title="SIG Lite — Standard Information Gathering"
          neutral="123 questions"
          required="Required for Tier 2"
          description="Industry-standard security questionnaire"
        />
        <QuestionnaireCard
          title="CSA CAIQ — Cloud Security Alliance"
          neutral="261 questions"
          required="Required for SaaS vendors"
          description="Cloud-control assessment"
        />
        <QuestionnaireCard
          title="Internal — Optro security baseline"
          neutral="42 questions"
          required="Custom for Optro"
          description="Optro-specific risk questions"
        />
      </div>
    </div>
  );
}

interface QuestionnaireCardProps {
  title: string;
  neutral: string;
  required: string;
  description: string;
}

function QuestionnaireCard({ title, neutral, required, description }: QuestionnaireCardProps) {
  return (
    <div className={styles.questionnaireCard}>
      <div className={styles.qCheckbox} />
      <div className={styles.qContent}>
        <div className={styles.qTitle}>{title}</div>
        <div className={styles.qMeta}>
          <span className={styles.qTagNeutral}>{neutral}</span>
          <span className={styles.qTagRequired}>{required}</span>
          <span className={styles.qDescription}>{description}</span>
        </div>
      </div>
    </div>
  );
}

function InProgressView() {
  return (
    <div className={styles.body}>
      <div className={styles.assessIntro}>
        <div className={styles.assessIntroBody}>
          <strong>AI agent answered 390 of 426 questions</strong> across 3 questionnaires from 4 collected documents. <strong>36 gaps</strong> need vendor input — review answers and resolve gaps below.
        </div>
      </div>

      <div className={styles.progressRow}>
        <span className={styles.progressText}><strong>390 / 426</strong> answered (92%)</span>
        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '92%' }} /></div>
        <button className={styles.objActionBtn}>Send 36 gaps to vendor</button>
        <button className={`${styles.objActionBtn} ${styles.objActionBtnPrimary}`}>Approve all 390 AI answers</button>
      </div>

      <div className={styles.questionnaireList}>
        <SigLiteDetailCard />
        <DetailCard title="CSA CAIQ — Cloud Security Alliance" answered="240 / 261" gaps="21" conf="89%" width="92%" />
        <DetailCard title="Internal — Optro security baseline" answered="40 / 42" gaps="2" conf="95%" width="95%" />
      </div>
    </div>
  );
}

interface DetailCardProps {
  title: string;
  answered: string;
  gaps: string;
  conf: string;
  width: string;
}

function DetailCard({ title, answered, gaps, conf, width }: DetailCardProps) {
  return (
    <div className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.qCheckbox} />
        <div className={styles.detailContent}>
          <div className={styles.detailTitle}>{title}</div>
          <div className={styles.detailStats}>
            <span><strong>{answered}</strong> answered</span>
            <span className={styles.statSep}>·</span>
            <span><strong>{gaps} gaps</strong> <span className={styles.needVendor}>need vendor</span></span>
            <span className={styles.statSep}>·</span>
            <span>avg <strong>{conf}</strong> confidence</span>
          </div>
          <div className={styles.detailBar}><div className={styles.detailFill} style={{ width }} /></div>
        </div>
        <button className={`${styles.objActionBtn} ${styles.detailOpen}`}>
          Open
          <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SigLiteDetailCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`${styles.detailCard} ${expanded ? styles.detailCardExpanded : ''}`}>
      <div className={styles.detailHeader}>
        <div className={styles.qCheckbox} />
        <div className={styles.detailContent}>
          <div className={styles.detailTitle}>SIG Lite — Standard Information Gathering</div>
          <div className={styles.detailStats}>
            <span><strong>110 / 123</strong> answered</span>
            <span className={styles.statSep}>·</span>
            <span><strong>13 gaps</strong> <span className={styles.needVendor}>need vendor</span></span>
            <span className={styles.statSep}>·</span>
            <span>avg <strong>92%</strong> confidence</span>
          </div>
          <div className={styles.detailBar}><div className={styles.detailFill} style={{ width: '89%' }} /></div>
        </div>
        <button className={`${styles.objActionBtn} ${styles.detailOpen}`} onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Close' : 'Open'}
          <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
            {expanded
              ? <path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </button>
      </div>
      {expanded && (
        <div className={styles.detailBody}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Access Controls</div>
            <AnsweredQuestion
              num="Q1"
              text="Do you require multi-factor authentication for all administrative access?"
              answer="Yes — MFA is enforced for all admin and engineering personnel via Okta SSO. TOTP and WebAuthn supported."
              conf="96%"
              doc="Information Security Policy.pdf"
            />
            <AnsweredQuestion
              num="Q2"
              text="How often are user access reviews performed?"
              answer="Quarterly access reviews for all production systems. Terminations trigger same-day deprovisioning."
              conf="91%"
              doc="SOC 2 Type II Report.pdf"
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Vendor Risk Management</div>
            <AnsweredQuestion
              num="Q14"
              text="Do you maintain a vendor inventory with risk classifications?"
              answer="Yes — all subprocessors are tracked in Vanta with quarterly tier reviews."
              conf="94%"
              doc="Information Security Policy.pdf"
            />
            <GapQuestion
              num="Q42"
              text="What is your sub-processor change notification SLA to customers?"
              warning="Not found in collected documents."
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Business Continuity</div>
            <GapQuestion
              num="Q88"
              text="When was your last full BCP/DR tabletop exercise?"
              warning="Document not collected (Business Continuity Plan)."
            />
          </div>

          <div className={styles.detailFooter}>
            Showing 5 of 123 questions · <a className={styles.detailFooterLink}>View all</a>
          </div>
        </div>
      )}
    </div>
  );
}

interface AnsweredProps {
  num: string;
  text: string;
  answer: string;
  conf: string;
  doc: string;
}

function AnsweredQuestion({ num, text, answer, conf, doc }: AnsweredProps) {
  return (
    <div className={styles.question}>
      <div className={styles.qNum}>{num}</div>
      <div className={styles.qBody}>
        <div className={styles.qText}>{text}</div>
        <div className={styles.qAnswer}>{answer}</div>
        <div className={styles.qSource}>
          <span className={styles.sourcePrefix}>AI · {conf}</span> · from <em className={styles.sourceDoc}>{doc}</em>
        </div>
        <div className={styles.qActions}>
          <button className={styles.rowAction}>Approve</button>
          <button className={styles.rowAction}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function GapQuestion({ num, text, warning }: { num: string; text: string; warning: string }) {
  return (
    <div className={`${styles.question} ${styles.gap}`}>
      <div className={styles.qNum}>{num}</div>
      <div className={styles.qBody}>
        <div className={styles.qText}>{text}</div>
        <div className={styles.gapWarning}>
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
            <path d="M6 1.5l5 8.5h-10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M6 5v2.5M6 8.7h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {warning}
        </div>
        <div className={styles.qActions}>
          <button className={styles.rowAction}>Answer manually</button>
          <button className={styles.rowAction}>Ask vendor</button>
        </div>
      </div>
    </div>
  );
}
