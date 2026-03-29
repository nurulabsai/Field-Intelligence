import { useState } from 'react';
import BottomNav from '../components/ui/BottomNav';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import StatusBadge from '../components/ui/StatusBadge';
import type { BadgeStatus } from '../components/ui/StatusBadge';

interface SyncItem {
  id: string;
  name: string;
  size: string;
  icon: string;
  status: 'syncing' | 'completed' | 'failed';
  progress?: number;
}

interface ActivityRow {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: BadgeStatus;
}

// Demo data
const SYNC_ITEMS: SyncItem[] = [
  { id: '1', name: 'Site_Photos_A.zip', size: '12.4 MB', icon: 'folder_zip', status: 'syncing', progress: 64 },
  { id: '2', name: 'Audit_Report_v2.pdf', size: '3.2 MB', icon: 'picture_as_pdf', status: 'completed' },
  { id: '3', name: 'Soil_Data.csv', size: '890 KB', icon: 'description', status: 'failed' },
];

const ACTIVITY_DATA: ActivityRow[] = [
  { id: 'ACT-001', user: 'John', action: 'Import', timestamp: '08:00', status: 'completed' },
  { id: 'ACT-002', user: 'Jane', action: 'Export', timestamp: '09:15', status: 'syncing' },
  { id: 'ACT-003', user: 'Joe', action: 'Delete', timestamp: '10:30', status: 'failed' },
  { id: 'ACT-004', user: 'Kim', action: 'Update', timestamp: '11:45', status: 'completed' },
];

export default function SyncDashboardScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <h1 className="font-sora text-2xl font-light text-white">
          System Tracking & Sync
        </h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-white text-[20px]">settings_suggest</span>
        </button>
      </div>

      {/* Action row */}
      <div className="flex gap-3 px-6 mb-8">
        <NeonButton variant="lime" icon="download" iconPosition="left" size="sm">
          Export CSV
        </NeonButton>
        <button className="glass-card flex items-center gap-2 rounded-full px-4 py-2 font-manrope text-xs font-semibold text-white">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          Filter Dates
        </button>
      </div>

      {/* Active Sync */}
      <div className="px-6 mb-8">
        <h2 className="mb-4 font-sora text-xl font-semibold text-white">Active Sync</h2>
        <div className="flex flex-col gap-4">
          {SYNC_ITEMS.map(item => (
            <GlassCard key={item.id} padding="lg" radius="lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    item.status === 'syncing' ? 'bg-neon-cyan/10' :
                    item.status === 'completed' ? 'bg-neon-lime/10' :
                    'bg-neon-red/10'
                  }`}>
                    <span className={`material-symbols-outlined text-[20px] ${
                      item.status === 'syncing' ? 'text-neon-cyan' :
                      item.status === 'completed' ? 'text-neon-lime' :
                      'text-neon-red'
                    }`}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-manrope text-sm font-semibold text-white">{item.name}</p>
                    <p className="font-manrope text-[11px] text-white/40">
                      {item.size}
                      {item.status === 'syncing' && ' \u00B7 Uploading...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                  {item.status === 'failed' && (
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5"
                      aria-label="Retry"
                    >
                      <span className="material-symbols-outlined text-white text-[16px]">refresh</span>
                    </button>
                  )}
                </div>
              </div>

              {item.status === 'syncing' && item.progress !== undefined && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-neon-cyan glow-cyan transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Activity Tracking */}
      <div className="px-6">
        <h2 className="mb-4 font-sora text-xl font-semibold text-white">Activity Tracking</h2>
        <GlassCard padding="none" radius="lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Activity ID', 'User', 'Action Type', 'Timestamp', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 font-manrope text-[10px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_DATA.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 1 ? 'bg-white/[0.02]' : ''}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.id}</td>
                    <td className="px-4 py-3 font-manrope text-xs text-white">{row.user}</td>
                    <td className="px-4 py-3 font-manrope text-xs text-white">{row.action}</td>
                    <td className="px-4 py-3 font-manrope text-xs text-white/60">{row.timestamp}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 border-t border-white/5 px-4 py-3">
            <button className="font-manrope text-xs text-white/40 hover:text-white">Prev</button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-full font-manrope text-xs ${
                  currentPage === p ? 'bg-neon-lime text-black' : 'text-white/40'
                }`}
              >
                {p}
              </button>
            ))}
            <button className="font-manrope text-xs text-white/40 hover:text-white">Next</button>
          </div>
        </GlassCard>
      </div>

      <BottomNav active="analytics" />
    </div>
  );
}
