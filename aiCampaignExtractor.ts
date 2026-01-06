import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { UploadedFiles } from './types';
import { fileToBase64 } from './fileUtils';
import { getGenerateResponseText, parseAiJsonObject } from './aiUtils';

const systemInstruction = `
  Você é um AUDITOR DE MÍDIA SÊNIOR da One Station Media. 
  Sua missão é a extração de dados estratégicos, técnicos e jurídicos com RIGOR TOTAL.
  
  DIRETRIZES DE EXTRAÇÃO (CRÍTICAS):
  1. NÃO SUMARIZE TABELAS: No 'pmProposalStrategies' e 'pmOpecStrategies', extraia TODAS as linhas individuais do plano de mídia. NÃO agrupe linhas nem resuma o conteúdo técnico. Se o documento tem 10 linhas de estratégia, o JSON deve conter 10 objetos nesses arrays.
  2. PRESERVAÇÃO TÉCNICA: Mantenha nomes de plataformas e KPIs exatamente como constam nos documentos.
  3. LIMITE DE TEXTO: Para campos de parágrafo (objetivo, tática), limite a 1000 caracteres, mas para LISTAS e TABELAS (estratégias), não há limite de quantidade de itens.
  4. AUDITORIA: Compare os documentos e aponte inconsistências entre eles.
  5. AUDITORIA (OBRIGATÓRIO): Em 'audit', gere EXATAMENTE 9 itens, um para cada 'field' desta lista (use a chave exatamente como abaixo): startDate, endDate, grossBudget, netBudget, totalImpressions, soldCPM, campaignObjective, ctrCheck, targetLocations. Para cada item, preencha piValue/proposalValue/emailValue/pmValue com o valor encontrado em cada documento (ou '-' se não existir). Defina isConsistent=true somente se os valores são equivalentes; caso contrário false. notes deve explicar a divergência em 1 frase.
  
  REGRAS DE FORMATO JSON:
  - Retorne APENAS o JSON puro.
  - O JSON raiz deve ser um OBJETO (não array).
  - Use SEMPRE as chaves e estruturas do schema solicitado, mesmo quando não houver dados.
  - Quando não encontrar uma informação: use "-" para strings, 0 para números, [] para listas.
  - Escape aspas internas: \\"exemplo\\".
  - Use ponto decimal em números.
  - Idioma: PT-BR.
`;

const promptText = `
  ORQUESTRAÇÃO E MAPA DE ORIGEM (OBRIGATÓRIO):
  - ARQUIVO: PI => usar para startDate/endDate, dados de compra e entidade (piEntities).
  - ARQUIVO: PROPOSTA => usar para plano comercial e budget bruto/líquido quando constar.
  - ARQUIVO: OPEC => usar para plano técnico (pmOpecStrategies) e especificações (piSpecifics quando aplicável).
  - ARQUIVO: EMAIL => usar para emails[] (resumo da thread) e para confirmar/ajustar valores (audit).

  REGRAS DE PREENCHIMENTO:
  - totalBudget: orçamento BRUTO (número). Converter moeda (ex: "R$ 123.456,78" => 123456.78).
  - netValue: orçamento LÍQUIDO (número). Converter moeda da mesma forma.
  - startDate/endDate: usar formato string como consta (ex: dd/mm/aaaa). Se divergente, use PI nos campos principais e registre divergência no audit.
  - objective/marketingTactic: texto curto (<= 1000 chars).
  - primaryKpis/kpis: listas de strings.
  - emails: cada item com id incremental iniciando em 1, date/sender/summary/type; type deve ser: initial | negotiation | approval (se não souber, use negotiation).
  - pmProposalStrategies: extrair CADA LINHA da tabela do plano comercial (PROPOSTA), sem agrupar.
  - pmOpecStrategies: extrair CADA LINHA do plano técnico (OPEC), sem agrupar.
  - techFeatures: se não houver indicação explícita, use false.

  AUDIT (OBRIGATÓRIO):
  - Gere EXATAMENTE 9 itens com id 1..9 e field exatamente: startDate, endDate, grossBudget, netBudget, totalImpressions, soldCPM, campaignObjective, ctrCheck, targetLocations.
  - Preencha piValue/proposalValue/emailValue/pmValue com o valor encontrado em cada arquivo (ou "-" se não existir).
  - isConsistent=true somente se equivalentes; caso contrário false. notes: 1 frase explicando.

  FORMATO (EXEMPLO DE ESQUELETO):
  {
    "clientName": "-",
    "campaignName": "-",
    "startDate": "-",
    "endDate": "-",
    "totalBudget": 0,
    "netValue": 0,
    "piEntities": { "razaoSocial": "-", "vehicle": "-" },
    "objective": "-",
    "marketingTactic": "-",
    "emails": [],
    "pmProposalStrategies": [],
    "pmOpecStrategies": [],
    "audit": [],
    "targeting": { "geo": [], "demographics": [], "interests": [], "devices": [], "brandSafety": "-" },
    "legal": { "paymentTerms": "-", "agencyCommission": "-", "cancellationPolicy": "-", "penalty": "-" },
    "piSpecifics": { "description": "-", "considerations": "-" },
    "primaryKpis": [],
    "kpis": [],
    "links": { "proposal": "", "pi": "", "priceTable": "", "emailThread": "", "creative": "", "addresses": "", "destinationUrls": [] }
  }
`;

