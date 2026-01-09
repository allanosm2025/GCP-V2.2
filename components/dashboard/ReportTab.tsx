import React, { useMemo, useRef, useState } from 'react';
import { BarChart3, Upload, CheckCircle2, TrendingUp, MousePointerClick, Target, Users, PieChart as PieChartIcon, Eye, Edit2, Save, X, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CampaignData, AiReport } from '../../types';

interface ReportTabProps {
  data: CampaignData;
  isEditing?: boolean;
  isStatic?: boolean;
  onImportReportFile?: (file: File) => Promise<void>;
  onUpdate?: (updatedReport: AiReport) => void;
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
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'partial':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'miss':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const MetricCard = ({ label, value, icon: Icon, colorClass, subtext, isEditing, onChange }: any) => (
  <div className={`glass-panel p-6 rounded-2xl border-t-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${colorClass}`}>
    <div className="flex justify-between items-start">
      <div className="w-full mr-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
        {isEditing ? (
          <input 
            type="text" 
            className="text-3xl font-extrabold text-slate-800 tracking-tight w-full bg-white/50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            defaultValue={value}
            onBlur={(e) => onChange && onChange(e.target.value)}
          />
        ) : (
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
        )}
        {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
      </div>
      <div className={`p-3 rounded-xl opacity-10 ${colorClass.replace('border-', 'bg-').replace('500', '100')}`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('border-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
      <div 
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${percent}%` }} 
      />
    </div>
  );
};

const COLORS = ['#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'];

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const describeArc = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const start2 = polarToCartesian(x, y, innerRadius, endAngle);
    const end2 = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", end.x, end.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 1, start.x, start.y,
        "L", start2.x, start2.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 0, end2.x, end2.y,
        "Z"
    ].join(" ");

    return d;       
}

const StaticDonutChart = ({ data }: { data: any[] }) => {
  let currentAngle = 0;
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <g>
          {data.map((entry, index) => {
            const share = parseFloat(entry.share);
            const angle = (share / 100) * 360;
            const endAngle = currentAngle + angle;
            const path = describeArc(100, 100, 40, 70, currentAngle, endAngle);
            currentAngle = endAngle;
            return <path key={index} d={path} fill={COLORS[index % COLORS.length]} />;
          })}
        </g>
      </svg>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
         {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-1">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
               <span className="text-[10px] text-slate-500 font-medium">{entry.label} ({Math.round(parseFloat(entry.share))}%)</span>
            </div>
         ))}
      </div>
    </div>
  );
};

export const ReportTab: React.FC<ReportTabProps> = ({ data, isEditing = false, isStatic = false, onImportReportFile, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [pubSort, setPubSort] = useState<'impressions' | 'clicks' | 'ctr'>('impressions');
  const [creativeSort, setCreativeSort] = useState<'impressions' | 'clicks' | 'ctr'>('impressions');
  const [bulkCreativeData, setBulkCreativeData] = useState('');

  const report = data.aiReport;

  const handleBulkImport = () => {
    if (!report || !onUpdate || !bulkCreativeData.trim()) return;

    const rows = bulkCreativeData.trim().split('\n');
    const newCreatives = [...(report.creatives || [])];
    let importedCount = 0;

    console.log('Iniciando importação de', rows.length, 'linhas');

    rows.forEach((row, index) => {
      if (!row.trim()) return;

      // Limpar caracteres invisíveis e normalizar espaços
      const cleanRow = row.replace(/[\u200B-\u200D\uFEFF]/g, '');

      // Ignorar cabeçalhos
      if (cleanRow.toLowerCase().includes('impressões') || cleanRow.toLowerCase().includes('ctr')) {
        return;
      }

      // Detect separator preference: Tab > Semicolon > Pipe > Multiple Spaces
      let parts = cleanRow.split('\t');
      if (parts.length < 2) parts = cleanRow.split(';');
      if (parts.length < 2) parts = cleanRow.split('|');
      if (parts.length < 2) parts = cleanRow.split(/\s{2,}/); // At least 2 spaces

      // Fallback: Smart Space Split (Se não detectou separador claro, tenta pegar as 3 últimas colunas como números)
      if (parts.length < 2) {
         const spaceParts = cleanRow.trim().split(/\s+/);
         if (spaceParts.length >= 4) {
            // Assume que as últimas 3 são métricas (CTR, Cliques, Impressões)
            const ctrStr = spaceParts.pop() || '';
            const clicksStr = spaceParts.pop() || '';
            const impStr = spaceParts.pop() || '';
            const nameStr = spaceParts.join(' '); // O resto é o nome
            parts = [nameStr, impStr, clicksStr, ctrStr];
         }
      }

      // Filter out empty parts
      parts = parts.map(p => p.trim()).filter(p => p !== '');

      if (parts.length < 2) {
        console.warn(`Linha ${index + 1} ignorada: formato não reconhecido.`, row);
        return; 
      }

      const name = parts[0];
      
      const parseMetric = (str: string, isInt: boolean) => {
        if (!str) return 0;
        // Remove R$, %, espaços e caracteres invisíveis
        let clean = str.replace(/[R$\s%\u00A0\u200B-\u200D\uFEFF]/g, '');
        
        if (isInt) {
          // Remove all non-digits for integers
          return parseInt(clean.replace(/[^0-9]/g, '')) || 0;
        } else {
          // Handle decimals (BR vs US)
          if (clean.includes(',')) {
             clean = clean.replace(/\./g, '').replace(',', '.');
          }
          return parseFloat(clean) || 0;
        }
      };

      const impressions = parseMetric(parts[1], true);
      const clicks = parts.length > 2 ? parseMetric(parts[2], true) : 0;
      const ctr = parts.length > 3 ? parseMetric(parts[3], false) : 0;

      newCreatives.push({
        name,
        impressions,
        clicks,
        ctr
      });
      importedCount++;
    });

    if (importedCount > 0) {
      onUpdate({ ...report, creatives: newCreatives });
      setBulkCreativeData('');
      alert(`${importedCount} criativos importados com sucesso!`);
    } else {
      alert('Não foi possível identificar os dados. Certifique-se de copiar as colunas corretamente (Nome | Impressões | Cliques | CTR).');
    }
  };

  const updateSummary = (field: keyof AiReport['summary'], value: string) => {
    if (!report || !onUpdate) return;
    const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    onUpdate({
      ...report,
      summary: {
        ...report.summary,
        [field]: isNaN(numValue) ? 0 : numValue
      }
    });
  };

  const updatePublisherName = (index: number, name: string) => {
    if (!report || !onUpdate) return;
    const newPublishers = [...report.publishers];
    newPublishers[index] = { ...newPublishers[index], name };
    onUpdate({ ...report, publishers: newPublishers });
  };

  const updateCreative = (index: number, field: keyof AiReport['creatives'][0], value: string) => {
    if (!report || !report.creatives || !onUpdate) return;
    const newCreatives = [...report.creatives];
    
    if (field === 'name') {
      newCreatives[index] = { ...newCreatives[index], name: value };
    } else {
      const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      newCreatives[index] = { ...newCreatives[index], [field]: isNaN(numValue) ? 0 : numValue };
    }
    
    onUpdate({ ...report, creatives: newCreatives });
  };

  const updateDemographic = (
    type: 'gender' | 'age',
    index: number,
    field: 'label' | 'share',
    value: string
  ) => {
    if (!report || !report.demographics || !onUpdate) return;
    
    const newDemographics = { ...report.demographics };
    const list = type === 'gender' ? [...(newDemographics.gender || [])] : [...(newDemographics.age || [])];
    
    if (index >= list.length) return;

    if (field === 'label') {
      list[index] = { ...list[index], label: value };
    } else {
      const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      list[index] = { ...list[index], share: isNaN(numValue) ? 0 : numValue };
    }

    if (type === 'gender') {
      newDemographics.gender = list;
    } else {
      newDemographics.age = list;
    }

    onUpdate({ ...report, demographics: newDemographics });
   };

   const updateConsideration = (index: number, value: string) => {
    if (!report || !report.considerations || !onUpdate) return;
    const newConsiderations = [...report.considerations];
    newConsiderations[index] = value;
    onUpdate({ ...report, considerations: newConsiderations });
   };

  const topPublishers = useMemo(() => {
    const pubs = report?.publishers || [];
    return pubs
      .filter(p => p && p.name)
      .slice()
      // Sort logic only applies when not editing to avoid jumping rows
      .sort((a, b) => {
        if (isEditing) return 0;
        if (pubSort === 'ctr') return (b.ctr || 0) - (a.ctr || 0);
        if (pubSort === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
        return (b.impressions || 0) - (a.impressions || 0);
      })
      .slice(0, 12);
  }, [report?.publishers, pubSort, isEditing]);

  const maxPubImpressions = useMemo(() => Math.max(...topPublishers.map(p => p.impressions || 0), 1), [topPublishers]);

  const topCreatives = useMemo(() => {
    const creatives = report?.creatives || [];
    return creatives
      .filter(c => c && c.name)
      .slice()
      .sort((a, b) => {
        if (creativeSort === 'ctr') return (b.ctr || 0) - (a.ctr || 0);
        if (creativeSort === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
        return (b.impressions || 0) - (a.impressions || 0);
      })
      .slice(0, 15);
  }, [report?.creatives, creativeSort]);

  const maxCreativeImpressions = useMemo(() => Math.max(...topCreatives.map(c => c.impressions || 0), 1), [topCreatives]);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-2xl border-l-4 border-indigo-500 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <BarChart3 className="w-32 h-32 text-indigo-600" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-indigo-600 uppercase tracking-widest font-bold mb-2">
              <BarChart3 className="w-4 h-4" />
              Relatório de Performance
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Importação e Análise IA</h2>
            <div className="mt-2 text-sm text-slate-600 max-w-xl">
              Importe o arquivo `.pdf` ou `.xlsx` da campanha para que nossa IA extraia os dados, gere insights e valide as metas automaticamente.
            </div>
            {report?.generatedAt && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Última atualização: <span className="font-medium text-slate-700">{new Date(report.generatedAt).toLocaleString('pt-BR')}</span>
                <span className="text-slate-300">|</span>
                <span className="italic">{report.sourceFileName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 shrink-0">
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
              className={`flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                !onImportReportFile
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isUploading
                    ? 'bg-indigo-50 text-indigo-700 cursor-wait border border-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processando Inteligência...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Relatório
                </>
              )}
            </button>
            {!onImportReportFile && (
              <div className="text-[10px] text-center text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                Configuração de IA necessária
              </div>
            )}
          </div>
        </div>
      </div>

      {!report && (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 bg-slate-50/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <BarChart3 className="w-8 h-8" />
          </div>
          <p className="font-medium">Nenhum relatório carregado</p>
          <p className="text-sm mt-1">Faça o upload acima para visualizar o dashboard.</p>
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Impressões Totais" 
              value={formatInt(report.summary?.impressions)} 
              icon={Eye} 
              colorClass="border-blue-500"
              isEditing={isEditing}
              onChange={(v: string) => updateSummary('impressions', v)}
            />
            <MetricCard 
              label="Cliques Totais" 
              value={formatInt(report.summary?.clicks)} 
              icon={MousePointerClick} 
              colorClass="border-purple-500" 
              isEditing={isEditing}
              onChange={(v: string) => updateSummary('clicks', v)}
            />
            <MetricCard 
              label="CTR Médio" 
              value={formatPercent(report.summary?.ctr)} 
              icon={Target} 
              colorClass="border-emerald-500"
              isEditing={isEditing}
              onChange={(v: string) => updateSummary('ctr', v)}
            />
          </div>

          <div className="flex flex-col gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-700">Top Publishers</h3>
                </div>
              </div>
              
              {topPublishers.length === 0 ? (
                <div className="text-center py-10 text-slate-400">Sem dados de publishers.</div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {topPublishers.map((p, idx) => (
                    <div key={`${p.name}_${idx}`} className="group">
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="font-bold text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
                          defaultValue={p.name}
                          onBlur={(e) => updatePublisherName(idx, e.target.value)}
                        />
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 truncate max-w-[150px]" title={p.name}>
                          {p.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full space-y-6">
               <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-700">Demografia</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gênero</h4>
                    {(report.demographics?.gender || []).length ? (
                      <div className="flex flex-col items-center">
                         {isStatic ? (
                           <StaticDonutChart data={report.demographics?.gender || []} />
                         ) : (
                           <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={report.demographics?.gender}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="share"
                                    nameKey="label"
                                  >
                                    {report.demographics?.gender?.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={['#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'][index % 4]} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    formatter={(value: number) => `${value.toFixed(0)}%`}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  />
                                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                              </ResponsiveContainer>
                           </div>
                         )}
                         
                         {isEditing && (
                           <div className="w-full space-y-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Editar Dados</p>
                              {report.demographics?.gender?.map((g, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    className="font-semibold text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 flex-grow focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    defaultValue={g.label}
                                    onBlur={(e) => updateDemographic('gender', idx, 'label', e.target.value)}
                                  />
                                  <div className="flex items-center gap-1 w-20 shrink-0">
                                    <input 
                                      type="text" 
                                      className="text-right font-mono text-xs text-slate-500 bg-white border border-slate-200 rounded px-1 w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                                      defaultValue={g.share}
                                      onBlur={(e) => updateDemographic('gender', idx, 'share', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-400">%</span>
                                  </div>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Dados não disponíveis</div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Faixa Etária</h4>
                    {(report.demographics?.age || []).length ? (
                      <div className="space-y-3">
                        {report.demographics?.age?.map((a, idx) => (
                          <div key={idx} className="group">
                            <div className="flex justify-between text-xs mb-1">
                              {isEditing ? (
                                <>
                                  <input 
                                    type="text" 
                                    className="font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    defaultValue={a.label}
                                    onBlur={(e) => updateDemographic('age', idx, 'label', e.target.value)}
                                  />
                                  <div className="flex items-center gap-1">
                                    <input 
                                      type="text" 
                                      className="text-right font-mono text-slate-500 bg-white border border-slate-200 rounded px-1 w-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      defaultValue={a.share}
                                      onBlur={(e) => updateDemographic('age', idx, 'share', e.target.value)}
                                    />
                                    <span>%</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold text-slate-700">{a.label}</span>
                                  <span className="text-slate-500 font-mono">{typeof a.share === 'number' ? `${a.share.toFixed(0)}%` : '-'}</span>
                                </>
                              )}
                            </div>
                            <ProgressBar value={a.share || 0} max={100} color="bg-orange-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Dados não disponíveis</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-700">Status Geral</h3>
                </div>
                
                <div className={`rounded-xl p-4 border ${statusBadge(report.goalsCheck?.overallStatus)} bg-opacity-50 flex flex-col items-center text-center`}>
                    <div className="text-2xl font-black uppercase tracking-tight mb-1">{report.goalsCheck?.overallStatus || 'N/A'}</div>
                    <div className="text-xs font-medium opacity-80">Resultado Consolidado</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-700">Performance por Criativo / Formato</h3>
              </div>
              <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Top {topCreatives.length}
              </div>
            </div>
            {isEditing && (
               <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-grow">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Importar Dados em Massa (Copie e cole do Excel/Sheets)
                      </label>
                      <textarea
                        className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Cole aqui as linhas da sua planilha...\nFormato: Nome Impressões Cliques CTR\n(Aceita Tabulação, Espaços ou Copiar/Colar do Excel)`}
                        value={bulkCreativeData}
                        onChange={(e) => setBulkCreativeData(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleBulkImport}
                      disabled={!bulkCreativeData.trim()}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Importar
                    </button>
                  </div>
               </div>
            )}
            {topCreatives.length === 0 && !isEditing ? (
              <div className="text-center py-10 text-slate-400">Sem dados de criativos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="text-left py-3 font-semibold pl-2">Criativos/ Formatos</th>
                      <th 
                        className={`text-right py-3 font-semibold w-32 cursor-pointer transition-colors ${creativeSort === 'impressions' ? 'text-purple-600' : 'hover:text-purple-500'}`}
                        onClick={() => setCreativeSort('impressions')}
                      >
                        Impressões {creativeSort === 'impressions' && '↓'}
                      </th>
                      <th 
                        className={`text-right py-3 font-semibold w-24 cursor-pointer transition-colors ${creativeSort === 'clicks' ? 'text-purple-600' : 'hover:text-purple-500'}`}
                        onClick={() => setCreativeSort('clicks')}
                      >
                        Cliques {creativeSort === 'clicks' && '↓'}
                      </th>
                      <th 
                        className={`text-right py-3 font-semibold w-24 pr-2 cursor-pointer transition-colors ${creativeSort === 'ctr' ? 'text-purple-600' : 'hover:text-purple-500'}`}
                        onClick={() => setCreativeSort('ctr')}
                      >
                        CTR {creativeSort === 'ctr' && '↓'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topCreatives.map((c, idx) => (
                      <tr key={`${c.name}_${idx}`} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2">
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="font-bold text-slate-700 w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              defaultValue={c.name}
                              onBlur={(e) => updateCreative(idx, 'name', e.target.value)}
                            />
                          ) : (
                            <div className="font-bold text-slate-700">{c.name}</div>
                          )}
                          <div className="w-full max-w-[120px]">
                              <ProgressBar value={c.impressions || 0} max={maxCreativeImpressions} color="bg-purple-400" />
                          </div>
                        </td>
                        <td className="py-3 text-right text-slate-600 font-medium align-top pt-4">
                          {isEditing ? (
                              <input 
                                  type="text"
                                  className="text-right w-full bg-white border border-slate-200 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  defaultValue={c.impressions}
                                  onBlur={(e) => updateCreative(idx, 'impressions', e.target.value)}
                              />
                          ) : formatInt(c.impressions)}
                        </td>
                        <td className="py-3 text-right text-slate-600 font-medium align-top pt-4">
                          {isEditing ? (
                              <input 
                                  type="text"
                                  className="text-right w-full bg-white border border-slate-200 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  defaultValue={c.clicks}
                                  onBlur={(e) => updateCreative(idx, 'clicks', e.target.value)}
                              />
                          ) : formatInt(c.clicks)}
                        </td>
                        <td className="py-3 text-right text-slate-600 font-medium align-top pt-4 pr-2">
                          {isEditing ? (
                              <input 
                                  type="text"
                                  className="text-right w-full bg-white border border-slate-200 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  defaultValue={c.ctr}
                                  onBlur={(e) => updateCreative(idx, 'ctr', e.target.value)}
                              />
                          ) : (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                (c.ctr || 0) > 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {formatPercent(c.ctr)}
                              </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-700">Considerações & Insights</h3>
              </div>
              
              {(report.considerations || []).length ? (
                <div className="space-y-3">
                  {report.considerations?.map((c, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 border border-slate-100 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      {isEditing ? (
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          defaultValue={c}
                          rows={3}
                          onBlur={(e) => updateConsideration(idx, e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed">{c}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 text-center py-6">Sem considerações extraídas.</div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-700">Acompanhamento de Metas</h3>
              </div>

              {(report.goalsCheck?.items || []).length ? (
                <div className="space-y-3">
                  {report.goalsCheck?.items?.map((item, idx) => (
                    <div key={idx} className="group bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-sm">{item.goal}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-4 bg-slate-200 rounded-full"></span>
                              Meta: <span className="font-medium text-slate-700">{item.target || '-'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-4 bg-slate-200 rounded-full"></span>
                              Realizado: <span className="font-medium text-slate-700">{item.actual || '-'}</span>
                            </span>
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                              "{item.notes}"
                            </div>
                          )}
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 text-center py-6">Sem validação de metas extraída.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportTab;
