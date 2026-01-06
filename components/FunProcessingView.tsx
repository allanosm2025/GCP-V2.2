import React, { useEffect, useState } from 'react';
import { LogOut, Rocket, ShieldCheck } from 'lucide-react';

interface FunProcessingViewProps {
  status: string;
  onCancel?: () => void;
  cancelLabel?: string;
  mode?: 'campaign' | 'report';
}

const FunProcessingView: React.FC<FunProcessingViewProps> = ({
  status,
  onCancel,
  cancelLabel,
  mode,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages =
    mode === 'report'
      ? [
          'Abrindo arquivo do relatório...',
          'Convertendo arquivo para análise...',
          'Enviando conteúdo para a IA...',
          'Extraindo KPIs principais...',
          'Montando lista de publishers...',
          'Verificando demografia e metas...',
          'Validando estrutura do JSON...',
          'Preparando dashboard do relatório...',
        ]
      : [
          'Ativando Extração de Alta Fidelidade...',
          'Mapeando todas as linhas do plano de mídia...',
          'Sincronizando cláusulas detalhadas do PI...',
          'Cruzando histórico completo de negociação...',
          'Formatando cada item técnico do OPEC...',
          'Validando KPIs e metas de entrega por linha...',
          'Consolidando visão macro One Station...',
          'Auditando consistência item a item...',
          'Finalizando matriz de inteligência...',
          'Preparando dashboard completo...',
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
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: '1.5s' }}
      ></div>

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
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {mode === 'report' ? 'Report Mode' : 'Full Extraction Mode'}
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-primary animate-pulse text-center">
              {status || 'Extraindo todos os itens...'}
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight min-h-[80px] flex items-center justify-center">
            {messages[messageIndex]}
          </h2>
          <div className="w-full bg-slate-200/80 rounded-full h-2.5 mt-4 overflow-hidden shadow-inner border border-slate-300/50">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 font-medium italic">
            {mode === 'report'
              ? 'Gerando dashboard do relatório via IA.'
              : 'Extraindo 100% das linhas dos planos de mídia.'}
          </p>

          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-8 text-xs text-red-500 hover:text-red-700 underline opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center mx-auto"
            >
              <LogOut className="w-3 h-3 mr-1" /> {cancelLabel || 'Cancelar e Limpar Cache'}
            </button>
          )}
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

export default FunProcessingView;
