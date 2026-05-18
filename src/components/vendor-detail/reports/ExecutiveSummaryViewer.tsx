import { useEffect, useState } from 'react';
import styles from './exec-summary.module.css';

interface Props {
  onClose: () => void;
}

const TODAY_LONG = 'May 18, 2026';

export default function ExecutiveSummaryViewer({ onClose }: Props) {
  const [entered, setEntered] = useState(false);

  // Fade/scale-in on mount.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Esc-to-close.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={`${styles.overlay} ${entered ? styles.overlayEntered : ''}`} role="dialog" aria-modal="true" aria-label="Executive summary report">
      <div className={styles.viewerChrome}>
        <div className={styles.chromeLeft}>
          <div className={styles.chromeDoc}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M4 1.5h5l3 3v8h-8v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M9 1.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.chromeTitleCol}>
            <div className={styles.chromeTitle}>Vendor Risk Report · Acme Cloud Co.</div>
            <div className={styles.chromeMeta}>Generated {TODAY_LONG} · Optro TPRM · 28 pages</div>
          </div>
        </div>
        <div className={styles.chromeRight}>
          <button className={styles.chromeBtn} title="Download PDF (demo)">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M7 2v8m0 0L4 7m3 3l3-3M2 11v.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PDF
          </button>
          <button className={styles.chromeBtn} title="Share with reviewers (demo)">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <circle cx="3" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="11" cy="3" r="1.6" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="11" cy="11" r="1.6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4.5 6.4l5 -2.8M4.5 7.6l5 2.8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Share
          </button>
          <button className={styles.chromeClose} onClick={onClose} aria-label="Close report">
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.scroll}>
        <article className={styles.page}>
          <CoverHeader />
          <SectionExecSummary />
          <SectionDispositionBox />
          <SectionTier />
          <SectionIntelligence />
          <SectionDocuments />
          <SectionAssessments />
          <SectionFindings />
          <SectionReviewers />
          <SectionRecommendations />
          <SectionAppendix />
          <Footer />
        </article>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────

function CoverHeader() {
  return (
    <header className={styles.cover}>
      <div className={styles.coverRibbon}>
        <span className={styles.coverRibbonMono}>OPTRO TPRM · VENDOR RISK REPORT</span>
        <span className={styles.coverRibbonSep}>·</span>
        <span className={styles.coverRibbonMono}>CONFIDENTIAL</span>
      </div>
      <h1 className={styles.coverTitle}>Acme Cloud Co.</h1>
      <div className={styles.coverSubtitle}>
        Comprehensive vendor risk assessment · onboarding cycle · committee review draft
      </div>
      <div className={styles.coverFacts}>
        <Fact label="Vendor UID"        value="VEN-2026-042" />
        <Fact label="Tier"              value="Tier 2 — Standard" />
        <Fact label="Composite Score"   value="74 / 100" />
        <Fact label="Report Generated"  value={TODAY_LONG} />
        <Fact label="Assessment Cycle"  value="Onboarding · 2026 Q2" />
        <Fact label="Disposition"       value="Approve with Conditions" />
      </div>
    </header>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <div className={styles.factLabel}>{label}</div>
      <div className={styles.factValue}>{value}</div>
    </div>
  );
}

