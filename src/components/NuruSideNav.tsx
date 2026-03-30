import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import NuruAvatar from './NuruAvatar';
import { cn } from '../design-system';

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
      className="nuru-side-nav w-[260px] h-screen fixed left-0 top-0 nuru-glass-card border-r border-border-glass flex flex-col font-base z-40"
    >
      {/* Logo */}
      <div className="py-6 px-5 border-b border-border-glass">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_16px_rgba(190,242,100,0.35)]">
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
              className={cn(
                'flex items-center gap-3 w-full min-h-[44px] py-2.5 px-3.5 rounded-full border-none cursor-pointer font-base text-sm transition-all duration-[var(--transition-base)] mb-1 text-left',
                isActive
                  ? 'font-semibold text-accent bg-accent/10 shadow-[0_8px_22px_-12px_rgba(190,242,100,0.4)]'
                  : 'font-normal text-text-secondary hover:bg-white/[0.04]',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="py-4 px-3.5 border-t border-border-glass flex items-center gap-3">
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
          className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 rounded-md flex items-center transition-colors duration-[var(--transition-base)] hover:text-error"
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