const strategySchema: any = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER },
    platform: { type: Type.STRING },
    tactic: { type: Type.STRING },
    format: { type: Type.STRING },
    bidModel: { type: Type.STRING },
    bidValue: { type: Type.NUMBER },
    totalCost: { type: Type.NUMBER },
    impressionGoal: { type: Type.NUMBER },
    techFeatures: {
      type: Type.OBJECT,
      properties: {
        hasFirstParty: { type: Type.BOOLEAN },
        hasFootfall: { type: Type.BOOLEAN },
        isRichMedia: { type: Type.BOOLEAN },
        isCrossDevice: { type: Type.BOOLEAN },
      },
      required: ['hasFirstParty', 'hasFootfall', 'isRichMedia', 'isCrossDevice'],
    },
  },
  required: ['id', 'platform', 'tactic', 'format', 'bidModel', 'bidValue', 'totalCost', 'impressionGoal', 'techFeatures'],
};

const responseSchema: any = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING },
    campaignName: { type: Type.STRING },
    startDate: { type: Type.STRING },
    endDate: { type: Type.STRING },
    totalBudget: { type: Type.NUMBER },
    netValue: { type: Type.NUMBER },
    piEntities: {
      type: Type.OBJECT,
      properties: { razaoSocial: { type: Type.STRING }, vehicle: { type: Type.STRING } },
      required: ['razaoSocial', 'vehicle'],
    },
    objective: { type: Type.STRING },
    marketingTactic: { type: Type.STRING },
    emails: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          date: { type: Type.STRING },
          sender: { type: Type.STRING },
          summary: { type: Type.STRING },
          type: { type: Type.STRING },
        },
        required: ['id', 'date', 'sender', 'summary', 'type'],
      },
    },
    pmProposalStrategies: { type: Type.ARRAY, items: strategySchema },
    pmOpecStrategies: { type: Type.ARRAY, items: strategySchema },
    audit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          field: { type: Type.STRING },
          piValue: { type: Type.STRING },
          proposalValue: { type: Type.STRING },
          emailValue: { type: Type.STRING },
          pmValue: { type: Type.STRING },
          isConsistent: { type: Type.BOOLEAN },
          notes: { type: Type.STRING },
        },
        required: ['id', 'field', 'piValue', 'proposalValue', 'emailValue', 'pmValue', 'isConsistent', 'notes'],
      },
    },
    targeting: {
      type: Type.OBJECT,
      properties: {
        geo: { type: Type.ARRAY, items: { type: Type.STRING } },
        demographics: { type: Type.ARRAY, items: { type: Type.STRING } },
        interests: { type: Type.ARRAY, items: { type: Type.STRING } },
        devices: { type: Type.ARRAY, items: { type: Type.STRING } },
        brandSafety: { type: Type.STRING },
      },
      required: ['geo', 'demographics', 'interests', 'devices', 'brandSafety'],
    },
    legal: {
      type: Type.OBJECT,
      properties: {
        paymentTerms: { type: Type.STRING },
        agencyCommission: { type: Type.STRING },
        cancellationPolicy: { type: Type.STRING },
        penalty: { type: Type.STRING },
      },
      required: ['paymentTerms', 'agencyCommission', 'cancellationPolicy', 'penalty'],
    },
    piSpecifics: {
      type: Type.OBJECT,
      properties: { description: { type: Type.STRING }, considerations: { type: Type.STRING } },
      required: ['description', 'considerations'],
    },
    primaryKpis: { type: Type.ARRAY, items: { type: Type.STRING } },
    kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
    links: {
      type: Type.OBJECT,
      properties: {
        proposal: { type: Type.STRING },
        pi: { type: Type.STRING },
        priceTable: { type: Type.STRING },
        emailThread: { type: Type.STRING },
        creative: { type: Type.STRING },
        addresses: { type: Type.STRING },
        destinationUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['proposal', 'pi', 'priceTable', 'emailThread', 'creative', 'addresses', 'destinationUrls'],
    },
  },
  required: [
    'clientName',
    'campaignName',
    'startDate',
    'endDate',
    'totalBudget',
    'netValue',
    'piEntities',
    'objective',
    'marketingTactic',
    'emails',
    'pmProposalStrategies',
    'pmOpecStrategies',
    'audit',
    'targeting',
    'legal',
    'piSpecifics',
    'primaryKpis',
    'kpis',
    'links',
  ],
};

