import { useState, useEffect, useCallback } from 'react';
import BottomNav from '../components/ui/BottomNav';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import StatusBadge from '../components/ui/StatusBadge';
import type { BadgeStatus } from '../components/ui/StatusBadge';
import { getQueue, drainQueue, onSyncEvent, type QueueItem, type SyncEvent } from '../lib/sync-queue';
import { useUIStore } from '../store/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OP_LABELS: Record<string, string> = {
  create_audit: 'Create Audit',
  submit_audit: 'Submit Audit',
  upload_photo: 'Upload Photo',
};

const OP_ICONS: Record<string, string> = {
  create_audit: 'assignment',
  submit_audit: 'task_alt',
  upload_photo: 'photo_camera',
};

function queueStatusToBadge(status: QueueItem['status']): BadgeStatus {
  switch (status) {
    case 'pending': return 'pending';
    case 'in_progress': return 'syncing';
    case 'failed': return 'failed';
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Activity row type (derived from completed sync events in current session)
// ---------------------------------------------------------------------------

interface ActivityRow {
  id: string;
  action: string;
  timestamp: string;
  status: BadgeStatus;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SyncDashboardScreen() {
  const [queueItems, setQueueItems] = useState<readonly QueueItem[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useUIStore((s) => s.isOnline);

  const refreshQueue = useCallback(async () => {
    const items = await getQueue();
    setQueueItems(items);
  }, []);

  // Load queue on mount and subscribe to sync events
  useEffect(() => {
    refreshQueue();

    const unsub = onSyncEvent((event: SyncEvent) => {
      if (event.type === 'drain_start') {
        setIsSyncing(true);
      }
      if (event.type === 'drain_end') {
        setIsSyncing(false);
        refreshQueue();
      }
      if (event.type === 'completed' && event.item) {
        setActivity((prev) => [
          {
            id: event.item!.id.slice(0, 8).toUpperCase(),
            action: OP_LABELS[event.item!.type] ?? event.item!.type,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);
        refreshQueue();
      }
      if (event.type === 'failed' && event.item) {
        setActivity((prev) => [
          {
            id: event.item!.id.slice(0, 8).toUpperCase(),
            action: OP_LABELS[event.item!.type] ?? event.item!.type,
            timestamp: new Date().toISOString(),
            status: 'failed',
          },
          ...prev,
        ]);
        refreshQueue();
      }
      if (event.type === 'processing') {
        refreshQueue();
      }
    });

    return unsub;
  }, [refreshQueue]);

  const handleSyncNow = async () => {
    await drainQueue();
  };

  const pendingCount = queueItems.filter((i) => i.status === 'pending').length;
  const failedCount = queueItems.filter((i) => i.status === 'failed').length;

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <h1 className="font-sora text-2xl font-light text-white">
          System Tracking & Sync
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-neon-lime glow-lime' : 'bg-neon-red glow-red'}`}
          />
          <span className="font-manrope text-xs text-white/60">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 px-6 mb-6">
        <GlassCard padding="md" radius="lg" className="flex-1 text-center">
          <p className="font-mono text-2xl font-bold text-neon-lime">{queueItems.length}</p>
          <p className="font-manrope text-[10px] text-white/40 uppercase tracking-wider">Queued</p>
        </GlassCard>
        <GlassCard padding="md" radius="lg" className="flex-1 text-center">
          <p className="font-mono text-2xl font-bold text-neon-cyan">{pendingCount}</p>
          <p className="font-manrope text-[10px] text-white/40 uppercase tracking-wider">Pending</p>
        </GlassCard>
        <GlassCard padding="md" radius="lg" className="flex-1 text-center">
          <p className="font-mono text-2xl font-bold text-neon-red">{failedCount}</p>
          <p className="font-manrope text-[10px] text-white/40 uppercase tracking-wider">Failed</p>
        </GlassCard>
      </div>

      {/* Action row */}
      <div className="flex gap-3 px-6 mb-8">
        <NeonButton
          variant="lime"
          icon="sync"
          iconPosition="left"
          size="sm"
          onClick={handleSyncNow}
          disabled={!isOnline || queueItems.length === 0 || isSyncing}
        >
          {isSyncing ? 'Syncing…' : 'Sync Now'}
        </NeonButton>
        <button
          onClick={refreshQueue}
          className="glass-card flex items-center gap-2 rounded-full px-4 py-2 font-manrope text-xs font-semibold text-white"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Pending Queue */}
      <div className="px-6 mb-8">
        <h2 className="mb-4 font-sora text-xl font-semibold text-white">Sync Queue</h2>

        {queueItems.length === 0 ? (
          <GlassCard padding="lg" radius="lg">
            <div className="flex flex-col items-center gap-3 py-6">
              <span className="material-symbols-outlined text-[40px] text-neon-lime/40">cloud_done</span>
              <p className="font-manrope text-sm text-white/60">All synced — nothing pending</p>
            </div>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-4">
            {queueItems.map((item) => (
              <GlassCard key={item.id} padding="lg" radius="lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      item.status === 'in_progress' ? 'bg-neon-cyan/10' :
                      item.status === 'pending' ? 'bg-white/5' :
                      'bg-neon-red/10'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${
                        item.status === 'in_progress' ? 'text-neon-cyan' :
                        item.status === 'pending' ? 'text-white/40' :
                        'text-neon-red'
                      }`}>
                        {OP_ICONS[item.type] ?? 'sync'}
                      </span>
                    </div>
                    <div>
                      <p className="font-manrope text-sm font-semibold text-white">
                        {OP_LABELS[item.type] ?? item.type}
                      </p>
                      <p className="font-manrope text-[11px] text-white/40">
                        {formatDate(item.createdAt)} · {formatTimestamp(item.createdAt)}
                        {item.retryCount > 0 && ` · Retry ${item.retryCount}/5`}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={queueStatusToBadge(item.status)} size="sm" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="px-6">
        <h2 className="mb-4 font-sora text-xl font-semibold text-white">Activity Log</h2>

        {activity.length === 0 ? (
          <GlassCard padding="lg" radius="lg">
            <p className="text-center font-manrope text-sm text-white/40 py-4">
              No sync activity this session
            </p>
          </GlassCard>
        ) : (
          <GlassCard padding="none" radius="lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    {['ID', 'Action', 'Time', 'Status'].map((h) => (
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
                  {activity.map((row, i) => (
                    <tr
                      key={`${row.id}-${row.timestamp}`}
                      className={i % 2 === 1 ? 'bg-white/[0.02]' : ''}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.id}</td>
                      <td className="px-4 py-3 font-manrope text-xs text-white">{row.action}</td>
                      <td className="px-4 py-3 font-manrope text-xs text-white/60">
                        {formatTimestamp(row.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>

      <BottomNav active="analytics" />
    </div>
  );
}
