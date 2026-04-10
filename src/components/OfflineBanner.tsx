import React from 'react';
import MaterialIcon from './MaterialIcon';
import { useUIStore } from '../store/index';
import { drainSyncQueue } from '../lib/syncService';

const copy = {
  en: {
    backOnline: 'Back online',
    offline: 'You are offline',
    pending: (n: number) => `${n} pending`,
    syncNow: 'Sync now',
    syncing: 'Syncing…',
  },
  sw: {
    backOnline: 'Uko mtandaoni tena',
    offline: 'Uko nje ya mtandao',
    pending: (n: number) => `${n} yanasubiri`,
    syncNow: 'Sawazisha sasa',
    syncing: 'Inasawazisha…',
  },
} as const;

const OfflineBanner: React.FC = () => {
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingCount = useUIStore((s) => s.pendingSyncCount);
  const language = useUIStore((s) => s.language);
  const [syncing, setSyncing] = React.useState(false);

  const t = copy[language === 'sw' ? 'sw' : 'en'];

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
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        showBanner ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        transform: showBanner ? 'translateY(0)' : 'translateY(-100%)',
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      <div
        className="backdrop-blur-[8px] py-2.5 px-4 flex items-center justify-center gap-2.5 font-base"
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
          {isOnline ? t.backOnline : t.offline}
        </span>
        {pendingCount > 0 && (
          <>
            <span className="text-xs font-medium text-[rgba(0,0,0,0.7)] bg-[rgba(0,0,0,0.15)] py-0.5 px-2 rounded-full">
              {t.pending(pendingCount)}
            </span>
            {isOnline && (
              <button
                type="button"
                onClick={handleRetrySync}
                disabled={syncing}
                aria-label={syncing ? t.syncing : t.syncNow}
                className="min-h-[44px] min-w-[44px] px-2.5 text-xs font-semibold text-black bg-[rgba(0,0,0,0.15)] rounded-full border-none cursor-pointer flex items-center justify-center gap-1"
              >
                <MaterialIcon
                  name="sync"
                  size={12}
                  className={syncing ? 'animate-spin' : ''}
                />
                {syncing ? t.syncing : t.syncNow}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
