import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, MapPin, Calendar, FileText, Filter } from 'lucide-react';

type AuditStatus = 'draft' | 'submitted' | 'verified' | 'synced' | 'failed';

interface AuditItem {
  id: string;
  farmName: string;
  date: string;
  status: AuditStatus;
  location: string;
}

interface AuditListProps {
  audits: AuditItem[];
  onAuditClick?: (id: string) => void;
  onNewAudit?: () => void;
}

const STATUS_CONFIG: Record<AuditStatus, { label: string; bg: string; color: string }> = {
  draft: { label: 'Draft', bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' },
  submitted: { label: 'Submitted', bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  verified: { label: 'Verified', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  synced: { label: 'Synced', bg: 'rgba(20,184,166,0.15)', color: '#14B8A6' },
  failed: { label: 'Failed', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Verified', value: 'verified' },
];

const AuditList: React.FC<AuditListProps> = ({ audits, onAuditClick, onNewAudit }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return audits.filter(a => {
      const matchesSearch = !search || a.farmName.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [audits, search, filter]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #0D0D0D)',
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 24px 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
          All Audits
        </h1>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search audits..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              backgroundColor: 'var(--color-bg-input, #252525)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.813rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                backgroundColor: filter === f.value ? 'rgba(240,81,62,0.15)' : 'rgba(255,255,255,0.06)',
                color: filter === f.value ? '#F0513E' : '#9CA3AF',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {f.value !== 'all' && <Filter size={12} />}
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Audit cards */}
      <div style={{ padding: '0 24px 120px', maxWidth: '800px', margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              backgroundColor: 'var(--color-bg-card, #1E1E1E)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <FileText size={48} style={{ color: '#6B7280', margin: '0 auto 16px' }} />
            <p style={{ color: '#9CA3AF', fontSize: '1rem', fontWeight: 500 }}>No audits found</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
              {search ? 'Try a different search term' : 'Start a new audit to get going'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(audit => {
              const status = STATUS_CONFIG[audit.status];
              return (
                <button
                  key={audit.id}
                  onClick={() => onAuditClick?.(audit.id)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'var(--color-bg-card, #1E1E1E)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>{audit.farmName}</div>
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
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6B7280' }}>
                      <Calendar size={13} />
                      {audit.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6B7280' }}>
                      <MapPin size={13} />
                      {audit.location}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onNewAudit}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#F0513E',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(240,81,62,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          zIndex: 50,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
        title="New Audit"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AuditList;
