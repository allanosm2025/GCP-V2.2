
export interface UploadedFiles {
  pi: File | null;
  proposal: File | null;
  email: File | null; // Reverted to single file for stability
  pmOpec: File | null;
}

export interface EmailInteraction {
  id: number;
  date: string;
  sender: string;
  summary: string;
  type: 'initial' | 'negotiation' | 'approval';
}

export interface EmailBatch {
  id: string;
  fileName: string;
  uploadedAt: string;
  emails: EmailInteraction[];
}

export interface TechFeatures {
  hasFirstParty: boolean;
  hasFootfall: boolean;
  isRichMedia: boolean;
  isCrossDevice: boolean;
}

export interface StrategyItem {
  id: number;
  platform: string;
  tactic: string; // ex: "Prospecção Geo", "Retargeting CRM"
  format: string;
  bidModel: 'CPM' | 'CPC' | 'CPV';
  bidValue: number;
  totalCost: number;
  impressionGoal: number;
  techFeatures: TechFeatures;
}

export const AUDIT_FIELD_KEYS = [
  'startDate',
  'endDate',
  'grossBudget',
  'netBudget',
  'totalImpressions',
  'soldCPM',
  'campaignObjective',
  'ctrCheck',
  'targetLocations',
] as const;

export type AuditFieldKey = (typeof AUDIT_FIELD_KEYS)[number];

export const AUDIT_FIELD_LABELS: Record<AuditFieldKey, string> = {
  startDate: '1. Data de Início',
  endDate: '2. Data de Término',
  grossBudget: '3. Investimento Bruto (Total)',
  netBudget: '4. Investimento Líquido',
  totalImpressions: '5. Total de Impressões',
  soldCPM: '6. CPM Vendido (Média)',
  campaignObjective: '7. Objetivo da Campanha',
  ctrCheck: '8. Meta de CTR (> 1%)',
  targetLocations: '9. Praças / Endereços',
};

export interface AuditItem {
  id: number;
  field: AuditFieldKey;
  piValue: string;
  proposalValue: string; // New field for Proposal Commercial PDF
  emailValue: string;    // Dedicated field for Email Thread
  pmValue: string;       // Dedicated field for OPEC/Technical
  isConsistent: boolean;
  notes?: string;

  // New Approval Fields
  manuallyApproved?: boolean;
  justification?: string;
}

// New detailed interfaces
export interface Targeting {
  geo: string[];
  demographics: string[];
  interests: string[];
  devices: string[];
  brandSafety: string;
}

export interface LegalTerms {
  paymentTerms: string;
  agencyCommission: string;
  cancellationPolicy: string;
  penalty: string;
}

export interface PiEntities {
  razaoSocial: string;
  vehicle: string;
}

export interface PiSpecifics {
  description: string;
  considerations: string;
}

export interface AssetLinks {
  proposal: string;
  pi: string;
  priceTable: string;
  emailThread: string;
  creative: string;
  addresses: string;
  destinationUrls: string[];
}

export interface AiReportPublisherMetric {
  name: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
}

export interface AiReportBreakdownItem {
  label: string;
  share?: number;
}

export interface AiReportGoalCheckItem {
  goal: string;
  target?: string;
  actual?: string;
  status: 'hit' | 'partial' | 'miss' | 'unknown';
  notes?: string;
}

export interface AiReport {
  generatedAt: string;
  sourceFileName: string;
  sourceFileType: string;
  summary: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
  };
  publishers?: AiReportPublisherMetric[];
  demographics?: {
    gender?: AiReportBreakdownItem[];
    age?: AiReportBreakdownItem[];
  };
  creatives?: {
    name: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
  considerations?: string[];
  goalsCheck?: {
    overallStatus: 'hit' | 'partial' | 'miss' | 'unknown';
    items: AiReportGoalCheckItem[];
  };
}

export interface CampaignData {
  clientName: string;
  campaignName: string;
  proposalFileName: string; // NEW: Mandatory field for URL generation
  startDate: string;
  endDate: string;
  totalBudget: number; // Valor Bruto
  netValue: number;    // Valor Líquido
  status: 'Active' | 'Pending' | 'Draft';

  // Strategic Data (New)
  objective: string;
  marketingTactic: string;

  emails: EmailInteraction[];

  emailBatches?: EmailBatch[];

  // Manual Observations with AI
  overviewObservations?: string;

  // Separated Strategies
  pmProposalStrategies: StrategyItem[]; // From Proposal PDF
  pmOpecStrategies: StrategyItem[];     // From OPEC Table File

  audit: AuditItem[];
  // New detailed fields
  targeting: Targeting;
  legal: LegalTerms;

  // PI Detailed Data
  piEntities: PiEntities;
  piSpecifics: PiSpecifics;

  primaryKpis: string[]; // NEW FIELD
  kpis: string[]; // Secondary KPIs

  // Asset Links
  links: AssetLinks;

  aiReport?: AiReport;
}

export type AppState = 'upload' | 'processing' | 'dashboard';
export type DashboardTab = 'overview' | 'profile' | 'email' | 'pi' | 'pm_proposal' | 'pm_opec' | 'audit' | 'chat' | 'report';
