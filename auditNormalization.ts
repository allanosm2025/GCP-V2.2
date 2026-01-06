import { AUDIT_FIELD_KEYS, AuditFieldKey, AuditItem } from './types';

const normalizeAuditFieldKey = (rawField: unknown): AuditFieldKey | null => {
  if (typeof rawField !== 'string') return null;

  const raw = rawField.trim();
  if (!raw) return null;

  if ((AUDIT_FIELD_KEYS as readonly string[]).includes(raw)) return raw as AuditFieldKey;

  const normalized = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

  const map: Record<string, AuditFieldKey> = {
    datainicio: 'startDate',
    datadeinicio: 'startDate',
    startdate: 'startDate',
    inicioveiculacao: 'startDate',
    inicio: 'startDate',
    datatermino: 'endDate',
    datadetermino: 'endDate',
    enddate: 'endDate',
    fim: 'endDate',
    termino: 'endDate',
    investimentobruto: 'grossBudget',
    budgetbruto: 'grossBudget',
    valortotal: 'grossBudget',
    totalbudget: 'grossBudget',
    grossbudget: 'grossBudget',
    investimentoliquido: 'netBudget',
    budgetliquido: 'netBudget',
    valorliquido: 'netBudget',
    netvalue: 'netBudget',
    netbudget: 'netBudget',
    totaldeimpressoes: 'totalImpressions',
    totalimpressions: 'totalImpressions',
    impressoes: 'totalImpressions',
    impressions: 'totalImpressions',
    metaimpressoes: 'totalImpressions',
    impressiongoal: 'totalImpressions',
    cpmvendido: 'soldCPM',
    cpmmedio: 'soldCPM',
    soldcpm: 'soldCPM',
    cpm: 'soldCPM',
    objetivodacampanha: 'campaignObjective',
    objetivo: 'campaignObjective',
    campaignobjective: 'campaignObjective',
    ctrcheck: 'ctrCheck',
    metactr: 'ctrCheck',
    ctr: 'ctrCheck',
    vtr: 'ctrCheck',
    pracas: 'targetLocations',
    pracasenderecos: 'targetLocations',
    enderecos: 'targetLocations',
    geolocalizacao: 'targetLocations',
    localizacoes: 'targetLocations',
    targetlocations: 'targetLocations',
    geo: 'targetLocations',
  };

  return map[normalized] || null;
};

export const normalizeAuditItems = (rawItems: unknown): AuditItem[] => {
  const arr = Array.isArray(rawItems) ? rawItems : [];
  const byField = new Map<AuditFieldKey, any[]>();

  for (const raw of arr) {
    if (!raw || typeof raw !== 'object') continue;
    const field = normalizeAuditFieldKey((raw as any).field);
    if (!field) continue;
    const list = byField.get(field) || [];
    list.push(raw);
    byField.set(field, list);
  }

  const coerceString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return '-';
  };

  const scoreItem = (raw: any) => {
    const values = [raw?.piValue, raw?.proposalValue, raw?.emailValue, raw?.pmValue]
      .map(coerceString)
      .map(v => v.trim());
    return values.filter(v => v && v !== '-').length;
  };

  const pickBest = (list: any[]) => {
    if (!list.length) return null;
    let best = list[0];
    let bestScore = scoreItem(best);
    for (let i = 1; i < list.length; i++) {
      const s = scoreItem(list[i]);
      if (s > bestScore) {
        best = list[i];
        bestScore = s;
      }
    }
    return best;
  };

  const result: AuditItem[] = [];
  for (let i = 0; i < AUDIT_FIELD_KEYS.length; i++) {
    const field = AUDIT_FIELD_KEYS[i];
    const raw = pickBest(byField.get(field) || []);

    if (!raw) {
      result.push({
        id: i + 1,
        field,
        piValue: '-',
        proposalValue: '-',
        emailValue: '-',
        pmValue: '-',
        isConsistent: false,
        notes: 'Campo não retornado pela IA.',
      });
      continue;
    }

    const piValue = coerceString(raw.piValue);
    const proposalValue = coerceString(raw.proposalValue);
    const emailValue = coerceString(raw.emailValue);
    const pmValue = coerceString(raw.pmValue);

    const isConsistent =
      typeof raw.isConsistent === 'boolean'
        ? raw.isConsistent
        : [piValue, proposalValue, emailValue, pmValue].every(v => v === piValue);

    result.push({
      id: i + 1,
      field,
      piValue,
      proposalValue,
      emailValue,
      pmValue,
      isConsistent,
      notes: typeof raw.notes === 'string' ? raw.notes : undefined,
      manuallyApproved: typeof raw.manuallyApproved === 'boolean' ? raw.manuallyApproved : undefined,
      justification: typeof raw.justification === 'string' ? raw.justification : undefined,
    });
  }

  return result;
};

