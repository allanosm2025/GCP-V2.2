import React from 'react';
import { FileCheck, RefreshCw } from 'lucide-react';

const UploadBox = (args: {
  file: File | null | undefined;
  label: string;
  description: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon: any;
}) => {
  const { file, label, description, accept, onChange, Icon } = args;
  const hasFile = !!file;

  return (
    <label
      className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer select-none min-h-[200px] flex flex-col items-center justify-center ${hasFile
        ? 'border-green-500 bg-green-50 shadow-md'
        : 'border-slate-300 bg-white/60 hover:border-primary hover:bg-white/90 hover:shadow-glow'
        }`}
    >
      <input type="file" accept={accept} onChange={onChange} className="hidden" />

      {!hasFile ? (
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
        <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none animate-fade-in-up">
          <div className="h-14 w-14 rounded-full flex items-center justify-center bg-green-500 text-white shadow-sm">
            <FileCheck size={28} />
          </div>
          <div className="w-full px-2">
            <h3 className="font-bold text-sm text-green-800 uppercase tracking-wide">Arquivo Carregado</h3>
            <p
              className="text-sm text-slate-700 mt-1 font-semibold truncate max-w-[250px] mx-auto bg-white/50 py-1 px-3 rounded-md border border-green-200"
              title={file?.name}
            >
              {file?.name}
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

export default UploadBox;

