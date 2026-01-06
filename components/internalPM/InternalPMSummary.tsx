import React from 'react';

export const InternalPMSummary = (args: {
  themeColor: string;
  currencySymbol: string;
  isOpec: boolean;
  totalImpressions: number;
  calculatedTotalCost: number;
  Icon: React.ComponentType<{ className?: string }>;
}) => {
  const { themeColor, currencySymbol, isOpec, totalImpressions, calculatedTotalCost, Icon } = args;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${themeColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
              Investimento Mídia ({currencySymbol})
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              <span className="text-sm font-medium text-gray-400 mr-1 align-top mt-1 inline-block">
                {currencySymbol}
              </span>
              {calculatedTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Icon className="w-5 h-5 text-gray-300" />
        </div>
        <p className="text-xs text-gray-400 mt-2">{isOpec ? 'Custo Técnico (Dólar)' : 'Custo Mídia (Real)'}</p>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-600">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Inventory Check (Impressões)</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString('pt-BR')}</p>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-600">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bid Médio Planejado ({currencySymbol})</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          <span className="text-sm font-medium text-gray-400 mr-1 align-top mt-1 inline-block">{currencySymbol}</span>
          {totalImpressions > 0
            ? ((calculatedTotalCost / totalImpressions) * 1000).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0,00'}
        </p>
      </div>
    </div>
  );
};
