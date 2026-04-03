import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';

interface AuditListProps {
  audits?: Array<{ id: string; farmName: string; auditType?: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed'; location?: string }>;
  isLoading?: boolean;
  onAuditClick?: (id: string) => void;
  onNewAudit?: () => void;
}

const STATUS_ICON: Record<string, { iconName: string; color: string; bg: string; badgeBg: string; badgeBorder: string; badgeText: string; label: string }> = {
  synced: { iconName: 'description', color: 'text-accent', bg: 'bg-accent/10', badgeBg: 'bg-accent/10', badgeBorder: 'border-accent/20', badgeText: 'text-accent', label: 'Completed' },
  submitted: { iconName: 'folder', color: 'text-cyan', bg: 'bg-cyan/10', badgeBg: 'bg-cyan/10', badgeBorder: 'border-cyan/30', badgeText: 'text-cyan', label: 'Syncing' },
  verified: { iconName: 'description', color: 'text-accent', bg: 'bg-accent/10', badgeBg: 'bg-accent/10', badgeBorder: 'border-accent/20', badgeText: 'text-accent', label: 'Verified' },
  failed: { iconName: 'description', color: 'text-[#F87171]', bg: 'bg-[#FF4D4D]/10', badgeBg: 'bg-[#FF4D4D]/10', badgeBorder: 'border-[#FF4D4D]/20', badgeText: 'text-[#FF4D4D]', label: 'Failed' },
  draft: { iconName: 'folder', color: 'text-white/50', bg: 'bg-white/5', badgeBg: 'bg-white/5', badgeBorder: 'border-white/10', badgeText: 'text-white/50', label: 'Draft' },
};

const AuditList: React.FC<AuditListProps> = ({ audits, isLoading, onAuditClick }) => {
  const hasPropData = audits && audits.length > 0;

  return (
    <div className="flex-1 pb-40 overflow-x-hidden">
      {/* Header — Stitch: px-6 pt-12 pb-6 */}
      <header className="px-6 pt-12 pb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-light text-[24px] tracking-tight leading-none text-white">
            System Tracking &amp; Sync
          </h1>
          <button
            type="button"
            aria-label="Settings"
            className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 cursor-pointer active:scale-95 transition-transform"
          >
            <MaterialIcon name="settings" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Action Buttons — Stitch: glass-material rounded-full */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex-1 bg-accent text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer border-none"
          >
            <MaterialIcon name="download" size={20} />
            Export CSV
          </button>
          <button
            type="button"
            className="flex-1 nuru-glassmorphism text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer"
          >
            <MaterialIcon name="calendar_today" size={20} className="text-white/70" />
            Filter Dates
          </button>
        </div>
      </header>

      {/* Main Content — Stitch: px-6 flex flex-col gap-8 */}
      <main className="px-6 flex flex-col gap-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <MaterialIcon name="progress_activity" size={32} className="text-accent animate-spin" />
          </div>
        )}

