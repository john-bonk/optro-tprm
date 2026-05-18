import type { PhaseData } from '../types';

export const phaseData: PhaseData = {
  vendor_intake: [
    {
      // Step 1 · capture who the vendor is and what they will do. The HITL
      // gate sits at the top: the user picks how the record is populated, and
      // the AI prep work (ingest, parse, pre-fill, flag) runs after their
      // selection. No risk judgment yet — the goal is a complete vendor
      // record before Inherent Risk takes over.
      name: 'Vendor Intake',
      substeps: [
        { name: 'Populate vendor record', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: 'How would you like to populate this vendor record?', body: 'Acme Cloud Co. was just added. Use the connected Zip integration to auto-populate the record from the procurement payload and attached evidence (MSA, SOW, DPA), or fill the required fields manually.', actions: ['Auto-populate', 'Fill out manually', 'Reject vendor'] } },
        { name: 'Ingest vendor record from source', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Imported VND-2026-042 from Zip on 2026-05-08 09:14 UTC. Normalized 8 fields. Match score against existing inventory: 0.12 (no duplicate).' } },
        { name: 'Parse attached evidence for field-level data', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Document', 'Type', 'Fields extracted'], rows: [['Acme MSA · v3.1', 'MSA', 'Legal entity, term, jurisdiction, liability cap'], ['SOW · Analytics platform', 'SOW', 'Scope, deliverables, owners, est. spend'], ['DPA · 2026-04-12', 'DPA', 'Data categories, sub-processors, retention']] } },
        { name: 'Pre-fill vendor record from parsed evidence', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: '32 of 38 vendor-record fields auto-populated from parsed evidence and the Zip request payload. Average extraction confidence: 0.94. Remaining 6 fields require human input (business justification, internal owners, framework requirements).' } },
        { name: 'Flag inconsistencies and surface missing fields', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Field', 'Source', 'Issue'], rows: [['Vendor services', 'Zip vs SOW', 'Zip says "marketing analytics"; SOW says "observability + analytics" — broader scope'], ['Data classification', 'DPA vs Zip', 'DPA indicates Internal; Zip request unspecified — defaulting to DPA'], ['Business justification', '—', 'Missing — required before proceeding']] } },
      ],
    },
    {
      // Step 2 · size up how risky the vendor would be before looking at
      // their controls. Combines tiering signals from the vendor record with
      // external (outside-in) intelligence — both feed the inherent-risk
      // autonomous contract.
      name: 'Inherent Risk',
      substeps: [
        { name: 'Generate tier classification', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: 'Trigger AI tier classification', body: 'AI will weigh tiering dimensions across the vendor record (annual spend, category, PII handling, prior assessment history, geographic risk) and produce a tier recommendation with confidence and signal-level rationale. Fire the analysis from any surface — the Profile-tab AI Tier card, the hero action button, or this substep.', actions: ['Generate tier classification'] } },
        { name: 'Apply AI tier classification', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Tier 2 — Standard Assessment. 87% confidence based on 4 policy signals (2 from Zip procurement data, 2 inferred). Composite risk score: 0.72. Threshold for Tier 2: 0.50–0.79.' } },
        {
          name: 'Confirm assigned tier',
          type: 'hitl',
          pattern: 'output_tier',
          flow: 'sequential',
          out: {
            kind: 'tier',
            value: 'Tier 2',
            confidence: '87% confidence',
            signals: [
              { source: 'Zip', text: 'Spend $48,000 — exceeds Tier 3 threshold ($25K), below Tier 1 threshold ($100K)' },
              { source: 'Zip', text: 'Category: SaaS — requires security questionnaire per policy §4.1' },
              { source: 'AI',  text: 'No PII handling indicated — if PII present, would escalate to Tier 1' },
              { source: 'AI',  text: 'New vendor, no prior assessment history — conservative classification' },
            ],
          },
        },
        { name: 'Query sanctions and watchlist databases', type: 'automated', pattern: 'output_text',  flow: 'parallel',   out: { kind: 'text',  content: 'Queried OFAC, EU, UN sanctions lists. No matches. Last refreshed 2026-04-22 14:47 UTC.' } },
        { name: 'Retrieve cyber risk posture score',       type: 'automated', pattern: 'output_chart', flow: 'parallel',   out: { kind: 'chart', labels: ['BitSight', 'Posture', 'Patch', 'Net', 'App'], values: [72, 68, 81, 65, 70] } },
        { name: 'Pull adverse news signals',               type: 'agentic',   pattern: 'output_table', flow: 'parallel',   out: { kind: 'table', headers: ['Date', 'Source', 'Severity'], rows: [['2026-02-14', 'Reuters', 'Low — minor outage'], ['2025-11-08', 'TechCrunch', 'Low — exec departure']] } },
        { name: 'Reconcile signals across sources',        type: 'agentic',   pattern: 'output_text',  flow: 'sequential', out: { kind: 'text',  content: 'Aggregated signals from 4 sources. No conflicting indicators. Two low-severity adverse news items in past 12 months. No data absence flags raised.' } },
      ],
    },
    {
      // Step 3 · collect evidence, evaluate controls, and issue the verdict.
      // The 10 substeps below map 1:1 to the product's workflow phases so the
      // lifecycle stepper, the active tab CTAs, and the status banner stay in
      // perfect lockstep.
      name: 'Due Diligence',
      substeps: [
        // Phase: docs_pending — start (agentic surface, auto-complete on tier accept)
        {
          name: 'Surface required documents',
          type: 'agentic',
          pattern: 'output_documents',
          flow: 'sequential',
          out: {
            kind: 'documents',
            summary: '2 of 6 required documents missing',
            rows: [
              { name: 'SOC 2 Type II Report',        source: 'Trust portal', status: 'received' },
              { name: 'Penetration Test Summary',    source: '—',            status: 'missing' },
              { name: 'Business Continuity Plan',    source: '—',            status: 'missing' },
              { name: 'Privacy Policy',              source: 'Trust portal', status: 'received' },
              { name: 'Information Security Policy', source: 'Trust portal', status: 'received' },
              { name: 'Data Processing Addendum',    source: 'Trust portal', status: 'received' },
            ],
          },
        },
        // Phase: docs_pending — active (proto user sends doc requests, vendor uploads)
        { name: 'Collect missing vendor evidence', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '2 documents missing · awaiting vendor upload', body: 'Send a secure upload link to Acme for the Penetration Test Summary and Business Continuity Plan. AI auto-discovers from trust portals first; gaps escalate to vendor request.', actions: ['Send secure upload link', 'Skip — accept gaps'] } },
        // Phase: assessments_pending (questionnaires queued, awaiting Start)
        { name: 'Queue tier-appropriate questionnaires', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Questionnaire', 'Trigger', 'Question count'], rows: [['SIG Lite v2.1', 'Tier 2 baseline', '60'], ['CSA CAIQ Lite', 'SaaS category §4.1', '84'], ['Internal Risk Questionnaire', 'Optro standard set', '28']] } },
        // Phase: assessments_started (AI drafting answers from docs)
        { name: 'Generate AI assessment drafts from collected docs', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'AI agent drafted 164 of 172 answers across 3 questionnaires (SIG Lite, CSA CAIQ, Internal — Optro security baseline) using the 6 collected documents. Average confidence: 92%. 8 questions remain unanswered (gaps).' } },
        // Phase: gaps_in_flight (vendor responding to gap requests)
        { name: 'Resolve question gaps with vendor', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '8 gaps require vendor input', body: 'Send unanswered questions to the vendor for direct response. Distribution: 2 SIG Lite · 3 CSA CAIQ · 3 Internal. Vendor SLA: 48 hours.', actions: ['Send 8 gaps to vendor', 'Answer manually', 'Defer'] } },
        // Phase: acceptance_pending (proto user accepts AI-drafted answers)
        { name: 'Review and accept AI-drafted answers', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: 'All 172 answers ready for acceptance', body: 'Vendor has answered every gap. Review and accept the AI drafts singly per-question or in bulk per-questionnaire — then send the package to reviewers for sign-off.', actions: ['Accept all', 'Review per questionnaire'] } },
        // Phase: review_pending (reviewer sim — Sarah → James → Maya)
        { name: 'Route to reviewers and certify', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Package routed to Sarah Chen (TPRM Lead), James Park (TPRM Admin), and Maya Okafor (Director, Platform Engineering) per Tier 2 routing rules. Reviewer SLA: 48 hours.' } },
        // Phase: report_pending — auto-completes (agentic findings + scoring on review approval)
        { name: 'Map findings to control framework and identify gaps', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Finding', 'Framework anchor', 'Severity'], rows: [['Sub-processor SLA undefined', 'CSA §STA-07 · SOC2 §CC9', 'Medium · non-blocking'], ['BCP/DR exercise scope narrow', 'ISO §A.17 · SIG Q88', 'Low · non-blocking'], ['EU scope exclusion in SOC 2', 'GDPR Art. 28', 'Medium · non-blocking']] } },
        // Phase: report_pending — auto-completes (agentic residual-risk scoring on review approval)
        { name: 'Compute residual-risk score and scorecard', type: 'agentic', pattern: 'output_chart', flow: 'sequential', out: { kind: 'chart', labels: ['Cyber', 'Fin', 'Ops', 'Comp', 'Data', 'Geo'], values: [35, 62, 48, 78, 55, 42] } },
        // Phase: report_pending (verdict implicit on review; user generates report)
        { name: 'Issue verdict and generate vendor risk report', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: 'Verdict · Approve with conditions', body: 'Composite score 74 · 3 non-blocking findings persist as Issues into Monitoring · contract addendum required for sub-processor SLA. Generate the comprehensive risk report to close out Due Diligence and kick off Monitoring.', actions: ['Generate risk report', 'Modify verdict'] } },
      ],
    },
    {
      // Step 4 · post-verdict ongoing watch. Entry condition: Due Diligence
      // returned Approved or Approved with conditions. Reassessments and
      // tier re-evaluations are events inside this phase, not exits from it.
      // The only exit is offboarding.
      name: 'Monitoring',
      substeps: [
        { name: 'Schedule monitoring cadence', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Monitoring cadence set to biannual for Tier 2 vendors. Next scheduled scan: 2026-07-22. Alerts enabled for composite score delta > 10 points and any new breach disclosure.' } },
        { name: 'Poll external threat intelligence feeds', type: 'automated', pattern: 'output_table', flow: 'parallel', out: { kind: 'table', headers: ['Feed', 'Last polled', 'Signal'], rows: [['BitSight', '2026-04-22 15:10', 'No change'], ['RiskRecon', '2026-04-22 15:10', 'No change'], ['OFAC', '2026-04-22 15:10', 'No match']] } },
        { name: 'Detect cyber posture drift', type: 'agentic', pattern: 'output_chart', flow: 'parallel', out: { kind: 'chart', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [74, 73, 70, 72, 68, 65] } },
        { name: 'Monitor for adverse news and public signals', type: 'agentic', pattern: 'output_table', flow: 'parallel', out: { kind: 'table', headers: ['Date', 'Source', 'Signal', 'Severity'], rows: [['2026-04-18', 'Bloomberg', 'Regulatory inquiry opened', 'Medium'], ['2026-03-30', 'TechCrunch', 'CISO departure', 'Low']] } },
        { name: 'Track document and certification expirations', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Item', 'Expiry', 'Days remaining'], rows: [['ISO 27001 cert', '2027-03-15', '328'], ['MSA renewal', '2026-11-01', '193'], ['Pen test SLA', '2026-06-30', '69']] } },
        { name: 'Trigger tier re-evaluation on material events', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'No material signal change detected this cycle. Composite score unchanged at 78. No re-tiering triggered. Next full reassessment due Q3 2027 per Tier 2 biannual cadence.' } },
        { name: 'Surface escalation triggers to reviewer', type: 'agentic', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '1 escalation trigger requires review', body: 'Cyber posture score has declined 9 points over 6 months (74 → 65). Approaching re-assessment threshold. Recommend expedited review.', actions: ['Initiate re-assessment', 'Dismiss', 'Snooze 30 days'] } },
      ],
    },
  ],
  continuous_monitoring: [
    {
      name: 'Continuous Monitoring',
      substeps: [
        { name: 'Schedule monitoring cadence', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Monitoring cadence set to quarterly for Tier 2 vendors. Next scheduled scan: 2026-07-22. Alerts enabled for score delta > 10 points.' } },
        { name: 'Poll external threat intelligence feeds', type: 'automated', pattern: 'output_table', flow: 'parallel', out: { kind: 'table', headers: ['Feed', 'Last polled', 'Signal'], rows: [['BitSight', '2026-04-22 15:10', 'No change'], ['RiskRecon', '2026-04-22 15:10', 'No change'], ['OFAC', '2026-04-22 15:10', 'No match']] } },
        { name: 'Detect cyber posture drift', type: 'agentic', pattern: 'output_chart', flow: 'parallel', out: { kind: 'chart', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [74, 73, 70, 72, 68, 65] } },
        { name: 'Monitor for adverse news and public signals', type: 'agentic', pattern: 'output_table', flow: 'parallel', out: { kind: 'table', headers: ['Date', 'Source', 'Signal', 'Severity'], rows: [['2026-04-18', 'Bloomberg', 'Regulatory inquiry opened', 'Medium'], ['2026-03-30', 'TechCrunch', 'CISO departure', 'Low']] } },
        { name: 'Assess contract and certification expirations', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Item', 'Expiry', 'Days remaining'], rows: [['ISO 27001 cert', '2027-03-15', '328'], ['MSA renewal', '2026-11-01', '193'], ['Pen test SLA', '2026-06-30', '69']] } },
        { name: 'Re-score on material signal change', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'No material signal change detected this cycle. Composite score unchanged at 78. No re-tiering triggered. Next full re-assessment due Q3 2027.' } },
        { name: 'Surface escalation triggers to reviewer', type: 'agentic', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '1 escalation trigger requires review', body: 'Cyber posture score has declined 9 points over 6 months (74 → 65). Approaching re-assessment threshold. Recommend expedited review.', actions: ['Initiate re-assessment', 'Dismiss', 'Snooze 30 days'] } },
      ],
    },
  ],
};
