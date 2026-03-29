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
      className="fixed top-0 left-0 right-0 z-[100] transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        transform: isOnline ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      <div className="bg-[rgba(245,158,11,0.95)] backdrop-blur-[8px] py-2.5 px-4 flex items-center justify-center gap-2.5 font-[Inter,sans-serif]">
        <WifiOff size={16} color="#000000" />
        <span className="text-[13px] font-semibold text-black">
          You are offline
        </span>
        {pendingCount > 0 && (
          <span className="text-xs font-medium text-[rgba(0,0,0,0.7)] bg-[rgba(0,0,0,0.15)] py-0.5 px-2 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
