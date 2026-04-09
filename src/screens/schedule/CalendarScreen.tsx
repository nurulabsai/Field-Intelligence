import React, { useState, useMemo } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../design-system';

export type EventType = 'audit' | 'training' | 'meeting' | 'deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

// Internal display model with extra visual fields
interface DisplayActivity {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  progress: number;
  color: string;
  imageUrl: string;
  status: 'completed' | 'pending';
  category: string;
}

interface CalendarScreenProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: { title: string; type: EventType; date: string; time: string; location: string; notes?: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
}

// Color map for event types
const TYPE_COLORS: Record<EventType, string> = {
  audit: '#BEF264',
  training: '#67E8F9',
  meeting: '#D8B4FE',
  deadline: '#FBBF24',
};

const TYPE_IMAGES: Record<EventType, string> = {
  audit: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD89wQuvoLzpExUZevyZsMgZx7IUaVmO0wH6ukF0PjBPl2lNgL1_zwpTkQQU5TgiLVUPjX69H-8pxBSY4flCkfeu3BPZJKnHmGJ8a65Y_0YWKWqCF5oGiHBrVkTAchQJ_HnqjjoqPqHLzj3nsruOzckDhWomkL_JwxKU2DPYVn47qe6Ndi33arHSuDX72KOlVrBMzB_lf62HnaP4kkNDgvqVa6k4dZt428Nq0iUuk-SFQ4ggq6CKrh4Q8PhEW_RUoW9iZWAgk_8qvuW',
  training: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcGErLNv0-42J33KKgOm8k2KtmUvcmUufl7U9ZSucXIsKv_DvEGes4HfF3xW6lf-adjl6hBvmcZrTtMmyUftfZBfWwjG6bNHZK7YKUcqKFHgqXfaW5AQKQ-W7KoJWiZYcHPrOkjIB5ylnm6ScbJ-VqAn2ls0s3Z3NsddaAIx9AHikPnXAkw30tkpmbFiFycLzFf6cBE3HJbaWXEGnMeRRLpfqapWPZ8Xt3PFyg1TdaSnV2su3f5XkCyTYa6aNjW7N9n6wxtV958cNY',
  meeting: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgzG3aOGeeO_xElNR0xwi3nB5064c1LuPKV68jILXcXK-lg0ldPkwJZKhCUVu-NfEhuybJKX2XYRzPSMAKyPyEbKt-uYXYhYjSDZ9h-La8YpIM4mY5vy0MsJLC3T_LEUgDsO7r3g8CGG1RjlnKsTHwYKi1a5CvVH-f2U76gGC5VOW_d-ou1Cc16fnoIIbT5JhnWhx8_ofSqQSxDWtdTKQ4b-B4IddbE5kO4S5pOaHM0smRrx58FyefvXzgEpWXCErbqJ8WkNwAtKUb',
  deadline: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD89wQuvoLzpExUZevyZsMgZx7IUaVmO0wH6ukF0PjBPl2lNgL1_zwpTkQQU5TgiLVUPjX69H-8pxBSY4flCkfeu3BPZJKnHmGJ8a65Y_0YWKWqCF5oGiHBrVkTAchQJ_HnqjjoqPqHLzj3nsruOzckDhWomkL_JwxKU2DPYVn47qe6Ndi33arHSuDX72KOlVrBMzB_lf62HnaP4kkNDgvqVa6k4dZt428Nq0iUuk-SFQ4ggq6CKrh4Q8PhEW_RUoW9iZWAgk_8qvuW',
};

// Fallback mock data when no real events are provided
const FALLBACK_ACTIVITIES: DisplayActivity[] = [
  {
    id: 'mock-1',
    title: 'Green Valley Farm Audit',
    type: 'audit',
    date: '12',
    time: '10:00 AM',
    location: 'California, US',
    progress: 100,
    color: '#BEF264',
    imageUrl: TYPE_IMAGES.audit,
    status: 'completed',
    category: 'Farm',
  },
  {
    id: 'mock-2',
    title: 'Retail Store Inspection',
    type: 'audit',
    date: '12',
    time: '02:00 PM',
    location: 'Downtown Branch',
    progress: 72,
    color: '#67E8F9',
    imageUrl: TYPE_IMAGES.training,
    status: 'pending',
    category: 'Store',
  },
];

const DATES = [
  { day: '10', label: 'MON' },
  { day: '11', label: 'TUE' },
  { day: '12', label: 'WED' },
  { day: '13', label: 'THU' },
  { day: '14', label: 'FRI' },
];

const FILTERS = ['All', 'Completed', 'Pending'];

