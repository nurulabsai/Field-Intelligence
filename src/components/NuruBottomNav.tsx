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
        className="fixed bottom-0 left-0 right-0 h-16 bg-[rgba(13,13,13,0.85)] backdrop-blur-[16px] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-around px-2 z-50 font-[Inter,sans-serif]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const color = isActive ? '#F0513E' : '#6B7280';
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer py-1.5 px-3 min-w-[60px] transition-colors duration-150"
            >
              <Icon size={22} color={color} />
              <span
                className="text-[11px] font-[Inter,sans-serif]"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color,
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
