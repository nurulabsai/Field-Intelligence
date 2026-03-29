import { useState, useMemo } from 'react';
import { useAuditStore } from '../store/index';
import BottomNav from '../components/ui/BottomNav';
import GlassCard from '../components/ui/GlassCard';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type FilterType = 'all' | 'completed' | 'pending' | 'failed';

export default function ScheduleScreen() {
  const audits = useAuditStore(s => s.audits);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>('all');

  const today = new Date();
  const monthName = MONTHS[today.getMonth()];

  // Generate 7 days centered on today
  const dateStrip = useMemo(() => {
    const days: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const completedCount = audits.filter(a => a.status === 'submitted' || a.status === 'approved').length;
  const totalCount = audits.length || 1;
  const grade = completedCount / totalCount >= 0.95 ? 'A+' :
    completedCount / totalCount >= 0.85 ? 'A' :
    completedCount / totalCount >= 0.70 ? 'B' : 'C';

  const FILTERS: FilterType[] = ['all', 'completed', 'pending', 'failed'];

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-14 pb-6">
        <h1 className="font-sora text-[32px] font-light text-white">My Schedule</h1>
        <div className="flex gap-2">
          <button
            className="glass-card flex h-12 w-12 items-center justify-center rounded-full"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-white text-[20px]">search</span>
          </button>
          <button
            className="glass-card relative flex h-12 w-12 items-center justify-center rounded-full"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-neon-lime" />
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 px-8 pb-4">
        <span className="font-sora text-sm font-semibold text-white/40">
          {MONTHS[(today.getMonth() - 1 + 12) % 12]?.slice(0, 3)}
        </span>
        <span className="font-sora text-base font-semibold text-white">
          {monthName}
        </span>
        <span className="font-sora text-sm font-semibold text-white/40">
          {MONTHS[(today.getMonth() + 1) % 12]?.slice(0, 3)}
        </span>
      </div>

      {/* Date strip */}
      <div className="flex gap-4 overflow-x-auto px-8 pb-10 scrollbar-hide">
        {dateStrip.map(d => {
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDate);

          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDate(d)}
              className={`flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-full py-4 transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-neon-lime text-black glow-lime-strong'
                  : 'glass-card text-white'
              }`}
              aria-label={`${DAYS[d.getDay()]} ${d.getDate()}`}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className={`font-sora text-lg ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                {d.getDate()}
              </span>
              <span className="font-manrope text-[10px] font-bold uppercase tracking-widest">
                {DAYS[d.getDay()]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Monthly Grade card */}
      <div className="px-8 mb-10">
        <GlassCard padding="lg" radius="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                Monthly Audit Grade
              </p>
              <h3 className="mt-1 font-sora text-xl font-semibold text-white">
                Total Audits Completed
              </h3>
              <p className="mt-2 flex items-center gap-1.5 font-manrope text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-lime" />
                {completedCount} Tasks this month
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-lime/10 bg-neon-lime/5">
              <span className="font-sora text-2xl font-bold text-neon-lime text-glow-lime">
                {grade}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Activity Filter */}
      <div className="flex gap-2 overflow-x-auto px-8 mb-8 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2 font-manrope text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
              filter === f
                ? 'bg-neon-lime text-black'
                : 'bg-white/5 text-white/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-6 px-8">
        <ActivityCard
          icon="eco"
          iconColor="text-neon-lime"
          name="Green Valley Farm Audit"
          location="Morogoro, TZ"
          time="11:00 AM"
          progress={65}
          color="lime"
        />
        <ActivityCard
          icon="store"
          iconColor="text-neon-cyan"
          name="Retail Store Inspection"
          location="Dar es Salaam"
          time="02:00 PM"
          progress={40}
          color="cyan"
        />
        <ActivityCard
          icon="warehouse"
          iconColor="text-neon-purple"
          name="Warehouse Audit"
          location="Arusha"
          time="04:00 PM"
          progress={20}
          color="purple"
        />
      </div>

      <BottomNav active="calendar" />
    </div>
  );
}

function ActivityCard({
  icon,
  iconColor,
  name,
  location,
  time,
  progress,
  color,
}: {
  icon: string;
  iconColor: string;
  name: string;
  location: string;
  time: string;
  progress: number;
  color: 'lime' | 'cyan' | 'purple';
}) {
  const barBg = color === 'lime' ? 'bg-neon-lime' :
    color === 'cyan' ? 'bg-neon-cyan' : 'bg-neon-purple';

  return (
    <GlassCard padding="lg" radius="lg">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[20px] bg-white/5">
          <span className={`material-symbols-outlined text-[32px] ${iconColor}`}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-sora text-lg font-semibold text-white">{name}</h4>
          <p className="mt-1 font-manrope text-xs text-white/40">{location}</p>
          <p className="mt-0.5 font-manrope text-xs text-white/40">{time}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${barBg} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </GlassCard>
  );
}
