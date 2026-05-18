export type AssessmentStatus =
  | 'queued'
  | 'drafting'
  | 'gaps'             // AI drafting complete · gaps awaiting send
  | 'filling_gaps'     // Gaps sent · vendor responding (gaps_in_flight)
  | 'ready_for_review' // All responses in · proto user accepting drafts (acceptance_pending)
  | 'review'           // Sent for reviewer sign-off (review_pending) — "In Review"
  | 'certified';       // Reviewer approval landed (report_pending / monitoring_active)

export interface AssessmentReviewer { initials: string; color: string }

export interface AssessmentDef {
  id: string;
  name: string;
  sub: string;
  totalQuestions: number;
  sent: string;
  due: string;
  reviewers: AssessmentReviewer[];
  reviewerOverflow?: number;
  reviewerSummary: string;
}

export const REVIEWER_COLORS = {
  SC: 'var(--sky)',
  JP: '#F5C84B',
  JF: '#2549E8',
  MS: 'var(--green-emerald)',
  LV: '#E85E36',
  AI: 'var(--indigo)',
} as const;

export const ASSESSMENTS: AssessmentDef[] = [
  {
    id: 'sig-lite',
    name: 'SIG Lite v2.1',
    sub: 'Required for Tier 2 · 60 questions',
    totalQuestions: 60,
    sent: 'May 12, 2026',
    due: 'May 30, 2026',
    reviewers: [
      { initials: 'SC', color: REVIEWER_COLORS.SC },
      { initials: 'JP', color: REVIEWER_COLORS.JP },
    ],
    reviewerSummary: 'Sarah, James',
  },
  {
    id: 'csa-caiq',
    name: 'CSA CAIQ Lite',
    sub: 'Cloud security baseline · 84 questions',
    totalQuestions: 84,
    sent: 'May 12, 2026',
    due: 'Jun 5, 2026',
    reviewers: [
      { initials: 'SC', color: REVIEWER_COLORS.SC },
      { initials: 'JF', color: REVIEWER_COLORS.JF },
      { initials: 'MS', color: REVIEWER_COLORS.MS },
    ],
    reviewerSummary: 'Sarah +2',
  },
  {
    id: 'internal-risk',
    name: 'Internal Risk Questionnaire',
    sub: 'Optro standard set · 28 questions',
    totalQuestions: 28,
    sent: 'May 11, 2026',
    due: 'May 20, 2026',
    reviewers: [
      { initials: 'SC', color: REVIEWER_COLORS.SC },
      { initials: 'LV', color: REVIEWER_COLORS.LV },
      { initials: 'JF', color: REVIEWER_COLORS.JF },
    ],
    reviewerOverflow: 1,
    reviewerSummary: 'Sarah +3',
  },
];

export function getAssessment(id: string): AssessmentDef | undefined {
  return ASSESSMENTS.find(a => a.id === id);
}

// In-progress per-assessment state (when workflowPhase === 'assessments_started').
export interface AssessmentProgress {
  status: AssessmentStatus;
  draftedCount: number;
  gapCount: number;
}

export const IN_PROGRESS_STATE: Record<string, AssessmentProgress> = {
  'sig-lite':      { status: 'gaps', draftedCount: 58, gapCount: 2 },
  'csa-caiq':      { status: 'gaps', draftedCount: 81, gapCount: 3 },
  'internal-risk': { status: 'gaps', draftedCount: 25, gapCount: 3 },
};

export const TOTAL_GAPS = Object.values(IN_PROGRESS_STATE).reduce((sum, p) => sum + p.gapCount, 0);

// Total time the "gaps in flight" interstitial runs before auto-advancing to
// acceptance_pending. Includes a brief "sent · awaiting" intro + the receiving
// animation + a short "all received" hold.
export const GAPS_IN_FLIGHT_INTRO_MS    = 700;
export const GAPS_IN_FLIGHT_RECEIVE_MS  = 2100;
export const GAPS_IN_FLIGHT_HOLD_MS     = 400;
export const GAPS_IN_FLIGHT_TOTAL_MS    =
  GAPS_IN_FLIGHT_INTRO_MS + GAPS_IN_FLIGHT_RECEIVE_MS + GAPS_IN_FLIGHT_HOLD_MS;

