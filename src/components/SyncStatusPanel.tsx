import React from 'react';
import MaterialIcon from './MaterialIcon';

interface SyncStatusPanelProps {
  pendingCount: number;
  isOnline: boolean;
  syncing?: boolean;
  onSyncNow?: () => void;
  compact?: boolean;
}

const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({
  pendingCount,
  isOnline,
  syncing = false,
  onSyncNow,
  compact = false,
}) => {
  const statusText = !isOnline
    ? 'Offline'
    : pendingCount > 0
      ? `${pendingCount} pending`
      : 'All synced';

  return (
    <div className="nuru-glass-card rounded-[24px] border border-border-glass p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <MaterialIcon
              name={syncing ? 'sync' : isOnline ? 'cloud_done' : 'wifi_off'}
              size={18}
              className={syncing ? 'text-accent animate-spin' : isOnline ? 'text-accent' : 'text-warning'}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Sync status</p>
            <p className="text-sm text-white font-semibold truncate">{statusText}</p>
          </div>
        </div>

        {onSyncNow && (
          <button
            type="button"
            onClick={onSyncNow}
            disabled={syncing || !isOnline || pendingCount === 0}
            className="min-h-[44px] px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] transition-all"
          >
            {syncing ? 'Syncing…' : compact ? 'Sync' : 'Sync now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SyncStatusPanel;
