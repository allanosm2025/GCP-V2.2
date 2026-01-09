import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { AiReport, CampaignData, StrategyItem } from './types';
import { pickApiKey } from './aiKeyRotation';
import { fileToBase64 } from './fileUtils';
import { getGenerateResponseText, isRateLimitError, parseAiJsonObject } from './aiUtils';

const reportSchema: any = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        impressions: { type: Type.INTEGER },
        clicks: { type: Type.INTEGER },
        ctr: { type: Type.NUMBER },
      },
    },
    publishers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          impressions: { type: Type.INTEGER },
          clicks: { type: Type.INTEGER },
          ctr: { type: Type.NUMBER },
        },
      },
    },
    demographics: {
      type: Type.OBJECT,
      properties: {
        gender: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              share: { type: Type.NUMBER },
            },
          },
        },
        age: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              share: { type: Type.NUMBER },
            },
          },
        },
      },
    },
    considerations: { type: Type.ARRAY, items: { type: Type.STRING } },
    goalsCheck: {
      type: Type.OBJECT,
      properties: {
        overallStatus: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              goal: { type: Type.STRING },
              target: { type: Type.STRING },
              actual: { type: Type.STRING },
              status: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
          },
        },
      },
    },
  },
};

const systemInstruction = `
  Você é um AUDITOR DE MÍDIA SÊNIOR da One Station Media.
  Extraia e estruture um RELATÓRIO de performance a partir do arquivo fornecido (PDF ou XLSX).

  REGRAS:
  1. Retorne APENAS JSON puro.
  2. Idioma: PT-BR.
  3. ctr deve ser um número em PERCENTUAL (0 a 100).
  4. Em publishers, use nomes padronizados e sem duplicar variações do mesmo publisher.
  5. Em demographics, use share em percentual (0 a 100) quando disponível.
  6. Em goalsCheck, cruze o relatório com o briefing/contexto e indique se metas foram batidas.
`;

const coerceReportParsed = (value: any) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const candidate = value.find(v => v && typeof v === 'object' && !Array.isArray(v));
    return candidate || null;
  }
  if (typeof value === 'object') return value;
  return null;
};

const totalImpressionGoalFromCampaign = (campaign: CampaignData) => {
  return [...(campaign.pmProposalStrategies || []), ...(campaign.pmOpecStrategies || [])].reduce(
    (sum, s) => sum + (typeof s.impressionGoal === 'number' ? s.impressionGoal : 0),
    0
  );
};

const pickStrategyHighlights = (strategies: StrategyItem[]) => {
  return (strategies || [])
    .slice()
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, 10)
    .map(s => ({
      platform: s.platform,
      tactic: s.tactic,
      format: s.format,
      bidModel: s.bidModel,
      bidValue: s.bidValue,
      totalCost: s.totalCost,
      impressionGoal: s.impressionGoal,
    }));
};

