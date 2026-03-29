import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, PlusCircle, BarChart2, Camera } from 'lucide-react';

export interface BottomNavProps {
  activeTab?: 'home' | 'calendar' | 'add' | 'stats' | 'camera';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'stats' }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home' as const, icon: Home, route: '/' },
    { id: 'calendar' as const, icon: Calendar, route: '/schedule' },
    { id: 'add' as const, icon: PlusCircle, route: '/new' },
    { id: 'stats' as const, icon: BarChart2, route: '/projects' },
    { id: 'camera' as const, icon: Camera, route: '/new' },
  ];

  return (
    <div className="fixed bottom-8 left-6 right-6 z-[100] bg-black rounded-full p-2 shadow-2xl shadow-black/20 max-w-[430px] mx-auto">
      <nav className="flex items-center justify-between px-2">
        {tabs.map(({ id, icon: Icon, route }) => (
          <button
            key={id}
            onClick={() => navigate(route)}
            className={`w-12 h-12 flex items-center justify-center transition-colors ${
              activeTab === id
                ? 'rounded-full bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={24} />
          </button>
        ))}
      </nav>
    </div>
  );
};
