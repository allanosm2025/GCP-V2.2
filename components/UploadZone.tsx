import React, { useState } from 'react';
import { AlertCircle, FileCode, FileText, ShieldCheck, Table, Upload } from 'lucide-react';
import { UploadedFiles, AssetLinks, CampaignData } from '../types';
import AssetsPanel from './uploadZone/AssetsPanel';
import HtmlImportBox from './uploadZone/HtmlImportBox';
import ProposalNameCard from './uploadZone/ProposalNameCard';
import QuotaMonitor from './uploadZone/QuotaMonitor';
import UploadBox from './uploadZone/UploadBox';
import UploadZoneHeader from './uploadZone/UploadZoneHeader';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">

      <QuotaMonitor count={dailyUsage} />

      <UploadZoneHeader />

      <ProposalNameCard proposalName={proposalName} setProposalName={setProposalName} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-8 mb-12 sm:mb-16">
        <UploadBox file={files.pi} label="Pedido de Inserção (PI)" description="PDF do Contrato Assinado" accept=".pdf" Icon={FileText} onChange={handleFileChange('pi')} />
        <UploadBox file={files.proposal} label="Proposta Comercial" description="PDF do Plano de Mídia Vendido" accept=".pdf" Icon={FileCode} onChange={handleFileChange('proposal')} />
        <UploadBox file={files.email} label="Thread de E-mail" description="PDF/TXT do Histórico de Negociação" accept=".pdf,.txt" Icon={Upload} onChange={handleFileChange('email')} />
        <UploadBox file={files.pmOpec} label="PM OPEC (Técnico)" description="Excel ou PDF do Planejamento" accept=".xlsx, .xls, .pdf" Icon={Table} onChange={handleFileChange('pmOpec')} />
      </div>

      <AssetsPanel
        links={links}
        onLinkChange={handleLinkChange}
        onDestinationUrlChange={handleDestinationUrlChange}
        onAddDestinationUrl={addDestinationUrl}
        onRemoveDestinationUrl={removeDestinationUrl}
      />

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
          className={`group relative px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden w-full max-w-md ${isReady
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

        <HtmlImportBox isImporting={isImporting} onChange={handleHtmlImport} />

      </div>
    </div>
  );
};

export default UploadZone;
