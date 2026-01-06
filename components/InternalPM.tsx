
import React from 'react';
import { Lock, Presentation } from 'lucide-react';
import { StrategyItem, TechFeatures } from '../types';
import { InternalPMSummary } from './internalPM/InternalPMSummary';
import InternalPMTable from './internalPM/InternalPMTable';

interface InternalPMProps {
  strategies: StrategyItem[];
  totalBudget: number;
  title: string;
  badgeType: 'OPEC' | 'PROPOSAL';
  isEditing?: boolean;
  onUpdate?: (strategies: StrategyItem[]) => void;
}

const InternalPM: React.FC<InternalPMProps> = ({ strategies, title, badgeType, isEditing = false, onUpdate }) => {

  const totalImpressions = strategies.reduce((acc, curr) => acc + curr.impressionGoal, 0);
  const calculatedTotalCost = strategies.reduce((acc, curr) => acc + curr.totalCost, 0);

  const isOpec = badgeType === 'OPEC';
  const currencySymbol = isOpec ? 'U$' : 'R$'; // OPEC sempre em Dólar, Proposta em Real

  // Visual Themes
  const themeColor = isOpec ? 'border-gray-800' : 'border-indigo-600';
  const badgeColor = isOpec ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  const Icon = isOpec ? Lock : Presentation;

  const handleRowChange = (id: number, field: keyof StrategyItem, value: any) => {
    if (!onUpdate) return;
    const updated = strategies.map(s => s.id === id ? { ...s, [field]: value } : s);
    onUpdate(updated);
  };

  const handleTechChange = (id: number, feature: keyof TechFeatures) => {
    if (!onUpdate) return;
    const updated = strategies.map(s => {
      if (s.id === id) {
        return {
          ...s,
          techFeatures: {
            ...s.techFeatures,
            [feature]: !s.techFeatures[feature]
          }
        };
      }
      return s;
    });
    onUpdate(updated);
  };

  const handleAddRow = () => {
    if (!onUpdate) return;
    const newItem: StrategyItem = {
      id: Date.now(),
      platform: "Nova Plataforma",
      tactic: "Nova Tática",
      format: "Formato",
      bidModel: 'CPM',
      bidValue: 0,
      totalCost: 0,
      impressionGoal: 0,
      techFeatures: {
        hasFirstParty: false,
        hasFootfall: false,
        isRichMedia: false,
        isCrossDevice: false
      }
    };
    onUpdate([...strategies, newItem]);
  };

  const handleRemoveRow = (id: number) => {
    if (!onUpdate || !window.confirm("Deseja remover esta linha?")) return;
    onUpdate(strategies.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <InternalPMSummary
        themeColor={themeColor}
        currencySymbol={currencySymbol}
        isOpec={isOpec}
        totalImpressions={totalImpressions}
        calculatedTotalCost={calculatedTotalCost}
        Icon={Icon}
      />

      <InternalPMTable
        strategies={strategies}
        title={title}
        badgeType={badgeType}
        isEditing={isEditing}
        currencySymbol={currencySymbol}
        badgeColor={badgeColor}
        Icon={Icon}
        calculatedTotalCost={calculatedTotalCost}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onRowChange={handleRowChange}
        onTechToggle={handleTechChange}
      />
    </div>
  );
};

export default InternalPM;
