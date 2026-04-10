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

/** Accessible names for icon-only controls (EN; SR-only). */
const NAV_ARIA_LABEL: Record<string, string> = {
  home: 'Home',
  calendar: 'Calendar',
  add: 'New audit',
  analytics: 'Audits',
  camera: 'Scanner',
};

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <nav className="md:hidden">
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
                type="button"
                aria-label={NAV_ARIA_LABEL[item.id] ?? item.id}
                aria-current="page"
                onClick={() => onNavigate(item.path)}
                className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-black border-none cursor-pointer active:scale-95 transition-transform shadow-lg shadow-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <MaterialIcon name={item.iconName} size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-label={NAV_ARIA_LABEL[item.id] ?? item.id}
              onClick={() => onNavigate(item.path)}
              className={cn(
                'flex-1 flex justify-center items-center py-2 text-gray-400 bg-transparent border-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              )}
            >
              <MaterialIcon name={item.iconName} size={24} />
            </button>
          );
        })}
      </div>

    </nav>
  );
};

export default NuruBottomNav;
