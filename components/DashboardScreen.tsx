import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlignLeft, User as UserIcon, ShieldCheck, Wheat, Building, Smartphone, Globe } from 'lucide-react';
import { User } from '../types';
import { Language } from '../services/i18n';
import { BottomNav } from './BottomNav';
import { ScreenLayout } from './ScreenLayout';
import './DashboardScreen.css';

export interface AuditItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  priority: string;
}

interface DashboardScreenProps {
  user: User;
  auditItems: AuditItem[];
  lang: Language;
  setLang: (lang: Language) => void;
  isTraining: boolean;
  setIsTraining: (val: boolean) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  unsynced: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user, auditItems, unsynced
}) => {
  const navigate = useNavigate();

  const completed = auditItems.filter(a => a.status === 'completed').length;
  const total = auditItems.length;
  const pendingCount = total - completed + unsynced; // Using a combined pending stat

  // Slice top 2 items for "Ongoing Audits"
  const ongoingAudits = auditItems.slice(0, 2);

  return (
    <ScreenLayout>
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-12 pb-6">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 border border-white/5 bg-white/5 active:scale-95 transition-transform">
              <AlignLeft className="w-5 h-5" />
            </button>
            <h1 className=" font-light tracking-tight text-xl ml-2 text-white">NuruOS</h1>
          </div>
          <button className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
            <UserIcon className="w-5 h-5 text-slate-300" />
          </button>
        </header>

        <main className="flex-1 px-6 flex flex-col gap-8">
          
          {/* Main Title */}
          <section>
            <h2 className=" text-[32px] sm:text-4xl font-light tracking-tight text-white text-center leading-[1.1] mt-2 mb-2">
              Your Field<br/>Audit Plan
            </h2>
          </section>

          {/* Grid Layout Cards */}
          <section className="grid grid-cols-2 gap-4 h-80">
            {/* High Priority Audits */}
            <div 
              className="bg-neonLime rounded-[32px] p-8 flex flex-col justify-between text-slate-900 soft-shadow relative overflow-hidden group active:scale-95 transition-transform border border-white/5 cursor-pointer"
              onClick={() => navigate('/projects')}
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center self-start soft-shadow">
                <ShieldCheck className="text-neonLime w-7 h-7" />
              </div>
              <div>
                <span className="text-4xl font-light tracking-tighter block mb-1">
                  {pendingCount < 10 ? `0${pendingCount}` : pendingCount}
                </span>
                <h3 className=" font-bold text-lg leading-tight">High Priority<br/>Audits</h3>
                <p className="text-[10px] uppercase tracking-wider font-bold mt-2 opacity-60">Tasks Pending</p>
              </div>
            </div>

            {/* Stacked Cards */}
            <div className="flex flex-col gap-4 h-full">
              {/* Farm Checks */}
              <div 
                className="bg-[#4edaff] rounded-[32px] p-6 flex-1 flex flex-col justify-between text-slate-900 soft-shadow active:scale-95 transition-transform border border-white/5 cursor-pointer"
                onClick={() => navigate('/new')}
              >
                <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                  <Wheat className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="text-2xl font-light tracking-tighter block">12</span>
                  <h3 className=" font-bold text-sm leading-tight">Farm Checks</h3>
                </div>
              </div>

              {/* Business Reports */}
              <div 
                className="bg-[#e0c6fd] rounded-[32px] p-6 flex-1 flex flex-col justify-between text-slate-900 soft-shadow active:scale-95 transition-transform border border-white/5 cursor-pointer"
                onClick={() => navigate('/new')}
              >
                <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="text-2xl font-light tracking-tighter block">28</span>
                  <h3 className=" font-bold text-sm leading-tight">Business Reports</h3>
                </div>
              </div>
            </div>
          </section>

          {/* Ongoing Audits */}
          <section className="mt-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl  font-light tracking-tight text-white">Ongoing Audits</h4>
              <button 
                onClick={() => navigate('/projects')}
                className="bg-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {ongoingAudits.length > 0 ? ongoingAudits.map((audit, index) => {
                const pct = audit.status === 'completed' ? 100 : 50;
                const isCyan = index % 2 === 0;
                
                return (
                  <div key={audit.id} className="glass-card rounded-[32px] p-6 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer" onClick={() => navigate(`/projects`)}>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      {isCyan ? <Smartphone className="text-[#4edaff] w-5 h-5" /> : <Globe className="text-[#e0c6fd] w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-3">
                        <div className="min-w-0 pr-2">
                          <h5 className="font-bold text-sm text-white truncate">{audit.title || 'Draft Audit'}</h5>
                          <p className="text-xs text-slate-400 truncate">{audit.type === 'home' ? 'Farm Check' : 'Business Check'}</p>
                        </div>
                        <span className={`text-sm font-light tracking-tight shrink-0 ${isCyan ? 'text-[#4edaff]' : 'text-[#e0c6fd]'}`}>{pct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className={isCyan ? "progress-bar-fill-cyan" : "progress-bar-fill-purple"} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="glass-card rounded-[32px] p-6 flex items-center justify-center">
                   <p className="text-sm font-medium text-slate-400">No ongoing audits</p>
                </div>
              )}
            </div>
          </section>
        </main>
        
        {/* Bottom Navigation Element */}
        <BottomNav activeTab="home" />

    </ScreenLayout>
  );
};