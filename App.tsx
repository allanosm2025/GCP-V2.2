
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import FunProcessingView from './components/FunProcessingView';
import { UploadedFiles, AppState, DashboardTab, CampaignData, AssetLinks, EmailBatch } from './types';
import { INITIAL_CAMPAIGN_STATE } from './constants';
import { normalizeAuditItems } from './auditNormalization';
import { extractEmailsFromFile } from './aiEmailExtractor';
import { normalizeInitialEmailData } from './campaignEmailNormalization';
import { refineTextWithAi } from './aiTextRefiner';
import { incrementGeminiDailyUsage, loadGeminiDailyUsage } from './geminiUsageTracker';
import { getAvailableGeminiKeysOrAlert } from './geminiKeys';
import { processCampaignFromFiles } from './campaignProcessing';
import { useReportImport } from './useReportImport';
// Added missing ShieldCheck import from lucide-react
import { PlusCircle, ChevronDown, Trash2, User } from 'lucide-react';

// --- CONSTANTS FOR STORAGE ---
const STORAGE_KEY_STATE = 'gcp_app_state_v2';
const STORAGE_KEY_DATA = 'gcp_campaign_data_v2';

function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATE);
    return (saved as AppState) || 'upload';
  });

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [dailyUsage, setDailyUsage] = useState<number>(0);

  useEffect(() => {
    setDailyUsage(loadGeminiDailyUsage());
  }, []);

  const incrementUsage = () => {
    setDailyUsage(prev => incrementGeminiDailyUsage(prev));
  };

  const [files, setFiles] = useState<UploadedFiles>({
    pi: null, proposal: null, email: null, pmOpec: null
  });

  const [data, setData] = useState<CampaignData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_STATE));
  });

  const { reportImportOpen, reportImportStatus, cancelReportImport, importReportFile } = useReportImport({
    campaign: data,
    incrementUsage,
    onDone: (report) => {
      setData(prev => ({ ...prev, aiReport: report }));
      setActiveTab('report');
    },
  });

  useEffect(() => {
    setData(prev => {
      const normalizedAudit = normalizeAuditItems((prev as any)?.audit);
      return normalizeInitialEmailData({ ...prev, audit: normalizedAudit });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATE, appState);
  }, [appState]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateData = (newData: Partial<CampaignData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleLinksUpdate = (newLinks: AssetLinks) => {
    setData(prev => ({ ...prev, links: newLinks }));
  };

  const handleImportCampaign = (importedData: CampaignData) => {
    setData(normalizeInitialEmailData({ ...importedData, audit: normalizeAuditItems((importedData as any)?.audit) }));
    setFiles({ pi: null, proposal: null, email: null, pmOpec: null });
    setAppState('dashboard');
    setActiveTab('overview');
  };

  const handleAddEmailFile = async (file: File) => {
    const extractedEmails = await extractEmailsFromFile(file);

    setData(prev => {
      const base = normalizeInitialEmailData(prev);
      const maxId = Math.max(0, ...(base.emails || []).map(e => (typeof e.id === 'number' ? e.id : 0)));
      const emailsWithUniqueIds = extractedEmails.map((e, idx) => ({ ...e, id: maxId + idx + 1 }));

      const newBatch: EmailBatch = {
        id: `batch_${Date.now()}`,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        emails: emailsWithUniqueIds
      };

      return {
        ...base,
        emails: [...(base.emails || []), ...emailsWithUniqueIds],
        emailBatches: [...(base.emailBatches || []), newBatch]
      };
    });
  };


  const handleNewCampaign = () => {
    if (window.confirm("Iniciar nova campanha? Os dados não salvos serão perdidos.")) {
      setData(JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_STATE)));
      setFiles({ pi: null, proposal: null, email: null, pmOpec: null });
      setActiveTab('overview');
      setResetKey(prev => prev + 1);
      setAppState('upload');
      setIsProfileOpen(false);
    }
  };

  const handleHardReset = () => {
    if (window.confirm("ATENÇÃO: Limpar cache e reiniciar?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleProcess = async () => {
    const availableKeys = getAvailableGeminiKeysOrAlert();
    if (!availableKeys) return;

    setAppState('processing');
    setProcessingStatus("Iniciando auditoria completa...");
    incrementUsage();
    try {
      const normalized = await processCampaignFromFiles({
        files,
        availableKeys,
        currentCampaign: data,
        onStatus: setProcessingStatus,
      });
      setData(normalized);
      setAppState('dashboard');
    } catch (err: any) {
      const msg = String(err?.message || err || 'Erro desconhecido');
      console.error('Falha ao processar campanha:', err);
      alert(msg.includes('Falha na IA:') ? msg : `Falha ao processar os arquivos.\n\n${msg}`);
      setAppState('upload');
    }
  };

  if (appState === 'processing') return <FunProcessingView status={processingStatus} onCancel={handleHardReset} />;

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <header className="h-20 glass-header fixed top-0 w-full z-40 flex items-center px-4 sm:px-6 lg:px-8 justify-between shadow-sm gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="https://onestationmedia.com/wp-content/uploads/2021/02/logo-sem-fundo@300x-768x543.png" alt="Logo" className="h-9 sm:h-10 bg-white rounded-md px-2 py-1 flex-shrink-0" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 tracking-tight leading-none uppercase">Auditoria GCP Hub</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">One Station Media</span>
          </div>
        </div>

        {appState === 'dashboard' && (
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button onClick={handleNewCampaign} className="flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-lg hover:bg-purple-700 transition-all">
              <PlusCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Nova Campanha</span>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 sm:gap-3 group sm:pl-4 sm:border-l sm:border-slate-200">
                <div className="h-10 w-10 rounded-full bg-slate-100 border border-white shadow flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-60 glass-panel rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up">
                  <button onClick={handleHardReset} className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 flex items-center group transition-colors">
                    <Trash2 className="w-4 h-4 mr-3" />
                    <div className="flex flex-col">
                      <span className="font-bold">Limpar Cache</span>
                      <span className="text-[10px] uppercase opacity-60 font-medium">Reiniciar Aplicativo</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {reportImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm">
          <FunProcessingView
            status={reportImportStatus}
            onCancel={cancelReportImport}
            cancelLabel="Cancelar importação"
            mode="report"
          />
        </div>
      )}

      <div className="pt-20">
        {appState === 'upload' && (
          <UploadZone
            key={resetKey}
            onProcess={handleProcess}
            files={files}
            setFiles={setFiles}
            links={data.links}
            setLinks={handleLinksUpdate}
            onImport={handleImportCampaign}
            proposalName={data.proposalFileName}
            setProposalName={(name) => handleUpdateData({ proposalFileName: name })}
            dailyUsage={dailyUsage}
          />
        )}
        {appState === 'dashboard' && (
          <div className="flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onReset={handleHardReset} />
            <Dashboard
              activeTab={activeTab}
              data={data}
              onUpdate={handleUpdateData}
              onHardReset={handleHardReset}
              onRefineText={refineTextWithAi}
              onAddEmailFile={handleAddEmailFile}
              onImportReportFile={importReportFile}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
