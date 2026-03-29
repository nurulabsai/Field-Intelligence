import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  pendingCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ pendingCount = 0 }) => {
  if (navigator.onLine) return null;

  return (
    <div
      className="offline-banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: 'white',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <WifiOff size={18} />
      <span>
        You're offline. Data will sync when connected.
        {pendingCount > 0 && ` (${pendingCount} pending)`}
      </span>
    </div>
  );
};
