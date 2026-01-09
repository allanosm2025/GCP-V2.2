
import React, { useState } from 'react';
import { DashboardTab, CampaignData, AuditItem, StrategyItem } from '../types';
import AuditTable from './AuditTable';
import EmailTimeline from './EmailTimeline';
import InternalPM from './InternalPM';
import { OverviewTab } from './dashboard/OverviewTab';
import { ProfileTab } from './dashboard/ProfileTab';
import { PITab } from './dashboard/PITab';
import { ChatTab } from './dashboard/ChatTab';
import { ReportTab } from './dashboard/ReportTab';
import { downloadCampaignReport } from './ReportGenerator';
import { downloadCommercialReport } from './ReportGeneratorCommercial';
import {
  Download,
  Pencil,
  Save,
  CloudUpload,
  Building2,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  activeTab: DashboardTab;
  data: CampaignData;
  onUpdate: (data: Partial<CampaignData>) => void;
  onHardReset: () => void;
  onRefineText?: (text: string) => Promise<string>;
  onAddEmailFile?: (file: File) => Promise<void>;
  onImportReportFile?: (file: File) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, data, onUpdate, onHardReset, onRefineText, onAddEmailFile, onImportReportFile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);

  const handleDownload = () => downloadCampaignReport(data);
  const handleDownloadCommercial = () => downloadCommercialReport(data);

  const handlePublishToServer = async () => {
    setIsPublishing(true);
    const fileName = data.proposalFileName
      ? `${data.proposalFileName.trim().replace(/\s+/g, '-')}.html`
      : `GCP_${data.clientName}_${data.campaignName.replace(/\s+/g, '_')}.html`;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPublicLink(`http://cv360.onrender.com/proposta/v2/${fileName}`);
    } catch (error) {
      alert("Erro ao publicar.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFieldChange = (field: keyof CampaignData, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleNestedChange = (parent: any, key: string, value: any) => {
    onUpdate({ [parent]: { ...data[parent as keyof CampaignData] as object, [key]: value } });
  };

  const renderHeader = () => (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm animate-fade-in-up">
      <div className="flex-1 md:mr-4 min-w-0">
        <div className="flex items-center space-x-2 text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{data.clientName}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight break-words">{data.campaignName}</h2>
        <div className="mt-2">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide border border-green-200 shadow-sm">
            {data.status}
          </span>
        </div>
      </div>
      <div className="mt-4 md:mt-0 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`w-full md:w-auto flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-bold shadow-sm transition-all ${isEditing ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300' : 'bg-white text-slate-600 border'
            }`}
        >
          {isEditing ? <><Save className="w-4 h-4 mr-2" /> Salvar</> : <><Pencil className="w-4 h-4 mr-2" /> Editar</>}
        </button>
        <button onClick={handlePublishToServer} disabled={isPublishing} className="w-full md:w-auto flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 bg-white border rounded-full text-sm font-bold text-slate-600 hover:text-primary transition-all shadow-sm">
          <CloudUpload className="w-4 h-4 mr-2" /> {isPublishing ? 'Publicando...' : 'Publicar Link'}
        </button>
        <button onClick={handleDownload} className="w-full md:w-auto flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-800 rounded-full text-sm font-bold text-white hover:bg-slate-900 transition-all shadow-lg">
          <Download className="w-4 h-4 mr-2" /> HTML Completo
        </button>
        <button onClick={handleDownloadCommercial} className="w-full md:w-auto flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-600 rounded-full text-sm font-bold text-white hover:bg-purple-700 transition-all shadow-lg">
          <Briefcase className="w-4 h-4 mr-2" /> HTML Comercial
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={data} isEditing={isEditing} onUpdate={handleFieldChange} onNestedUpdate={handleNestedChange} onRefineText={onRefineText} />;

      case 'profile':
        return <ProfileTab data={data} isEditing={isEditing} onUpdate={handleFieldChange} onNestedUpdate={handleNestedChange} />;

      case 'pi':
        return <PITab data={data} isEditing={isEditing} onUpdate={handleFieldChange} onNestedUpdate={handleNestedChange} />;

      case 'audit':
        return <AuditTable items={data.audit} onUpdate={(items) => onUpdate({ audit: items })} />;

      case 'pm_proposal':
        return <InternalPM strategies={data.pmProposalStrategies} totalBudget={data.totalBudget} title="Plano Comercial" badgeType="PROPOSAL" isEditing={isEditing} onUpdate={(s) => onUpdate({ pmProposalStrategies: s })} />;

      case 'pm_opec':
        return <InternalPM strategies={data.pmOpecStrategies} totalBudget={data.totalBudget} title="Plano Técnico (OPEC)" badgeType="OPEC" isEditing={isEditing} onUpdate={(s) => onUpdate({ pmOpecStrategies: s })} />;

      case 'email':
        return <EmailTimeline emails={data.emails} batches={data.emailBatches} onAddEmailFile={onAddEmailFile} />;

      case 'chat':
        return <ChatTab data={data} />;

      case 'report':
        return <ReportTab data={data} isEditing={isEditing} onImportReportFile={onImportReportFile} onUpdate={(report) => onUpdate({ aiReport: report })} />;

      default:
        return <div className="p-10 text-center text-slate-400">Em desenvolvimento.</div>;
    }
  };

  return (
    <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-10 min-h-screen pb-24 lg:pb-20">
      {renderHeader()}
      {publicLink && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <span className="text-sm text-green-800 font-medium break-all">Link: <a href={publicLink} className="underline font-bold text-blue-600" target="_blank">{publicLink}</a></span>
          <button onClick={() => { navigator.clipboard.writeText(publicLink); alert('Copiado!') }} className="text-[10px] bg-white px-3 py-1.5 rounded-lg border shadow-sm font-bold uppercase tracking-wider w-full sm:w-auto">Copiar</button>
        </div>
      )}
      <div className="animate-fade-in-up">{renderContent()}</div>
    </main>
  );
};

export default Dashboard;