// Reviewer sim — "send for review" → reviewers stepping through approvals →
// auto-advance to report_pending. Intro + per-reviewer ticks + final hold.
export const REVIEW_PENDING_INTRO_MS   = 700;
export const REVIEW_PENDING_TICK_MS    = 2400;
export const REVIEW_PENDING_HOLD_MS    = 500;
export const REVIEW_PENDING_TOTAL_MS   =
  REVIEW_PENDING_INTRO_MS + REVIEW_PENDING_TICK_MS + REVIEW_PENDING_HOLD_MS;

export interface Reviewer {
  initials: string;
  name: string;
  role: string;
  color: string;
  email: string;
}

export const REVIEWERS: Reviewer[] = [
  { initials: 'SC', name: 'Sarah Chen',   role: 'TPRM Lead',                       color: 'var(--sky)',          email: 'sarah.chen@optro.dev' },
  { initials: 'JP', name: 'James Park',   role: 'TPRM Admin',                      color: '#F5C84B',             email: 'james.park@optro.dev' },
  { initials: 'MS', name: 'Maya Okafor',  role: 'Director, Platform Engineering',  color: 'var(--green-emerald)', email: 'maya.okafor@optro.dev' },
];

// Questions used in the opened assessment view.
export type QuestionStatus = 'drafted' | 'gap' | 'approved';
export type QuestionConfidence = 'High' | 'Medium' | 'Low';

export interface Question {
  id: string;
  num: string;
  text: string;
  draftAnswer: string;
  source: string | null;
  status: QuestionStatus;
  confidence: QuestionConfidence;
  commentCount?: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 'q01',
    num: 'Q01',
    text: 'Do you have a documented information security policy?',
    draftAnswer: 'Yes. Acme maintains a documented InfoSec policy reviewed annually by the CISO.',
    source: 'SOC 2 Type II · §1.1',
    status: 'drafted',
    confidence: 'High',
  },
  {
    id: 'q02',
    num: 'Q02',
    text: 'Do you require multi-factor authentication for all administrative access?',
    draftAnswer: 'Yes — MFA is enforced for all admin and engineering personnel via Okta SSO. TOTP and WebAuthn supported.',
    source: 'Information Security Policy · §3.4',
    status: 'drafted',
    confidence: 'High',
  },
  {
    id: 'q14',
    num: 'Q14',
    text: 'Do you maintain a vendor inventory with risk classifications?',
    draftAnswer: 'Yes — all subprocessors are tracked in Vanta with quarterly tier reviews.',
    source: 'Information Security Policy · §4.2',
    status: 'drafted',
    confidence: 'High',
  },
  {
    id: 'q15',
    num: 'Q15',
    text: 'Do you support SSO/SAML for customer authentication?',
    draftAnswer: 'Yes. SAML 2.0 and OIDC are supported for all enterprise tenants.',
    source: 'Information Security Policy · §3.7',
    status: 'drafted',
    confidence: 'High',
  },
  {
    id: 'q42',
    num: 'Q42',
    text: 'What is your sub-processor change notification SLA to customers?',
    draftAnswer: "Source materials don't specify a customer-facing SLA. Needs vendor confirmation.",
    source: null,
    status: 'gap',
    confidence: 'Low',
  },
  {
    id: 'q88',
    num: 'Q88',
    text: 'When was your last full BCP/DR tabletop exercise?',
    draftAnswer: "BCP doc references Q4 2025 exercise but doesn't list participants. Vendor input needed.",
    source: null,
    status: 'gap',
    confidence: 'Low',
    commentCount: 1,
  },
];

export const STATUS_LABEL: Record<AssessmentStatus, string> = {
  queued:           'Queued',
  drafting:         'AI Drafting',
  gaps:             'Gaps Awaiting',
  filling_gaps:     'Filling Gaps',
  ready_for_review: 'Ready for Review',
  review:           'In Review',
  certified:        'Certified',
};

// Vendor responses returned for each gap once the request/response cycle completes.
// Used in the opened assessment view during `report_pending` to show the filled gap.
export const VENDOR_RESPONSES: Record<string, string> = {
  q42: '30-day advance notice for any sub-processor change, delivered via email to all customer technical contacts and posted on the trust portal. Customers may terminate within 30 days if they object.',
  q88: 'Last full BCP/DR tabletop exercise: November 12, 2025. 28 participants across Engineering, SRE, Customer Operations, and Security. Findings logged in BCP-2025-Q4-001; next exercise scheduled May 2026.',
};
