
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

export interface AuditItem {
  id: number;
  field: string;
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
}

export type AppState = 'upload' | 'processing' | 'dashboard';
export type DashboardTab = 'overview' | 'profile' | 'email' | 'pi' | 'pm_proposal' | 'pm_opec' | 'audit' | 'chat';
