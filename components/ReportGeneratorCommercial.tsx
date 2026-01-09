import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CampaignData } from '../types';
import { OverviewTab } from './dashboard/OverviewTab';
import { ProfileTab } from './dashboard/ProfileTab';
import { PITab } from './dashboard/PITab';
import ReportTab from './dashboard/ReportTab';
import AuditTable from './AuditTable';
import EmailTimeline from './EmailTimeline';
import InternalPM from './InternalPM';
import {
    LayoutDashboard,
    FileText,
    Mail,
    ShieldCheck,
    Briefcase,
    Presentation,
    BarChart3,
    Cpu,
    Shield,
    Building2
} from 'lucide-react';

// VERSÃO COMERCIAL - Sem aba OPEC
const TABS = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'profile', label: 'Perfil & Targets', icon: Briefcase },
    { id: 'email', label: 'E-mail Thread', icon: Mail },
    { id: 'pi', label: 'Pedido de Inserção', icon: FileText },
    { id: 'pm_proposal', label: 'Plano Proposta', icon: Presentation },
    { id: 'audit', label: 'Auditoria GCP', icon: ShieldCheck },
    { id: 'report', label: 'Relatório', icon: BarChart3 },
];

const CommercialReportLayout: React.FC<{ data: CampaignData }> = ({ data }) => {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 overflow-x-hidden">
            {/* Header Fixo */}
            <header className="h-20 bg-white/85 backdrop-blur-md fixed top-0 w-full z-50 flex items-center px-8 justify-between border-b border-white/30 shadow-sm">
                <div className="flex items-center space-x-3">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 720 405" 
                        className="h-10 w-auto bg-primary rounded-md px-2 py-1"
                        aria-label="Logo"
                    >
                        <path fill="#fff" d="M227.63,35.38s-80.9,16.11-114.77,74.33c-10.07,17.3-17.89,34.58-23.94,50.35l-50.53,46.95s34.52-24.5,85.29,5.03c53.09,30.89,48.27,72.66,48.27,72.66l15.49-66.8c10.88-13.14,22.2-28.6,32.32-46,33.86-58.22,7.87-136.51,7.87-136.51M176.1,152.04c-14.98.34-27.41-11.53-27.75-26.51-.34-14.98,11.53-27.4,26.51-27.75,14.98-.34,27.4,11.53,27.75,26.51.34,14.98-11.53,27.4-26.51,27.75"/>
                        <path fill="#fff" d="M116.94,225.59c-26.39-15.34-60.34-6.36-75.68,20.03-4.61,7.92-7.19,16.93-7.48,26.08l-2.04,94.39c-.03,1.26.63,2.43,1.72,3.06,1.09.63,2.44.63,3.51-.02l81.05-48.48c7.79-4.76,14.34-11.47,18.94-19.39,15.34-26.38,6.36-60.33-20.03-75.68M90.53,295.94c-13.58.11-24.68-10.81-24.79-24.39-.11-13.58,10.81-24.68,24.39-24.79,13.58-.11,24.68,10.81,24.79,24.39.11,13.58-10.81,24.68-24.39,24.79"/>
                        <path fill="#fff" d="M337.48,125.98c0,22.8-13.42,37.08-35.06,37.08s-35.2-14.28-35.2-37.08,13.42-36.94,35.2-36.94,35.06,14.43,35.06,36.94M289.58,125.98c0,10.53,4.91,16.88,12.84,16.88s12.7-6.35,12.7-16.88-4.9-16.59-12.7-16.59-12.84,6.2-12.84,16.59"/>
                        <path fill="#fff" d="M361,94.96c1.44,2.16,2.31,2.02,4.47.14,5.77-4.9,12.41-6.06,16.74-6.06,17.03,0,27.41,9.81,27.41,26.69v43.86c0,1.15-.72,1.88-1.88,1.88h-19.19c-1.15,0-1.88-.72-1.88-1.88v-40.98c0-5.92-3.03-9.23-8.08-9.23-6.92,0-10.82,5.05-10.82,14.72v35.49c0,1.15-.72,1.88-1.88,1.88h-19.19c-1.15,0-1.87-.72-1.87-1.88v-67.09c0-1.15.72-1.88,1.87-1.88h10.24c1.01,0,1.73.43,2.17,1.3l1.88,3.03Z"/>
                        <path fill="#fff" d="M466.33,161.48c-5.05,1.15-9.95,1.59-13.7,1.59-23.66,0-36.5-14.28-36.5-36.94s13.13-37.08,35.78-37.08c18.04,0,29.15,9.52,29.15,24.38,0,11.54-8.08,18.18-24.67,20.49l-16.88,2.45c2.74,5.05,6.35,7.21,13.13,7.21,3.03,0,7.21-.58,9.23-1.01l8.66-1.87c1.15-.29,1.88.14,2.17,1.3l4.04,15c.29,1.3-.29,2.02-1.44,2.31l-8.95,2.16ZM453.06,119.35c4.47-.43,6.64-2.45,6.64-5.63,0-3.46-2.89-5.19-8.66-5.19-6.2,0-12.55,4.04-12.98,13.13l15.01-2.31Z"/>
                        <path fill="#fff" d="M289.58,236.76c-13.99-3.18-20.34-9.52-20.34-20.49,0-14.57,10.39-23.08,28.14-23.08,6.64,0,13.56,1.15,18.76,2.31l7.21,1.73c1.15.29,1.73,1.15,1.3,2.31l-4.33,15c-.29,1.15-1.01,1.59-2.17,1.3l-7.36-1.73c-3.9-.87-9.96-1.44-13.42-1.44-3.75,0-5.92,1.3-5.92,3.61,0,1.45,1.3,3.03,3.75,3.75l12.27,2.89c13.85,3.32,20.05,9.81,20.05,21.06,0,14.57-10.39,23.23-27.99,23.23-6.35,0-14-.58-22.08-2.6l-7.65-1.88c-1.15-.29-1.73-1.15-1.3-2.31l4.33-15.29c.29-1.16,1.01-1.59,2.17-1.3l6.78,1.73c6.2,1.59,15,2.31,17.75,2.31,3.61,0,5.63-1.44,5.63-3.9,0-1.87-1.3-3.61-4.19-4.33l-11.4-2.88Z"/>
                        <path fill="#fff" d="M378.32,194.78c1.15,0,1.87.72,1.87,1.88v16.3c0,1.15-.72,1.88-1.87,1.88h-16.3v26.26c0,3.75,1.44,5.92,3.75,5.92,1.3,0,2.45-.15,3.61-.58,1.15-.43,2.02-.29,2.6.86l6.78,13.85c.43,1.01.29,2.02-.58,2.6-3.46,2.31-8.08,3.46-12.41,3.46-16.74,0-26.55-9.67-26.55-26.12v-26.26h-7.5c-1.15,0-1.88-.72-1.88-1.88v-16.3c0-1.15.72-1.88,1.88-1.88h7.5v-15.73c0-1.01.43-1.73,1.59-2.16l19.04-6.35c1.3-.43,2.16.14,2.16,1.59v22.65h16.3Z"/>
                        <path fill="#fff" d="M395.78,195.5c5.34-1.44,10.39-2.31,15.87-2.31,21.93,0,34.77,10.39,34.77,27.99v42.56c0,1.15-.72,1.88-1.88,1.88h-10.82c-1.15,0-1.73-.43-2.31-1.3l-1.3-2.6c-.86-1.73-2.17-2.02-4.62,0-3.75,3.32-9.52,5.48-15.58,5.48-17.17,0-27.41-8.51-27.41-23.09,0-13.42,10.68-21.35,28.57-21.35h13.56v-.29c-.58-6.2-5.92-9.81-14.14-9.81-2.88,0-6.2.58-9.38,1.44l-5.48,1.59c-1.15.29-1.88-.14-2.31-1.3l-4.48-15c-.43-1.3,0-2.02,1.3-2.31l5.63-1.59ZM411.07,237.05c-4.19,0-7.22,2.31-7.22,5.48,0,4.04,3.03,6.35,8.22,6.35,7.5,0,11.69-3.61,12.55-11.54v-.29h-13.56Z"/>
                        <path fill="#fff" d="M500.82,194.78c1.15,0,1.87.72,1.87,1.88v16.3c0,1.15-.72,1.88-1.87,1.88h-16.31v26.26c0,3.75,1.44,5.92,3.75,5.92,1.3,0,2.46-.15,3.61-.58,1.15-.43,2.02-.29,2.59.86l6.78,13.85c.43,1.01.29,2.02-.58,2.6-3.46,2.31-8.08,3.46-12.41,3.46-16.73,0-26.55-9.67-26.55-26.12v-26.26h-7.5c-1.15,0-1.88-.72-1.88-1.88v-16.3c0-1.15.72-1.88,1.88-1.88h7.5v-15.73c0-1.01.44-1.73,1.59-2.16l19.05-6.35c1.3-.43,2.16.14,2.16,1.59v22.65h16.31Z"/>
                        <path fill="#fff" d="M538.48,263.74c0,1.15-.72,1.88-1.88,1.88h-19.04c-1.15,0-1.88-.72-1.88-1.88v-48.91h-7.5c-1.15,0-1.88-.72-1.88-1.88v-16.3c0-1.15.72-1.88,1.88-1.88h28.42c1.15,0,1.88.72,1.88,1.88v67.09ZM538.04,172.27c0,8.22-4.62,13.27-12.84,13.27s-12.84-5.05-12.84-13.27,4.76-13.13,12.84-13.13,12.84,4.76,12.84,13.13"/>
                        <path fill="#fff" d="M616.1,230.12c0,22.8-13.42,37.08-35.06,37.08s-35.2-14.29-35.2-37.08,13.42-36.94,35.2-36.94,35.06,14.43,35.06,36.94M568.2,230.12c0,10.53,4.91,16.88,12.84,16.88s12.7-6.35,12.7-16.88-4.91-16.59-12.7-16.59-12.84,6.2-12.84,16.59"/>
                        <path fill="#fff" d="M639.62,199.1c1.44,2.16,2.31,2.02,4.47.14,5.77-4.9,12.41-6.06,16.74-6.06,17.03,0,27.42,9.81,27.42,26.69v43.86c0,1.15-.72,1.88-1.88,1.88h-19.19c-1.15,0-1.88-.72-1.88-1.88v-40.98c0-5.92-3.03-9.23-8.08-9.23-6.93,0-10.82,5.05-10.82,14.72v35.49c0,1.15-.72,1.88-1.88,1.88h-19.19c-1.15,0-1.88-.72-1.88-1.88v-67.09c0-1.15.72-1.88,1.88-1.88h10.24c1.01,0,1.73.43,2.17,1.3l1.88,3.03Z"/>
                        <path fill="#fff" d="M284.39,301.29c.7,1.58,1.14,1.32,2.72.09,3.78-3.16,7.47-4.31,11.15-4.31,4.04,0,7.11,1.67,9.57,4.57,1.67,1.58,2.46,1.85,4.57.18,4.22-3.69,7.82-4.74,11.51-4.74,9.93,0,15.02,6.59,13.17,16.95l-4.48,25.91c-.09.62-.53.97-1.14.97h-9.84c-.7,0-1.05-.44-.97-1.14l4.39-25.21c.79-4.57-.35-6.85-3.95-6.85-5.71,0-9.4,4.57-10.63,11.51l-3.51,20.73c-.09.62-.53.97-1.14.97h-9.84c-.7,0-1.06-.44-.97-1.14l4.39-25.38c.79-4.39-.53-6.68-3.95-6.68-5.8,0-9.4,4.57-10.63,11.51l-3.51,20.73c-.09.62-.53.97-1.14.97h-9.84c-.7,0-1.05-.44-.97-1.14l7.03-40.75c.09-.61.53-.97,1.14-.97h5.27c.61,0,1.05.35,1.14.97l.44,2.29Z"/>
                        <path fill="#fff" d="M367.56,340.81c-2.99.79-5.62,1.05-8.43,1.05-12.03,0-18.44-6.76-18.44-17.65,0-11.59,6.41-27.14,24.15-27.14,9.84,0,15.63,4.74,15.63,12.47,0,6.68-2.99,12.73-15.37,14.49l-12.73,1.76c.26,3.25,2.46,5.45,7.11,5.45,2.72,0,4.83-.26,7.38-.88l4.56-1.23c.7-.18,1.14.18,1.23.88l.7,8.35c.09.61-.26,1.05-.88,1.23l-4.92,1.23ZM364.13,315.34c3.42-.53,4.92-2.2,4.92-4.3s-1.67-3.34-4.83-3.34c-4.92,0-8.87,2.72-11.07,9.14l10.98-1.49Z"/>
                        <path fill="#fff" d="M420.34,339.93c-.09.62-.53.97-1.14.97h-5.18c-.61,0-1.05-.35-1.14-.97l-.53-2.37c-.44-1.23-.79-1.4-2.46-.09-3.69,3.08-7.73,4.39-11.68,4.39-10.36,0-16.16-6.59-16.16-17.3,0-11.42,6.24-27.4,23.71-27.49,3.16,0,5.44.44,7.38,1.41l2.2,1.05,3.69-21.08c.09-.61.52-.97,1.14-.97h9.75c.7,0,1.06.44.97,1.14l-10.54,61.3ZM411.82,308.75c-1.49-.7-3.69-1.05-5.62-1.05-9.31,0-12.47,9.93-12.47,15.81,0,4.92,2.37,7.73,6.94,7.73,5.89,0,10.01-4.22,11.15-10.8l1.93-10.8-1.93-.88Z"/>
                        <path fill="#fff" d="M442.74,339.93c-.09.62-.53.97-1.14.97h-9.84c-.7,0-1.06-.44-.97-1.14l5.45-31.27h-4.3c-.7,0-1.05-.44-.97-1.14l1.41-8.35c.09-.61.53-.97,1.14-.97h15.29c.7,0,1.05.44.96,1.14l-7.02,40.75ZM452.31,282.67c0,5.09-2.81,7.91-7.29,7.91-4.13,0-6.41-2.29-6.41-6.06,0-5.09,2.81-7.9,7.29-7.9,4.13,0,6.41,2.28,6.41,6.06"/>
                        <path fill="#fff" d="M481.82,335.72c-.26-1.84-.61-2.11-2.55-.09-3.34,3.86-7.11,6.24-12.56,6.24-9.84,0-15.54-6.06-15.54-16.42,0-11.94,7.11-28.37,25.99-28.37,2.9,0,5.62.44,9.22,1.32l8.78,2.11c.61.18.88.62.79,1.23l-6.5,38.21c-.08.62-.52.97-1.14.97h-5.45c-.7,0-1.05-.35-1.05-1.05v-4.13ZM481.03,308.32c-1.49-.44-2.55-.62-4.39-.62-9.84,0-13.79,10.8-13.79,16.69,0,4.31,2.28,6.85,6.06,6.85,6.32,0,11.33-7.55,13.35-18.62l.7-3.69-1.93-.61Z"/>
                    </svg>
                    <div className="flex flex-col ml-2">
                        <span className="text-sm font-bold text-slate-800 tracking-tight leading-none uppercase">Auditoria GCP Hub</span>
                        <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">One Station Media</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest border border-purple-200">
                        Versão Comercial
                    </span>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Data do Relatório</p>
                        <p className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>
            </header>

            <div className="flex pt-20">
                <aside className="desktop-sidebar w-72 fixed top-0 left-0 pt-24 h-screen z-40 px-4 pb-4">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 h-full w-full rounded-2xl flex flex-col shadow-lg">
                        <div className="p-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center">
                                <Cpu className="w-3 h-3 mr-2 text-primary" />
                                Navegação
                            </h2>
                            <nav className="space-y-2">
                                {TABS.map((item, idx) => (
                                    <button
                                        key={item.id}
                                        data-tab={item.id}
                                        className={`nav-trigger relative w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group overflow-hidden ${idx === 0
                                            ? 'text-white shadow-glow active-tab-bg'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                                            }`}
                                    >
                                        <item.icon className="relative z-10 mr-3 h-5 w-5" />
                                        <span className="relative z-10">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 lg:ml-72 p-6 md:p-10 min-h-screen pb-24">
                    <div className="glass-panel p-8 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-white/60">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                                <Building2 className="w-3 h-3" /> <span>{data.clientName}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{data.campaignName}</h2>
                            <div className="flex items-center mt-3">
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-200">
                                    STATUS: {data.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div id="content-overview" className="tab-content tab-block">
                        <OverviewTab data={data} isEditing={false} onUpdate={() => { }} onNestedUpdate={() => { }} />
                    </div>

                    <div id="content-profile" className="tab-content tab-hidden">
                        <ProfileTab data={data} isEditing={false} onUpdate={() => { }} onNestedUpdate={() => { }} />
                    </div>

                    <div id="content-email" className="tab-content tab-hidden">
                        <EmailTimeline emails={data.emails} batches={data.emailBatches} />
                    </div>

                    <div id="content-pi" className="tab-content tab-hidden">
                        <PITab data={data} isEditing={false} onUpdate={() => { }} onNestedUpdate={() => { }} />
                    </div>

                    <div id="content-pm_proposal" className="tab-content tab-hidden">
                        <InternalPM strategies={data.pmProposalStrategies} totalBudget={data.totalBudget} title="Plano Comercial" badgeType="PROPOSAL" isEditing={false} />
                    </div>

                    <div id="content-audit" className="tab-content tab-hidden">
                        <AuditTable items={data.audit} onUpdate={() => { }} />
                    </div>

                    <div id="content-report" className="tab-content tab-hidden">
                        <ReportTab data={data} isStatic={true} />
                    </div>
                </main>
            </div>

            <nav className="mobile-nav fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-around py-3 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {TABS.map((item, idx) => (
                    <button
                        key={item.id}
                        data-tab={item.id}
                        className={`nav-trigger flex flex-col items-center justify-center space-y-1 ${idx === 0 ? 'text-primary' : 'text-slate-400'}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export const generateCommercialHtmlString = (data: CampaignData): string => {
    const reportMarkup = renderToStaticMarkup(<CommercialReportLayout data={data} />);
    const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
  <title>GCP Report Comercial - ${data.campaignName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#6d28d9',
            secondary: '#4f46e5',
            accent: '#ec4899',
            background: '#f8fafc',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      background-image: 
        radial-gradient(at 0% 0%, rgba(109, 40, 217, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.1) 0px, transparent 50%);
      background-attachment: fixed;
    }
    .tab-hidden { display: none !important; }
    .tab-block { display: block !important; }
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .active-tab-bg {
       background: linear-gradient(to right, #6d28d9, #4f46e5) !important;
       box-shadow: 0 0 15px -3px rgba(109, 40, 217, 0.3) !important;
    }
    @media (max-width: 1023px) {
       .desktop-sidebar { display: none !important; }
       .mobile-nav { display: flex !important; }
    }
    @media (min-width: 1024px) {
       .desktop-sidebar { display: flex !important; }
       .mobile-nav { display: none !important; }
    }
  </style>
</head>
<body>
  ${reportMarkup}
  <script id="gcp-raw-data" type="application/json">${serializedData}</script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const triggers = document.querySelectorAll('.nav-trigger');
      const contents = document.querySelectorAll('.tab-content');
      function switchTab(tabId) {
        contents.forEach(content => {
          content.classList.add('tab-hidden');
          content.classList.remove('tab-block');
        });
        const target = document.getElementById('content-' + tabId);
        if (target) {
          target.classList.remove('tab-hidden');
          target.classList.add('tab-block');
        }
        triggers.forEach(t => {
          const tTab = t.getAttribute('data-tab');
          const isMatch = tTab === tabId;
          const isDesktop = t.closest('aside');
          const isMobile = t.closest('nav');
          if (isDesktop) {
            if (isMatch) {
              t.classList.add('active-tab-bg', 'text-white');
              t.classList.remove('text-slate-500');
            } else {
              t.classList.remove('active-tab-bg', 'text-white');
              t.classList.add('text-slate-500');
            }
          }
          if (isMobile) {
            t.classList.toggle('text-primary', isMatch);
            t.classList.toggle('text-slate-400', !isMatch);
          }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          switchTab(trigger.getAttribute('data-tab'));
        });
      });
    });
  </script>
</body>
</html>`;
};

export const downloadCommercialReport = (data: CampaignData) => {
    const fullHtml = generateCommercialHtmlString(data);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCP_Comercial_${data.clientName.replace(/\s+/g, '_')}_${data.proposalFileName || 'report'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
