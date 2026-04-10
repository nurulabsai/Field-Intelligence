import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';

interface DashboardHomeProps {
  userName?: string;
  stressAlert?: string | null;
  onDismissAlert?: () => void;
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
  /** Mobile: opens navigation drawer when the desktop sidebar is hidden. */
  onMenuPress?: () => void;
  /** Opens Settings / profile. */
  onProfilePress?: () => void;
}

/** Dashboard stat card fills — aligned to DESIGN.md palette */
const DASH_LIME = '#BEF264';     // accent lime (design system)
const DASH_CYAN = '#67E8F9';     // secondary cyan (design system)
const DASH_AMBER = '#FDE68A';    // warm amber — business/reports semantic

const PROGRESS_COLORS: string[] = [
  DASH_CYAN,
  DASH_AMBER,
  DASH_LIME,
  '#FBBF24',
  '#FB7185',
];

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  stressAlert,
  onDismissAlert,
  isLoading = false,
  stats,
  audits,
  onAuditClick,
  onViewAllAudits,
  onMenuPress,
  onProfilePress,
}) => {
  const highPriority = stats?.pendingSync ?? 0;
  const farmChecks = stats?.totalAudits ?? 0;
  const businessReports = stats?.verified ?? 0;

  return (
    <div className="min-h-screen bg-bg-primary font-base overflow-x-hidden">

      <header className="flex items-center justify-between px-6 md:px-10 pt-12 pb-6 w-full md:max-w-5xl md:mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => onMenuPress?.()}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer text-white/80 active:scale-95 transition-transform"
          >
            <MaterialIcon name="menu" size={20} />
          </button>
          <h1 className="font-heading font-light tracking-tight text-xl md:ml-0 ml-2 text-white">NuruOS</h1>
        </div>
        <button
          type="button"
          aria-label="Settings and profile"
          onClick={() => onProfilePress?.()}
          className="w-11 h-11 rounded-full border border-white/5 bg-white/5 flex items-center justify-center cursor-pointer text-text-secondary active:scale-95 transition-transform"
        >
          <MaterialIcon name="person" size={20} />
        </button>
      </header>

      <main className="flex-1 px-6 md:px-10 flex flex-col gap-8 pb-40 w-full md:max-w-5xl md:mx-auto">

        {stressAlert && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] px-5 py-3.5 flex items-center gap-3" role="alert">
            <MaterialIcon name="warning" size={18} className="text-amber-400 shrink-0" />
            <p className="text-amber-300 text-[13px] font-medium flex-1">{stressAlert}</p>
            {onDismissAlert && (
              <button
                type="button"
                aria-label="Dismiss alert"
                onClick={onDismissAlert}
                className="w-8 h-8 rounded-full flex items-center justify-center text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer shrink-0"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20" aria-label="Loading dashboard data">
            <MaterialIcon name="progress_activity" size={36} className="text-accent animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            <section className="nuru-animate-in nuru-stagger-1">
              <h2 className="font-heading text-4xl font-light tracking-tight text-white text-center leading-tight">
                {userName ? `${userName.split(' ')[0]}'s` : 'Your'} Field<br />Audit Plan
              </h2>
            </section>

            {/* Stitch: grid grid-cols-2 gap-4 h-80; on md+ becomes 4 equal cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[260px] md:h-56 nuru-animate-in nuru-stagger-2" aria-label="Audit statistics">
              {/* Stitch home_2: bg-primary #d1fa7d (display lime), icon text-primary on black */}
              <div
                className="md:col-span-2 rounded-[32px] p-8 flex flex-col justify-between items-center text-center text-slate-900 nuru-soft-shadow relative overflow-hidden active:scale-95 transition-transform border border-white/5"
                style={{ backgroundColor: DASH_LIME }}
              >
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center nuru-soft-shadow shrink-0">
                  <MaterialIcon name="verified_user" size={24} style={{ color: DASH_LIME }} />
                </div>
                <div>
                  <span className="text-4xl font-light tracking-tighter block mb-1 nuru-tabular-nums">
                    {String(highPriority).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading font-bold text-base leading-tight">High Priority<br />Audits</h3>
                  <p className="text-[10px] uppercase tracking-wider font-bold mt-2 opacity-60">Tasks Pending</p>
                </div>
              </div>

              {/* Stitch: flex flex-col gap-4 h-full; md:contents hoists children into grid row */}
              <div className="flex flex-col gap-4 h-full md:contents">
                <div
                  className="flex-1 rounded-[32px] p-6 flex flex-col justify-between items-center text-center text-slate-900 nuru-soft-shadow active:scale-95 transition-transform border border-white/5"
                  style={{ backgroundColor: DASH_CYAN }}
                >
                  <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                    <MaterialIcon name="eco" size={22} className="text-black/80" />
                  </div>
                  <div>
                    <span className="text-2xl font-light tracking-tighter block nuru-tabular-nums">{farmChecks}</span>
                    <h3 className="font-heading font-bold text-[13px] leading-tight">Farm Checks</h3>
                  </div>
                </div>

                <div
                  className="flex-1 rounded-[32px] p-6 flex flex-col justify-between items-center text-center text-slate-900 nuru-soft-shadow active:scale-95 transition-transform border border-white/5"
                  style={{ backgroundColor: DASH_AMBER }}
                >
                  <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center shrink-0">
                    <MaterialIcon name="business_center" size={22} className="text-black/80" />
                  </div>
                  <div>
                    <span className="text-2xl font-light tracking-tighter block nuru-tabular-nums">{businessReports}</span>
                    <h3 className="font-heading font-bold text-[13px] leading-tight">Business<br />Reports</h3>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-2 nuru-animate-in nuru-stagger-3">
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

              {/* Stitch: glass-card rounded-vital p-6 with progress bars */}
              <div className="flex flex-col gap-4" role="list" aria-label="Ongoing audits">
                {(!audits || audits.length === 0) && !isLoading && (
                  <div className="nuru-glass-card rounded-[32px] p-10 flex flex-col items-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                      <MaterialIcon name="inbox" size={28} className="text-text-tertiary" />
                    </div>
                    <div>
                      <h5 className="font-heading font-light text-lg text-white tracking-tight mb-1">
                        No audits yet
                      </h5>
                      <p className="text-xs text-text-secondary max-w-[260px]">
                        Start your first audit from the <span className="text-accent font-medium">+</span> button below.
                      </p>
                    </div>
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

                  const AUDIT_TYPE_ICON: Record<string, string> = {
                    farm: 'eco',
                    business: 'business_center',
                    verified: 'verified',
                    submitted: 'upload_file',
                    failed: 'error_outline',
                    draft: 'edit_document',
                    synced: 'cloud_done',
                  };
                  const iconName = AUDIT_TYPE_ICON[audit.auditType?.toLowerCase() ?? '']
                    ?? AUDIT_TYPE_ICON[audit.status]
                    ?? 'assignment';

                  return (
                    <div
                      key={audit.id}
                      role="listitem"
                      className="nuru-glass-card rounded-[32px] p-6 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => onAuditClick?.(audit.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onAuditClick?.(audit.id)}
                      tabIndex={0}
                    >
                      <div
                        className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5"
                        style={{ color }}
                      >
                        <MaterialIcon name={iconName} size={24} />
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