function SectionExecSummary() {
  return (
    <section className={styles.section}>
      <SectionHead num="1" label="EXECUTIVE SUMMARY" />
      <p className={styles.lede}>
        Acme Cloud Co. has completed the Optro TPRM onboarding workflow as a <strong>Tier 2 — Standard</strong> vendor.
        The vendor was classified by AI with 87% confidence based on four policy signals — estimated spend of $48,000/yr,
        SaaS category triggering §4.1 questionnaire requirements, no PII in scope, and no prior assessment history. The
        classification was confirmed by Akarsh Kaur on May 17, 2026.
      </p>
      <p className={styles.body}>
        Across the assessment cycle, the AI agent drafted answers to all <strong>172 questions</strong> across three questionnaires
        (SIG Lite v2.1, CSA CAIQ Lite, and Optro&rsquo;s Internal Risk Questionnaire), sourcing evidence from six collected
        documents — SOC 2 Type II, ISO 27001 certificate, BCP/DR policy, InfoSec policy, sub-processor list, and Acme&rsquo;s
        most recent penetration test attestation. An initial <strong>8 gaps</strong> required vendor input (sub-processor SLAs,
        BCP/DR exercise specifics, and incident-notification timelines); the vendor closed all gaps within 28 hours of
        the request. Following gap closure, the TPRM team accepted every drafted answer — singly and in bulk — and
        routed the package to three reviewers who signed off in sequence.
      </p>
      <p className={styles.body}>
        Outside-in signals corroborate the questionnaire posture. BitSight reports a 690 (intermediate) security rating
        with no significant deltas in the last 90 days; no breach disclosures have been published against Acme in the
        last 24 months. Two minor controls findings were flagged for monitoring but do not block approval at the
        Tier 2 threshold. <strong>Recommendation: Approve with Conditions</strong>, with monitoring set to the standard
        Tier 2 quarterly cadence and a contractual addendum covering sub-processor notification timing.
      </p>
    </section>
  );
}

function SectionDispositionBox() {
  return (
    <section className={styles.dispositionBox}>
      <div className={styles.dispositionLabel}>RECOMMENDED DISPOSITION</div>
      <div className={styles.dispositionValue}>Approve with Conditions</div>
      <div className={styles.dispositionGrid}>
        <DispositionItem label="Composite risk" value="74 / 100" tone="amber" />
        <DispositionItem label="Tier"            value="Tier 2 — Standard" tone="amber" />
        <DispositionItem label="Open findings"   value="2 minor · monitor" tone="amber" />
        <DispositionItem label="Reviewer sign-off" value="3 of 3 approved" tone="green" />
        <DispositionItem label="Contract addendum" value="Sub-processor notice" tone="sky" />
        <DispositionItem label="Next review"     value="Aug 18, 2026" tone="neutral" />
      </div>
    </section>
  );
}

function DispositionItem({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'green' | 'sky' | 'neutral' }) {
  const cls =
    tone === 'amber' ? styles.dispAmber :
    tone === 'green' ? styles.dispGreen :
    tone === 'sky'   ? styles.dispSky   : styles.dispNeutral;
  return (
    <div className={`${styles.dispItem} ${cls}`}>
      <div className={styles.dispItemLabel}>{label}</div>
      <div className={styles.dispItemValue}>{value}</div>
    </div>
  );
}

function SectionTier() {
  return (
    <section className={styles.section}>
      <SectionHead num="2" label="TIER CLASSIFICATION" />
      <div className={styles.twoCol}>
        <div>
          <p className={styles.body}>
            Acme was classified as <strong>Tier 2 — Standard</strong> by the AI tier-classification agent on May 17, 2026
            at 09:16 PT, with a stated confidence of 87% based on four observed signals. The classification was
            reviewed and accepted by the TPRM team within 60 seconds of suggestion — no override applied.
          </p>
          <p className={styles.body}>
            Tier 2 designates vendors with material spend or category exposure but no Restricted/PII data handling.
            Per Optro&rsquo;s tiering policy, Tier 2 vendors require SIG Lite questionnaire coverage, CSA CAIQ cloud
            baseline, and Optro&rsquo;s internal risk questionnaire — all of which were administered.
          </p>
        </div>
        <div className={styles.signalCard}>
          <div className={styles.signalCardLabel}>POLICY SIGNALS</div>
          <SignalRow tag="Zip"  text="Est. spend $48,000/yr — exceeds Tier 3 threshold ($25K); below Tier 1 ($100K)" />
          <SignalRow tag="Zip"  text="Category: SaaS — requires security questionnaire per policy §4.1" />
          <SignalRow tag="AI"   text="No PII handling indicated — if PII present, would escalate to Tier 1" />
          <SignalRow tag="AI"   text="New vendor, no prior assessment history — conservative classification" />
        </div>
      </div>
    </section>
  );
}

