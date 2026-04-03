import React from 'react';
import MaterialIcon from './MaterialIcon';

interface NuruTopNavProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationsPress?: () => void;
}

const NuruTopNav: React.FC<NuruTopNavProps> = ({
  title,
  onBack,
  rightAction,
  showNotifications = false,
  notificationCount = 0,
  onNotificationsPress,
}) => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-bg-primary/80 backdrop-blur-[18px] border-b border-border-glass z-50 font-base"
    >
      {/* Left */}
      <div className="w-12 flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg flex items-center justify-center transition-colors duration-[var(--transition-base)] hover:bg-white/[0.05]"
          >
            <MaterialIcon name="arrow_back" size={20} />
          </button>
        )}
      </div>

      {/* Center */}
      <h1 className="text-base font-light font-heading tracking-tight text-white m-0 truncate flex-1 text-center">
        {title}
      </h1>

      {/* Right */}
      <div className="w-12 flex items-center justify-end gap-2">
        {showNotifications && (
          <button
            type="button"
            onClick={() => onNotificationsPress?.()}
            className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg flex items-center justify-center relative transition-colors duration-[var(--transition-base)] hover:bg-white/[0.05]"
          >
            <MaterialIcon name="notifications" size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}
        {rightAction}
      </div>
    </nav>
  );
};

export default NuruTopNav;
