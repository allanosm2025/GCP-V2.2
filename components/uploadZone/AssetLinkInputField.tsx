import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

const AssetLinkInputField = (args: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const { label, value, placeholder, onChange } = args;

  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-lg bg-white/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-100">
          <LinkIcon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-slate-700 focus:outline-none bg-transparent placeholder-slate-300"
        />
      </div>
    </div>
  );
};

export default AssetLinkInputField;

