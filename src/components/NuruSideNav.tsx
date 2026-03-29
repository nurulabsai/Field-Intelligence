import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import NuruAvatar from './NuruAvatar';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NuruSideNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: { name: string; role: string };
  onLogout: () => void;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Audits', path: '/audits', icon: <ClipboardCheck size={20} /> },
  { label: 'Calendar', path: '/schedule', icon: <Calendar size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

const NuruSideNav: React.FC<NuruSideNavProps> = ({
  currentPath,
  onNavigate,
  user,
  onLogout,
}) => {
  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--color-bg-card, #1E1E1E)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        zIndex: 40,
      }}
      className="nuru-side-nav"
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#F0513E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            N
          </div>
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.02em',
            }}
          >
            NuruOS
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#F0513E' : '#9CA3AF',
                backgroundColor: isActive
                  ? 'rgba(240,81,62,0.1)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #F0513E'
                  : '3px solid transparent',
                transition: 'all 0.15s ease',
                marginBottom: '4px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <NuruAvatar name={user.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              color: '#6B7280',
              fontSize: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.role}
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .nuru-side-nav {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};

export default NuruSideNav;