const coerceCampaignParsed = (value: any) => {
  if (!value) return null;

  const looksLikeCampaignObject = (v: any) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
    return (
      typeof v.clientName === 'string' ||
      typeof v.campaignName === 'string' ||
      Array.isArray(v.audit) ||
      Array.isArray(v.pmProposalStrategies) ||
      Array.isArray(v.pmOpecStrategies)
    );
  };

  if (Array.isArray(value)) {
    const candidate = value.find(looksLikeCampaignObject);
    return candidate || null;
  }

  if (typeof value === 'object') {
    if (looksLikeCampaignObject(value)) return value;

    const keys = Object.keys(value);
    if (keys.length === 1) {
      const inner = (value as any)[keys[0]];
      if (looksLikeCampaignObject(inner)) return inner;
    }
    return value;
  }

  return null;
};

const isRetryableError = (message: string) => {
  const m = (message || '').toLowerCase();
  return (
    m.includes('429') ||
    m.includes('503') ||
    m.includes('resource_exhausted') ||
    m.includes('too many requests') ||
    m.includes('service unavailable') ||
    m.includes('unavailable') ||
    m.includes('deadline exceeded') ||
    m.includes('timeout')
  );
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const backoffDelayMs = (attempt: number, baseMs: number, maxMs: number) => {
  const exp = Math.min(maxMs, Math.round(baseMs * Math.pow(2, Math.max(0, attempt - 1))));
  const jitter = Math.floor(Math.random() * Math.min(250, Math.max(50, Math.round(exp * 0.15))));
  return Math.min(maxMs, exp + jitter);
};

const getErrorStatusCode = (err: any): number | null => {
  const candidates = [
    err?.status,
    err?.code,
    err?.response?.status,
    err?.cause?.status,
    err?.cause?.code,
    err?.error?.code,
  ];

  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
    if (typeof c === 'string') {
      const n = Number.parseInt(c, 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
};

const isRetryableExtractionError = (message: string) => {
  const m = (message || '').toLowerCase();
  if (isRetryableError(m)) return true;
  return m.includes('resposta da ia vazia') || m.includes('json parseável') || m.includes('objeto json válido');
};

const isInvalidAiResponseErrorMessage = (message: string) => {
  const m = (message || '').toLowerCase();
  return m.includes('resposta da ia vazia') || m.includes('json parseável') || m.includes('objeto json válido');
};

const statusLineForRetry = (args: { attempt: number; maxAttempts: number; delaySec: number; reason: string }) => {
  const { attempt, maxAttempts, delaySec, reason } = args;
  if (reason === 'rate_limit') {
    return `Limite de requisições do Gemini. Tentativa ${attempt}/${maxAttempts}. Aguardando ${delaySec}s...`;
  }
  if (reason === 'invalid_response') {
    return `Revalidando resposta da IA. Tentativa ${attempt}/${maxAttempts}. Aguardando ${delaySec}s...`;
  }
  return `Gemini indisponível temporariamente. Tentativa ${attempt}/${maxAttempts}. Aguardando ${delaySec}s...`;
};

const generateCampaignJsonTextWithRetry = async (args: {
  ai: GoogleGenAI;
  model: string;
  parts: any[];
  onStatus?: (status: string) => void;
}) => {
  const { ai, model, parts, onStatus } = args;

  const maxAttempts = 5;
  const maxAttemptsInvalidResponse = 2;
  const baseDelayMs = 1500;
  const maxDelayMs = 20000;
  const invalidResponseDelayMs = 900;

  let lastError = '';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1,
          maxOutputTokens: 65000,
        },
      });

      const rawText = getGenerateResponseText(response);
      if (!rawText?.trim()) {
        throw new Error('Resposta da IA vazia.');
      }

      const parsed = parseAiJsonObject(rawText);
      const parsedObj = coerceCampaignParsed(parsed);
      if (!parsedObj || typeof parsedObj !== 'object' || Array.isArray(parsedObj)) {
        throw new Error('Resposta da IA não contém um objeto JSON válido.');
      }

      return JSON.stringify(parsedObj);
    } catch (err: any) {
      const statusCode = getErrorStatusCode(err);
      lastError = String(err?.message || err || 'Erro desconhecido');
      const lastErrorLower = lastError.toLowerCase();

      if (statusCode === 404) {
        throw new Error(`Modelo Gemini não encontrado: ${model}. Use gemini-3-flash-preview.`);
      }

      const retryableByStatus = statusCode === 429 || statusCode === 503 || statusCode === 502 || statusCode === 504;
      const retryableByText = !retryableByStatus && isRetryableError(lastErrorLower);
      const invalidResponse = !retryableByStatus && !retryableByText && isInvalidAiResponseErrorMessage(lastError);

      const reason = retryableByStatus
        ? statusCode === 429
          ? 'rate_limit'
          : 'unavailable'
        : retryableByText
          ? lastErrorLower.includes('429') || lastErrorLower.includes('resource_exhausted') || lastErrorLower.includes('too many requests')
            ? 'rate_limit'
            : 'unavailable'
          : 'invalid_response';

      const attemptLimit = invalidResponse ? maxAttemptsInvalidResponse : maxAttempts;
      const canRetry = attempt < attemptLimit && (retryableByStatus || retryableByText || invalidResponse || isRetryableExtractionError(lastError));
      if (!canRetry) throw new Error(lastError);

      const delayMs = invalidResponse ? invalidResponseDelayMs : backoffDelayMs(attempt, baseDelayMs, maxDelayMs);
      const delaySec = Math.max(1, Math.round(delayMs / 1000));
      onStatus?.(statusLineForRetry({ attempt, maxAttempts: attemptLimit, delaySec, reason }));
      await sleep(delayMs);
    }
  }

  throw new Error(lastError || 'Falha ao extrair dados via IA.');
};

