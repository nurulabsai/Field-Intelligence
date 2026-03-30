import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, MapPin, Calendar, FileText, Filter } from 'lucide-react';
import { cn } from '../../design-system';

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
  isLoading?: boolean;
  onAuditClick?: (id: string) => void;
  onNewAudit?: () => void;
}

const STATUS_CLASSES: Record<AuditStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-400/15 text-text-secondary' },
  submitted: { label: 'Submitted', className: 'bg-info/15 text-info' },
  verified: { label: 'Verified', className: 'bg-success/15 text-success' },
  synced: { label: 'Synced', className: 'bg-[rgba(20,184,166,0.15)] text-[#14B8A6]' },
  failed: { label: 'Failed', className: 'bg-error/15 text-error' },
};

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Verified', value: 'verified' },
];

const AuditList: React.FC<AuditListProps> = ({ audits, isLoading = false, onAuditClick, onNewAudit }) => {
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
    <div className="min-h-screen nuru-screen font-base relative">
      {/* Header */}
      <div className="pt-6 px-6 max-w-[800px] mx-auto">
        <h1 className="text-3xl font-light text-white mb-5 font-heading tracking-tight">
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
            className="w-full py-3 pr-4 pl-11 nuru-glass-card border border-border rounded-full text-white text-sm font-inherit outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border-none cursor-pointer font-inherit transition-all duration-[var(--transition-base)]',
                filter === f.value
                  ? 'bg-accent/15 text-accent'
                  : 'bg-border-glass text-text-secondary',
              )}
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
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-full h-[104px] nuru-glass-card rounded-[20px] border border-border-glass animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 nuru-glass-card rounded-[24px] border border-border-glass">
            <FileText size={48} className="text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-base font-medium">No audits found</p>
            <p className="text-text-tertiary text-sm mt-1">
              {search ? 'Try a different search term' : 'Start a new audit to get going'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(audit => {
              const status = STATUS_CLASSES[audit.status];
              return (
                <button
                  key={audit.id}
                  onClick={() => onAuditClick?.(audit.id)}
                  className="w-full p-5 nuru-glass-card border border-border-glass rounded-[20px] cursor-pointer font-inherit text-left transition-all duration-[var(--transition-base)] flex flex-col gap-3 hover:border-border-dark hover:-translate-y-px"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-base font-semibold text-white">{audit.farmName}</div>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-[20px] text-[0.688rem] font-semibold uppercase tracking-wide shrink-0',
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
                      <Calendar size={13} />
                      {audit.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
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

      {/* FAB — desktop only (mobile uses bottom nav pill center button) */}
      <button
        onClick={onNewAudit}
        className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-full bg-accent text-black border-none cursor-pointer items-center justify-center shadow-[var(--shadow-glow-accent-lg)] transition-transform duration-[var(--transition-base)] z-50 hover:scale-105"
        title="New Audit"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AuditList;
