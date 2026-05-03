import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { useUIStore } from '../../store/index';

interface AuditListProps {
  audits?: Array<{ id: string; farmName: string; auditType?: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed'; location?: string }>;
  isLoading?: boolean;
  onAuditClick?: (id: string) => void;
  onSettingsPress?: () => void;
  onExportCsv?: () => void;
  onFilterDatesPress?: () => void;
  onRetrySyncPress?: () => void;
}

const STATUS_ICON: Record<string, { iconName: string; color: string; bg: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
  synced: { iconName: 'description', color: 'text-accent', bg: 'bg-accent/10', badgeBg: 'bg-accent/10', badgeBorder: 'border-accent/20', badgeText: 'text-accent' },
  submitted: { iconName: 'folder', color: 'text-cyan', bg: 'bg-cyan/10', badgeBg: 'bg-cyan/10', badgeBorder: 'border-cyan/30', badgeText: 'text-cyan' },
  verified: { iconName: 'description', color: 'text-accent', bg: 'bg-accent/10', badgeBg: 'bg-accent/10', badgeBorder: 'border-accent/20', badgeText: 'text-accent' },
  failed: { iconName: 'description', color: 'text-error', bg: 'bg-error/10', badgeBg: 'bg-error/10', badgeBorder: 'border-error/20', badgeText: 'text-error' },
  draft: { iconName: 'folder', color: 'text-white/50', bg: 'bg-white/5', badgeBg: 'bg-white/5', badgeBorder: 'border-white/10', badgeText: 'text-white/50' },
};

const PAGE_SIZE = 6;

const LIST_COPY = {
  en: {
    title: 'Audits',
    activeSync: 'Active Sync',
    activityTracking: 'Activity Tracking',
    exportCsv: 'Export CSV',
    filterDates: 'Filter Dates',
    emptySyncTitle: 'No audits to sync yet',
    emptySyncHint: 'Submitted audits and upload activity will show here.',
    emptyTable: 'No audit activity yet. Tap the + button to start your first audit.',
    prev: 'Prev',
    next: 'Next',
    pageOf: (p: number, t: number) => `Page ${p} / ${t}`,
    noPage: '—',
    thActivityId: 'Activity ID',
    thUser: 'User',
    thAction: 'Action Type',
    thTime: 'Timestamp',
    thStatus: 'Status',
    settings: 'Settings',
    farmAuditFallback: 'Farm Audit',
    retrySync: 'Retry sync',
    statusBadge: {
      synced: 'Completed',
      submitted: 'Syncing',
      verified: 'Verified',
      failed: 'Failed',
      draft: 'Draft',
    },
  },
  sw: {
    title: 'Ukaguzi',
    activeSync: 'Usawazishaji unaofanyika',
    activityTracking: 'Shughuli',
    exportCsv: 'Hamisha CSV',
    filterDates: 'Chuja tarehe',
    emptySyncTitle: 'Bado hakuna ukaguzi wa kusawazisha',
    emptySyncHint: 'Ukaguzi uliowasilishwa na shughuli za kupakia zitaonekana hapa.',
    emptyTable: 'Bado hakuna shughuli. Bonyeza kitufe cha + kuanza ukaguzi.',
    prev: 'Iliyopita',
    next: 'Ifuatayo',
    pageOf: (p: number, t: number) => `Ukurasa ${p} / ${t}`,
    noPage: '—',
    thActivityId: 'Kitambulisho',
    thUser: 'Mtumiaji',
    thAction: 'Aina ya kitendo',
    thTime: 'Muda',
    thStatus: 'Hali',
    settings: 'Mipangilio',
    farmAuditFallback: 'Ukaguzi wa shamba',
    retrySync: 'Jaribu kusawazisha tena',
    statusBadge: {
      synced: 'Imesawazishwa',
      submitted: 'Inasawazishwa',
      verified: 'Imethibitishwa',
      failed: 'Imeshindwa',
      draft: 'Rasimu',
    },
  },
} as const;

const AuditList: React.FC<AuditListProps> = ({
  audits,
  isLoading,
  onAuditClick,
  onSettingsPress,
  onExportCsv,
  onFilterDatesPress,
  onRetrySyncPress,
}) => {
  const language = useUIStore((s) => s.language);
  const t = language === 'sw' ? LIST_COPY.sw : LIST_COPY.en;

  const listAudits = audits ?? [];
  const hasRows = listAudits.length > 0;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [listAudits.length]);

