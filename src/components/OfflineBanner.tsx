import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  pendingCount?: number;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ pendingCount = 0 }) => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transform: isOnline ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(245,158,11,0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <WifiOff size={16} color="#000000" />
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#000000',
          }}
        >
          You are offline
        </span>
        {pendingCount > 0 && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(0,0,0,0.7)',
              backgroundColor: 'rgba(0,0,0,0.15)',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
