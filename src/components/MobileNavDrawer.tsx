import React, { useEffect } from 'react';
import MaterialIcon from './MaterialIcon';
import NuruAvatar from './NuruAvatar';
import { cn } from '../design-system';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <MaterialIcon name="space_dashboard" size={20} /> },
  { label: 'Audits', path: '/audits', icon: <MaterialIcon name="assignment_turned_in" size={20} /> },
  { label: 'Calendar', path: '/schedule', icon: <MaterialIcon name="calendar_today" size={20} /> },
  { label: 'Settings', path: '/settings', icon: <MaterialIcon name="settings" size={20} /> },
];

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  user: { name: string; role: string };
  onLogout: () => void;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  open,
  onClose,
  currentPath,
  onNavigate,
  user,
  onLogout,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[200] font-base" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 border-none cursor-pointer"
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 bottom-0 w-[min(300px,88vw)] nuru-glass-card border-r border-border-glass flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-5 px-4 border-b border-border-glass flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-extrabold text-sm">
              N
            </div>
            <span className="text-white font-bold text-lg tracking-tight">NuruOS</span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="bg-transparent border-none text-text-secondary cursor-pointer p-2 rounded-lg hover:bg-white/[0.06]"
          >
            <MaterialIcon name="close" size={22} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2.5">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'flex items-center gap-3 w-full min-h-[44px] py-2.5 px-3.5 rounded-full border-none cursor-pointer font-base text-sm transition-all duration-[var(--transition-base)] mb-1 text-left',
                  isActive
                    ? 'font-semibold text-accent bg-accent/10'
                    : 'font-normal text-text-secondary hover:bg-white/[0.04]',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="py-4 px-3.5 border-t border-border-glass flex items-center gap-3">
          <NuruAvatar name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-semibold truncate">{user.name}</div>
            <div className="text-text-tertiary text-xs truncate">{user.role}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 rounded-md hover:text-error"
          >
            <MaterialIcon name="logout" size={16} />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileNavDrawer;
