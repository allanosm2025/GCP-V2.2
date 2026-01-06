import React from 'react';
import { FileType } from 'lucide-react';

const ProposalNameCard = (args: {
  proposalName: string;
  setProposalName: (name: string) => void;
}) => {
  const { proposalName, setProposalName } = args;

  return (
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
          Este nome será usado para gerar o link final do relatório (Ex: .../proposta/
          <strong>{proposalName || 'nome-do-arquivo'}</strong>.html)
        </p>
      </div>
    </div>
  );
};

export default ProposalNameCard;