function SignalRow({ tag, text }: { tag: string; text: string }) {
  return (
    <div className={styles.signalRow}>
      <span className={styles.signalTag}>{tag}</span>
      <span>{text}</span>
    </div>
  );
}

function SectionIntelligence() {
  return (
    <section className={styles.section}>
      <SectionHead num="3" label="OUTSIDE-IN INTELLIGENCE" />
      <p className={styles.body}>
        External signals provide an independent corroboration of the vendor&rsquo;s self-attested posture. Acme&rsquo;s
        BitSight rating sits at <strong>690 (Intermediate)</strong>, stable over the trailing 90-day window. No
        regulatory enforcement actions, public breach disclosures, or critical CVE exposures have been associated with
        Acme&rsquo;s known infrastructure in the trailing 24 months.
      </p>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Signal</th>
            <th>Source</th>
            <th>Value</th>
            <th>Trend (90d)</th>
            <th>Threshold</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Composite security rating</td>     <td>BitSight</td>           <td>690 (Intermediate)</td>      <td>Stable</td>            <td>≥ 640 for Tier 2</td></tr>
          <tr><td>SSL/TLS configuration</td>          <td>BitSight</td>           <td>Good</td>                     <td>Stable</td>            <td>Good or better</td></tr>
          <tr><td>Patching cadence</td>               <td>BitSight</td>           <td>Fair</td>                     <td>+1 grade</td>          <td>Fair or better</td></tr>
          <tr><td>Public breach disclosures (24m)</td><td>HaveIBeenPwned · NVD</td><td>0</td>                       <td>—</td>                 <td>= 0</td></tr>
          <tr><td>Regulatory actions (24m)</td>       <td>SEC EDGAR · FTC</td>    <td>0</td>                       <td>—</td>                 <td>= 0</td></tr>
          <tr><td>Critical CVE exposure</td>          <td>NVD · Shodan</td>       <td>1 medium · patched</td>      <td>Resolved</td>          <td>0 unpatched critical</td></tr>
          <tr><td>Subsidiary risk drag</td>           <td>D&amp;B · OFAC</td>     <td>None</td>                    <td>—</td>                 <td>None flagged</td></tr>
        </tbody>
      </table>
      <p className={styles.note}>
        <strong>Note:</strong> the medium-severity CVE reflected affected a third-party logging library; Acme&rsquo;s
        public CVE remediation log shows the patch deployed on April 30, 2026 — verified independently via the
        vendor&rsquo;s status page archive.
      </p>
    </section>
  );
}

function SectionDocuments() {
  return (
    <section className={styles.section}>
      <SectionHead num="4" label="DOCUMENT COLLECTION" />
      <p className={styles.body}>
        Six documents were collected via the vendor secure-upload portal between May 14 and May 16, 2026. All
        documents were AI-validated for authenticity (signatures, certificate-authority chain, issuer metadata) and
        cross-referenced against Acme&rsquo;s public trust portal.
      </p>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Issued</th>
            <th>Expires</th>
            <th>Validation</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>SOC 2 Type II report</td>     <td>Audit attestation</td>  <td>Feb 12, 2026</td> <td>Feb 12, 2027</td>  <td>Verified · Deloitte signed</td></tr>
          <tr><td>ISO 27001 certificate</td>    <td>Certification</td>      <td>Sep 30, 2025</td> <td>Sep 30, 2028</td>  <td>Verified · Schellman</td></tr>
          <tr><td>BCP/DR policy</td>            <td>Internal policy</td>    <td>Jan 04, 2026</td> <td>Annual review</td>  <td>Current</td></tr>
          <tr><td>InfoSec policy</td>           <td>Internal policy</td>    <td>Jan 04, 2026</td> <td>Annual review</td>  <td>Current</td></tr>
          <tr><td>Sub-processor list</td>       <td>Operational</td>        <td>Apr 22, 2026</td> <td>Live</td>           <td>Current · 14 sub-processors</td></tr>
          <tr><td>Pen-test attestation</td>     <td>Third-party report</td> <td>Mar 18, 2026</td> <td>Mar 18, 2027</td>  <td>Verified · Bishop Fox</td></tr>
        </tbody>
      </table>
    </section>
  );
}