        {/* Active Sync Section — Stitch: glass-material rounded-[32px] p-8 */}
        {!isLoading && (
          <section>
            <h2 className="font-heading font-semibold text-[20px] text-white mb-4">Active Sync</h2>
            <div className="flex flex-col gap-3">
              {!hasPropData && (
                <>
                  {/* Syncing card — Stitch: glass-material rounded-[32px] p-8 */}
                  <div className="nuru-glassmorphism rounded-[32px] p-5 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan/10 rounded-2xl flex items-center justify-center shrink-0">
                          <MaterialIcon name="folder" size={24} className="text-cyan" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">Site_Photos_A.zip</h3>
                          <p className="text-[11px] text-text-tertiary font-medium">34MB &bull; Uploading...</p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-cyan/10 text-cyan text-[10px] font-bold rounded-full nuru-animate-pulse-cyan flex items-center gap-1 border border-cyan/30 shrink-0">
                        Syncing
                      </div>
                    </div>
                    <div className="h-[6px] bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan w-[65%] rounded-full shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
                    </div>
                  </div>

                  {/* Completed card — Stitch: glass-material rounded-[32px] p-8 */}
                  <div className="nuru-glassmorphism rounded-[32px] p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                        <MaterialIcon name="description" size={24} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Audit_Report_v2.pdf</h3>
                        <p className="text-[11px] text-text-tertiary font-medium">2MB &bull; 2 mins ago</p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-bold rounded-full border border-accent/30 shrink-0">
                      Completed
                    </div>
                  </div>

                  {/* Failed card — Stitch: glass-material rounded-[32px] p-8 */}
                  <div className="nuru-glassmorphism rounded-[32px] p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FF4D4D]/10 rounded-2xl flex items-center justify-center shrink-0">
                        <MaterialIcon name="description" size={24} className="text-[#F87171]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Soil_Data.csv</h3>
                        <p className="text-[11px] text-text-tertiary font-medium">12MB &bull; Failed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-1.5 bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] font-bold rounded-full border border-[#FF4D4D]/30 shrink-0">
                        Failed
                      </div>
                      <button
                        type="button"
                        aria-label="Retry upload"
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer text-text-secondary active:scale-90 border border-white/5 transition-transform shrink-0"
                      >
                        <MaterialIcon name="sync" size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {hasPropData && audits!.map((audit) => {
                const style = (STATUS_ICON[audit.status] ?? STATUS_ICON.draft)!;
                return (
                  <div
                    key={audit.id}
                    onClick={() => onAuditClick?.(audit.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onAuditClick?.(audit.id)}
                    tabIndex={0}
                    role="button"
                    className="nuru-glassmorphism rounded-[32px] p-5 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shrink-0`}>
                          <MaterialIcon name={style.iconName} size={24} className={style.color} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm tracking-wide">{audit.farmName}</h4>
                          <p className="text-[11px] text-text-tertiary font-medium">{audit.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-4 py-1.5 rounded-full ${style.badgeBg} border ${style.badgeBorder} ${style.badgeText} text-[10px] font-bold shrink-0`}>
                          {style.label}
                        </div>
                        {audit.status === 'failed' && (
                          <button
                            type="button"
                            aria-label="Retry"
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer text-text-secondary active:scale-90 transition-transform shrink-0"
                          >
                            <MaterialIcon name="sync" size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    {audit.status === 'submitted' && (
                      <div className="h-[6px] bg-white/5 rounded-full overflow-hidden mt-5">
                        <div className="h-full bg-cyan w-[65%] rounded-full shadow-[0_0_8px_rgba(103,232,249,0.5)] animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Activity Tracking — Stitch: 5-column table with glass-material, overflow-x-auto */}
        {!isLoading && (
          <section className="flex-1 flex flex-col min-h-0">
            <h2 className="font-heading font-semibold text-[20px] text-white mb-4">Activity Tracking</h2>

            {hasPropData && audits!.length === 0 && (
              <div className="text-center py-12 nuru-vital-card rounded-[32px]">
                <MaterialIcon name="error" size={28} className="text-text-secondary mx-auto mb-3" />
                <p className="text-text-secondary text-[14px] mb-1">No activity to show</p>
                <p className="text-text-tertiary text-[12px]">Completed audits will appear here</p>
              </div>
            )}

            <div className="nuru-glassmorphism rounded-[32px] flex-1 flex flex-col overflow-hidden">
              <div className="overflow-x-auto nuru-no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      <th className="px-4 py-3 font-bold">Activity ID</th>
                      <th className="px-4 py-3 font-bold">User</th>
                      <th className="px-4 py-3 font-bold">Action Type</th>
                      <th className="px-4 py-3 font-bold">Timestamp</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {hasPropData ? (
                      audits!.slice(0, 6).map((audit) => {
                        const style = (STATUS_ICON[audit.status] ?? STATUS_ICON.draft)!;
                        return (
                          <tr
                            key={audit.id}
                            className="nuru-table-row-alt border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => onAuditClick?.(audit.id)}
                          >
                            <td className="px-4 py-4 font-mono text-text-tertiary">#{audit.id.slice(0, 8)}</td>
                            <td className="px-4 py-4 font-semibold text-white">{audit.farmName}</td>
                            <td className="px-4 py-4 text-text-secondary">{audit.auditType || 'Farm Audit'}</td>
                            <td className="px-4 py-4 text-text-tertiary">{audit.date}</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 ${style.badgeBg} ${style.badgeText} text-[10px] font-bold rounded-full border ${style.badgeBorder}`}>
                                {style.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <>
                        <tr className="nuru-table-row-alt border-b border-white/5">
                          <td className="px-4 py-4 font-mono text-text-tertiary">#NR-9821</td>
                          <td className="px-4 py-4 font-semibold text-white">John Doe</td>
                          <td className="px-4 py-4 text-text-secondary">Site Visit</td>
                          <td className="px-4 py-4 text-text-tertiary">10:45 AM</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full border border-accent/20">Completed</span>
                          </td>
                        </tr>
                        <tr className="nuru-table-row-alt border-b border-white/5">
                          <td className="px-4 py-4 font-mono text-text-tertiary">#NR-9819</td>
                          <td className="px-4 py-4 font-semibold text-white">Sarah M.</td>
                          <td className="px-4 py-4 text-text-secondary">Data Entry</td>
                          <td className="px-4 py-4 text-text-tertiary">09:12 AM</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full border border-accent/20">Completed</span>
                          </td>
                        </tr>
                        <tr className="nuru-table-row-alt border-b border-white/5">
                          <td className="px-4 py-4 font-mono text-text-tertiary">#NR-9815</td>
                          <td className="px-4 py-4 font-semibold text-white">Mike R.</td>
                          <td className="px-4 py-4 text-text-secondary">Export</td>
                          <td className="px-4 py-4 text-text-tertiary">Yesterday</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] font-bold rounded-full border border-[#FF4D4D]/20">Failed</span>
                          </td>
                        </tr>
                        <tr className="nuru-table-row-alt">
                          <td className="px-4 py-4 font-mono text-text-tertiary">#NR-9804</td>
                          <td className="px-4 py-4 font-semibold text-white">John Doe</td>
                          <td className="px-4 py-4 text-text-secondary">Audit Final</td>
                          <td className="px-4 py-4 text-text-tertiary">Yesterday</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full border border-accent/20">Completed</span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination — Stitch: p-8, glass-material Prev/Next, lime active page */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                <button type="button" className="px-6 py-2.5 nuru-glassmorphism rounded-full text-[11px] font-bold text-text-tertiary uppercase active:scale-95 transition-all cursor-pointer">
                  Prev
                </button>
                <div className="flex gap-3">
                  <button type="button" className="w-10 h-10 rounded-full bg-accent text-black text-[11px] font-bold shadow-[0_0_15px_rgba(190,242,100,0.3)] cursor-pointer border-none">
                    1
                  </button>
                  <button type="button" className="w-10 h-10 rounded-full nuru-glassmorphism text-[11px] font-bold text-text-tertiary hover:text-white transition-colors cursor-pointer">
                    2
                  </button>
                  <button type="button" className="w-10 h-10 rounded-full nuru-glassmorphism text-[11px] font-bold text-text-tertiary hover:text-white transition-colors cursor-pointer">
                    3
                  </button>
                </div>
                <button type="button" className="px-6 py-2.5 nuru-glassmorphism rounded-full text-[11px] font-bold text-text-tertiary uppercase active:scale-95 transition-all cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AuditList;
