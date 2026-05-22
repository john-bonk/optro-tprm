import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PortalPage.module.css';

type PortalState = 'initial' | 'progress' | 'complete';

export default function PortalPage() {
  const navigate = useNavigate();
  const [portalState, setPortalState] = useState<PortalState>('initial');

  const onBack = () => {
    window.location.href = `${import.meta.env.BASE_URL}vendors/acme`;
  };

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.protoBadge}>PROTOTYPE</span>
          <button className={styles.backLink} onClick={onBack}>← Back to Buyer view (Optro)</button>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.vendorAsLabel}>VENDOR AS:</span>
          <button className={`${styles.vendorAsPill} ${styles.vendorAsActive}`}>Doc upload</button>
          <button className={styles.vendorAsPill} onClick={() => navigate('/portal/gaps')}>Q&amp;A gaps</button>
        </div>
      </header>

      {/* Brand bar */}
      <div className={styles.brandBar}>
        <div className={styles.brandLeft}>
          <div className={styles.brandLogo}>G</div>
          <div className={styles.brandName}>Globex Inc</div>
        </div>
        <div className={styles.brandRight}>
          powered by <span className={styles.optro}>Optro</span>
        </div>
      </div>

      {/* Preview banner */}
      <div className={styles.previewBanner}>
        <div className={styles.previewBannerLeft}>
          <span className={styles.bolt}>⚡</span>
          <span className={styles.previewLabel}>PROTOTYPE PREVIEW · VENDOR-FACING PAGE</span>
        </div>
        <div className={styles.previewBannerRight}>
          {(['initial', 'progress', 'complete'] as PortalState[]).map(s => (
            <button
              key={s}
              className={`${styles.statePill} ${portalState === s ? styles.statePillActive : ''}`}
              onClick={() => setPortalState(s)}
            >
              {s === 'initial' ? 'Initial' : s === 'progress' ? 'In progress' : 'Complete'}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.mainGrid}>
          <div className={styles.mainContent}>
            <div className={styles.requestFrom}>
              Request from <strong>Globex Inc</strong>
            </div>
            <h1 className={styles.title}>Acme Corp · security review documents</h1>
            <p className={styles.intro}>
              Globex Inc has requested the documents below for your security review. Uploads are secure and you don&rsquo;t have to do everything in one session.
            </p>

            <DocumentsRequestedCard state={portalState} />

            <div className={styles.expiresNote}>
              Link expires <strong>14 days</strong> from when it was sent. Forward the email if a colleague needs to help.
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarLabel}>REQUEST DETAILS</div>
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSubLabel}>Requested by</div>
                <div className={styles.sidebarValue}>Sarah Chen</div>
                <div className={styles.sidebarMeta}>sarah.chen@globex.com</div>
              </div>
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSubLabel}>For vendor</div>
                <div className={styles.sidebarValue}>Acme Corp</div>
              </div>
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSubLabel}>Link expires</div>
                <div className={styles.sidebarValue}>May 20, 2026 · 14 days left</div>
              </div>
            </div>
          </aside>
        </div>

        <footer className={styles.footer}>
          Powered by <span className={styles.optro}>Optro</span>
        </footer>
      </main>
    </div>
  );
}

function DocumentsRequestedCard({ state }: { state: PortalState }) {
  const totals = state === 'initial' ? { resolved: 0, pct: 0 }
              : state === 'progress' ? { resolved: 1, pct: 50 }
              : { resolved: 2, pct: 100 };
  return (
    <div className={styles.docsCard}>
      <div className={styles.docsHeader}>
        <div className={styles.docsHeaderIcon} />
        <div className={styles.docsHeaderText}>
          <div className={styles.docsHeaderTitle}>Documents requested</div>
          <div className={styles.docsHeaderSub}>Drop files in or pick from your computer · PDF, DOCX accepted</div>
        </div>
        <div className={styles.docsProgress}>
          <div className={styles.docsProgressLabel}>
            <span>{totals.resolved} of 2 resolved</span>
            <span>{totals.pct}%</span>
          </div>
          <div className={styles.docsProgressBar}>
            <div className={styles.docsProgressFill} style={{ width: `${totals.pct}%` }} />
          </div>
        </div>
      </div>

      <DocRequestRow
        title="Penetration Test Summary"
        desc="Most recent annual or bi-annual report · PDF preferred"
        resolved={state !== 'initial'}
      />
      <DocRequestRow
        title="Business Continuity Plan"
        desc="Or DR / resilience documentation · PDF, DOCX"
        resolved={state === 'complete'}
      />
    </div>
  );
}

interface RowProps {
  title: string;
  desc: string;
  resolved: boolean;
}

function DocRequestRow({ title, desc, resolved }: RowProps) {
  return (
    <div className={styles.docRow}>
      <div className={`${styles.docCircle} ${resolved ? styles.docCircleDone : ''}`}>
        {resolved && (
          <svg viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className={styles.docRowText}>
        <div className={styles.docRowTitle}>{title}</div>
        <div className={styles.docRowDesc}>{desc}</div>
      </div>
      <div className={styles.docRowActions}>
        <button className={styles.dontHaveBtn}>I don&rsquo;t have this</button>
        <button className={styles.uploadBtn}>
          <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
            <path d="M7 10V3M4 6l3-3 3 3M3 11.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload file
        </button>
      </div>
    </div>
  );
}
