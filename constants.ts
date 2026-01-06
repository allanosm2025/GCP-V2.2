import { CampaignData } from './types';

export const INITIAL_CAMPAIGN_STATE: CampaignData = {
  clientName: "-",
  campaignName: "-",
  proposalFileName: "", // Init empty
  startDate: "-",
  endDate: "-",
  totalBudget: 0,
  netValue: 0,
  status: 'Draft',
  objective: "-",
  marketingTactic: "-",
  emails: [],
  emailBatches: [],
  pmProposalStrategies: [],
  pmOpecStrategies: [],
  audit: [],
  targeting: {
    geo: [],
    demographics: [],
    interests: [],
    devices: [],
    brandSafety: "-"
  },
  legal: {
    paymentTerms: "-",
    agencyCommission: "-",
    cancellationPolicy: "-",
    penalty: "-"
  },
  piEntities: {
    razaoSocial: "-",
    vehicle: "-"
  },
  piSpecifics: {
    description: "-",
    considerations: "-"
  },
  primaryKpis: [],
  kpis: [],
  links: {
    proposal: "",
    pi: "",
    priceTable: "",
    emailThread: "",
    creative: "",
    addresses: "",
    destinationUrls: []
  }
};
