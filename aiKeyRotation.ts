export const pickApiKey = (
  availableKeys: string[],
  purpose: 'process' | 'report' | 'email' | 'refine'
) => {
  if (!availableKeys.length) {
    throw new Error('Nenhuma chave API encontrada para processar.');
  }

  const storageKey = `gcp_gemini_key_index_${purpose}`;
  let idx = 0;
  try {
    const raw = localStorage.getItem(storageKey);
    idx = raw ? Number.parseInt(raw, 10) : 0;
    if (!Number.isFinite(idx)) idx = 0;
  } catch {
    idx = 0;
  }

  const normalizedIdx = ((idx % availableKeys.length) + availableKeys.length) % availableKeys.length;
  const selected = availableKeys[normalizedIdx];

  try {
    localStorage.setItem(storageKey, String((normalizedIdx + 1) % availableKeys.length));
  } catch {
  }

  return selected;
};