export const extractAiReportFromFile = async (
  file: File,
  campaign: CampaignData,
  availableKeys: string[],
  onStatus?: (status: string) => void
): Promise<AiReport> => {
  if (!availableKeys.length) throw new Error('Nenhuma chave API encontrada para processar relatório.');

  const totalImpressionGoal = totalImpressionGoalFromCampaign(campaign);
  const proposalStrategyHighlights = pickStrategyHighlights(campaign.pmProposalStrategies || []);
  const opecStrategyHighlights = pickStrategyHighlights(campaign.pmOpecStrategies || []);
  const emailHighlights = (campaign.emails || [])
    .slice()
    .slice(-8)
    .map(e => ({ date: e.date, sender: e.sender, type: e.type, summary: e.summary }));

  const briefingContext = {
    clientName: campaign.clientName,
    campaignName: campaign.campaignName,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    totalBudget: campaign.totalBudget,
    netValue: campaign.netValue,
    objective: campaign.objective,
    marketingTactic: campaign.marketingTactic,
    primaryKpis: campaign.primaryKpis,
    kpis: campaign.kpis,
    totalImpressionGoal,
    targeting: campaign.targeting,
    legal: campaign.legal,
    piEntities: campaign.piEntities,
    piSpecifics: campaign.piSpecifics,
    emailHighlights,
    proposalStrategyHighlights,
    opecStrategyHighlights,
  };

  const promptText = `
    A partir do arquivo de relatório, extraia:
    - summary: impressions, clicks, ctr
    - publishers: lista ordenada por impressões
    - creatives: extraia a tabela de criativos/formatos (nome, impressões, cliques, ctr)
    - demographics: gender e age (quando existir)
    - considerations: considerações acionáveis e profissionais
    - goalsCheck: cruze com o contexto do briefing e aponte se metas foram batidas

    CONTEXTO (briefing e plano já processados):\n${JSON.stringify(briefingContext)}
  `;

  onStatus?.('Preparando arquivo do relatório...');
  const b64 = await fileToBase64(file);
  const mimeType = file.type || 'application/pdf';
  const parts: any[] = [
    { text: promptText },
    { text: 'ARQUIVO: RELATORIO_PERFORMANCE' },
    { inlineData: { mimeType, data: b64 } },
  ];

  const apiKey = pickApiKey(availableKeys as string[], 'report');
  const ai = new GoogleGenAI({ apiKey });
  
  // IMPORTANTE: NÃO ALTERAR O MODELO ABAIXO SEM CONSULTA PRÉVIA AO USUÁRIO
  const modelName = 'gemini-3-flash-preview';

  let lastError: Error | null = null;
  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const isRetry = attempt > 1;
      onStatus?.(isRetry ? `Tentativa ${attempt}/${MAX_RETRIES}: Reanalisando via ${modelName}...` : `Analisando via ${modelName}...`);
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction: isRetry ? systemInstruction + '\nATENÇÃO: A tentativa anterior falhou. CERTIFIQUE-SE DE RETORNAR APENAS JSON VÁLIDO.' : systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: reportSchema,
          temperature: isRetry ? 0.2 : 0.1, // Aumenta levemente a temperatura no retry para tentar caminho diferente
          maxOutputTokens: 12000,
        },
      });

      const extractedText = getGenerateResponseText(response);
      if (!extractedText?.trim()) {
        throw new Error('Resposta da IA vazia.');
      }

      onStatus?.('Validando JSON do relatório...');
      console.log(`Raw AI Response (Attempt ${attempt}):`, extractedText.slice(0, 200) + '...');
      
      const parsed = parseAiJsonObject(extractedText);
      const parsedObj = coerceReportParsed(parsed) || {};
      
      return {
        generatedAt: new Date().toISOString(),
        sourceFileName: file.name,
        sourceFileType: file.type || 'application/octet-stream',
        summary: {
          impressions: typeof (parsedObj as any)?.summary?.impressions === 'number' ? (parsedObj as any).summary.impressions : undefined,
          clicks: typeof (parsedObj as any)?.summary?.clicks === 'number' ? (parsedObj as any).summary.clicks : undefined,
          ctr: typeof (parsedObj as any)?.summary?.ctr === 'number' ? (parsedObj as any).summary.ctr : undefined,
        },
        publishers: Array.isArray((parsedObj as any)?.publishers) ? (parsedObj as any).publishers : undefined,
        creatives: Array.isArray((parsedObj as any)?.creatives) ? (parsedObj as any).creatives : undefined,
        demographics: (parsedObj as any)?.demographics && typeof (parsedObj as any).demographics === 'object' ? (parsedObj as any).demographics : undefined,
        considerations: Array.isArray((parsedObj as any)?.considerations) ? (parsedObj as any).considerations : undefined,
        goalsCheck: (parsedObj as any)?.goalsCheck && typeof (parsedObj as any).goalsCheck === 'object' ? (parsedObj as any).goalsCheck : undefined,
      };

    } catch (err: any) {
      console.warn(`Attempt ${attempt} failed:`, err);
      lastError = err;
      
      // Se for erro de rate limit, não adianta tentar imediatamente sem esperar, mas aqui vamos deixar falhar e o user tenta de novo se for o caso, 
      // ou poderíamos adicionar um delay. Como é "preview", rate limits são comuns.
      const msg = String(err?.message || err || 'Erro desconhecido');
      if (isRateLimitError(msg) || msg.includes('503')) {
        throw new Error('Limite de requisições (429/503) atingido. Aguarde alguns segundos e tente novamente.');
      }
      
      if (attempt === MAX_RETRIES) {
         // Na última tentativa, lança o erro formatado
         const snippet = (lastError as any)?.message || 'Erro desconhecido';
         throw new Error(`Falha após ${MAX_RETRIES} tentativas. Último erro: ${snippet}`);
      }
      // Se não for a última, loop continua
    }
  }

  throw lastError || new Error('Falha inesperada na extração do relatório.');
};
