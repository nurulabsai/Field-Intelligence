import React from 'react';
import MaterialIcon from './MaterialIcon';
import { useUIStore } from '../store/index';
import { drainSyncQueue } from '../lib/syncService';

const OfflineBanner: React.FC = () => {
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingCount = useUIStore((s) => s.pendingSyncCount);
  const [syncing, setSyncing] = React.useState(false);

  const handleRetrySync = React.useCallback(async () => {
    if (syncing || !isOnline) return;
    setSyncing(true);
    try {
      await drainSyncQueue();
    } finally {
      setSyncing(false);
    }
  }, [syncing, isOnline]);

  const showBanner = !isOnline || pendingCount > 0;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        transform: showBanner ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div
        className="backdrop-blur-[8px] py-2.5 px-4 flex items-center justify-center gap-2.5 font-[Inter,sans-serif]"
        style={{
          backgroundColor: isOnline
            ? 'rgba(59, 130, 246, 0.95)'
            : 'rgba(245, 158, 11, 0.95)',
        }}
      >
        {!isOnline && (
          <MaterialIcon name="wifi_off" size={16} className="text-black" />
        )}
        <span className="text-[13px] font-semibold text-black">
          {isOnline ? 'Back online' : 'You are offline'}
        </span>
        {pendingCount > 0 && (
          <>
            <span className="text-xs font-medium text-[rgba(0,0,0,0.7)] bg-[rgba(0,0,0,0.15)] py-0.5 px-2 rounded-full">
              {pendingCount} pending
            </span>
            {isOnline && (
              <button
                type="button"
                onClick={handleRetrySync}
                disabled={syncing}
                className="text-xs font-semibold text-black bg-[rgba(0,0,0,0.15)] py-0.5 px-2.5 rounded-full border-none cursor-pointer flex items-center gap-1"
              >
                <MaterialIcon
                  name="sync"
                  size={12}
                  className={syncing ? 'animate-spin' : ''}
                />
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
