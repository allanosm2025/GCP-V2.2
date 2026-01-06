import { CampaignData, EmailBatch } from './types';

export const normalizeInitialEmailData = (campaign: CampaignData, fileName?: string): CampaignData => {
  const existingBatches = (campaign.emailBatches || []).filter(b => Array.isArray(b.emails));
  if (existingBatches.length) return campaign;

  const normalizedEmails = (campaign.emails || []).map((e, idx) => ({
    ...e,
    id: idx + 1,
    type: e.type === 'initial' || e.type === 'negotiation' || e.type === 'approval' ? e.type : 'negotiation',
  }));

  const batch: EmailBatch = {
    id: `batch_${Date.now()}`,
    fileName: fileName || 'Thread inicial',
    uploadedAt: new Date().toISOString(),
    emails: normalizedEmails,
  };

  return { ...campaign, emails: normalizedEmails, emailBatches: normalizedEmails.length ? [batch] : [] };
};

