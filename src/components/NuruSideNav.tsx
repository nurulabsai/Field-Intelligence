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
      className="nuru-side-nav w-[260px] h-screen fixed left-0 top-0 bg-bg-card border-r border-[rgba(255,255,255,0.06)] flex flex-col font-[Inter,sans-serif] z-40"
    >
      {/* Logo */}
      <div className="py-6 px-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-sm">
            N
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            NuruOS
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2.5">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="flex items-center gap-3 w-full py-2.5 px-3.5 rounded-[10px] border-none cursor-pointer font-[Inter,sans-serif] text-sm transition-all duration-150 mb-1 text-left"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#F0513E' : '#9CA3AF',
                backgroundColor: isActive
                  ? 'rgba(240,81,62,0.1)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #F0513E'
                  : '3px solid transparent',
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
      <div className="py-4 px-3.5 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <NuruAvatar name={user.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">
            {user.name}
          </div>
          <div className="text-text-tertiary text-xs truncate">
            {user.role}
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 rounded-md flex items-center transition-colors duration-150 hover:text-[#EF4444]"
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
