import React from 'react';
import { Zap } from 'lucide-react';

const UploadZoneHeader = () => {
  return (
    <div className="text-center mb-16 relative mt-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[220px] sm:h-[300px] bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-primary mb-4 uppercase tracking-widest">
        <Zap className="w-3 h-3 mr-2" /> GCP Automation Hub v2.1
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight">Setup da Campanha</h1>
      <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-lg font-light leading-relaxed">
        Carregue os documentos oficiais para iniciar o processo de auditoria por IA.
        <br />O sistema irá cruzar PI, Proposta, E-mails e OPEC automaticamente.
      </p>
    </div>
  );
};

export default UploadZoneHeader;

