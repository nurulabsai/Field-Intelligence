import { cn } from '../../design-system';

interface SyncStatusBarProps {
  pendingCount: number;
  isOnline: boolean;
  lastSynced?: Date;
}

export default function SyncStatusBar({
  pendingCount,
  isOnline,
  lastSynced,
}: SyncStatusBarProps) {
  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-2 px-6 py-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-manrope text-[11px] text-white/40">
          All synced
          {lastSynced && ` \u00B7 ${formatTimeAgo(lastSynced)}`}
        </span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="mx-6 flex items-center gap-2 rounded-full bg-neon-amber/10 border border-neon-amber/20 px-4 py-2">
        <span className="material-symbols-outlined text-neon-amber text-[16px]">
          cloud_off
        </span>
        <span className="font-manrope text-[11px] font-semibold text-neon-amber">
          Offline {pendingCount > 0 && `\u2014 ${pendingCount} item${pendingCount === 1 ? '' : 's'} queued`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-6 py-2">
      <span className={cn('h-2 w-2 rounded-full bg-neon-cyan animate-pulse-cyan')} />
      <span className="font-manrope text-[11px] text-neon-cyan">
        {pendingCount} pending upload{pendingCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
