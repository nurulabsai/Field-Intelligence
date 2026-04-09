import React from 'react';
import MaterialIcon from './MaterialIcon';
import { cn } from '../design-system';

interface NavItem {
  id: string;
  path: string;
  iconName: string;
}

interface NuruBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onFabPress?: () => void;
}

const navItems: NavItem[] = [
  { id: 'home', path: '/dashboard', iconName: 'home' },
  { id: 'calendar', path: '/schedule', iconName: 'calendar_today' },
  { id: 'add', path: '/audit/new', iconName: 'add' },
  { id: 'analytics', path: '/audits', iconName: 'bar_chart' },
  { id: 'camera', path: '/scanner', iconName: 'photo_camera' },
];

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <nav className="nuru-bottom-nav md:hidden">
      <div
        className="fixed bottom-8 left-6 right-6 z-[100] bg-black rounded-full p-2 shadow-2xl shadow-black/20 flex items-center justify-between md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.path;

          if (isActive) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white border-none cursor-pointer active:scale-95 transition-transform outline-none shadow-lg shadow-accent/20"
              >
                <MaterialIcon name={item.iconName} size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "flex-1 flex justify-center items-center py-2 text-gray-400 bg-transparent border-none cursor-pointer transition-colors outline-none"
              )}
            >
              <MaterialIcon name={item.iconName} size={24} />
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
