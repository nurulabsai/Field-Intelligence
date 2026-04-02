import React from 'react';
import { Home, Calendar, Plus, BarChart2, Camera } from 'lucide-react';
import { cn } from '../design-system';

interface NavItem {
  id: string;
  path: string;
  icon: React.FC<{ size: number; className?: string; strokeWidth?: number }>;
}

interface NuruBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onFabPress?: () => void;
}

const navItems: NavItem[] = [
  { id: 'home', path: '/dashboard', icon: Home },
  { id: 'calendar', path: '/schedule', icon: Calendar },
  { id: 'add', path: '/audit/new', icon: Plus },
  { id: 'analytics', path: '/audits', icon: BarChart2 },
  { id: 'camera', path: '/scanner', icon: Camera },
];

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <nav className="nuru-bottom-nav">
      <div
        className="fixed bottom-8 left-6 right-6 z-[100] bg-black rounded-full p-2 shadow-2xl shadow-black/20 flex items-center justify-between"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          if (isActive) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white border-none cursor-pointer active:scale-95 transition-transform outline-none shadow-lg shadow-accent/20"
              >
                <Icon size={24} strokeWidth={2} />
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
              <Icon size={24} strokeWidth={1.5} />
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
