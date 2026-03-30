import React from 'react';
import { Home, ClipboardCheck, Calendar, Settings, Plus } from 'lucide-react';
import { cn } from '../design-system';

interface NavItem {
  label: string;
  path: string;
  icon: React.FC<{ size: number }>;
}

interface NuruBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onFabPress?: () => void;
}

const leftItems: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Audits', path: '/audits', icon: ClipboardCheck },
];

const rightItems: NavItem[] = [
  { label: 'Calendar', path: '/schedule', icon: Calendar },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
  onFabPress,
}) => {
  const renderItem = (item: NavItem) => {
    const isActive = currentPath === item.path;
    const Icon = item.icon;
    return (
      <button
        key={item.path}
        onClick={() => onNavigate(item.path)}
        className={cn(
          'flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer py-1.5 transition-colors duration-[var(--transition-base)]',
          isActive ? 'text-accent' : 'text-gray-400',
        )}
      >
        <Icon size={22} />
        <span
          className={cn(
            'text-[10px] font-base',
            isActive ? 'font-semibold text-accent' : 'font-normal text-gray-500',
          )}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="nuru-bottom-nav">
      <div
        className="fixed bottom-6 left-4 right-4 z-50 bg-black/90 border border-white/10 rounded-full p-2 shadow-2xl shadow-black/30 max-w-[420px] mx-auto backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <div className="flex items-center justify-between">
          {leftItems.map(renderItem)}

          {/* Center FAB */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={onFabPress}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-accent shadow-[0_6px_24px_rgba(190,242,100,0.35)] border-none cursor-pointer active:scale-95 transition-transform"
            >
              <Plus size={24} className="text-black" strokeWidth={2.5} />
            </button>
          </div>

          {rightItems.map(renderItem)}
        </div>
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
