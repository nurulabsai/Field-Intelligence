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
  { id: 'camera', path: '/camera', icon: Camera },
];

const NuruBottomNav: React.FC<NuruBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <nav className="nuru-bottom-nav">
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#070A12] rounded-full p-2.5 shadow-2xl w-[90%] max-w-[400px]"
        style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0))' }}
      >
        <div className="flex items-center justify-between px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const isAddButton = item.id === 'add';
            const Icon = item.icon;
            
            // Special styling for the active state of the Center "+" Add button
            if (isAddButton) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "relative flex items-center justify-center border-none cursor-pointer p-0 transition-all duration-300 outline-none",
                    isActive 
                      ? "w-16 h-16 bg-accent rounded-full -translate-y-4 shadow-[0_0_30px_rgba(190,242,100,0.4)]" 
                      : "w-12 h-12 bg-transparent rounded-full"
                  )}
                >
                  <Icon
                    size={isActive ? 32 : 24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "relative z-10 transition-colors duration-300",
                      isActive ? "text-[#080B10]" : "text-gray-500"
                    )}
                  />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="relative flex items-center justify-center border-none bg-transparent cursor-pointer p-2 transition-all duration-300 outline-none w-12 h-12"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-accent rounded-full scale-[1.15] opacity-20 transition-transform duration-300" />
                )}
                <Icon
                  size={24}
                  className={cn(
                    "relative z-10 transition-colors duration-300",
                    isActive ? "text-accent" : "text-gray-500"
                  )}
                />
              </button>
            );
          })}
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