const CalendarScreen: React.FC<CalendarScreenProps> = ({
  events = [],
  isLoading = false,
  error = null,
  onSearchPress,
  onNotificationsPress,
}) => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>('12');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Convert real events into display activities, or fall back to mock data
  const activities: DisplayActivity[] = useMemo(() => {
    if (events.length > 0) {
      return events.map((ev) => {
        const evDate = new Date(ev.date);
        const dayStr = String(evDate.getDate());
        const color = TYPE_COLORS[ev.type] || '#BEF264';
        const image = TYPE_IMAGES[ev.type] || TYPE_IMAGES.audit;
        return {
          id: ev.id,
          title: ev.title,
          type: ev.type,
          date: dayStr,
          time: ev.time,
          location: ev.location || ev.notes || '',
          progress: ev.type === 'deadline' ? 0 : 50,
          color,
          imageUrl: image,
          status: 'pending' as const,
          category: ev.type.charAt(0).toUpperCase() + ev.type.slice(1),
        };
      });
    }
    return FALLBACK_ACTIVITIES;
  }, [events]);

  // Dynamic filtering logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (activity.date !== selectedDate) return false;
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Completed') return activity.status === 'completed';
      if (selectedFilter === 'Pending') return activity.status === 'pending';
      if (selectedFilter === 'Warehouse') return activity.category === 'Warehouse';
      return true;
    });
  }, [activities, selectedDate, selectedFilter]);

  return (
    <div className="w-full min-h-screen relative flex flex-col bg-bg-primary font-base overflow-x-hidden">

      <div className="px-8 pt-14 pb-6 flex justify-between items-center">
        <h2 className="font-heading text-[32px] font-light tracking-tight text-white leading-tight">
          My Schedule
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search schedule"
            onClick={() => onSearchPress?.()}
            className="w-12 h-12 rounded-full nuru-vital-card flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer border-none font-inherit"
          >
            <MaterialIcon name="search" size={22} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => onNotificationsPress?.()}
            className="relative w-12 h-12 rounded-full nuru-vital-card flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer border-none font-inherit"
          >
            <MaterialIcon name="notifications" size={22} />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Horizontal Calendar Scroller */}
        <div className="px-8 pb-4">
          <div className="flex items-center text-text-secondary text-xs font-semibold tracking-widest uppercase">
            <span className="text-white">February</span>
          </div>
        </div>

        <div className="px-8 pb-10">
          <div className="flex gap-3 items-center">
            {DATES.map((item, idx) => {
              const isActive = item.day === selectedDate;
              return (
                <button 
                  key={idx}
                  onClick={() => setSelectedDate(item.day)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center h-[84px] rounded-full cursor-pointer transition-all border",
                    isActive 
                    ? "bg-accent border-accent text-bg-primary nuru-glow-lime-soft" 
                    : "nuru-vital-card text-white/80 hover:bg-white/10"
                  )}
                >
                  <span className={cn("text-[18px] mb-0.5 nuru-tabular-nums", isActive ? "font-extrabold" : "font-semibold opacity-80")}>
                    {item.day}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-widest", isActive ? "font-bold" : "font-medium opacity-40")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Score Card */}
        <div className="px-8 pb-10">
          <div className="nuru-vital-card rounded-[32px] p-8 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase mb-2">
                Monthly Audit Grade
              </p>
              <h3 className="text-white text-2xl font-heading font-semibold tracking-tight">
                Total Audits Completed
              </h3>
              <p className="text-accent font-medium mt-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {activities.length} Tasks this month
              </p>
            </div>
            <div className="relative z-10 w-20 h-20 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center">
              <span className="text-accent text-3xl font-light font-heading">A+</span>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="px-8 flex flex-col flex-1 pb-40">
          <h3 className="font-heading font-light text-[28px] tracking-tight text-white mb-8">
            Your Activity
          </h3>

          {/* Filter Pills */}
          <div className="flex gap-3 mb-8">
            {FILTERS.map(filter => {
              const isActive = filter === selectedFilter;
              return (
                <button 
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "flex-1 py-3 rounded-full text-[14px] tracking-wide cursor-pointer transition-all whitespace-nowrap",
                    isActive 
                    ? "bg-accent text-bg-primary font-bold nuru-glow-lime-soft" 
                    : "nuru-vital-card text-text-secondary font-semibold hover:text-white hover:bg-white/10"
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Task Feed */}
          <div className="space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <MaterialIcon name="progress_activity" size={32} className="text-accent animate-spin" />
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center py-6 bg-warning/5 border border-warning/15 rounded-[32px]">
                <p className="text-warning text-[14px] tracking-wide mb-1">Can't reach the server</p>
                <p className="text-text-secondary text-[12px]">Showing your last synced schedule.</p>
              </div>
            )}

            {!isLoading && filteredActivities.length === 0 && (
              <div className="text-center py-10 bg-white/[0.02] border border-white/5 rounded-[32px]">
                <p className="text-text-secondary text-[14px] tracking-wide">No activities matched for this filter.</p>
              </div>
            )}

            {!isLoading && filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                onClick={() => navigate('/audit/wizard/business')}
                className="nuru-vital-card rounded-[32px] p-8 flex flex-col relative overflow-hidden cursor-pointer group"
              >
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-[24px] bg-zinc-900/50 overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                    <img 
                      alt="Audit Thumbnail" 
                      className="w-full h-full object-cover opacity-70" 
                      src={activity.imageUrl} 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-heading font-semibold text-[20px] text-white leading-snug">
                      {activity.title}
                    </h4>
                    <p className="text-[14px] font-medium text-text-secondary mt-1 opacity-80">
                      {activity.location}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3" style={{ color: `${activity.color}B3` }}>
                      <MaterialIcon name="schedule" size={16} />
                      <span className="text-[13px] font-bold tracking-wide">{activity.time}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 w-full h-[4px] bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${activity.progress}%`,
                      backgroundColor: activity.color,
                      boxShadow: `0 0 12px ${activity.color}66`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;
