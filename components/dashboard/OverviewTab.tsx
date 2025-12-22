import React, { useState } from 'react';
import { Wallet, Calendar, Building2, Link as LinkIcon, FileText, ExternalLink, ImageIcon, MapPin, Globe, Lightbulb, Crosshair, Target, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { CampaignData } from '../../types';
import { EditableField, EditableLinkField, EditableDestinationUrls, EditableLongTextField } from '../EditableFields';

interface OverviewTabProps {
   data: CampaignData;
   isEditing: boolean;
   onUpdate: (field: keyof CampaignData, value: any) => void;
   onNestedUpdate: (parent: any, key: string, value: any) => void;
   onRefineText?: (text: string) => Promise<string>;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, isEditing, onUpdate, onNestedUpdate, onRefineText }) => {
   const [isRefining, setIsRefining] = useState(false);

   const handleRefine = async () => {
      if (!onRefineText || !data.overviewObservations) return;
      setIsRefining(true);
      try {
         const newText = await onRefineText(data.overviewObservations);
         onUpdate('overviewObservations', newText);
      } finally {
         setIsRefining(false);
      }
   };

   return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary via-purple-700 to-indigo-800 rounded-2xl shadow-glow-lg p-8 text-white mb-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
               <h1 className="text-4xl font-bold mb-2 tracking-tight">Painel de Controle</h1>
               <p className="text-purple-100 text-lg opacity-90 font-light max-w-2xl">
                  A Inteligência Artificial processou seus documentos. Valide os dados abaixo antes de gerar o GCP final.
               </p>
            </div>
         </div>

         <div className="glass-panel p-6 rounded-2xl border-l-4 border-primary">
            <h3 className="font-bold text-slate-700 flex items-center justify-between border-b pb-2 mb-4 text-sm uppercase tracking-wider">
               Budget Total (Bruto) <Wallet className="w-5 h-5 text-slate-400" />
            </h3>
            <div className="text-3xl font-bold text-slate-800 tracking-tight">
               R$ <EditableField value={data.totalBudget} field="totalBudget" type="number" isEditing={isEditing} onUpdate={onUpdate} />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">Valor total do PI</p>
         </div>

         <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-600">
            <h3 className="font-bold text-slate-700 flex items-center justify-between border-b pb-2 mb-4 text-sm uppercase tracking-wider">
               Período <Calendar className="w-5 h-5 text-slate-400" />
            </h3>
            <div className="flex flex-col space-y-1">
               <EditableField value={data.startDate} field="startDate" className="font-bold text-slate-800 text-lg" isEditing={isEditing} onUpdate={onUpdate} />
               <span className="text-[10px] text-slate-400 uppercase font-bold">Até</span>
               <EditableField value={data.endDate} field="endDate" className="font-bold text-slate-800 text-lg" isEditing={isEditing} onUpdate={onUpdate} />
            </div>
         </div>

         <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
            <h3 className="font-bold text-slate-700 flex items-center justify-between border-b pb-2 mb-4 text-sm uppercase tracking-wider">
               Anunciante <Building2 className="w-5 h-5 text-slate-400" />
            </h3>
            <EditableField value={data.clientName} field="clientName" className="text-xl font-bold text-slate-800" isEditing={isEditing} onUpdate={onUpdate} />
            <div className="mt-3"><span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] rounded-md font-bold border border-green-100 uppercase tracking-widest">Validado</span></div>
         </div>

         <div className="col-span-1 md:col-span-3 glass-panel rounded-2xl p-0 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b flex items-center justify-between backdrop-blur-sm">
               <h3 className="font-bold text-slate-700 text-lg flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-primary" /> Ativos Digitais
               </h3>
            </div>
            <div className="p-6 bg-white/40">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <EditableLinkField itemKey="proposal" label="Proposta" value={data.links.proposal} icon={FileText} isEditing={isEditing} onUpdate={onNestedUpdate} />
                  <EditableLinkField itemKey="pi" label="PI Assinado" value={data.links.pi} icon={FileText} isEditing={isEditing} onUpdate={onNestedUpdate} />
                  <EditableLinkField itemKey="priceTable" label="Tabela Preço" value={data.links.priceTable} icon={Wallet} isEditing={isEditing} onUpdate={onNestedUpdate} />
                  <EditableLinkField itemKey="emailThread" label="Thread E-mail" value={data.links.emailThread} icon={ExternalLink} isEditing={isEditing} onUpdate={onNestedUpdate} />
                  <EditableLinkField itemKey="creative" label="Criativos" value={data.links.creative} icon={ImageIcon} isEditing={isEditing} onUpdate={onNestedUpdate} />
                  <EditableLinkField itemKey="addresses" label="Endereços" value={data.links.addresses} icon={MapPin} isEditing={isEditing} onUpdate={onNestedUpdate} />
               </div>
               <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
                  <h4 className="text-xs font-bold text-blue-700 mb-1 flex items-center uppercase tracking-wider">
                     <Globe className="w-3 h-3 mr-2" /> Landing Pages
                  </h4>
                  <EditableDestinationUrls urls={data.links.destinationUrls || []} isEditing={isEditing} onUpdate={(newUrls: string[]) => onNestedUpdate('links', 'destinationUrls', newUrls)} />
               </div>
            </div>
         </div>

         <div className="col-span-1 md:col-span-3 glass-panel p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-accent"></div>
            <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center">
               <Lightbulb className="w-6 h-6 mr-2 text-primary" /> Inteligência Estratégica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/60 p-6 rounded-xl border">
                  <h4 className="flex items-center text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest"><Crosshair className="w-3 h-3 mr-2 text-primary" /> Objetivo Principal</h4>
                  <EditableLongTextField value={data.objective} field="objective" isEditing={isEditing} onUpdate={onUpdate} rows={6} />
               </div>
               <div className="bg-slate-50/80 p-6 rounded-xl border">
                  <h4 className="flex items-center text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest"><Target className="w-3 h-3 mr-2 text-primary" /> Tática de Mercado</h4>
                  <EditableLongTextField value={data.marketingTactic} field="marketingTactic" isEditing={isEditing} onUpdate={onUpdate} rows={6} />
               </div>
            </div>
         </div>

         <div className="col-span-1 md:col-span-3 glass-panel p-8 rounded-2xl border-l-4 border-yellow-500 relative overflow-hidden">
            <h3 className="font-bold text-slate-800 text-xl mb-4 flex items-center justify-between">
               <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-yellow-600" />
                  Observações Gerais & Auditoria Humana
               </div>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
               Espaço reservado para notas manuais, considerações finais ou pontos de atenção não capturados automaticamente.
            </p>
            <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
               <EditableLongTextField
                  value={data.overviewObservations || ""}
                  field="overviewObservations"
                  isEditing={isEditing}
                  onUpdate={onUpdate}
                  rows={4}
                  placeholder="Digite aqui suas observações sobre a campanha..."
               />
            </div>
         </div>
      </div>
   );
};