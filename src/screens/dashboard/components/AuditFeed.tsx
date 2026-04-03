import React from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';

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

const STATUS_CLASSES: Record<AuditStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-400/15 text-text-secondary' },
  submitted: { label: 'Submitted', className: 'bg-info/15 text-info' },
  verified: { label: 'Verified', className: 'bg-success/15 text-success' },
  synced: { label: 'Synced', className: 'bg-[rgba(20,184,166,0.15)] text-[#14B8A6]' },
  failed: { label: 'Failed', className: 'bg-error/15 text-error' },
};

const AuditFeed: React.FC<AuditFeedProps> = ({ items, onItemClick, onViewAll }) => {
  if (items.length === 0) {
    return (
      <div className="nuru-glass-card border border-border-glass rounded-[24px] py-12 px-6 text-center">
        <MaterialIcon name="description" size={48} className="text-text-tertiary mx-auto mb-4 block" />
        <p className="text-text-secondary text-base font-medium">No audits yet</p>
        <p className="text-text-tertiary text-sm mt-1">
          Start your first field audit to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="nuru-glass-card border border-border-glass rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-border-glass">
        <h3 className="text-base font-semibold text-white">Recent Audits</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="bg-transparent border-none text-text-accent text-sm font-semibold cursor-pointer font-[inherit] flex items-center gap-1"
          >
            View All
            <MaterialIcon name="chevron_right" size={14} />
          </button>
        )}
      </div>

      {/* Items */}
      <div>
        {items.map((item, i) => {
          const status = STATUS_CLASSES[item.status];
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                'w-full flex items-center gap-3.5 py-4 px-6 bg-transparent border-none cursor-pointer transition-colors duration-[var(--transition-base)] font-[inherit] text-left hover:bg-white/[0.03]',
                i < items.length - 1 && 'border-b border-border-light',
              )}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center text-text-accent shrink-0">
                <MaterialIcon name="assignment_turned_in" size={18} />
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
                className={cn(
                  'px-2.5 py-1 rounded-full text-[0.688rem] font-semibold uppercase tracking-[0.03em] shrink-0',
                  status.className,
                )}
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