const partsFromUploadedFiles = async (files: UploadedFiles) => {
  const labeled: Array<{ file: File; label: string }> = [];
  if (files.proposal) labeled.push({ file: files.proposal, label: 'PROPOSTA' });
  if (files.pi) labeled.push({ file: files.pi, label: 'PI' });
  if (files.email) labeled.push({ file: files.email, label: 'EMAIL' });
  if (files.pmOpec) labeled.push({ file: files.pmOpec, label: 'OPEC' });

  const parts: any[] = [{ text: promptText }];
  for (const item of labeled) {
    const b64 = await fileToBase64(item.file);
    const mimeType = item.file.type || 'application/pdf';
    parts.push({ text: `ARQUIVO: ${item.label}` });
    parts.push({ inlineData: { mimeType, data: b64 } });
  }
  return parts;
};

export const extractCampaignJsonTextFromFiles = async (args: {
  files: UploadedFiles;
  availableKeys: string[];
  onStatus?: (status: string) => void;
}) => {
  const { files, availableKeys, onStatus } = args;
  if (!availableKeys.length) throw new Error('Nenhuma chave API encontrada para processar.');

  const parts = await partsFromUploadedFiles(files);
  const tryModels = ['gemini-3-flash-preview'];

  let extractedText = '';
  let lastError = '';

  for (const key of availableKeys) {
    const ai = new GoogleGenAI({ apiKey: key });

    for (const modelName of tryModels) {
      onStatus?.(`Analisando via ${modelName}...`);
      try {
        extractedText = await generateCampaignJsonTextWithRetry({
          ai,
          model: modelName,
          parts,
          onStatus,
        });
        break;
      } catch (err: any) {
        lastError = String(err?.message || err || 'Erro desconhecido');
      }
    }

    if (extractedText) break;
  }

  if (!extractedText) {
    throw new Error(`Falha na IA:\n\n${lastError}`);
  }

  return extractedText;
};
