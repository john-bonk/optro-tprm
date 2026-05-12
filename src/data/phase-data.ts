import type { PhaseData } from '../types';

export const phaseData: PhaseData = {
  vendor_intake: [
    {
      name: 'Vendor Intake',
      substeps: [
        { name: 'Ingest vendor record from source', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Imported VND-0042 from Zip on 2026-05-08 09:14 UTC. Normalized 8 fields. Match score against existing inventory: 0.12 (no duplicate).' } },
        { name: 'Evaluate vendor against tiering dimensions', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Dimension', 'Value', 'Weight'], rows: [['Annual spend', '$48,000', '0.30'], ['Category', 'SaaS', '0.25'], ['PII handling', 'Not indicated', '0.25'], ['Prior assessment', 'None', '0.10'], ['Geographic risk', 'Low', '0.10']] } },
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
      ],
    },
    {
      name: 'Outside-in Intel',
      substeps: [
        { name: 'Query sanctions and watchlist databases', type: 'automated', pattern: 'output_text',  flow: 'parallel',   out: { kind: 'text',  content: 'Queried OFAC, EU, UN sanctions lists. No matches. Last refreshed 2026-04-22 14:47 UTC.' } },
        { name: 'Retrieve cyber risk posture score',       type: 'automated', pattern: 'output_chart', flow: 'parallel',   out: { kind: 'chart', labels: ['BitSight', 'Posture', 'Patch', 'Net', 'App'], values: [72, 68, 81, 65, 70] } },
        { name: 'Pull adverse news signals',               type: 'agentic',   pattern: 'output_table', flow: 'parallel',   out: { kind: 'table', headers: ['Date', 'Source', 'Severity'], rows: [['2026-02-14', 'Reuters', 'Low — minor outage'], ['2025-11-08', 'TechCrunch', 'Low — exec departure']] } },
        { name: 'Reconcile signals across sources',        type: 'agentic',   pattern: 'output_text',  flow: 'sequential', out: { kind: 'text',  content: 'Aggregated signals from 4 sources. No conflicting indicators. Two low-severity adverse news items in past 12 months. No data absence flags raised.' } },
      ],
    },
    {
      name: 'Due Diligence',
      substeps: [
        { name: 'Generate AI assessment drafts from collected docs', type: 'agentic', pattern: 'output_text',  flow: 'sequential', out: { kind: 'text', content: "AI agent drafted 390 of 426 answers across 3 questionnaires (SIG Lite, CSA CAIQ, Internal — Optro security baseline) using the 6 collected documents. Average confidence: 92%. 36 questions remain unanswered (gaps)." } },
        { name: 'Review AI-drafted answers', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '390 AI-drafted answers awaiting review', body: 'Bulk approve high-confidence answers, or open individual questionnaires to review and edit. Distribution: SIG Lite 110/123 · CSA CAIQ 240/261 · Internal 40/42.', actions: ['Approve all', 'Review by questionnaire', 'Defer'] } },
        { name: 'Resolve question gaps with vendor', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: '36 gaps require vendor input', body: 'Send unanswered questions to the vendor for direct response, or fill in manually. Distribution: 13 SIG Lite · 21 CSA CAIQ · 2 Internal.', actions: ['Send 36 gaps to vendor', 'Answer manually', 'Defer'] } },
        { name: 'Map findings to control framework', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Requirement', 'Evidence', 'Status'], rows: [['Encryption at rest', 'SOC2 §3.4 + SIG Q41', 'Covered'], ['Access logging', 'CAIQ §IS-08', 'Covered'], ['Incident response', 'ISO §A.16 + CAIQ §IS-15', 'Covered'], ['BCP/DR testing', 'Q88 (gap)', 'Pending']] } },
        { name: 'Identify and surface control gaps', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Gap', 'Severity', 'Owner'], rows: [['Sub-processor SLA undefined', 'Medium', 'Vendor'], ['BCP/DR exercise missing', 'High', 'Vendor'], ['EU scope exclusion in SOC 2', 'Medium', 'Legal']] } },
      ],
    },
    {
      name: 'Risk Scoring',
      substeps: [
        { name: 'Aggregate intelligence into dimensions', type: 'agentic', pattern: 'output_chart', flow: 'sequential', out: { kind: 'chart', labels: ['Cyber', 'Fin', 'Ops', 'Comp', 'Data', 'Geo'], values: [35, 62, 48, 78, 55, 42] } },
        { name: 'Compute weighted composite score', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Composite risk score: 78 / 100. Top contributors: regulatory exposure (78), data sensitivity (55). Confidence: high (0.87).' } },
        { name: 'Produce structured risk scorecard', type: 'agentic', pattern: 'output_table', flow: 'sequential', out: { kind: 'table', headers: ['Dimension', 'Score', 'Confidence'], rows: [['Cyber posture', '35', '0.92'], ['Financial stability', '62', '0.81'], ['Compliance', '78', '0.95']] } },
        { name: 'Generate audit-ready narrative', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Vendor Acme Cloud Co. presents moderate-to-elevated risk driven primarily by regulatory exposure and data sensitivity. Cyber posture is acceptable; one document gap (pen test) outstanding.' } },
      ],
    },
    {
      name: 'Remediation',
      substeps: [
        { name: 'Evaluate against auto-close thresholds', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Score 78 exceeds Tier 1 auto-close threshold (≤30). Routing for human review.' } },
        { name: 'Prepare reviewer brief', type: 'agentic', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Brief assembled: score breakdown, top 3 findings, suggested disposition (Mitigate), comparable vendor reference cases.' } },
        { name: 'Route to assigned reviewer', type: 'automated', pattern: 'output_text', flow: 'sequential', out: { kind: 'text', content: 'Routed to J. Davis (TPRM Lead) per Tier 2 routing rules. Notification dispatched 2026-04-22 15:02 UTC.' } },
        { name: 'Reviewer disposition decision', type: 'hitl', pattern: 'hitl_block', flow: 'sequential', out: { kind: 'hitl', title: 'Risk treatment decision · VND-0042', body: 'Score 78 · Tier 2 · 3 findings flagged. Suggested disposition: Mitigate.', actions: ['Approve', 'Modify', 'Reject'] } },
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
