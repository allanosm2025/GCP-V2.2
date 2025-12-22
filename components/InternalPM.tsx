
import React from 'react';
import { StrategyItem, TechFeatures } from '../types';
import {
  Target,
  MapPin,
  Database,
  Zap,
  MonitorSmartphone,
  TableProperties,
  Lock,
  Presentation,
  CheckSquare,
  Square,
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';

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

      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${themeColor}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Investimento Mídia ({currencySymbol})</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                <span className="text-sm font-medium text-gray-400 mr-1 align-top mt-1 inline-block">{currencySymbol}</span>
                {calculatedTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Icon className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isOpec ? 'Custo Técnico (Dólar)' : 'Custo Mídia (Real)'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-600">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Inventory Check (Impressões)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-600">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bid Médio Planejado ({currencySymbol})</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <span className="text-sm font-medium text-gray-400 mr-1 align-top mt-1 inline-block">{currencySymbol}</span>
            {totalImpressions > 0 ? ((calculatedTotalCost / totalImpressions) * 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
          </p>
        </div>
      </div>

      {/* Main Detailed Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-800 flex items-center">
              <TableProperties className="w-5 h-5 mr-2 text-primary" />
              {title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isEditing ? 'Modo de Edição Ativo: Ajuste os valores da tabela.' : 'Detalhamento estratégico e custos.'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing && (
              <button
                onClick={handleAddRow}
                className="flex items-center px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-all shadow-sm uppercase tracking-widest"
              >
                <Plus className="w-3 h-3 mr-1.5" /> Adicionar Linha
              </button>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded border flex items-center ${badgeColor}`}>
              <Icon className="w-3 h-3 mr-1" />
              {badgeType}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold border-b">Item da Estratégia</th>
                <th className="px-6 py-3 font-semibold border-b">Specs (Formato)</th>
                <th className="px-6 py-3 font-semibold border-b">Bid ({currencySymbol})</th>
                <th className="px-6 py-3 font-semibold border-b text-right">Vol. Impressões</th>
                <th className="px-6 py-3 font-semibold border-b text-right">Custo Tabela ({currencySymbol})</th>
                <th className="px-6 py-3 font-semibold border-b text-center">Tech Flags</th>
                {isEditing && <th className="px-4 py-3 border-b"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {strategies.map((item) => (
                <tr key={item.id} className={`transition-colors ${isEditing ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}>
                  {/* Platform & Tactic */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {isEditing ? (
                        <>
                          <input
                            value={item.platform}
                            onChange={(e) => handleRowChange(item.id, 'platform', e.target.value)}
                            className="font-bold text-gray-800 text-sm border-b border-purple-300 bg-transparent focus:outline-none"
                            placeholder="Plataforma"
                          />
                          <input
                            value={item.tactic}
                            onChange={(e) => handleRowChange(item.id, 'tactic', e.target.value)}
                            className="text-xs text-gray-500 border-b border-purple-300 bg-transparent focus:outline-none"
                            placeholder="Tática"
                          />
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-gray-800 text-sm">{item.platform}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{item.tactic}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Format */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {isEditing ? (
                      <input
                        value={item.format}
                        onChange={(e) => handleRowChange(item.id, 'format', e.target.value)}
                        className="bg-white border border-purple-300 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span className="inline-block bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-500">
                        {item.format}
                      </span>
                    )}
                  </td>

                  {/* Bid */}
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      {isEditing ? (
                        <select
                          value={item.bidModel}
                          onChange={(e) => handleRowChange(item.id, 'bidModel', e.target.value)}
                          className="bg-transparent text-[10px] font-bold border-b border-purple-300 mr-1 outline-none"
                        >
                          <option value="CPM">CPM</option>
                          <option value="CPC">CPC</option>
                          <option value="CPV">CPV</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400 mr-2 uppercase w-8">{item.bidModel}</span>
                      )}

                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={item.bidValue}
                          onChange={(e) => handleRowChange(item.id, 'bidValue', parseFloat(e.target.value))}
                          className="w-20 border-b border-purple-300 bg-transparent focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono">
                          <span className="text-gray-400 text-xs mr-1">{currencySymbol}</span>
                          {item.bidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Impressions */}
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.impressionGoal}
                        onChange={(e) => handleRowChange(item.id, 'impressionGoal', parseFloat(e.target.value))}
                        className="w-24 text-right border-b border-purple-300 bg-transparent focus:outline-none font-mono text-sm"
                      />
                    ) : (
                      <span className="text-sm font-mono text-gray-600 font-semibold">
                        {item.impressionGoal > 0 ? item.impressionGoal.toLocaleString('pt-BR') : '-'}
                      </span>
                    )}
                  </td>

                  {/* Total Cost */}
                  <td className="px-6 py-4 text-right bg-gray-50/50">
                    {isEditing ? (
                      <div className="flex items-center justify-end">
                        <span className="mr-1 text-xs">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.totalCost}
                          onChange={(e) => handleRowChange(item.id, 'totalCost', parseFloat(e.target.value))}
                          className="w-24 text-right border-b border-purple-300 bg-transparent focus:outline-none font-mono text-sm font-bold text-gray-900"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-gray-900 font-bold">
                        <span className="text-gray-400 text-xs mr-1">{currencySymbol}</span>
                        {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>

                  {/* Tech Features (Flags) */}
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.techFeatures.hasFirstParty} onChange={() => handleTechChange(item.id, 'hasFirstParty')} className="mr-1" />
                          CRM
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.techFeatures.hasFootfall} onChange={() => handleTechChange(item.id, 'hasFootfall')} className="mr-1" />
                          Geo
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.techFeatures.isRichMedia} onChange={() => handleTechChange(item.id, 'isRichMedia')} className="mr-1" />
                          Rich
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.techFeatures.isCrossDevice} onChange={() => handleTechChange(item.id, 'isCrossDevice')} className="mr-1" />
                          Cross
                        </label>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-2">
                        {item.techFeatures.hasFirstParty && (
                          <div title="1st Party Data" className="p-1.5 bg-blue-100 text-blue-700 rounded-md"><Database className="w-4 h-4" /></div>
                        )}
                        {item.techFeatures.hasFootfall && (
                          <div title="Footfall" className="p-1.5 bg-orange-100 text-orange-700 rounded-md"><MapPin className="w-4 h-4" /></div>
                        )}
                        {item.techFeatures.isRichMedia && (
                          <div title="Rich Media" className="p-1.5 bg-purple-100 text-purple-700 rounded-md"><Zap className="w-4 h-4" /></div>
                        )}
                        {item.techFeatures.isCrossDevice && (
                          <div title="Cross Device" className="p-1.5 bg-green-100 text-green-700 rounded-md"><MonitorSmartphone className="w-4 h-4" /></div>
                        )}
                        {!item.techFeatures.hasFirstParty && !item.techFeatures.hasFootfall && !item.techFeatures.isRichMedia && !item.techFeatures.isCrossDevice && (
                          <span className="text-gray-300 text-xs font-medium italic">Standard</span>
                        )}
                      </div>
                    )}
                  </td>

                  {isEditing && (
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleRemoveRow(item.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Botão de Adicionar Linha (Visível apenas em Edição) */}
              {isEditing && (
                <tr>
                  <td colSpan={7} className="p-2">
                    <button
                      onClick={handleAddRow}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary hover:bg-purple-50 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center group"
                    >
                      <div className="bg-gray-200 rounded-full p-1 mr-2 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      Adicionar Nova Estratégia Manual
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right font-bold text-gray-600 uppercase text-xs tracking-wider">
                  Total Consolidado ({currencySymbol})
                </td>
                <td className="px-6 py-4 text-right font-bold text-primary text-sm">
                  {currencySymbol} {calculatedTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
                {isEditing && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InternalPM;
