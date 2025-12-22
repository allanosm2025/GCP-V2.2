
import React from 'react';
import { Building2, Scale, FileText, AlertCircle, FileCheck, Info, Wallet, TrendingUp, Landmark } from 'lucide-react';
import { CampaignData } from '../../types';
import { EditableNestedField, EditableField } from '../EditableFields';

interface PITabProps {
  data: CampaignData;
  isEditing: boolean;
  onUpdate: (field: keyof CampaignData, value: any) => void;
  onNestedUpdate: (parent: any, key: string, value: any) => void;
}

export const PITab: React.FC<PITabProps> = ({ data, isEditing, onUpdate, onNestedUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Seção de Valores Financeiros do PI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-primary shadow-sm flex items-center justify-between">
           <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                 <Wallet className="w-3 h-3 mr-2 text-primary" /> Valor Bruto (PI)
              </h3>
              <div className="text-2xl font-black text-slate-800 flex items-baseline">
                 <span className="text-sm font-bold text-slate-400 mr-1">R$</span>
                 <EditableField 
                    value={data.totalBudget} 
                    field="totalBudget" 
                    type="number" 
                    isEditing={isEditing} 
                    onUpdate={onUpdate} 
                    className="bg-transparent font-black"
                 />
              </div>
           </div>
           <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-primary/40" />
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm flex items-center justify-between">
           <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                 <TrendingUp className="w-3 h-3 mr-2 text-emerald-500" /> Valor Líquido (PI)
              </h3>
              <div className="text-2xl font-black text-slate-800 flex items-baseline">
                 <span className="text-sm font-bold text-slate-400 mr-1">R$</span>
                 <EditableField 
                    value={data.netValue} 
                    field="netValue" 
                    type="number" 
                    isEditing={isEditing} 
                    onUpdate={onUpdate} 
                    className="bg-transparent font-black"
                 />
              </div>
           </div>
           <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center border-b pb-3">
              <Building2 className="w-5 h-5 mr-3 text-primary" /> Entidades Fiscais
           </h3>
           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Razão Social (Contratante)</label>
                 <EditableNestedField 
                    parent="piEntities" 
                    itemKey="razaoSocial" 
                    value={data.piEntities.razaoSocial} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-sm font-bold text-slate-800 block"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Veículo de Mídia (OSM)</label>
                 <EditableNestedField 
                    parent="piEntities" 
                    itemKey="vehicle" 
                    value={data.piEntities.vehicle} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-sm font-bold text-slate-800 block"
                 />
              </div>
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center border-b pb-3">
              <Scale className="w-5 h-5 mr-3 text-primary" /> Regras Jurídicas
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Pagamento</label>
                 <EditableNestedField 
                    parent="legal" 
                    itemKey="paymentTerms" 
                    value={data.legal.paymentTerms} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-xs font-medium text-slate-700 block bg-slate-50 p-2 rounded border shadow-inner"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Comissão</label>
                 <EditableNestedField 
                    parent="legal" 
                    itemKey="agencyCommission" 
                    value={data.legal.agencyCommission} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-xs font-medium text-slate-700 block bg-slate-50 p-2 rounded border shadow-inner"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cancelamento</label>
                 <EditableNestedField 
                    parent="legal" 
                    itemKey="cancellationPolicy" 
                    value={data.legal.cancellationPolicy} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-xs font-medium text-slate-700 block bg-slate-50 p-2 rounded border shadow-inner"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Multas</label>
                 <EditableNestedField 
                    parent="legal" 
                    itemKey="penalty" 
                    value={data.legal.penalty} 
                    isEditing={isEditing} 
                    onUpdate={onNestedUpdate}
                    className="text-xs font-medium text-red-700 block bg-red-50 p-2 rounded border border-red-100 shadow-inner"
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/60 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
         <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-3 text-primary" /> Descritivo Técnico do PI
         </h3>
         <div className="space-y-8">
            <div className="bg-white/50 p-6 rounded-xl border border-slate-100">
               <h4 className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  <Info className="w-3 h-3 mr-2 text-primary" /> Descrição do Plano no Contrato
               </h4>
               <EditableNestedField 
                  parent="piSpecifics" 
                  itemKey="description" 
                  value={data.piSpecifics.description} 
                  isEditing={isEditing} 
                  onUpdate={onNestedUpdate}
                  className="text-sm text-slate-700 leading-relaxed block"
                  rows={4}
               />
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl relative">
               <div className="absolute top-4 right-4"><FileCheck className="w-6 h-6 text-primary opacity-50" /></div>
               <h4 className="flex items-center text-[10px] font-black text-purple-300 uppercase tracking-widest mb-4">
                  <AlertCircle className="w-3 h-3 mr-2 text-primary" /> Considerações Especiais
               </h4>
               <EditableNestedField 
                  parent="piSpecifics" 
                  itemKey="considerations" 
                  value={data.piSpecifics.considerations} 
                  isEditing={isEditing} 
                  onUpdate={onNestedUpdate}
                  className="text-sm text-purple-50 leading-relaxed block bg-transparent border-none p-0 focus:ring-0"
                  rows={4}
               />
            </div>
         </div>
      </div>
    </div>
  );
};
