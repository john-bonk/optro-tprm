import { useEffect, useMemo, useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import { ASSESSMENTS, REVIEWERS, TOTAL_GAPS } from '../../../data/assessments';
import styles from './SendForReviewPanel.module.css';
import gapsStyles from './SendGapsPanel.module.css';

const AI_DRAFT_INTRO = `Hi team — Acme Cloud Co.'s assessment package is ready for sign-off. AI drafted answers from 6 collected documents, the 8 vendor gaps closed yesterday, and every answer has been accepted internally. The link below opens the certify view with all three questionnaires, the residual-risk scorecard, and the suggested verdict. Sign-off SLA: 48 hours.`;

export default function SendForReviewPanel() {
  const { state, closeSendForReviewPanel, sendForReview } = useWorkflow();
  const [selectedReviewers, setSelectedReviewers] = useState<Set<string>>(
    new Set(REVIEWERS.map(r => r.initials))
  );
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(
    new Set(ASSESSMENTS.map(a => a.id))
  );
  const [subject, setSubject] = useState('Acme Cloud Co. · assessment package ready for sign-off');
  const [intro, setIntro] = useState(AI_DRAFT_INTRO);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSendForReviewPanel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeSendForReviewPanel]);

  const totalQuestions = useMemo(() => {
    let total = 0;
    ASSESSMENTS.forEach(def => {
      if (selectedAssessments.has(def.id)) total += def.totalQuestions;
    });
    return total;
  }, [selectedAssessments]);

  const toggleReviewer = (initials: string) => {
    setSelectedReviewers(prev => {
      const next = new Set(prev);
      if (next.has(initials)) next.delete(initials); else next.add(initials);
      return next;
    });
  };

  const toggleAssessment = (id: string) => {
    setSelectedAssessments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllAssessments  = () => setSelectedAssessments(new Set(ASSESSMENTS.map(a => a.id)));
  const clearAllAssessments   = () => setSelectedAssessments(new Set());

  if (!state.sendForReviewPanelOpen) return null;

  const disabled = selectedReviewers.size === 0 || selectedAssessments.size === 0;

  return (
    <>
      <div className={gapsStyles.scrim} onClick={closeSendForReviewPanel} />
      <aside className={gapsStyles.panel} role="dialog" aria-labelledby="send-review-title">
        <div className={gapsStyles.header}>
          <div className={`${gapsStyles.headerIcon} ${styles.headerIconReview}`}>
            <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
              <path d="M3.5 5.5l4.5 4.5 7-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.5 9v5.5h-11V4h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={gapsStyles.headerText}>
            <div className={gapsStyles.headerTitle} id="send-review-title">Send for reviewer sign-off</div>
            <div className={gapsStyles.headerSub}>
              <span className={gapsStyles.aiPreparedPill}>AI-PREPARED</span>
              <span className={gapsStyles.headerMeta}>
                {selectedReviewers.size} reviewers · {selectedAssessments.size} questionnaires · {totalQuestions} questions · Acme Cloud Co.
              </span>
            </div>
          </div>
          <button className={gapsStyles.closeBtn} onClick={closeSendForReviewPanel} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={gapsStyles.body}>
          <div className={gapsStyles.field}>
            <div className={gapsStyles.fieldLabelRow}>
              <label className={gapsStyles.fieldLabel}>
                REVIEWERS ({selectedReviewers.size} SELECTED)
              </label>
              <span className={gapsStyles.aiDraftMeta}>
                <span className={gapsStyles.captionIndigo}>AI suggested</span> · per Tier 2 routing rules
              </span>
            </div>
            <div className={styles.reviewerList}>
              {REVIEWERS.map(r => {
                const checked = selectedReviewers.has(r.initials);
                return (
                  <label key={r.initials} className={styles.reviewerRow}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleReviewer(r.initials)}
                      className={gapsStyles.qCheckbox}
                    />
                    <span className={styles.reviewerAvatar} style={{ background: r.color }}>
                      {r.initials}
                    </span>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerName}>{r.name}</div>
                      <div className={styles.reviewerMeta}>
                        <span>{r.role}</span>
                        <span className={styles.reviewerSep}>·</span>
                        <span className={styles.reviewerEmail}>{r.email}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={gapsStyles.field}>
            <label className={gapsStyles.fieldLabel}>SUBJECT</label>
            <input
              className={gapsStyles.inputEditable}
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className={gapsStyles.field}>
            <div className={gapsStyles.fieldLabelRow}>
              <label className={gapsStyles.fieldLabel}>INTRO MESSAGE</label>
              <span className={gapsStyles.aiDraftMeta}>
                <span className={gapsStyles.captionIndigo}>AI draft</span> · editable
              </span>
            </div>
            <textarea
              className={gapsStyles.textarea}
              value={intro}
              onChange={e => setIntro(e.target.value)}
              rows={5}
            />
          </div>

          <div className={gapsStyles.field}>
            <div className={gapsStyles.fieldLabelRow}>
              <label className={gapsStyles.fieldLabel}>
                QUESTIONNAIRES TO CERTIFY ({selectedAssessments.size} SELECTED)
              </label>
              <span className={gapsStyles.selectAllRow}>
                <button className={gapsStyles.selectAllLink} onClick={selectAllAssessments}>Select all</button>
                <button className={gapsStyles.selectAllLink} onClick={clearAllAssessments}>Clear</button>
              </span>
            </div>

            <div className={gapsStyles.qList}>
              {ASSESSMENTS.map(def => {
                const checked = selectedAssessments.has(def.id);
                return (
                  <label key={def.id} className={gapsStyles.qRow}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssessment(def.id)}
                      className={gapsStyles.qCheckbox}
                    />
                    <span className={gapsStyles.qName}>{def.name}</span>
                    <span className={styles.questionnairePill}>{def.totalQuestions} accepted</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.packageCard}>
            <div className={styles.packageCardIcon}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M2 4.5L8 1l6 3.5v7L8 15l-6-3.5v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 4.5L8 8l6-3.5M8 8v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.packageCardText}>
              <div className={styles.packageCardTitle}>Certify view · single sign-off link</div>
              <div className={styles.packageCardMeta}>
                {totalQuestions} accepted answers · {TOTAL_GAPS} closed gaps · residual scorecard + suggested verdict
              </div>
            </div>
            <a
              className={styles.previewLink}
              href={`${import.meta.env.BASE_URL}reviewer-preview`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                <path d="M3 9l6-6M5 3h4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className={styles.reminderBanner}>
            <div className={styles.reminderIcon}>
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M7 4.5V7l1.8 1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.reminderText}>
              Auto-reminders at <strong>24, 36, 48 hours</strong> if any reviewer is outstanding. Approvals are sequential — Sarah first, then James, then Maya.
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeSendForReviewPanel}>Cancel</button>
          <button
            className={styles.sendBtn}
            onClick={sendForReview}
            disabled={disabled}
          >
            Send to  {selectedReviewers.size}  reviewers
          </button>
        </div>
      </aside>
    </>
  );
}
