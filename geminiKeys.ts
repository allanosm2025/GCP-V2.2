const MISSING_KEYS_MESSAGE =
  'ERRO DE CONFIGURAÇÃO: Nenhuma chave API encontrada.\n\n' +
  '1. Verifique se o arquivo .env contém GEMINI_API_KEY=...\n' +
  '2. REINICIE O SERVIDOR (pare com Ctrl+C e rode npm run dev novamente) para carregar o arquivo.\n' +
  '3. Na Vercel, confirme as Variáveis de Ambiente.';

export const getAvailableGeminiKeys = (): string[] =>
  [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(Boolean) as string[];

export const getAvailableGeminiKeysOrAlert = (): string[] | null => {
  const keys = getAvailableGeminiKeys();
  if (!keys.length) {
    alert(MISSING_KEYS_MESSAGE);
    return null;
  }
  return keys;
};
