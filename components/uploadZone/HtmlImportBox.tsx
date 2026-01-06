import React from 'react';
import { Loader2, UploadCloud } from 'lucide-react';

const HtmlImportBox = (args: {
  isImporting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { isImporting, onChange } = args;

  return (
    <div className="w-full max-w-md">
      <div
        className={`relative group border-2 border-dashed border-slate-300 rounded-xl p-4 transition-all ${isImporting ? 'bg-blue-50 border-blue-400' : 'hover:border-blue-400 hover:bg-blue-50/50'} cursor-pointer`}
      >
        <input
          type="file"
          accept=".html"
          onChange={onChange}
          disabled={isImporting}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
          {isImporting ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" /> : <UploadCloud className="w-5 h-5 mr-3" />}
          <div className="text-left">
            <p className="text-sm font-bold">{isImporting ? 'Lendo Relatório...' : 'Importar Relatório Existente (Update)'}</p>
            <p className="text-[10px] opacity-70">{isImporting ? 'Restaurando estado...' : 'Carregue um arquivo .html gerado anteriormente'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlImportBox;

