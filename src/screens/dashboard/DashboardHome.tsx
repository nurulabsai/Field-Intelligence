import React from 'react';
import { Menu, User, ShieldCheck, Sprout, Briefcase, TabletSmartphone, LayoutDashboard, Loader2, AlertTriangle } from 'lucide-react';

interface DashboardHomeProps {
  userName?: string;
  stressAlert?: string | null;
  isLoading?: boolean;
  stats?: {
    totalAudits: number;
    submittedToday: number;
    pendingSync: number;
    verified: number;
  };
  audits?: Array<{ id: string; farmName: string; auditType: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed' }>;
  prices?: Array<{ id: string; crop: string; region: string; pricePerKg: number; change: number }>;
  onAuditClick?: (id: string) => void;
  onViewAllAudits?: () => void;
  onStartNewAudit?: () => void;
}

const PROGRESS_COLORS: string[] = ['#67E8F9', '#E9D5FF', '#BEF264', '#FBBF24', '#FB7185'];

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  stressAlert,
  isLoading = false,
  stats,
  audits,
  onAuditClick,
  onViewAllAudits,
}) => {
  const highPriority = stats?.pendingSync ?? 0;
  const farmChecks = stats?.totalAudits ?? 0;
  const businessReports = stats?.verified ?? 0;

  return (
    <div className="min-h-screen bg-bg-primary font-base overflow-x-hidden">

      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menu"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer text-white/80 active:scale-95 transition-transform"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          <h1 className="font-heading font-light tracking-tight text-xl ml-2 text-white">NuruOS</h1>
        </div>
        <button
          type="button"
          aria-label="Profile"
          className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center cursor-pointer text-text-secondary active:scale-95 transition-transform"
        >
          <User size={20} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-6 flex flex-col gap-8 pb-40">

        {stressAlert && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] px-5 py-3.5 flex items-center gap-3" role="alert">
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <p className="text-amber-300 text-[13px] font-medium">{stressAlert}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20" aria-label="Loading dashboard data">
            <Loader2 size={36} className="text-accent animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            <section>
              <h2 className="font-heading text-4xl font-light tracking-tight text-white text-center leading-tight">
                {userName ? `${userName.split(' ')[0]}'s` : 'Your'} Field<br />Audit Plan
              </h2>
            </section>

            <section className="grid grid-cols-2 gap-4" aria-label="Audit statistics">
              <div className="row-span-2 bg-accent rounded-[32px] p-6 flex flex-col justify-between text-black nuru-soft-shadow relative active:scale-95 transition-transform border border-white/5 min-h-[320px]">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center self-start nuru-soft-shadow shrink-0">
                  <ShieldCheck size={22} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <span className="text-4xl font-light tracking-tighter block mb-1 nuru-tabular-nums">
                    {String(highPriority).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading font-bold text-base leading-tight">High Priority<br />Audits</h3>
                  <p className="text-[10px] uppercase tracking-wider font-bold mt-1.5 opacity-60">Tasks Pending</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-cyan rounded-[32px] p-6 flex-1 min-h-[140px] flex flex-col justify-between text-black nuru-soft-shadow active:scale-95 transition-transform border border-white/5">
                  <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                    <Sprout size={22} className="text-black/80" />
                  </div>
                  <div>
                    <span className="text-2xl font-light tracking-tighter block nuru-tabular-nums">{farmChecks}</span>
                    <h3 className="font-heading font-bold text-sm leading-tight">Farm Checks</h3>
                  </div>
                </div>

                <div className="bg-[#E9D5FF] rounded-[32px] p-6 flex-1 min-h-[140px] flex flex-col justify-between text-black nuru-soft-shadow active:scale-95 transition-transform border border-white/5">
                  <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                    <Briefcase size={22} className="text-black/80" />
                  </div>
                  <div>
                    <span className="text-2xl font-light tracking-tighter block nuru-tabular-nums">{businessReports}</span>
                    <h3 className="font-heading font-bold text-sm leading-tight">Business<br />Reports</h3>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-2">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-heading font-light tracking-tight text-white">Ongoing Audits</h4>
                <button
                  type="button"
                  onClick={onViewAllAudits}
                  className="bg-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border border-white/5 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-4" role="list" aria-label="Ongoing audits">
                {(!audits || audits.length === 0) && !isLoading && (
                  <div className="text-center py-12 nuru-glass-card rounded-[32px]">
                    <p className="text-text-secondary text-[14px] mb-2">No audits yet</p>
                    <p className="text-text-tertiary text-[12px]">Start a new audit to see it here</p>
                  </div>
                )}

                {audits && audits.slice(0, 5).map((audit, index) => {
                  const colorIdx = index % PROGRESS_COLORS.length;
                  const color = PROGRESS_COLORS[colorIdx];
                  const progress = audit.status === 'verified' ? 100
                    : audit.status === 'submitted' ? 80
                    : audit.status === 'synced' ? 100
                    : audit.status === 'failed' ? 30
                    : 50;

                  const IconComp = index % 2 === 0 ? TabletSmartphone : LayoutDashboard;

                  return (
                    <div
                      key={audit.id}
                      role="listitem"
                      className="nuru-glass-card rounded-[32px] p-6 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => onAuditClick?.(audit.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onAuditClick?.(audit.id)}
                      tabIndex={0}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <IconComp size={24} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <h5 className="font-bold text-sm text-white truncate">{audit.farmName}</h5>
                            <p className="text-xs text-text-secondary">{audit.auditType}</p>
                          </div>
                          <span className="text-sm font-light tracking-tight nuru-tabular-nums" style={{ color }}>{progress}%</span>
                        </div>
                        <div className="w-full h-[6px] bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardHome;
