const STORAGE_KEY = 'gemini_usage_tracker';

type UsageRecord = {
  date: string;
  count: number;
};

const todayKey = () => new Date().toDateString();

const safeParseRecord = (raw: string | null): UsageRecord | null => {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;

    const date = (obj as any).date;
    const count = (obj as any).count;
    if (typeof date !== 'string') return null;
    if (typeof count !== 'number' || !Number.isFinite(count)) return null;

    return { date, count };
  } catch {
    return null;
  }
};

export const loadGeminiDailyUsage = (): number => {
  const today = todayKey();
  const record = safeParseRecord(localStorage.getItem(STORAGE_KEY));

  if (record && record.date === today) {
    return record.count;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 } satisfies UsageRecord));
  } catch {
  }
  return 0;
};

export const incrementGeminiDailyUsage = (currentStateCount: number): number => {
  const today = todayKey();
  const record = safeParseRecord(localStorage.getItem(STORAGE_KEY));
  const base = record && record.date === today ? record.count : currentStateCount;
  const next = (record && record.date === today ? base : 0) + 1;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: next } satisfies UsageRecord));
  } catch {
  }

  return next;
};

