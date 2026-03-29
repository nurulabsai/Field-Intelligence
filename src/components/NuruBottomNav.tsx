import React from 'react';
import { Home, ClipboardCheck, Calendar, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.FC<{ size: number; color: string }>;
}

interface NuruBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Audits', path: '/audits', icon: ClipboardCheck },
  { label: 'Calendar', path: '/schedule', icon: Calendar },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <nav className="nuru-bottom-nav">
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: 'rgba(13,13,13,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
          zIndex: 50,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const color = isActive ? '#F0513E' : '#6B7280';
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                minWidth: '60px',
                transition: 'color 0.15s',
              }}
            >
              <Icon size={22} color={color} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .nuru-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default NuruBottomNav;
