export type VendorSource = 'Zip' | 'Jira' | 'ServiceNow' | 'Coupa';

export interface RequestedVendor {
  id: string;
  name: string;
  source: VendorSource;
  owner: string;
  category: string;
  spend: string;
  date: string;
  _removed?: boolean;
}

export type ManagedStatus = 'Intake' | 'Approved' | 'In Review' | 'Archived';

export interface ManagedVendor {
  id: string;
  name: string;
  type: 'Vendor' | 'IT Asset';
  status: ManagedStatus;
  tier: 1 | 2 | 3;
  score: number | null;
  lastQ: string | null;
  owner: string;
  hidden?: boolean;
  link?: boolean;
}

export type Tier = 1 | 2 | 3;

export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted / PII';

export interface TierInfo {
  label: string;
  name: string;
  confidence: string;
  subtitle: string;
  pillClass: 'pill-critical' | 'pill-standard' | 'pill-low';
}

export type WorkflowPhase =
  | 'profile_pending'
  | 'tier_pending'
  | 'docs_pending'
  | 'assessments_pending'
  | 'assessments_started'
  | 'gaps_in_flight'
  | 'acceptance_pending'
  | 'review_pending'
  | 'report_pending'
  | 'monitoring_active';

export type ProfileConfigSource = 'auto' | 'manual' | null;

export type LifecyclePhase = 'vendor_intake' | 'continuous_monitoring';

export type VendorTab =
  | 'overview'
  | 'profile'
  | 'lifecycle'
  | 'documents'
  | 'intelligence'
  | 'assessments'
  | 'reports';

export type SubstepStatus = 'not_started' | 'in_progress' | 'complete';

export type SubstepType = 'agentic' | 'automated' | 'hitl' | 'manual';
export type SubstepFlow = 'sequential' | 'parallel';

export type OutputKind =
  | 'text'
  | 'table'
  | 'annotated'
  | 'chart'
  | 'hitl'
  | 'tier'
  | 'documents'
  | 'link';

export interface SubstepTextOutput { kind: 'text'; content: string }
export interface SubstepTableOutput { kind: 'table' | 'annotated'; headers: string[]; rows: string[][] }
export interface SubstepChartOutput { kind: 'chart'; labels: string[]; values: number[] }
export interface SubstepHitlOutput { kind: 'hitl'; title: string; body: string; actions: string[] }
export interface SubstepLinkOutput { kind: 'link'; links: string[] }
export interface TierSignal { source: string; text: string }
export interface SubstepTierOutput { kind: 'tier'; value: string; confidence: string; signals: TierSignal[] }
export interface DocRow { name: string; source: string; status: 'received' | 'missing' }
export interface SubstepDocumentsOutput { kind: 'documents'; summary: string; rows: DocRow[] }

export type SubstepOutput =
  | SubstepTextOutput
  | SubstepTableOutput
  | SubstepChartOutput
  | SubstepHitlOutput
  | SubstepLinkOutput
  | SubstepTierOutput
  | SubstepDocumentsOutput;

export interface Substep {
  name: string;
  type: SubstepType;
  pattern: string;
  flow: SubstepFlow;
  out: SubstepOutput;
}

export interface PhaseStep {
  name: string;
  substeps: Substep[];
}

export type PhaseData = Record<LifecyclePhase, PhaseStep[]>;