function SectionAssessments() {
  return (
    <section className={styles.section}>
      <SectionHead num="5" label="ASSESSMENT RESULTS" />
      <p className={styles.body}>
        Three questionnaires were administered, totaling <strong>172 questions</strong>. The AI agent drafted answers
        from collected documents for 164 questions; the remaining 8 were marked as gaps requiring direct vendor input.
        Acme returned full responses to all 8 gaps within 28 hours, after which the TPRM team accepted all drafted
        answers — bulk-accepted by Akarsh Kaur on May 18 — and the assessment package was routed to three reviewers
        for sign-off.
      </p>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Questionnaire</th>
            <th>Questions</th>
            <th>AI Drafted</th>
            <th>Gaps</th>
            <th>Acceptance</th>
            <th>Reviewer</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>SIG Lite v2.1</td>                    <td>60</td>  <td>58</td>  <td>2 · closed</td>  <td>Bulk-accepted May 18</td>  <td>Sarah Chen ✓</td></tr>
          <tr><td>CSA CAIQ Lite</td>                    <td>84</td>  <td>81</td>  <td>3 · closed</td>  <td>Bulk-accepted May 18</td>  <td>Sarah +2 ✓</td></tr>
          <tr><td>Internal Risk Questionnaire</td>      <td>28</td>  <td>25</td>  <td>3 · closed</td>  <td>Bulk-accepted May 18</td>  <td>Sarah +3 ✓</td></tr>
          <tr className={styles.totalsRow}>
            <td><strong>Total</strong></td>
            <td><strong>172</strong></td>
            <td><strong>164</strong></td>
            <td><strong>8 · all closed</strong></td>
            <td><strong>100% accepted</strong></td>
            <td><strong>3 of 3 ✓</strong></td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function SectionFindings() {
  return (
    <section className={styles.section}>
      <SectionHead num="6" label="FINDINGS" />
      <p className={styles.body}>
        Two minor findings were surfaced during questionnaire analysis. Neither blocks Tier 2 approval; both are
        flagged for monitoring and one is addressed via the recommended contract addendum.
      </p>
      <div className={styles.findingList}>
        <Finding
          severity="minor"
          title="Sub-processor change notification SLA"
          questionRef="SIG Lite · Q42"
          body="Vendor confirmed a 30-day advance notice for sub-processor changes via email and trust portal posting. This SLA is not currently captured in the MSA — recommend a contract addendum aligning the SLA with internal policy §6.3, which requires written notification of any sub-processor change."
          owner="Sarah Chen · TPRM"
          deadline="By contract execution"
        />
        <Finding
          severity="minor"
          title="BCP/DR tabletop participation breadth"
          questionRef="Internal Risk · Q88"
          body="Last full BCP/DR tabletop ran November 12, 2025 with 28 participants across Engineering, SRE, Customer Operations, and Security. Coverage is adequate but did not include Customer Success — recommend the May 2026 exercise expand to include CS leadership for end-to-end incident escalation rehearsal. No remediation required for approval."
          owner="James Park · TPRM"
          deadline="Monitor · re-check Q3 2026"
        />
      </div>
    </section>
  );
}

function Finding({ severity, title, questionRef, body, owner, deadline }: { severity: 'minor' | 'major'; title: string; questionRef: string; body: string; owner: string; deadline: string }) {
  return (
    <div className={`${styles.finding} ${severity === 'major' ? styles.findingMajor : styles.findingMinor}`}>
      <div className={styles.findingHead}>
        <span className={styles.findingSeverityPill}>{severity.toUpperCase()}</span>
        <div className={styles.findingTitle}>{title}</div>
        <span className={styles.findingRef}>{questionRef}</span>
      </div>
      <div className={styles.findingBody}>{body}</div>
      <div className={styles.findingMeta}>
        <span><strong>Owner:</strong> {owner}</span>
        <span className={styles.findingMetaSep}>·</span>
        <span><strong>Deadline:</strong> {deadline}</span>
      </div>
    </div>
  );
}

function SectionReviewers() {
  return (
    <section className={styles.section}>
      <SectionHead num="7" label="REVIEWER SIGN-OFFS" />
      <p className={styles.body}>
        Three reviewers approved the assessment package in sequence. All approvals were recorded with timestamps and
        are part of the audit trail.
      </p>
      <div className={styles.reviewGrid}>
        <ReviewerCard
          initials="SC"
          color="var(--sky)"
          name="Sarah Chen"
          role="TPRM Lead"
          time={`Approved ${TODAY_LONG} · 09:48 PT`}
          note="Tier 2 fit is appropriate. Sub-processor SLA gap acceptable via contract addendum. Recommend approve."
        />
        <ReviewerCard
          initials="JP"
          color="#F5C84B"
          name="James Park"
          role="TPRM Admin"
          time={`Approved ${TODAY_LONG} · 09:50 PT`}
          note="Documents and intelligence concur. Findings minor. Approve subject to addendum."
        />
        <ReviewerCard
          initials="MO"
          color="var(--green-emerald)"
          name="Maya Okafor"
          role="Director, Platform Engineering"
          time={`Approved ${TODAY_LONG} · 09:51 PT`}
          note="Operationally fine for our use case. No platform-eng blockers."
        />
      </div>
    </section>
  );
}

function ReviewerCard({ initials, color, name, role, time, note }: { initials: string; color: string; name: string; role: string; time: string; note: string }) {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHead}>
        <div className={styles.reviewAvatar} style={{ background: color }}>{initials}</div>
        <div>
          <div className={styles.reviewName}>{name}</div>
          <div className={styles.reviewRole}>{role}</div>
        </div>
        <div className={styles.reviewCheck}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M3 7.2l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={styles.reviewTime}>{time}</div>
      <div className={styles.reviewNote}>{note}</div>
    </div>
  );
}

