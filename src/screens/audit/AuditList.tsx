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
    <div className="min-h-screen bg-bg-primary font-base relative">
      {/* Header */}
      <div className="pt-6 px-6 max-w-[800px] mx-auto">
        <h1 className="text-2xl font-bold text-white mb-5">
          All Audits
        </h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search audits..."
            className="w-full py-3 pr-4 pl-11 bg-bg-input border border-border rounded-xl text-white text-sm font-inherit outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-[20px] text-[0.813rem] font-medium border-none cursor-pointer font-inherit transition-all duration-150"
              style={{
                backgroundColor: filter === f.value ? 'rgba(240,81,62,0.15)' : 'rgba(255,255,255,0.06)',
                color: filter === f.value ? '#F0513E' : '#9CA3AF',
              }}
            >
              <span className="flex items-center gap-1.5">
                {f.value !== 'all' && <Filter size={12} />}
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Audit cards */}
      <div className="px-6 pb-[120px] max-w-[800px] mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-bg-card rounded-xl border border-[rgba(255,255,255,0.06)]">
            <FileText size={48} className="text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-base font-medium">No audits found</p>
            <p className="text-text-tertiary text-sm mt-1">
              {search ? 'Try a different search term' : 'Start a new audit to get going'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(audit => {
              const status = STATUS_CONFIG[audit.status];
              return (
                <button
                  key={audit.id}
                  onClick={() => onAuditClick?.(audit.id)}
                  className="w-full p-5 bg-bg-card border border-[rgba(255,255,255,0.06)] rounded-lg cursor-pointer font-inherit text-left transition-all duration-150 flex flex-col gap-3 hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-px"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-base font-semibold text-white">{audit.farmName}</div>
                    <span
                      className="px-2.5 py-1 rounded-[20px] text-[0.688rem] font-semibold uppercase tracking-wide shrink-0"
                      style={{
                        backgroundColor: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[0.813rem] text-text-tertiary">
                      <Calendar size={13} />
                      {audit.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[0.813rem] text-text-tertiary">
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
        className="fixed bottom-8 right-8 w-14 h-14 rounded-lg bg-accent text-white border-none cursor-pointer flex items-center justify-center shadow-[0_8px_24px_rgba(240,81,62,0.4)] transition-transform duration-150 z-50 hover:scale-105"
        title="New Audit"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AuditList;