  const totalPages = hasRows ? Math.max(1, Math.ceil(listAudits.length / PAGE_SIZE)) : 1;

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedAudits = hasRows
    ? listAudits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  return (
    <div className="flex-1 pb-40 overflow-x-hidden min-w-0">
      {/* Header — Stitch: px-6 pt-12 pb-6 */}
      <header className="px-6 md:px-10 pt-12 pb-6 flex flex-col gap-6 min-w-0 w-full md:max-w-5xl md:mx-auto">
        <div className="flex items-center justify-between min-w-0 gap-3">
          <h1 className="font-heading font-light text-[24px] tracking-tight leading-none text-white truncate">
            {t.title}
          </h1>
          <button
            type="button"
            aria-label={t.settings}
            onClick={() => onSettingsPress?.()}
            className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 cursor-pointer active:scale-95 transition-transform"
          >
            <MaterialIcon name="settings" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Action Buttons — Stitch: two equal pills (Export CSV + Filter Dates) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => onExportCsv?.()}
            className="flex-1 bg-accent text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer border-none"
          >
            <MaterialIcon name="download" size={20} />
            {t.exportCsv}
          </button>
          <button
            type="button"
            onClick={() => onFilterDatesPress?.()}
            className="flex-1 nuru-glassmorphism text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer border-none font-inherit"
          >
            <MaterialIcon name="calendar_today" size={20} className="text-white/70" />
            {t.filterDates}
          </button>
        </div>
      </header>

      {/* Main Content — Stitch: px-6 flex flex-col gap-8 */}
      <main className="px-6 md:px-10 flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <MaterialIcon name="progress_activity" size={32} className="text-accent animate-spin" />
          </div>
        )}

        {/* Active Sync Section — Stitch: glass-material rounded-[32px] p-8 */}
        {!isLoading && (
          <section>
            <h2 className="font-heading font-semibold text-[20px] text-white mb-4">{t.activeSync}</h2>
            <div className="flex flex-col gap-3">
              {!hasRows && (
                <div className="nuru-glassmorphism rounded-[32px] p-8 text-center">
                  <MaterialIcon name="cloud_upload" size={32} className="text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-secondary text-[14px] mb-1">{t.emptySyncTitle}</p>
                  <p className="text-text-tertiary text-[12px]">{t.emptySyncHint}</p>
                </div>
              )}

              {hasRows && listAudits.map((audit) => {
                const style = (STATUS_ICON[audit.status] ?? STATUS_ICON.draft)!;
                const badgeText =
                  t.statusBadge[audit.status as keyof typeof t.statusBadge] ?? t.statusBadge.draft;
                return (
                  <div
                    key={audit.id}
                    onClick={() => onAuditClick?.(audit.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onAuditClick?.(audit.id);
                      }
                    }}
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
                          {badgeText}
                        </div>
                        {audit.status === 'failed' && (
                          <button
                            type="button"
                            aria-label={t.retrySync}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetrySyncPress?.();
                            }}
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
            <h2 className="font-heading font-semibold text-[20px] text-white mb-4">{t.activityTracking}</h2>

            <div className="nuru-glassmorphism rounded-[32px] flex-1 flex flex-col overflow-hidden">
              <div className="overflow-x-auto nuru-no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      <th className="px-4 py-3 font-bold">{t.thActivityId}</th>
                      <th className="px-4 py-3 font-bold">{t.thUser}</th>
                      <th className="px-4 py-3 font-bold">{t.thAction}</th>
                      <th className="px-4 py-3 font-bold">{t.thTime}</th>
                      <th className="px-4 py-3 font-bold">{t.thStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {hasRows ? (
                      pagedAudits.map((audit) => {
                        const style = (STATUS_ICON[audit.status] ?? STATUS_ICON.draft)!;
                        const badgeText =
                          t.statusBadge[audit.status as keyof typeof t.statusBadge] ?? t.statusBadge.draft;
                        return (
                          <tr
                            key={audit.id}
                            className="nuru-table-row-alt border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => onAuditClick?.(audit.id)}
                          >
                            <td className="px-4 py-4 font-mono text-text-tertiary">#{audit.id.slice(0, 8)}</td>
                            <td className="px-4 py-4 font-semibold text-white">{audit.farmName}</td>
                            <td className="px-4 py-4 text-text-secondary">{audit.auditType || t.farmAuditFallback}</td>
                            <td className="px-4 py-4 text-text-tertiary">{audit.date}</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 ${style.badgeBg} ${style.badgeText} text-[10px] font-bold rounded-full border ${style.badgeBorder}`}>
                                {badgeText}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="nuru-table-row-alt">
                        <td colSpan={5} className="px-4 py-12 text-center text-text-secondary text-[14px]">
                          {t.emptyTable}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01] gap-3">
                <button
                  type="button"
                  disabled={!hasRows || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-6 py-2.5 nuru-glassmorphism rounded-full text-[11px] font-bold text-text-tertiary uppercase active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.prev}
                </button>
                <span className="text-[11px] font-semibold text-text-secondary whitespace-nowrap">
                  {hasRows ? t.pageOf(page, totalPages) : t.noPage}
                </span>
                <button
                  type="button"
                  disabled={!hasRows || page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-6 py-2.5 nuru-glassmorphism rounded-full text-[11px] font-bold text-text-tertiary uppercase active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.next}
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
