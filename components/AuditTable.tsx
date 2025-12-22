import React, { useState } from 'react';
import { AuditItem } from '../types';
import { CheckCircle, AlertTriangle, Pencil, Check, X, ShieldCheck } from 'lucide-react';

interface AuditTableProps {
  items: AuditItem[];
  onUpdate?: (items: AuditItem[]) => void;
}

const FIELD_LABELS: Record<string, string> = {
  startDate: "1. Data de Início",
  endDate: "2. Data de Término",
  grossBudget: "3. Investimento Bruto (Total)",
  netBudget: "4. Investimento Líquido",
  totalImpressions: "5. Total de Impressões",
  soldCPM: "6. CPM Vendido (Média)",
  campaignObjective: "7. Objetivo da Campanha",
  ctrCheck: "8. Meta de CTR (> 1%)",
  targetLocations: "9. Praças / Endereços"
};

const AuditTable: React.FC<AuditTableProps> = ({ items, onUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<AuditItem>>({});
  
  const [justifyingId, setJustifyingId] = useState<number | null>(null);
  const [justificationText, setJustificationText] = useState("");

  const startEdit = (item: AuditItem) => {
    setEditingId(item.id);
    setEditValues({ ...item });
    setJustifyingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = () => {
    if (!onUpdate || editingId === null) return;
    
    const updatedItems = items.map(item => {
      if (item.id === editingId) {
        // Auto-check consistency logic on save could go here, 
        // but for now we trust the user manual entry or keep consistency flag as is 
        // until they manually approve/override.
        return { ...item, ...editValues };
      }
      return item;
    });

    onUpdate(updatedItems);
    cancelEdit();
  };

  const openJustify = (id: number) => {
    setJustifyingId(id);
    setJustificationText("");
    setEditingId(null);
  };

  const saveApproval = (id: number) => {
    if (!onUpdate) return;
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          manuallyApproved: true, 
          justification: justificationText 
        };
      }
      return item;
    });
    onUpdate(updatedItems);
    setJustifyingId(null);
  };

  const handleInputChange = (field: keyof AuditItem, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 relative">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">Relatório de Divergências</h3>
        <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          Cross-Check 4 Vias (PI / Proposta / Email / OPEC)
        </span>
      </div>
      
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-[10px] md:text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold border-b">Item Verificado</th>
              <th className="px-4 py-3 font-semibold border-b text-blue-600">PI (Legal)</th>
              <th className="px-4 py-3 font-semibold border-b text-indigo-600">Proposta (Vendas)</th>
              <th className="px-4 py-3 font-semibold border-b text-orange-600">E-mail (Contexto)</th>
              <th className="px-4 py-3 font-semibold border-b text-purple-600">OPEC (Técnico)</th>
              <th className="px-4 py-3 font-semibold border-b text-center">Status</th>
              <th className="px-4 py-3 font-semibold border-b text-center w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const friendlyName = FIELD_LABELS[item.field] || item.field;
              const isEditingRow = editingId === item.id;
              const isJustifyingRow = justifyingId === item.id;

              return (
                <React.Fragment key={item.id}>
                  <tr className={`transition-colors ${isEditingRow ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-4 text-sm font-bold text-gray-800">{friendlyName}</td>
                    
                    {/* PI Value */}
                    <td className="px-4 py-4 text-sm text-gray-600 bg-blue-50/20">
                      {isEditingRow ? (
                        <input 
                          className="w-full border-b border-blue-300 bg-transparent focus:outline-none"
                          value={editValues.piValue || ''}
                          onChange={(e) => handleInputChange('piValue', e.target.value)}
                        />
                      ) : item.piValue}
                    </td>
                    
                    {/* Proposal Value */}
                    <td className={`px-4 py-4 text-sm bg-indigo-50/20 ${!item.isConsistent && item.proposalValue !== item.piValue && !item.manuallyApproved ? 'font-bold text-red-600' : 'text-gray-600'}`}>
                       {isEditingRow ? (
                        <input 
                          className="w-full border-b border-indigo-300 bg-transparent focus:outline-none"
                          value={editValues.proposalValue || ''}
                          onChange={(e) => handleInputChange('proposalValue', e.target.value)}
                        />
                      ) : item.proposalValue}
                    </td>

                    {/* Email Value */}
                    <td className={`px-4 py-4 text-sm bg-orange-50/20 ${!item.isConsistent && item.emailValue !== item.piValue && !item.manuallyApproved ? 'font-bold text-red-600' : 'text-gray-600'}`}>
                       {isEditingRow ? (
                        <input 
                          className="w-full border-b border-orange-300 bg-transparent focus:outline-none"
                          value={editValues.emailValue || ''}
                          onChange={(e) => handleInputChange('emailValue', e.target.value)}
                        />
                      ) : item.emailValue}
                    </td>
                    
                    {/* OPEC Value */}
                    <td className={`px-4 py-4 text-sm bg-purple-50/20 ${!item.isConsistent && item.pmValue !== item.piValue && !item.manuallyApproved ? 'font-bold text-red-600' : 'text-gray-600'}`}>
                       {isEditingRow ? (
                        <input 
                          className="w-full border-b border-purple-300 bg-transparent focus:outline-none"
                          value={editValues.pmValue || ''}
                          onChange={(e) => handleInputChange('pmValue', e.target.value)}
                        />
                      ) : item.pmValue}
                    </td>
                    
                    <td className="px-4 py-4 text-center">
                      {item.manuallyApproved ? (
                        <div className="flex flex-col items-center">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-help" title={item.justification}>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Aprovado*
                          </span>
                        </div>
                      ) : item.isConsistent ? (
                        <div className="flex flex-col items-center">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Erro
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                       {isEditingRow ? (
                         <div className="flex justify-center space-x-2">
                           <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Check size={18} /></button>
                           <button onClick={cancelEdit} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center space-y-2">
                            <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-primary transition-colors" title="Editar Valores">
                              <Pencil size={16} />
                            </button>
                            {(!item.isConsistent && !item.manuallyApproved) && (
                               <button 
                                 onClick={() => openJustify(item.id)} 
                                 className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200"
                               >
                                 Aprovar
                               </button>
                            )}
                         </div>
                       )}
                    </td>
                  </tr>
                  
                  {/* Justification Row / Modal */}
                  {isJustifyingRow && (
                    <tr className="bg-blue-50 animate-fade-in-up">
                      <td colSpan={7} className="px-4 py-4 border-b border-blue-100">
                         <div className="flex flex-col space-y-2">
                            <label className="text-xs font-bold text-blue-800 uppercase">Motivo da Aprovação / Ressalva:</label>
                            <textarea 
                              className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              rows={2}
                              placeholder="Descreva por que essa inconsistência é aceitável..."
                              value={justificationText}
                              onChange={(e) => setJustificationText(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                               <button 
                                 onClick={() => setJustifyingId(null)}
                                 className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800"
                               >
                                 Cancelar
                               </button>
                               <button 
                                 onClick={() => saveApproval(item.id)}
                                 className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                 disabled={!justificationText.trim()}
                               >
                                 Confirmar Aprovação
                               </button>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {items.some(i => !i.isConsistent && !i.manuallyApproved) && (
        <div className="bg-red-50 p-4 border-t border-red-100">
          <p className="text-sm text-red-800 font-medium">Atenção:</p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-1">
            {items.filter(i => !i.isConsistent && !i.manuallyApproved).map(i => (
              <li key={i.id}>{i.notes || `Inconsistência encontrada em ${FIELD_LABELS[i.field] || i.field}`}</li>
            ))}
          </ul>
        </div>
      )}
      
      {items.some(i => i.manuallyApproved) && (
        <div className="bg-green-50 p-4 border-t border-green-100">
           <p className="text-sm text-green-800 font-medium">Itens Aprovados Manualmente:</p>
           <ul className="list-disc list-inside text-sm text-green-700 mt-1">
            {items.filter(i => i.manuallyApproved).map(i => (
              <li key={i.id}>
                <span className="font-bold">{FIELD_LABELS[i.field] || i.field}:</span> {i.justification}
              </li>
            ))}
           </ul>
        </div>
      )}
    </div>
  );
};

export default AuditTable;