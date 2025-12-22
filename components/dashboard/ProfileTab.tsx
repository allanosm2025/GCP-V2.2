import React from 'react';
import { Trophy, ShieldAlert, Smartphone, Users, MapPin, Target, Sparkles } from 'lucide-react';
import { CampaignData } from '../../types';
import { EditableArrayField, EditableNestedField } from '../EditableFields';

interface ProfileTabProps {
  data: CampaignData;
  isEditing: boolean;
  onUpdate: (field: keyof CampaignData, value: any) => void;
  onNestedUpdate: (parent: any, key: string, value: any) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ data, isEditing, onUpdate, onNestedUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-purple-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KPIs Primários</h3>
             <Trophy className="w-5 h-5 text-purple-300" />
          </div>
          <EditableArrayField 
            values={data.primaryKpis} 
            isEditing={isEditing} 
            onUpdate={(val: string[]) => onUpdate('primaryKpis', val)}
            className="space-y-2"
            renderItem={(kpi: string, idx: number) => (
              <div key={idx} className="flex items-center text-xs font-bold text-purple-900 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 shadow-sm">
                 <Sparkles className="w-3 h-3 mr-2 text-purple-400" /> {kpi}
              </div>
            )}
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Safety</h3>
             <ShieldAlert className="w-5 h-5 text-blue-300" />
          </div>
          <EditableNestedField 
            parent="targeting" 
            itemKey="brandSafety" 
            value={data.targeting.brandSafety} 
            isEditing={isEditing} 
            onUpdate={onNestedUpdate}
            className="text-sm font-bold text-slate-700 leading-tight block"
            rows={3}
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispositivos</h3>
             <Smartphone className="w-5 h-5 text-green-300" />
          </div>
          <EditableArrayField 
            values={data.targeting.devices} 
            isEditing={isEditing} 
            onUpdate={(val: string[]) => onNestedUpdate('targeting', 'devices', val)}
            className="flex flex-wrap gap-2"
            renderItem={(dev: string, idx: number) => (
              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold border border-slate-200 uppercase tracking-wider shadow-sm">
                {dev}
              </span>
            )}
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t-4 border-orange-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demográfico</h3>
             <Users className="w-5 h-5 text-orange-300" />
          </div>
          <EditableArrayField 
            values={data.targeting.demographics} 
            isEditing={isEditing} 
            onUpdate={(val: string[]) => onNestedUpdate('targeting', 'demographics', val)}
            className="flex flex-wrap gap-2"
            renderItem={(dem: string, idx: number) => (
              <span key={idx} className="text-[10px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg font-bold border border-orange-100 uppercase tracking-wider shadow-sm">
                {dem}
              </span>
            )}
          />
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/60 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" /> Segmentação Geográfica
               </h3>
               <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <EditableArrayField 
                    values={data.targeting.geo} 
                    isEditing={isEditing} 
                    onUpdate={(val: string[]) => onNestedUpdate('targeting', 'geo', val)}
                    className="flex flex-wrap gap-2"
                    renderItem={(g: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-white text-slate-700 text-xs rounded-lg border border-slate-200 font-medium shadow-sm">
                        {g}
                      </span>
                    )}
                  />
               </div>
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-primary" /> Interesses & Afinidades
               </h3>
               <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100/50">
                  <EditableArrayField 
                    values={data.targeting.interests} 
                    isEditing={isEditing} 
                    onUpdate={(val: string[]) => onNestedUpdate('targeting', 'interests', val)}
                    className="flex flex-wrap gap-2"
                    renderItem={(it: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-white text-primary text-xs rounded-lg border border-purple-100 font-bold shadow-sm">
                        {it}
                      </span>
                    )}
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};