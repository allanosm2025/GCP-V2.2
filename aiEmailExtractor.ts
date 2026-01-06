import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { EmailInteraction } from './types';
import { fileToBase64 } from './fileUtils';
import { pickApiKey } from './aiKeyRotation';
import { getGenerateResponseText, isRateLimitError, parseAiJsonObject } from './aiUtils';

export const extractEmailsFromFile = async (file: File): Promise<EmailInteraction[]> => {
  const availableKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(k => !!k);
  if (!availableKeys.length) {
    throw new Error('Nenhuma chave API encontrada para processar e-mails.');
  }

  const apiKey = pickApiKey(availableKeys as string[], 'email');

  const emailSchema: any = {
    type: Type.OBJECT,
    properties: {
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
        },
      },
    },
  };

  const systemInstruction = `
    Você é um AUDITOR DE MÍDIA SÊNIOR da One Station Media.
    Extraia APENAS a linha do tempo de e-mails do arquivo fornecido.
    
    REGRAS:
    1. Retorne APENAS JSON puro.
    2. Preencha 'emails' com CADA e-mail relevante em ordem cronológica.
    3. Campo 'type' deve ser um destes: initial | negotiation | approval.
    4. Seja objetivo no 'summary' (máximo 400 caracteres).
    5. Idioma: PT-BR.
  `;

  const promptText = `Extraia a thread de e-mail do arquivo. Não sumarize a thread em 1 item; gere múltiplos itens em 'emails' quando aplicável.`;
  const b64 = await fileToBase64(file);
  const mimeType = file.type || 'application/pdf';

  const parts: any[] = [
    { text: promptText },
    { text: 'ARQUIVO: EMAIL_THREAD_UPDATE' },
    { inlineData: { mimeType, data: b64 } },
  ];

  const ai = new GoogleGenAI({ apiKey });

  let extractedText = '';
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: emailSchema,
        temperature: 0.1,
        maxOutputTokens: 12000,
      },
    });

    extractedText = getGenerateResponseText(response);
    if (!extractedText.trim()) {
      throw new Error('Resposta da IA vazia.');
    }
  } catch (err: any) {
    const msg = err?.message || JSON.stringify(err);
    if (isRateLimitError(msg)) {
      throw new Error('Limite de requisições (429) atingido. Aguarde 30s e tente novamente.');
    }
    throw new Error(msg || 'Falha ao extrair e-mails.');
  }

  const parsed = parseAiJsonObject(extractedText);
  const emails = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as any)?.emails)
      ? (parsed as any).emails
      : [];

  return emails
    .filter((e: any) => e && (e.sender || e.summary))
    .map((e: any) => ({ date: e.date, sender: e.sender, type: e.type, summary: e.summary }));
};

