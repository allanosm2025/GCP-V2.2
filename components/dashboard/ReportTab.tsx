import React, { useMemo, useRef, useState } from 'react';
import { BarChart3, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CampaignData } from '../../types';

interface ReportTabProps {
  data: CampaignData;
  onImportReportFile?: (file: File) => Promise<void>;
}

const formatInt = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return value.toLocaleString('pt-BR');
};

const formatPercent = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toFixed(2).replace('.', ',')}%`;
};

const statusBadge = (status?: string) => {
  switch (status) {
    case 'hit':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'partial':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'miss':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const ReportTab: React.FC<ReportTabProps> = ({ data, onImportReportFile }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const report = data.aiReport;

  const topPublishers = useMemo(() => {
    const pubs = report?.publishers || [];
    return pubs
      .filter(p => p && p.name)
      .slice()
      .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
      .slice(0, 12);
  }, [report?.publishers]);

  const handlePickFile = () => {
    if (!onImportReportFile) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!onImportReportFile) return;

    setIsUploading(true);
    try {
      await onImportReportFile(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
              <BarChart3 className="w-3 h-3" />
              Relatório de Performance
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Importe um arquivo `.pdf` ou `.xlsx` para gerar o dashboard do relatório via IA.
            </div>
            {report?.generatedAt && (
              <div className="mt-2 text-[11px] text-slate-400 font-medium break-all">
                Última importação: {new Date(report.generatedAt).toLocaleString('pt-BR')} — {report.sourceFileName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={!onImportReportFile || isUploading}
            />
            <button
              onClick={handlePickFile}
              disabled={!onImportReportFile || isUploading}
              className={`flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all ${
                !onImportReportFile
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isUploading
                    ? 'bg-indigo-100 text-indigo-700 cursor-wait'
                    : 'bg-slate-900 text-white hover:bg-slate-950'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Processando...' : 'Importar Relatório'}
            </button>
          </div>
        </div>

        {!onImportReportFile && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="font-medium">
              Importação indisponível no momento. Verifique a configuração da IA.
            </div>
          </div>
        )}
      </div>

      {!report && (
        <div className="glass-panel p-10 rounded-2xl text-center text-slate-500">
          Nenhum relatório importado ainda.
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-primary shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impressões</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-800 tracking-tight">{formatInt(report.summary?.impressions)}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-purple-500 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliques</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-800 tracking-tight">{formatInt(report.summary?.clicks)}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-emerald-500 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CTR</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-800 tracking-tight">{formatPercent(report.summary?.ctr)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 border border-white/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Publishers</h3>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Top {topPublishers.length}</div>
              </div>
              {topPublishers.length === 0 ? (
                <div className="text-sm text-slate-400">Sem dados de publishers.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-widest">
                        <th className="text-left py-2">Publisher</th>
                        <th className="text-right py-2">Impressões</th>
                        <th className="text-right py-2">Cliques</th>
                        <th className="text-right py-2">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPublishers.map((p, idx) => (
                        <tr key={`${p.name}_${idx}`} className="border-t border-slate-100">
                          <td className="py-2 font-bold text-slate-700">{p.name}</td>
                          <td className="py-2 text-right text-slate-600 font-semibold">{formatInt(p.impressions)}</td>
                          <td className="py-2 text-right text-slate-600 font-semibold">{formatInt(p.clicks)}</td>
                          <td className="py-2 text-right text-slate-600 font-semibold">{formatPercent(p.ctr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Gênero</h3>
                <div className="flex flex-wrap gap-2">
                  {(report.demographics?.gender || []).length ? (
                    report.demographics?.gender?.map((g, idx) => (
                      <span key={`${g.label}_${idx}`} className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100 uppercase tracking-wider shadow-sm">
                        {g.label}{typeof g.share === 'number' ? ` (${g.share.toFixed(0)}%)` : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Sem dados.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Idade</h3>
                <div className="flex flex-wrap gap-2">
                  {(report.demographics?.age || []).length ? (
                    report.demographics?.age?.map((a, idx) => (
                      <span key={`${a.label}_${idx}`} className="text-[10px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg font-bold border border-orange-100 uppercase tracking-wider shadow-sm">
                        {a.label}{typeof a.share === 'number' ? ` (${a.share.toFixed(0)}%)` : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Sem dados.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Considerações</h3>
              {(report.considerations || []).length ? (
                <div className="space-y-2">
                  {report.considerations?.map((c, idx) => (
                    <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700">
                      {c}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Sem considerações extraídas.</div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Metas vs. Resultado</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusBadge(report.goalsCheck?.overallStatus)}`}>
                  {report.goalsCheck?.overallStatus || 'unknown'}
                </span>
              </div>

              {(report.goalsCheck?.items || []).length ? (
                <div className="space-y-2">
                  {report.goalsCheck?.items?.map((item, idx) => (
                    <div key={idx} className="bg-white/60 border border-white/70 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-sm break-words">{item.goal}</div>
                          <div className="mt-1 text-xs text-slate-500 break-words">
                            {item.target ? `Meta: ${item.target}` : 'Meta: -'}
                            {' • '}
                            {item.actual ? `Realizado: ${item.actual}` : 'Realizado: -'}
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-xs text-slate-600 break-words">{item.notes}</div>
                          )}
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Sem validação de metas extraída.</div>
              )}

              {(report.goalsCheck?.overallStatus === 'hit' || report.goalsCheck?.overallStatus === 'partial') && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  <div className="font-medium">Metas avaliadas com status: {report.goalsCheck?.overallStatus}.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportTab;
