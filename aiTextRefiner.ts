import { GoogleGenAI } from '@google/genai';
import { pickApiKey } from './aiKeyRotation';
import { getGenerateResponseText } from './aiUtils';

export const refineTextWithAi = async (text: string): Promise<string> => {
  const availableKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(k => !!k);
  if (!availableKeys.length) return text;

  const apiKey = pickApiKey(availableKeys as string[], 'refine');
  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await (genAI as any).models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          {
            text: `Aja como um Auditor de Mídia Sênior. Reescreva o seguinte texto de observação para ser mais profissional, conciso e técnico, mantendo os pontos principais. Texto: "${text}"`,
          },
        ],
      },
    });

    return getGenerateResponseText(response) || text;
  } catch {
    return text;
  }
};

