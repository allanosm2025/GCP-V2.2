
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import { UploadedFiles, AppState, DashboardTab, CampaignData, AssetLinks } from './types';
import { INITIAL_CAMPAIGN_STATE } from './constants';
// Added missing ShieldCheck import from lucide-react
import { Loader2, PlusCircle, ChevronDown, LogOut, Trash2, User, Zap, Brain, Scan, FileText, Sparkles, CheckCircle2, Rocket, ShieldCheck } from 'lucide-react';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// --- CONSTANTS FOR STORAGE ---
const STORAGE_KEY_STATE = 'gcp_app_state_v2';
const STORAGE_KEY_DATA = 'gcp_campaign_data_v2';

const FunProcessingView = ({ status }: { status: string }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "Ativando Extração de Alta Fidelidade...",
    "Mapeando todas as linhas do plano de mídia...",
    "Sincronizando cláusulas detalhadas do PI...",
    "Cruzando histórico completo de negociação...",
    "Formatando cada item técnico do OPEC...",
    "Validando KPIs e metas de entrega por linha...",
    "Consolidando visão macro One Station...",
    "Auditando consistência item a item...",
    "Finalizando matriz de inteligência...",
    "Preparando dashboard completo..."
  ];

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 95) return 95;
        const diff = Math.random() * 8;
        return Math.min(oldProgress + diff, 95);
      });
    }, 800);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-40 mb-12 group">
          <div className="absolute inset-0 bg-white/60 border border-white/80 rounded-xl backdrop-blur-xl flex items-center justify-center shadow-glass transform transition-transform group-hover:scale-105 overflow-hidden">
            <div className="relative z-20 animate-[bounce_1.5s_infinite]">
              <Rocket className="w-16 h-16 text-primary fill-indigo-50" strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute left-[-20%] right-[-20%] h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-[scan_2s_ease-in-out_infinite] z-30 opacity-60"></div>
        </div>

        <div className="text-center space-y-6 max-w-lg px-6">
          <div className="inline-flex flex-col items-center justify-center space-y-2 px-6 py-3 rounded-xl border shadow-sm backdrop-blur-sm bg-white/50 border-white/50">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 animate-pulse text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Full Extraction Mode</span>
            </div>
            <p className="text-sm font-mono font-bold text-primary animate-pulse text-center">
              {status || "Extraindo todos os itens..."}
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight min-h-[80px] flex items-center justify-center">
            {messages[messageIndex]}
          </h2>
          <div className="w-full bg-slate-200/80 rounded-full h-2.5 mt-4 overflow-hidden shadow-inner border border-slate-300/50">
            <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 font-medium italic">Extraindo 100% das linhas dos planos de mídia.</p>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 95%; opacity: 1; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

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
    const today = new Date().toDateString();
    try {
      const stored = JSON.parse(localStorage.getItem('gemini_usage_tracker') || '{}');
      if (stored.date === today) {
        setDailyUsage(stored.count || 0);
      } else {
        localStorage.setItem('gemini_usage_tracker', JSON.stringify({ date: today, count: 0 }));
        setDailyUsage(0);
      }
    } catch (e) {
      setDailyUsage(0);
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = dailyUsage + 1;
    setDailyUsage(newCount);
    localStorage.setItem('gemini_usage_tracker', JSON.stringify({ date: today, count: newCount }));
  };

  const [files, setFiles] = useState<UploadedFiles>({
    pi: null, proposal: null, email: null, pmOpec: null
  });

  const [data, setData] = useState<CampaignData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_STATE));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATE, appState);
  }, [appState]);

  // DEBUG: Verificar carregamento das chaves
  useEffect(() => {
    const key1 = process.env.GEMINI_API_KEY;
    console.log("Status da API Key 1:", key1 ? "Carregada (" + key1.substring(0, 4) + "...)" : "NÃO ENCONTRADA");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const refineTextWithAi = async (text: string): Promise<string> => {
    const availableKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(k => !!k);
    if (!availableKeys.length) return text;

    // Simple round-robin or random
    const apiKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    // @ts-ignore - SDK types mismatch workaround
    const genAI = new GoogleGenAI({ apiKey: apiKey! });

    try {
      // @ts-ignore - SDK types mismatch workaround
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [{ text: `Aja como um Auditor de Mídia Sênior. Reescreva o seguinte texto de observação para ser mais profissional, conciso e técnico, mantendo os pontos principais. Texto: "${text}"` }]
        }
      });
      return response.text || text;
    } catch (e) {
      console.error("AI Refine Error:", e);
      return text;
    }
  };

  const handleUpdateData = (newData: Partial<CampaignData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleLinksUpdate = (newLinks: AssetLinks) => {
    setData(prev => ({ ...prev, links: newLinks }));
  };

  const handleImportCampaign = (importedData: CampaignData) => {
    setData(importedData);
    setFiles({ pi: null, proposal: null, email: null, pmOpec: null });
    setAppState('dashboard');
    setActiveTab('overview');
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
    const availableKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(k => !!k);

    if (availableKeys.length === 0) {
      alert("ERRO DE CONFIGURAÇÃO: Nenhuma chave API encontrada.\n\n1. Verifique se o arquivo .env contém GEMINI_API_KEY=...\n2. REINICIE O SERVIDOR (pare com Ctrl+C e rode npm run dev novamente) para carregar o arquivo.\n3. Na Vercel, confirme as Variáveis de Ambiente.");
      return;
    }

    setAppState('processing');
    setProcessingStatus("Iniciando auditoria completa...");
    incrementUsage();

    const processedFiles: { file: File, base64: string, label: string }[] = [];
    const loadFile = async (file: File | null, label: string) => {
      if (file) {
        const b64 = await fileToBase64(file);
        processedFiles.push({ file, base64: b64, label });
      }
    };

    await loadFile(files.proposal, "PROPOSTA");
    await loadFile(files.pi, "PI");
    await loadFile(files.email, "EMAIL");
    await loadFile(files.pmOpec, "OPEC");

    const systemInstruction = `
      Você é um AUDITOR DE MÍDIA SÊNIOR da One Station Media. 
      Sua missão é a extração de dados estratégicos, técnicos e jurídicos com RIGOR TOTAL.
      
      DIRETRIZES DE EXTRAÇÃO (CRÍTICAS):
      1. NÃO SUMARIZE TABELAS: No 'pmProposalStrategies' e 'pmOpecStrategies', extraia TODAS as linhas individuais do plano de mídia. NÃO agrupe linhas nem resuma o conteúdo técnico. Se o documento tem 10 linhas de estratégia, o JSON deve conter 10 objetos nesses arrays.
      2. PRESERVAÇÃO TÉCNICA: Mantenha nomes de plataformas e KPIs exatamente como constam nos documentos.
      3. LIMITE DE TEXTO: Para campos de parágrafo (objetivo, tática), limite a 1000 caracteres, mas para LISTAS e TABELAS (estratégias), não há limite de quantidade de itens.
      4. AUDITORIA: Compare os documentos e aponte inconsistências entre eles.
      
      REGRAS DE FORMATO JSON:
      - Retorne APENAS o JSON puro.
      - Escape aspas internas: \\"exemplo\\".
      - Use ponto decimal em números.
      - Idioma: PT-BR.
    `;

    const promptText = `
        Realize a análise dos arquivos. 
        IMPORTANTE: No Plano Técnico (OPEC) e Plano Proposta, extraia CADA LINHA individualmente. 
        Não combine itens da tabela de preço. Se houver 5 formatos diferentes, quero 5 itens no array correspondente do JSON.
    `;

    const strategySchema: any = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        platform: { type: Type.STRING },
        tactic: { type: Type.STRING },
        format: { type: Type.STRING },
        bidModel: { type: Type.STRING },
        bidValue: { type: Type.NUMBER },
        totalCost: { type: Type.NUMBER },
        impressionGoal: { type: Type.NUMBER },
        techFeatures: {
          type: Type.OBJECT,
          properties: {
            hasFirstParty: { type: Type.BOOLEAN },
            hasFootfall: { type: Type.BOOLEAN },
            isRichMedia: { type: Type.BOOLEAN },
            isCrossDevice: { type: Type.BOOLEAN }
          }
        }
      }
    };

    const responseSchema: any = {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING },
        campaignName: { type: Type.STRING },
        startDate: { type: Type.STRING },
        endDate: { type: Type.STRING },
        totalBudget: { type: Type.NUMBER },
        netValue: { type: Type.NUMBER },
        piEntities: { type: Type.OBJECT, properties: { razaoSocial: { type: Type.STRING }, vehicle: { type: Type.STRING } } },
        objective: { type: Type.STRING },
        marketingTactic: { type: Type.STRING },
        emails: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, date: { type: Type.STRING }, sender: { type: Type.STRING }, summary: { type: Type.STRING }, type: { type: Type.STRING } } } },
        pmProposalStrategies: { type: Type.ARRAY, items: strategySchema },
        pmOpecStrategies: { type: Type.ARRAY, items: strategySchema },
        audit: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, field: { type: Type.STRING }, piValue: { type: Type.STRING }, proposalValue: { type: Type.STRING }, emailValue: { type: Type.STRING }, pmValue: { type: Type.STRING }, isConsistent: { type: Type.BOOLEAN }, notes: { type: Type.STRING } } } },
        targeting: { type: Type.OBJECT, properties: { geo: { type: Type.ARRAY, items: { type: Type.STRING } }, demographics: { type: Type.ARRAY, items: { type: Type.STRING } }, interests: { type: Type.ARRAY, items: { type: Type.STRING } }, devices: { type: Type.ARRAY, items: { type: Type.STRING } }, brandSafety: { type: Type.STRING } } },
        legal: { type: Type.OBJECT, properties: { paymentTerms: { type: Type.STRING }, agencyCommission: { type: Type.STRING }, cancellationPolicy: { type: Type.STRING }, penalty: { type: Type.STRING } } },
        piSpecifics: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, considerations: { type: Type.STRING } } },
        primaryKpis: { type: Type.ARRAY, items: { type: Type.STRING } },
        kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
        links: { type: Type.OBJECT, properties: { proposal: { type: Type.STRING }, pi: { type: Type.STRING }, priceTable: { type: Type.STRING }, emailThread: { type: Type.STRING }, creative: { type: Type.STRING }, addresses: { type: Type.STRING }, destinationUrls: { type: Type.ARRAY, items: { type: Type.STRING } } } }
      }
    };

    const parts: any[] = [{ text: promptText }];
    processedFiles.forEach(f => {
      let mimeType = f.file.type || 'application/pdf';
      parts.push({ text: `ARQUIVO: ${f.label}` });
      parts.push({ inlineData: { mimeType, data: f.base64 } });
    });

    // Updated model selection to align with task complexity
    const tryModels = ['gemini-3-pro-preview', 'gemini-3-flash-preview'];
    let extractedText = "";
    let lastError = "";

    for (const key of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const modelName of tryModels) {
        setProcessingStatus(`Extraindo linhas via ${modelName}...`);
        try {
          const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
              temperature: 0.1,
              maxOutputTokens: 65000, // Aumentado para prevenir cortes em documentos grandes
            }
          });
          extractedText = response.text || "";
          
          // Validação preliminar básica
          if (extractedText && (extractedText.trim().startsWith('{') || extractedText.trim().startsWith('```'))) {
             break;
          } else {
             console.warn(`Resposta inválida do modelo ${modelName}:`, extractedText?.substring(0, 100));
             extractedText = ""; // Descarta resposta inválida para forçar próxima tentativa
             throw new Error("Resposta da IA não é um JSON válido");
          }

        } catch (err: any) {
          lastError = err.message || JSON.stringify(err);
          console.error(`Erro com modelo ${modelName}:`, lastError);
          
          if (lastError.includes('429') || lastError.includes('503')) {
            setProcessingStatus(`Limite de API (429). Aguardando...`);
            await new Promise(r => setTimeout(r, 6000)); // Aumentado tempo de espera
          }
        }
      }
      if (extractedText) break;
    }

    if (!extractedText) {
      alert(`Falha na IA:\n\n${lastError}`);
      setAppState('upload');
      return;
    }

    try {
      setProcessingStatus("Sincronizando Dashboard...");

      let cleanJson = extractedText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      }
      cleanJson = cleanJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

      const extractedData = JSON.parse(cleanJson);

      const safeData: CampaignData = {
        ...INITIAL_CAMPAIGN_STATE,
        ...extractedData,
        proposalFileName: data.proposalFileName,
        status: 'Active'
      };

      setData(safeData);
      setAppState('dashboard');
    } catch (err: any) {
      console.error("JSON Error:", err);
      alert(`Erro na estrutura dos dados. Tente reprocessar.`);
      setAppState('upload');
    }
  };

  if (appState === 'processing') return <FunProcessingView status={processingStatus} />;

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <header className="h-20 glass-header fixed top-0 w-full z-40 flex items-center px-8 justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <img src="https://onestationmedia.com/wp-content/uploads/2021/02/logo-sem-fundo@300x-768x543.png" alt="Logo" className="h-10 bg-white rounded-md px-2 py-1" />
          <div className="hidden md:flex flex-col ml-2">
            <span className="text-sm font-bold text-slate-800 tracking-tight leading-none uppercase">Auditoria GCP Hub</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">One Station Media</span>
          </div>
        </div>

        {appState === 'dashboard' && (
          <div className="flex items-center gap-4">
            <button onClick={handleNewCampaign} className="flex items-center px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-lg hover:bg-purple-700 transition-all">
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Campanha
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-3 group pl-4 border-l border-slate-200">
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
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