function SectionRecommendations() {
  return (
    <section className={styles.section}>
      <SectionHead num="8" label="RECOMMENDATIONS &amp; CONDITIONS" />
      <ol className={styles.recList}>
        <li>
          <strong>Approve at Tier 2 — Standard</strong> with monitoring set to the standard quarterly BitSight scan
          cadence; alerts triggered on score delta &gt; 10 points or new breach disclosure.
        </li>
        <li>
          <strong>Contract addendum — sub-processor notice.</strong> Align Acme&rsquo;s 30-day advance-notice SLA with
          Optro&rsquo;s policy §6.3. Sarah Chen to coordinate with Legal; target execution prior to contract signature.
        </li>
        <li>
          <strong>Monitoring · BCP/DR scope.</strong> Re-verify CS-leadership participation in the May 2026 BCP/DR
          tabletop exercise. James Park to confirm at Q3 2026 review.
        </li>
        <li>
          <strong>Re-assessment cadence.</strong> Next full assessment scheduled for May 18, 2028 per Tier 2 24-month
          cycle. Trigger early re-assessment if BitSight composite drops below 640 or category of service materially
          changes.
        </li>
      </ol>
    </section>
  );
}

function SectionAppendix() {
  return (
    <section className={styles.section}>
      <SectionHead num="A" label="APPENDIX" />
      <h3 className={styles.subhead}>A.1 — Workflow audit trail</h3>
      <table className={styles.dataTable}>
        <thead>
          <tr><th>Timestamp</th><th>Event</th><th>Actor</th></tr>
        </thead>
        <tbody>
          <tr><td>May 17 · 09:14 PT</td>  <td>Vendor imported from Zip</td>                              <td>System</td></tr>
          <tr><td>May 17 · 09:15 PT</td>  <td>Profile auto-populated from Zip</td>                       <td>Akarsh Kaur</td></tr>
          <tr><td>May 17 · 09:16 PT</td>  <td>AI suggested Tier 2 (87% confidence)</td>                  <td>AI Agent</td></tr>
          <tr><td>May 17 · 09:16 PT</td>  <td>Tier 2 accepted</td>                                       <td>Akarsh Kaur</td></tr>
          <tr><td>May 17 · 09:18 PT</td>  <td>All 6 required documents received</td>                     <td>Vendor portal</td></tr>
          <tr><td>May 17 · 09:19 PT</td>  <td>Outside-in intel completed · 4 signals reconciled</td>     <td>AI Agent</td></tr>
          <tr><td>May 17 · 09:24 PT</td>  <td>Assessments started · AI drafting 426 questions</td>       <td>AI Agent</td></tr>
          <tr><td>May 17 · 09:38 PT</td>  <td>8 gaps sent to vendor</td>                                 <td>Akarsh Kaur</td></tr>
          <tr><td>May 17 · 09:42 PT</td>  <td>All vendor responses received · gaps closed</td>           <td>Vendor</td></tr>
          <tr><td>May 18 · 09:46 PT</td>  <td>All assessments bulk-accepted</td>                         <td>Akarsh Kaur</td></tr>
          <tr><td>May 18 · 09:48 PT</td>  <td>Assessment package sent for reviewer approval</td>         <td>Akarsh Kaur</td></tr>
          <tr><td>May 18 · 09:51 PT</td>  <td>Reviewer approvals received · sign-off complete</td>       <td>3 reviewers</td></tr>
          <tr><td>May 18 · 09:52 PT</td>  <td>Risk report generated</td>                                 <td>System</td></tr>
        </tbody>
      </table>
      <h3 className={styles.subhead}>A.2 — Framework coverage</h3>
      <table className={styles.dataTable}>
        <thead><tr><th>Framework</th><th>Coverage</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>SOC 2 (Security, Availability)</td>  <td>Full</td>      <td>Type II report · Feb 2026 · Deloitte</td></tr>
          <tr><td>ISO 27001:2022</td>                  <td>Full</td>      <td>Certified · Sep 2025 · Schellman</td></tr>
          <tr><td>NIST CSF 2.0</td>                    <td>Mapped</td>    <td>Mapped through CSA CAIQ + Internal Risk</td></tr>
          <tr><td>GDPR / Art. 28 processor terms</td>  <td>Confirmed</td> <td>DPA executed Apr 2026</td></tr>
          <tr><td>CCPA / CPRA</td>                     <td>Confirmed</td> <td>No PII in scope for this engagement</td></tr>
        </tbody>
      </table>
      <h3 className={styles.subhead}>A.3 — Sub-processors of note</h3>
      <table className={styles.dataTable}>
        <thead><tr><th>Sub-processor</th><th>Region</th><th>Purpose</th><th>Cert</th></tr></thead>
        <tbody>
          <tr><td>AWS</td>                  <td>us-east-1 / us-west-2</td>  <td>Compute / storage</td>     <td>SOC 2 · ISO 27001</td></tr>
          <tr><td>Datadog</td>              <td>US-1</td>                   <td>Observability</td>        <td>SOC 2 · ISO 27001</td></tr>
          <tr><td>Snowflake</td>            <td>us-east-1</td>              <td>Warehouse</td>            <td>SOC 2 · ISO 27001</td></tr>
          <tr><td>Okta</td>                 <td>US prod</td>                <td>Identity</td>             <td>SOC 2 · FedRAMP Moderate</td></tr>
          <tr><td>Stripe</td>               <td>US</td>                     <td>Billing</td>              <td>PCI DSS L1</td></tr>
        </tbody>
      </table>
    </section>
  );
}

function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionHeadNum}>{num}</span>
      <span className={styles.sectionHeadLabel}>{label}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLine}>
        <strong>Confidentiality.</strong> This report is the property of Optro and the entities it represents.
        Distribute only to authorized reviewers and contractually-bound counterparties. Generated automatically by the
        Optro TPRM platform — questions on methodology may be directed to <a className={styles.footerLink}>tprm@optro.dev</a>.
      </div>
      <div className={styles.footerMono}>OPTRO TPRM · v2026.05 · Vendor Risk Report · Acme Cloud Co. · {TODAY_LONG}</div>
    </footer>
  );
}
