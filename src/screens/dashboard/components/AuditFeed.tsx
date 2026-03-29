import React from 'react';
import { ClipboardCheck, ChevronRight, FileText } from 'lucide-react';

type AuditStatus = 'draft' | 'submitted' | 'verified' | 'synced' | 'failed';

interface AuditFeedItem {
  id: string;
  farmName: string;
  auditType: string;
  date: string;
  status: AuditStatus;
}

interface AuditFeedProps {
  items: AuditFeedItem[];
  onItemClick?: (id: string) => void;
  onViewAll?: () => void;
}

const STATUS_CONFIG: Record<AuditStatus, { label: string; bg: string; color: string }> = {
  draft: { label: 'Draft', bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' },
  submitted: { label: 'Submitted', bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  verified: { label: 'Verified', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  synced: { label: 'Synced', bg: 'rgba(20,184,166,0.15)', color: '#14B8A6' },
  failed: { label: 'Failed', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};

const AuditFeed: React.FC<AuditFeedProps> = ({ items, onItemClick, onViewAll }) => {
  if (items.length === 0) {
    return (
      <div className="bg-bg-glass backdrop-blur-[16px] border border-border-glass rounded-xl py-12 px-6 text-center">
        <FileText size={48} className="text-text-tertiary mx-auto mb-4" />
        <p className="text-text-secondary text-base font-medium">No audits yet</p>
        <p className="text-text-tertiary text-sm mt-1">
          Start your first field audit to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-glass backdrop-blur-[16px] border border-border-glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-border-glass">
        <h3 className="text-base font-semibold text-white">Recent Audits</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="bg-transparent border-none text-text-accent text-[0.813rem] font-semibold cursor-pointer font-[inherit] flex items-center gap-1"
          >
            View All
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Items */}
      <div>
        {items.map((item, i) => {
          const status = STATUS_CONFIG[item.status];
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center gap-3.5 py-4 px-6 bg-transparent border-none cursor-pointer transition-colors duration-150 font-[inherit] text-left hover:bg-white/[0.03]"
              style={{
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center text-text-accent shrink-0">
                <ClipboardCheck size={18} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[0.938rem] font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.farmName}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  {item.auditType} &middot; {item.date}
                </div>
              </div>

              {/* Status badge */}
              <span
                className="px-2.5 py-1 rounded-full text-[0.688rem] font-semibold uppercase tracking-[0.03em] shrink-0"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AuditFeed;
