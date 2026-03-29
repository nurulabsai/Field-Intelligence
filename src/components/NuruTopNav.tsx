import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';

interface NuruTopNavProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
}

const NuruTopNav: React.FC<NuruTopNavProps> = ({
  title,
  onBack,
  rightAction,
  showNotifications = false,
  notificationCount = 0,
}) => {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backgroundColor: 'rgba(13,13,13,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 50,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Left */}
      <div style={{ width: '48px', display: 'flex', alignItems: 'center' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                'rgba(255,255,255,0.05)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      {/* Center */}
      <h1
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#FFFFFF',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          textAlign: 'center',
        }}
      >
        {title}
      </h1>

      {/* Right */}
      <div
        style={{
          width: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
        }}
      >
        {showNotifications && (
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                'rgba(255,255,255,0.05)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: '#F0513E',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
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
