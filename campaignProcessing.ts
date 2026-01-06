import { parseAiJsonObject } from './aiUtils';
import { extractCampaignJsonTextFromFiles } from './aiCampaignExtractor';
import { normalizeAuditItems } from './auditNormalization';
import { normalizeInitialEmailData } from './campaignEmailNormalization';
import { INITIAL_CAMPAIGN_STATE } from './constants';
import { CampaignData, UploadedFiles } from './types';

export const processCampaignFromFiles = async (args: {
  files: UploadedFiles;
  availableKeys: string[];
  currentCampaign: CampaignData;
  onStatus?: (status: string) => void;
}): Promise<CampaignData> => {
  const { files, availableKeys, currentCampaign, onStatus } = args;

  const extractedText = await extractCampaignJsonTextFromFiles({
    files,
    availableKeys,
    onStatus,
  });

  onStatus?.('Sincronizando Dashboard...');

  const extractedData = parseAiJsonObject(extractedText);

  if (!extractedData || typeof extractedData !== 'object') {
    throw new Error('Resposta da IA não contém um objeto JSON válido.');
  }

  const safeData: CampaignData = {
    ...INITIAL_CAMPAIGN_STATE,
    ...extractedData,
    audit: normalizeAuditItems((extractedData as any)?.audit),
    proposalFileName: currentCampaign.proposalFileName,
    status: 'Active',
  };

  return normalizeInitialEmailData(safeData, files.email?.name);
};
