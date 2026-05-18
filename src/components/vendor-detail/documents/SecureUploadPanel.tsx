import { useEffect } from 'react';
import styles from './SecureUploadPanel.module.css';

interface Props {
  onClose: () => void;
  onSend: () => void;
}

const PORTAL_URL = '/portal/upload';

export default function SecureUploadPanel({ onClose, onSend }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <aside className={styles.panel} role="dialog" aria-labelledby="upload-panel-title">
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
              <path d="M7.5 10.5l3-3M7 11l-1.5 1.5a2.5 2.5 0 1 1-3.5-3.5L3.5 7.5M10.5 7l1.5-1.5a2.5 2.5 0 1 1 3.5 3.5L14 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitle} id="upload-panel-title">Send secure upload link</div>
            <div className={styles.headerSub}>
              <span className={styles.aiPreparedPill}>AI-PREPARED</span>
              <span className={styles.headerMeta}>2 missing documents · Acme Corp</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
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
            <label className={styles.fieldLabel}>CC</label>
            <div className={styles.input}>
              <span className={styles.inputValue}>jorge.rivera@optro-customer.com (Business Owner)</span>
              <span className={styles.policyPill}>POLICY: ALWAYS CC</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>SUBJECT</label>
            <div className={styles.input}>Document request — Acme Corp security review</div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>MESSAGE</label>
              <button className={styles.editMessageBtn}>
                <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                  <path d="M2 11.5l1-3 6-6 2 2-6 6-3 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Edit message
              </button>
            </div>
            <div className={styles.messageBox}>
              <p>Hi Acme team,</p>
              <p>We&rsquo;re getting your security review started and need two more documents to complete it:</p>
              <ul>
                <li>Penetration Test Summary</li>
                <li>Business Continuity Plan</li>
              </ul>
              <p>The button below opens a secure upload page &mdash; no login required, expires in 14 days. We&rsquo;ll auto-attach what you share to your vendor record.</p>
              <p>Thanks,<br />Sarah</p>
              <div className={styles.messageDivider} />
              <div className={styles.messageCaption}>
                <span className={styles.captionIndigo}>AI draft</span> · click <strong>Edit message</strong> <span className={styles.captionIndigo}>to change</span>
              </div>
            </div>
          </div>

          <div className={styles.uploadCard}>
            <div className={styles.uploadCardIcon}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M6.5 9.5l3-3M6 10l-1.5 1.5a2 2 0 1 1-2.8-2.8L3.2 7.2M9.5 6.2l1.5-1.5a2 2 0 1 1 2.8 2.8L12.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.uploadCardText}>
              <div className={styles.uploadCardTitle}>Secure upload link</div>
              <div className={styles.uploadCardMeta}>2 docs requested · expires in 14 days · auto-attached on upload</div>
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
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.sendBtn} onClick={onSend}>Send</button>
        </div>
      </aside>
    </>
  );
}
