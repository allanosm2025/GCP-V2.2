import React, { useState } from 'react';
import { Upload, FileCheck, AlertCircle, Link as LinkIcon, Globe, Plus, Zap, FileCode, UploadCloud, Loader2, FileType, FileText, Table, RefreshCw, Trash2, ShieldCheck, Activity, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { UploadedFiles, AssetLinks, CampaignData } from '../types';

interface UploadZoneProps {
  onProcess: () => void;
  files: UploadedFiles;
  setFiles: React.Dispatch<React.SetStateAction<UploadedFiles>>;
  links: AssetLinks;
  setLinks: (links: AssetLinks) => void;
  onImport: (data: CampaignData) => void;
  proposalName: string;
  setProposalName: (name: string) => void;
  dailyUsage?: number;
}

// --- QUOTA MONITOR COMPONENT ---
const QuotaMonitor = ({ count }: { count: number }) => {
  // Estimated daily limit for Gemini 3 Flash Free Tier
  const LIMIT = 1500;
  const percentage = Math.min((count / LIMIT) * 100, 100);

  let color = "bg-green-500";
  let textColor = "text-green-700";
  let borderColor = "border-green-200";

  if (percentage > 50) {
    color = "bg-yellow-500";
    textColor = "text-yellow-700";
    borderColor = "border-yellow-200";
  }
  if (percentage > 85) {
    color = "bg-red-500";
    textColor = "text-red-700";
    borderColor = "border-red-200";
  }

  return (
    <div className={`absolute top-0 right-0 m-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border ${borderColor} w-64 animate-fade-in-up transition-all hover:shadow-xl group`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Activity className={`w-4 h-4 mr-2 ${textColor}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>API Monitor</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600">{count} / {LIMIT}</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.max(percentage, 2)}%` }}></div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span>Gemini 3 Flash</span>
        <div className="group relative">
          <Info className="w-3 h-3 hover:text-slate-600 cursor-help" />
          <div className="absolute right-0 top-4 w-48 bg-slate-800 text-white p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Estimativa baseada no limite diário gratuito da Google AI Studio (1.500 RPD).
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadZone: React.FC<UploadZoneProps> = ({
  onProcess,
  files,
  setFiles,
  links,
  setLinks,
  onImport,
  proposalName,
  setProposalName,
  dailyUsage = 0
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Handler simplificado para upload (substituição direta)
  const handleFileChange = (key: keyof UploadedFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
      setError(null);
    }
  };

  const handleLinkChange = (key: keyof AssetLinks, value: string) => setLinks({ ...links, [key]: value });

  const handleDestinationUrlChange = (index: number, value: string) => {
    const newUrls = [...links.destinationUrls];
    newUrls[index] = value;
    setLinks({ ...links, destinationUrls: newUrls });
  };
  const addDestinationUrl = () => setLinks({ ...links, destinationUrls: [...links.destinationUrls, ''] });
  const removeDestinationUrl = (index: number) => {
    const newUrls = links.destinationUrls.filter((_, i) => i !== index);
    setLinks({ ...links, destinationUrls: newUrls });
  };

  // Lógica de Importação HTML
  const handleHtmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];

      if (!file.name.toLowerCase().endsWith('.html')) {
        setError("Formato inválido. Por favor, selecione um arquivo .html.");
        fileInput.value = '';
        return;
      }

      setIsImporting(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const htmlContent = event.target?.result as string;
          let jsonString: string | null | undefined = null;
          const match = htmlContent.match(/<script id="gcp-raw-data" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
          if (match && match[1]) {
            jsonString = match[1];
          }

          if (!jsonString) {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              const scriptEl = doc.getElementById('gcp-raw-data');
              if (scriptEl) {
                jsonString = scriptEl.textContent;
              }
            } catch (domError) {
              console.warn("DOMParser failed", domError);
            }
          }

          if (!jsonString) {
            throw new Error("DADOS_NAO_ENCONTRADOS");
          }

          const jsonData = JSON.parse(jsonString) as CampaignData;

          if (!jsonData.clientName || !jsonData.audit) {
            throw new Error("ESTRUTURA_INVALIDA");
          }

          onImport(jsonData);

        } catch (err: any) {
          console.error("Import Error:", err);
          setError("Falha na importação. Arquivo incompatível.");
        } finally {
          setIsImporting(false);
          fileInput.value = '';
        }
      };

      reader.readAsText(file);
    }
  };

  const isReady = files.pi && files.proposal && files.email && files.pmOpec && proposalName.trim().length > 0;

  const handleProcessClick = () => {
    if (!isReady) {
      setError("Por favor, preencha o Nome da Proposta e faça o upload de todos os 4 arquivos obrigatórios.");
      return;
    }
    onProcess();
  };

  // Função Renderizadora Simplificada (Sem botão de remover)
  const renderUploadBox = (key: keyof UploadedFiles, label: string, description: string, accept: string, Icon: any) => {
    const file = files[key];
    const hasFile = !!file;

    return (
      <label
        className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer select-none min-h-[200px] flex flex-col items-center justify-center ${hasFile
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-slate-300 bg-white/60 hover:border-primary hover:bg-white/90 hover:shadow-glow'
          }`}
      >
        {/* Input Oculto mas funcional via Label */}
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange(key)}
          className="hidden"
        />

        {!hasFile ? (
          // ESTADO VAZIO
          <div className="flex flex-col items-center justify-center text-center space-y-4 pointer-events-none">
            <div className="h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110">
              <Icon size={32} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-700">{label}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto font-medium truncate px-2">{description}</p>
            </div>
          </div>
        ) : (
          // ESTADO PREENCHIDO (Sem botão de remover, apenas visualização)
          <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none animate-fade-in-up">
            <div className="h-14 w-14 rounded-full flex items-center justify-center bg-green-500 text-white shadow-sm">
              <FileCheck size={28} />
            </div>
            <div className="w-full px-2">
              <h3 className="font-bold text-sm text-green-800 uppercase tracking-wide">Arquivo Carregado</h3>
              <p className="text-sm text-slate-700 mt-1 font-semibold truncate max-w-[250px] mx-auto bg-white/50 py-1 px-3 rounded-md border border-green-200" title={file.name}>
                {file.name}
              </p>
            </div>
            <div className="flex items-center text-[10px] text-green-600 font-bold uppercase tracking-wider mt-2 opacity-70">
              <RefreshCw className="w-3 h-3 mr-1" /> Clique para substituir
            </div>
          </div>
        )}
      </label>
    );
  };

  const InputField = ({ label, valueKey, placeholder }: { label: string, valueKey: keyof AssetLinks, placeholder: string }) => (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-lg bg-white/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-100">
          <LinkIcon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={links[valueKey] as string}
          onChange={(e) => handleLinkChange(valueKey, e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-slate-700 focus:outline-none bg-transparent placeholder-slate-300"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative">

      {/* QUOTA MONITOR WIDGET */}
      <QuotaMonitor count={dailyUsage} />

      <div className="text-center mb-16 relative mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-primary mb-4 uppercase tracking-widest">
          <Zap className="w-3 h-3 mr-2" /> GCP Automation Hub v2.1
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Setup da Campanha</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
          Carregue os documentos oficiais para iniciar o processo de auditoria por IA.
          <br />O sistema irá cruzar PI, Proposta, E-mails e OPEC automaticamente.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center">
            <FileType className="w-4 h-4 mr-2 text-primary" />
            Nome da Proposta <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={proposalName}
            onChange={(e) => setProposalName(e.target.value)}
            placeholder="Ex: campanha-verao-2025"
            className="w-full text-lg font-bold text-slate-800 border-b-2 border-slate-200 focus:border-primary focus:outline-none py-2 bg-transparent placeholder-slate-300 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-2">
            Este nome será usado para gerar o link final do relatório (Ex: .../proposta/<strong>{proposalName || 'nome-do-arquivo'}</strong>.html)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
        {renderUploadBox('pi', 'Pedido de Inserção (PI)', 'PDF do Contrato Assinado', '.pdf', FileText)}
        {renderUploadBox('proposal', 'Proposta Comercial', 'PDF do Plano de Mídia Vendido', '.pdf', FileCode)}
        {renderUploadBox('email', 'Thread de E-mail', 'PDF/TXT do Histórico de Negociação', '.pdf,.txt', Upload)}
        {renderUploadBox('pmOpec', 'PM OPEC (Técnico)', 'Excel ou PDF do Planejamento', '.xlsx, .xls, .pdf', Table)}
      </div>

      <div className="glass-panel rounded-2xl p-8 mb-12 shadow-lg relative overflow-hidden border border-white/60">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50"></div>
        <div className="flex items-center mb-8 pb-4 border-b border-slate-100/50">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg text-white">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Ativos Digitais</h3>
            <p className="text-sm text-slate-500">URLs para o relatório final (Drive, Criativos, etc).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InputField label="Proposta Link" valueKey="proposal" placeholder="https://..." />
          <InputField label="PI Link" valueKey="pi" placeholder="https://..." />
          <InputField label="Tabela Preço" valueKey="priceTable" placeholder="https://..." />
          <InputField label="Thread Link" valueKey="emailThread" placeholder="https://..." />
          <InputField label="Criativos" valueKey="creative" placeholder="https://..." />
          <InputField label="Endereços" valueKey="addresses" placeholder="https://..." />
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold text-blue-700 uppercase flex items-center tracking-wide">
              <Globe className="w-4 h-4 mr-2" /> Landing Pages (Destino)
            </label>
            <button onClick={addDestinationUrl} className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center transition-all font-bold shadow-sm">
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {links.destinationUrls.map((url, idx) => (
              <div key={idx} className="flex items-center group">
                <div className="flex-1 flex items-center border border-blue-200 rounded-xl bg-white overflow-hidden shadow-sm group-hover:border-blue-300 transition-colors">
                  <span className="bg-blue-50 px-4 py-3 text-xs text-blue-400 font-mono border-r border-blue-100">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleDestinationUrlChange(idx, e.target.value)}
                    placeholder="https://site.com.br/landing?utm_source=one_station..."
                    className="flex-1 px-4 py-2 text-sm text-slate-700 focus:outline-none placeholder-slate-300"
                  />
                </div>
                {links.destinationUrls.length > 0 && (
                  <button onClick={() => removeDestinationUrl(idx)} className="ml-3 p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {links.destinationUrls.length === 0 && (
              <div className="text-center py-6 text-sm text-blue-300 italic font-medium bg-white/50 rounded-xl border border-dashed border-blue-200">
                Nenhum link adicionado.
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center shadow-lg rounded-r-xl animate-fade-in-up">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center pb-20 space-y-8">

        <button
          onClick={handleProcessClick}
          disabled={!isReady || isImporting}
          className={`group relative px-12 py-5 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden w-full max-w-md ${isReady
              ? 'bg-slate-900 text-white hover:shadow-primary/50 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {isReady && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          <span className="relative flex items-center justify-center">
            {isReady ? <><ShieldCheck className="w-5 h-5 mr-3" /> Processar & Auditar (AI)</> : 'Aguardando Arquivos e Nome...'}
          </span>
        </button>

        <div className="relative flex items-center w-full max-w-md">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">OU</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <div className="w-full max-w-md">
          <div className={`relative group border-2 border-dashed border-slate-300 rounded-xl p-4 transition-all ${isImporting ? 'bg-blue-50 border-blue-400' : 'hover:border-blue-400 hover:bg-blue-50/50'} cursor-pointer`}>
            <input
              type="file"
              accept=".html"
              onChange={handleHtmlImport}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
              {isImporting ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
              ) : (
                <UploadCloud className="w-5 h-5 mr-3" />
              )}
              <div className="text-left">
                <p className="text-sm font-bold">{isImporting ? "Lendo Relatório..." : "Importar Relatório Existente (Update)"}</p>
                <p className="text-[10px] opacity-70">{isImporting ? "Restaurando estado..." : "Carregue um arquivo .html gerado anteriormente"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UploadZone;