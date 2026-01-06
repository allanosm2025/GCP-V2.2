export const cleanGeminiJsonText = (raw: string): string => {
  let cleanJson = (raw || '').trim();
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  }
  return cleanJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

export const getGenerateResponseText = (response: any): string => {
  const direct = response?.text;
  if (typeof direct === 'string') return direct;
  if (typeof direct === 'function') {
    try {
      const v = direct.call(response);
      if (typeof v === 'string') return v;
    } catch {
    }
  }

  const parts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const text = parts
      .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .filter(Boolean)
      .join('');
    if (text) return text;
  }

  return '';
};

const extractFirstJsonValueText = (text: string): string | null => {
  const s = (text || '').trim();
  const objStart = s.indexOf('{');
  const arrStart = s.indexOf('[');

  let start = -1;
  if (objStart === -1) start = arrStart;
  else if (arrStart === -1) start = objStart;
  else start = Math.min(objStart, arrStart);

  if (start === -1) return null;

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (stack.length && ch === stack[stack.length - 1]) stack.pop();

    if (i > start && stack.length === 0) {
      return s.slice(start, i + 1);
    }
  }

  return null;
};

export const parseAiJsonObject = (raw: string) => {
  const cleaned = cleanGeminiJsonText(raw)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\b-?Infinity\b/g, 'null')
    .replace(/\bNaN\b/g, 'null');

  try {
    return JSON.parse(cleaned);
  } catch {
    const extracted = extractFirstJsonValueText(cleaned);
    if (!extracted) throw new Error('Resposta da IA não contém JSON parseável.');

    const withoutTrailingCommas = extracted.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(withoutTrailingCommas);
  }
};

export const isRateLimitError = (message: string) => {
  const m = (message || '').toLowerCase();
  return m.includes('429') || m.includes('too many requests') || m.includes('resource_exhausted');
};

