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
  Table2,
  Presentation,
  BarChart3,
  Cpu,
  Shield,
  Building2
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'profile', label: 'Perfil & Targets', icon: Briefcase },
  { id: 'email', label: 'E-mail Thread', icon: Mail },
  { id: 'pi', label: 'Pedido de Inserção', icon: FileText },
  { id: 'pm_proposal', label: 'Plano Proposta', icon: Presentation },
  { id: 'pm_opec', label: 'Plano OPEC', icon: Table2 },
  { id: 'audit', label: 'Auditoria GCP', icon: ShieldCheck },
  { id: 'report', label: 'Relatório', icon: BarChart3 },
];

const ReportLayout: React.FC<{ data: CampaignData }> = ({ data }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Header Fixo */}
      <header className="h-20 bg-white/85 backdrop-blur-md fixed top-0 w-full z-50 flex items-center px-8 justify-between border-b border-white/30 shadow-sm">
        <div className="flex items-center space-x-3">
           <img src="https://onestationmedia.com/wp-content/uploads/2021/02/logo-sem-fundo@300x-768x543.png" alt="Logo" className="h-10 bg-white rounded-md px-2 py-1" />
           <div className="flex flex-col ml-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight leading-none uppercase">Auditoria GCP Hub</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">One Station Media</span>
           </div>
        </div>
        <div className="flex items-center space-x-4">
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
                    className={`nav-trigger relative w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group overflow-hidden ${
                      idx === 0 
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
            <OverviewTab data={data} isEditing={false} onUpdate={() => {}} onNestedUpdate={() => {}} />
          </div>
          
          <div id="content-profile" className="tab-content tab-hidden">
            <ProfileTab data={data} isEditing={false} onUpdate={() => {}} onNestedUpdate={() => {}} />
          </div>

          <div id="content-email" className="tab-content tab-hidden">
            <EmailTimeline emails={data.emails} batches={data.emailBatches} />
          </div>

          <div id="content-pi" className="tab-content tab-hidden">
            <PITab data={data} isEditing={false} onUpdate={() => {}} onNestedUpdate={() => {}} />
          </div>

          <div id="content-pm_proposal" className="tab-content tab-hidden">
            <InternalPM strategies={data.pmProposalStrategies} totalBudget={data.totalBudget} title="Plano Comercial" badgeType="PROPOSAL" isEditing={false} />
          </div>

          <div id="content-pm_opec" className="tab-content tab-hidden">
            <InternalPM strategies={data.pmOpecStrategies} totalBudget={data.totalBudget} title="Plano Técnico (OPEC)" badgeType="OPEC" isEditing={false} />
          </div>

          <div id="content-audit" className="tab-content tab-hidden">
             <AuditTable items={data.audit} onUpdate={() => {}} />
          </div>

          <div id="content-report" className="tab-content tab-hidden">
            <ReportTab data={data} />
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

export const generateHtmlString = (data: CampaignData): string => {
  const reportMarkup = renderToStaticMarkup(<ReportLayout data={data} />);
  const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
  <title>GCP Report - ${data.campaignName}</title>
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

export const downloadCampaignReport = (data: CampaignData) => {
  const fullHtml = generateHtmlString(data);
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GCP_${data.clientName.replace(/\s+/g, '_')}_${data.proposalFileName || 'report'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
