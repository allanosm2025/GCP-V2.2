import React from 'react';
import { Plus, TableProperties, Trash2 } from 'lucide-react';
import { StrategyItem, TechFeatures } from '../../types';
import { TechFeaturesDisplay, TechFeaturesEditor } from './TechFeatures';

interface InternalPMTableProps {
  strategies: StrategyItem[];
  title: string;
  badgeType: 'OPEC' | 'PROPOSAL';
  isEditing: boolean;
  currencySymbol: string;
  badgeColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  calculatedTotalCost: number;
  onAddRow: () => void;
  onRemoveRow: (id: number) => void;
  onRowChange: (id: number, field: keyof StrategyItem, value: any) => void;
  onTechToggle: (id: number, feature: keyof TechFeatures) => void;
}

const InternalPMTable: React.FC<InternalPMTableProps> = ({
  strategies,
  title,
  badgeType,
  isEditing,
  currencySymbol,
  badgeColor,
  Icon,
  calculatedTotalCost,
  onAddRow,
  onRemoveRow,
  onRowChange,
  onTechToggle,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <TableProperties className="w-5 h-5 mr-2 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isEditing ? 'Modo de Edição Ativo: Ajuste os valores da tabela.' : 'Detalhamento estratégico e custos.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isEditing && (
            <button
              onClick={onAddRow}
              className="flex items-center px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-all shadow-sm uppercase tracking-widest"
              type="button"
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

      <div className="md:hidden p-4 space-y-4">
        {strategies.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border ${isEditing ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'} p-4`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={item.platform}
                      onChange={(e) => onRowChange(item.id, 'platform', e.target.value)}
                      className="w-full font-bold text-gray-800 text-sm border-b border-purple-300 bg-transparent focus:outline-none"
                      placeholder="Plataforma"
                    />
                    <input
                      value={item.tactic}
                      onChange={(e) => onRowChange(item.id, 'tactic', e.target.value)}
                      className="w-full text-xs text-gray-500 border-b border-purple-300 bg-transparent focus:outline-none"
                      placeholder="Tática"
                    />
                  </div>
                ) : (
                  <>
                    <div className="font-bold text-gray-900 text-sm break-words">{item.platform}</div>
                    <div className="text-xs text-gray-500 break-words mt-1">{item.tactic}</div>
                  </>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={() => onRemoveRow(item.id)}
                  className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Formato</div>
                <div className="text-sm text-gray-700 text-right min-w-0">
                  {isEditing ? (
                    <input
                      value={item.format}
                      onChange={(e) => onRowChange(item.id, 'format', e.target.value)}
                      className="w-full text-right bg-white border border-purple-300 rounded px-2 py-1 text-xs"
                    />
                  ) : (
                    <span className="inline-block bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-500 break-words">
                      {item.format}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bid</div>
                <div className="text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={item.bidModel}
                        onChange={(e) => onRowChange(item.id, 'bidModel', e.target.value)}
                        className="bg-white text-[10px] font-bold border border-purple-300 rounded px-2 py-1 outline-none"
                      >
                        <option value="CPM">CPM</option>
                        <option value="CPC">CPC</option>
                        <option value="CPV">CPV</option>
                      </select>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-1">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.bidValue}
                          onChange={(e) => onRowChange(item.id, 'bidValue', parseFloat(e.target.value))}
                          className="w-28 text-right border border-purple-300 rounded px-2 py-1 bg-white focus:outline-none font-mono text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-mono text-gray-700">
                      <span className="text-gray-400 text-xs mr-2 uppercase">{item.bidModel}</span>
                      <span className="text-gray-400 text-xs mr-1">{currencySymbol}</span>
                      {item.bidValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Impressões</div>
                <div className="text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.impressionGoal}
                      onChange={(e) => onRowChange(item.id, 'impressionGoal', parseFloat(e.target.value))}
                      className="w-40 text-right border border-purple-300 rounded px-2 py-1 bg-white focus:outline-none font-mono text-xs"
                    />
                  ) : (
                    <span className="text-sm font-mono text-gray-700 font-semibold">
                      {item.impressionGoal > 0 ? item.impressionGoal.toLocaleString('pt-BR') : '-'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Custo</div>
                <div className="text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end">
                      <span className="mr-1 text-xs text-gray-400">{currencySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalCost}
                        onChange={(e) => onRowChange(item.id, 'totalCost', parseFloat(e.target.value))}
                        className="w-40 text-right border border-purple-300 rounded px-2 py-1 bg-white focus:outline-none font-mono text-xs font-bold text-gray-900"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-mono text-gray-900 font-bold">
                      <span className="text-gray-400 text-xs mr-1">{currencySymbol}</span>
                      {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-1">Tech</div>
                <div className="flex-1 flex justify-end">
                  {isEditing ? (
                    <TechFeaturesEditor item={item} onToggle={onTechToggle} />
                  ) : (
                    <TechFeaturesDisplay item={item} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isEditing && (
          <button
            onClick={onAddRow}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary hover:bg-purple-50 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center group"
            type="button"
          >
            <div className="bg-gray-200 rounded-full p-1 mr-2 group-hover:bg-primary group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Adicionar Nova Estratégia Manual
          </button>
        )}

        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Consolidado ({currencySymbol})</div>
          <div className="text-sm font-bold text-primary">
            {currencySymbol} {calculatedTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-3 sm:px-6 py-3 font-semibold border-b">Item da Estratégia</th>
              <th className="px-3 sm:px-6 py-3 font-semibold border-b">Specs (Formato)</th>
              <th className="px-3 sm:px-6 py-3 font-semibold border-b">Bid ({currencySymbol})</th>
              <th className="px-3 sm:px-6 py-3 font-semibold border-b text-right">Vol. Impressões</th>
              <th className="px-3 sm:px-6 py-3 font-semibold border-b text-right">Custo Tabela ({currencySymbol})</th>
              <th className="px-3 sm:px-6 py-3 font-semibold border-b text-center">Tech Flags</th>
              {isEditing && <th className="px-4 py-3 border-b"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {strategies.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors ${isEditing ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}
              >
                <td className="px-3 sm:px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {isEditing ? (
                      <>
                        <input
                          value={item.platform}
                          onChange={(e) => onRowChange(item.id, 'platform', e.target.value)}
                          className="font-bold text-gray-800 text-sm border-b border-purple-300 bg-transparent focus:outline-none"
                          placeholder="Plataforma"
                        />
                        <input
                          value={item.tactic}
                          onChange={(e) => onRowChange(item.id, 'tactic', e.target.value)}
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

                <td className="px-3 sm:px-6 py-4 text-sm text-gray-600">
                  {isEditing ? (
                    <input
                      value={item.format}
                      onChange={(e) => onRowChange(item.id, 'format', e.target.value)}
                      className="bg-white border border-purple-300 rounded px-2 py-1 text-xs w-full"
                    />
                  ) : (
                    <span className="inline-block bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-500">
                      {item.format}
                    </span>
                  )}
                </td>

                <td className="px-3 sm:px-6 py-4">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    {isEditing ? (
                      <select
                        value={item.bidModel}
                        onChange={(e) => onRowChange(item.id, 'bidModel', e.target.value)}
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
                        onChange={(e) => onRowChange(item.id, 'bidValue', parseFloat(e.target.value))}
                        className="w-20 border-b border-purple-300 bg-transparent focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono">
                        <span className="text-gray-400 text-xs mr-1">{currencySymbol}</span>
                        {item.bidValue.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.impressionGoal}
                      onChange={(e) => onRowChange(item.id, 'impressionGoal', parseFloat(e.target.value))}
                      className="w-24 text-right border-b border-purple-300 bg-transparent focus:outline-none font-mono text-sm"
                    />
                  ) : (
                    <span className="text-sm font-mono text-gray-600 font-semibold">
                      {item.impressionGoal > 0 ? item.impressionGoal.toLocaleString('pt-BR') : '-'}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right bg-gray-50/50">
                  {isEditing ? (
                    <div className="flex items-center justify-end">
                      <span className="mr-1 text-xs">{currencySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalCost}
                        onChange={(e) => onRowChange(item.id, 'totalCost', parseFloat(e.target.value))}
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

                <td className="px-6 py-4">
                  {isEditing ? (
                    <TechFeaturesEditor item={item} onToggle={onTechToggle} />
                  ) : (
                    <TechFeaturesDisplay item={item} />
                  )}
                </td>

                {isEditing && (
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onRemoveRow(item.id)}
                      className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {isEditing && (
              <tr>
                <td colSpan={7} className="p-2">
                  <button
                    onClick={onAddRow}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary hover:bg-purple-50 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center group"
                    type="button"
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
  );
};

export default InternalPMTable;
