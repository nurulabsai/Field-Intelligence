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
      <div
        style={{
          backgroundColor: 'var(--glass-bg, rgba(30,30,30,0.8))',
          backdropFilter: 'var(--glass-blur, blur(16px))',
          WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
          border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <FileText size={48} style={{ color: '#6B7280', margin: '0 auto 16px' }} />
        <p style={{ color: '#9CA3AF', fontSize: '1rem', fontWeight: 500 }}>No audits yet</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
          Start your first field audit to see it here
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--glass-bg, rgba(30,30,30,0.8))',
        backdropFilter: 'var(--glass-blur, blur(16px))',
        WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>Recent Audits</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#F0513E',
              fontSize: '0.813rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
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
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(240,81,62,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F0513E',
                  flexShrink: 0,
                }}
              >
                <ClipboardCheck size={18} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.938rem', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.farmName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                  {item.auditType} &middot; {item.date}
                </div>
              </div>

              {/* Status badge */}
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.688rem',
                  fontWeight: 600,
                  backgroundColor: status.bg,
                  color: status.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  flexShrink: 0,
                }}
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
