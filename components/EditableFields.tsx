import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Globe } from 'lucide-react';
import { CampaignData } from '../types';

interface EditableFieldProps {
  value: string | number;
  field: keyof CampaignData;
  type?: string;
  className?: string;
  prefix?: string;
  isEditing: boolean;
  privacyMode?: boolean;
  onUpdate: (field: keyof CampaignData, value: any) => void;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  value, field, type = "text", className = "", prefix = "", isEditing, privacyMode, onUpdate 
}) => {
  if (!isEditing) {
    const displayValue = privacyMode && typeof value === 'number' ? '***' : (typeof value === 'number' ? value.toLocaleString('pt-BR') : value);
    return <span className={className}>{prefix}{displayValue}</span>;
  }
  
  return (
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onUpdate(field, type === 'number' ? Number(e.target.value) : e.target.value)}
      className={`bg-white/50 border-b-2 border-primary/50 px-2 py-1 focus:outline-none focus:bg-white focus:border-primary w-full transition-colors ${className}`}
    />
  );
};

interface EditableLongTextFieldProps {
  value: string;
  field: keyof CampaignData;
  className?: string;
  rows?: number;
  isEditing: boolean;
  onUpdate: (field: keyof CampaignData, value: any) => void;
}

export const EditableLongTextField: React.FC<EditableLongTextFieldProps> = ({ 
  value, field, className = "", rows = 4, isEditing, onUpdate 
}) => {
  if (!isEditing) return <span className={`${className} block whitespace-pre-wrap leading-relaxed`}>{value}</span>;
  return (
    <textarea 
      rows={rows}
      value={value} 
      onChange={(e) => onUpdate(field, e.target.value)}
      className={`border border-primary/30 bg-white/50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 w-full rounded-lg text-sm transition-all resize-y ${className}`}
    />
  );
};

interface EditableNestedFieldProps {
  parent: 'legal' | 'targeting' | 'piEntities' | 'piSpecifics' | 'links';
  itemKey: string;
  value: string;
  className?: string;
  rows?: number;
  isEditing: boolean;
  onUpdate: (parent: any, key: string, value: any) => void;
}

export const EditableNestedField: React.FC<EditableNestedFieldProps> = ({ 
  parent, itemKey, value, className = "", rows = 2, isEditing, onUpdate 
}) => {
  if (!isEditing) return <span className={className}>{value || '-'}</span>;
  return (
    <textarea 
      rows={rows}
      value={value} 
      onChange={(e) => onUpdate(parent, itemKey, e.target.value)}
      className={`border border-primary/30 bg-white/50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 w-full rounded-lg text-sm transition-all ${className}`}
    />
  );
};

export const EditableLinkField = ({ itemKey, value, label, icon: Icon, isEditing, onUpdate }: any) => {
   return (
     <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/50 flex flex-col hover:shadow-sm transition-shadow">
        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center mb-2 tracking-wider">
           <Icon className="w-3 h-3 mr-1.5 text-primary" /> {label}
        </label>
        {isEditing ? (
           <input 
             type="text"
             value={value}
             onChange={(e) => onUpdate('links', itemKey, e.target.value)}
             placeholder="https://..."
             className="text-sm bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-blue-600 w-full"
           />
        ) : (
           <div className="truncate">
             {value ? (
               <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center truncate font-medium" title={value}>
                 <ExternalLink className="w-3 h-3 mr-1.5 flex-shrink-0" />
                 {value.replace(/^https?:\/\//, '')}
               </a>
             ) : (
               <span className="text-xs text-slate-400 italic">Vazio</span>
             )}
           </div>
        )}
     </div>
   )
};

export const EditableArrayField = ({ values, className = "", renderItem, isEditing, onUpdate }: any) => {
  const [localText, setLocalText] = useState((values || []).join(', '));

  useEffect(() => {
    setLocalText((values || []).join(', '));
  }, [isEditing, values]);

  const handleBlur = () => {
     const newArray = localText.split(',').map((s: string) => s.trim()).filter(Boolean);
     onUpdate(newArray);
  };

  if (isEditing) {
    return (
      <div className="w-full">
        <textarea 
           value={localText} 
           onChange={(e) => setLocalText(e.target.value)}
           onBlur={handleBlur}
           className="w-full border border-primary/30 bg-white/50 rounded-lg p-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20" 
           rows={3} 
        />
      </div>
    );
  }
  if (!values || values.length === 0) return <span className="text-slate-400 text-sm italic">Não informado</span>;
  return <div className={className}>{values.map((v: string, i: number) => renderItem(v, i))}</div>;
};

export const EditableDestinationUrls = ({ urls, isEditing, onUpdate }: any) => {
  if (isEditing) {
    return (
      <div className="space-y-2 w-full mt-2">
         {(urls || []).map((url: string, idx: number) => (
           <div key={idx} className="flex items-center space-x-2">
              <input value={url} onChange={(e) => {
                const newUrls = [...urls];
                newUrls[idx] = e.target.value;
                onUpdate(newUrls);
              }} className="flex-1 text-sm bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-primary focus:outline-none text-blue-600" />
              <button onClick={() => onUpdate(urls.filter((_: any, i: number) => i !== idx))} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
           </div>
         ))}
         <button onClick={() => onUpdate([...urls, ""])} className="text-xs text-primary font-bold hover:underline mt-1">+ Adicionar URL</button>
      </div>
    );
  }
  if (!urls || urls.length === 0) return <span className="text-xs text-slate-400 italic">Nenhum link de destino</span>;
  return (
    <ul className="space-y-1 w-full mt-2">
      {urls.map((url: string, idx: number) => (
         <li key={idx} className="flex items-start overflow-hidden">
            <Globe className="w-3 h-3 mr-2 mt-1 text-green-500 flex-shrink-0" />
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all block truncate" title={url}>{url}</a>
         </li>
      ))}
    </ul>
  );
};