import React from 'react';
import { Activity, Info } from 'lucide-react';

const QuotaMonitor = ({ count }: { count: number }) => {
  const LIMIT = 1500;
  const percentage = Math.min((count / LIMIT) * 100, 100);

  let color = 'bg-green-500';
  let textColor = 'text-green-700';
  let borderColor = 'border-green-200';

  if (percentage > 50) {
    color = 'bg-yellow-500';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-200';
  }
  if (percentage > 85) {
    color = 'bg-red-500';
    textColor = 'text-red-700';
    borderColor = 'border-red-200';
  }

  return (
    <div
      className={`static md:absolute md:top-0 md:right-0 mx-auto md:m-6 mt-6 md:mt-0 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border ${borderColor} w-full max-w-sm md:w-64 animate-fade-in-up transition-all hover:shadow-xl group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Activity className={`w-4 h-4 mr-2 ${textColor}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>API Monitor</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600">
          {count} / {LIMIT}
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span>Gemini 3 Flash</span>
        <div className="group relative">
          <Info className="w-3 h-3 hover:text-slate-600 cursor-help" />
          <div className="absolute right-0 top-4 w-48 bg-slate-800 text-white p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Estimativa baseada no limite diário gratuito da Google AI Studio (1.500 RPD).
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaMonitor;

