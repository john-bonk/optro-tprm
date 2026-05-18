import { useEffect, useMemo, useState } from 'react';
import { useWorkflow } from '../../../state/WorkflowContext';
import { ASSESSMENTS, IN_PROGRESS_STATE } from '../../../data/assessments';
import styles from './SendGapsPanel.module.css';

const PORTAL_URL = '/portal/gaps';
const AI_DRAFT_INTRO = `Hi Acme team — we drafted answers for most of our security review from the docs you shared. A handful of questions still need your input. The link below opens a focused page (~10 min, expires in 14 days). Answers come straight back to us — no login required.`;

export default function SendGapsPanel() {
  const { state, closeSendGapsPanel, sendGaps } = useWorkflow();
  const [selected, setSelected] = useState<Set<string>>(new Set(ASSESSMENTS.map(a => a.id)));
  const [subject, setSubject] = useState('A few questions to finish your AuditBoard security review');
  const [intro, setIntro] = useState(AI_DRAFT_INTRO);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSendGapsPanel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeSendGapsPanel]);

  const selectedGaps = useMemo(() => {
    let total = 0;
    ASSESSMENTS.forEach(def => {
      if (selected.has(def.id)) total += IN_PROGRESS_STATE[def.id].gapCount;
    });
    return total;
  }, [selected]);

  const totalGaps = useMemo(
    () => ASSESSMENTS.reduce((s, def) => s + IN_PROGRESS_STATE[def.id].gapCount, 0),
    []
  );

  const toggleQ = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ASSESSMENTS.map(a => a.id)));
  const clearAll = () => setSelected(new Set());

  if (!state.sendGapsPanelOpen) return null;

  return (
    <>
      <div className={styles.scrim} onClick={closeSendGapsPanel} />
      <aside className={styles.panel} role="dialog" aria-labelledby="send-gaps-title">
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
              <path d="M7.5 10.5l3-3M7 11l-1.5 1.5a2.5 2.5 0 1 1-3.5-3.5L3.5 7.5M10.5 7l1.5-1.5a2.5 2.5 0 1 1 3.5 3.5L14 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitle} id="send-gaps-title">Send gaps to Acme</div>
            <div className={styles.headerSub}>
              <span className={styles.aiPreparedPill}>AI-PREPARED</span>
              <span className={styles.headerMeta}>
                {totalGaps} questions across {ASSESSMENTS.length} questionnaires · Acme Corp
              </span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={closeSendGapsPanel} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>TO</label>
            <div className={styles.input}>security@acmecorp.com</div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>SUBJECT</label>
            <input
              className={styles.inputEditable}
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>INTRO MESSAGE</label>
              <span className={styles.aiDraftMeta}>
                <span className={styles.captionIndigo}>AI draft</span> · editable
              </span>
            </div>
            <textarea
              className={styles.textarea}
              value={intro}
              onChange={e => setIntro(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>
                QUESTIONS TO SEND ({selectedGaps} SELECTED)
              </label>
              <span className={styles.selectAllRow}>
                <button className={styles.selectAllLink} onClick={selectAll}>Select all</button>
                <button className={styles.selectAllLink} onClick={clearAll}>Clear</button>
              </span>
            </div>

            <div className={styles.qList}>
              {ASSESSMENTS.map(def => {
                const checked = selected.has(def.id);
                const gaps = IN_PROGRESS_STATE[def.id].gapCount;
                return (
                  <label key={def.id} className={styles.qRow}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleQ(def.id)}
                      className={styles.qCheckbox}
                    />
                    <span className={styles.qName}>{def.name}</span>
                    <span className={styles.qGapsPill}>{gaps} of {gaps} gaps</span>
                  </label>
                );
              })}
            </div>

            <div className={styles.selectedCounter}>
              {selected.size} of {ASSESSMENTS.length} selected
            </div>
          </div>

          <div className={styles.linkCard}>
            <div className={styles.linkCardIcon}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M6.5 9.5l3-3M6 10l-1.5 1.5a2 2 0 1 1-2.8-2.8L3.2 7.2M9.5 6.2l1.5-1.5a2 2 0 1 1 2.8 2.8L12.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.linkCardText}>
              <div className={styles.linkCardTitle}>Magic link · one focused form</div>
              <div className={styles.linkCardMeta}>
                {selectedGaps} questions · expires in 14 days · auto-attached on submit
              </div>
            </div>
            <a
              className={styles.previewLink}
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview
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
              Auto-reminders at <strong>3, 7, 10 days</strong> if no response. After 10 days, escalates to you.
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeSendGapsPanel}>Cancel</button>
          <button
            className={styles.sendBtn}
            onClick={sendGaps}
            disabled={selectedGaps === 0}
          >
            Send  {selectedGaps}  gaps
          </button>
        </div>
      </aside>
    </>
  );
}
