import React from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';

const DestinationUrlsEditor = (args: {
  urls: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}) => {
  const { urls, onAdd, onRemove, onChange } = args;

  return (
    <div className="bg-blue-50/50 rounded-2xl p-4 sm:p-6 border border-blue-100 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <label className="text-xs font-bold text-blue-700 uppercase flex items-center tracking-wide">
          <Globe className="w-4 h-4 mr-2" /> Landing Pages (Destino)
        </label>
        <button
          onClick={onAdd}
          className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center transition-all font-bold shadow-sm"
        >
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {urls.map((url, idx) => (
          <div key={idx} className="flex items-center group">
            <div className="flex-1 flex items-center border border-blue-200 rounded-xl bg-white overflow-hidden shadow-sm group-hover:border-blue-300 transition-colors">
              <span className="bg-blue-50 px-3 sm:px-4 py-3 text-xs text-blue-400 font-mono border-r border-blue-100">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => onChange(idx, e.target.value)}
                placeholder="https://site.com.br/landing?utm_source=one_station..."
                className="flex-1 px-3 sm:px-4 py-2 text-sm text-slate-700 focus:outline-none placeholder-slate-300"
              />
            </div>
            {urls.length > 0 && (
              <button
                onClick={() => onRemove(idx)}
                className="ml-2 sm:ml-3 p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {urls.length === 0 && (
          <div className="text-center py-6 text-sm text-blue-300 italic font-medium bg-white/50 rounded-xl border border-dashed border-blue-200">
            Nenhum link adicionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationUrlsEditor;

