import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Mail,
  ShieldCheck,
  Briefcase,
  Table2,
  Presentation,
  Cpu,
  LogOut,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onReset?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onReset }) => {
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', shortLabel: 'Visão', icon: LayoutDashboard },
    { id: 'profile', label: 'Perfil & Targets', shortLabel: 'Perfil', icon: Briefcase },
    { id: 'email', label: 'E-mail Thread', shortLabel: 'E-mail', icon: Mail },
    { id: 'pi', label: 'Pedido de Inserção', shortLabel: 'PI', icon: FileText },
    { id: 'pm_proposal', label: 'Plano Proposta', shortLabel: 'Proposta', icon: Presentation },
    { id: 'pm_opec', label: 'Plano OPEC', shortLabel: 'OPEC', icon: Table2 },
    { id: 'audit', label: 'Auditoria GCP', shortLabel: 'Auditoria', icon: ShieldCheck },
    { id: 'report', label: 'Relatório IA', shortLabel: 'Relatório', icon: BarChart3 },
    { id: 'chat', label: 'Deep Chat IA', shortLabel: 'Chat', icon: Sparkles },
  ];

  return (
    <>
      <aside className="hidden lg:block w-72 fixed top-0 left-0 pt-24 h-screen z-10 px-4 pb-4">
        <div className="glass-panel h-full w-full rounded-2xl flex flex-col shadow-lg">
          <div className="p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center">
              <Cpu className="w-3 h-3 mr-2 text-primary" />
              Navegação
            </h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as DashboardTab)}
                    className={`relative w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                      ? 'text-white shadow-glow'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-100"></div>
                    )}

                    <Icon className={`relative z-10 mr-3 h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-4">
            <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Status do Sistema</p>
              <div className="flex items-center space-x-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                <span className="text-xs text-slate-600 font-medium">Gemini 3 Online</span>
              </div>
            </div>

            {onReset && (
              <button
                onClick={onReset}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Resetar / Sair
              </button>
            )}
          </div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-around py-2 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as DashboardTab)}
                className={`flex flex-col items-center justify-center min-w-[72px] py-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-tighter mt-1">{item.shortLabel}</span>
              </button>
            );
          })}

          {onReset && (
            <button
              onClick={onReset}
              className="flex flex-col items-center justify-center min-w-[72px] py-1 text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-tighter mt-1">Reset</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
