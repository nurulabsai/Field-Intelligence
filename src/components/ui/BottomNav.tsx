import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../design-system';

type NavItem = 'home' | 'calendar' | 'add' | 'analytics' | 'camera';

interface BottomNavProps {
  active: NavItem;
}

const NAV_ITEMS: Array<{ id: NavItem; icon: string; route: string }> = [
  { id: 'home', icon: 'home', route: '/dashboard' },
  { id: 'calendar', icon: 'calendar_today', route: '/schedule' },
  { id: 'add', icon: 'add', route: '/audit/select' },
  { id: 'analytics', icon: 'analytics', route: '/sync' },
  { id: 'camera', icon: 'photo_camera', route: '/camera' },
];

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentActive = NAV_ITEMS.find(item => location.pathname.startsWith(item.route))?.id ?? active;

  return (
    <nav
      className="fixed bottom-8 left-6 right-6 z-[100] mx-auto max-w-[430px]"
      aria-label="Main navigation"
    >
      <div
        className="flex items-center justify-around rounded-full bg-black p-2"
        style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.60)' }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = currentActive === item.id;
          const isCenter = item.id === 'add';

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-lime glow-lime transition-transform active:scale-95"
                aria-label="New audit"
              >
                <span className="material-symbols-outlined text-black text-[28px]">
                  {item.icon}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 active:scale-95',
                isActive
                  ? 'bg-neon-lime text-black'
                  : 'text-gray-400 hover:text-white'
              )}
              aria-label={item.id}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
