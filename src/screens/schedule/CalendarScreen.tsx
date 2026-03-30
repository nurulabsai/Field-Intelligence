import React from 'react';
import { Search, Bell, Clock, User, Box, ArrowRightLeft } from 'lucide-react';
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

interface CalendarScreenProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

// --- Temporary Mock Data for UI Fidelity ---
const DATES = [
  { day: '10', label: 'MON', active: false },
  { day: '11', label: 'TUE', active: false },
  { day: '12', label: 'WED', active: true },
  { day: '13', label: 'THU', active: false },
  { day: '14', label: 'FRI', active: false },
  { day: '15', label: 'SAT', active: false },
];

const ACTIVITIES = [
  {
    id: '1',
    title: 'Green Valley Farm Audit',
    location: 'California, US',
    time: '10:00 AM',
    progress: 85,
    progressColor: 'bg-[#BEF264]',
    iconBg: 'bg-[#507675]', // Slate teal
    icon: <User className="text-white" size={24} strokeWidth={1.5} />
  },
  {
    id: '2',
    title: 'Retail Store Inspection',
    location: 'Downtown Branch',
    time: '02:00 PM',
    progress: 45,
    progressColor: 'bg-[#4DD0E1]', // Cyan blue
    iconBg: 'bg-[#1A1F2E]', // Dark slate
    icon: <ArrowRightLeft className="text-white/50" size={20} strokeWidth={1.5} />
  },
  {
    id: '3',
    title: 'Warehouse Audit',
    location: 'Logistics Hub B',
    time: '06:00 PM',
    progress: 10,
    progressColor: 'bg-[#CE93D8]', // Purple/Pink
    iconBg: 'bg-[#3A5653]', // Deep green/teal
    icon: <Box className="text-white" size={22} strokeWidth={1.5} />
  }
];

const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  return (
    <div className="min-h-screen bg-[#070A0F] font-base px-6 pt-14 pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 w-full max-w-lg mx-auto">
        <h1 className="text-[36px] font-heading font-light text-white tracking-tight">
          My Schedule
        </h1>
        <div className="flex items-center gap-3">
          <button className="w-11 h-11 rounded-full bg-[#121623] border border-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shadow-xl">
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="relative w-11 h-11 rounded-full bg-[#121623] border border-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shadow-xl">
            <Bell size={18} strokeWidth={2} />
            {/* Notification Dot */}
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent rounded-full border-[2px] border-[#121623]" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto">
        {/* Horizontal Calendar Scroller */}
        <div className="mb-10 w-full">
          {/* Months Ribbon Text */}
          <div className="flex justify-between items-center mb-5 text-[10px] font-bold tracking-[0.15em] uppercase px-1">
            <span className="text-white">February</span>
            <div className="flex gap-5 text-[#3D4760]">
              <span className="cursor-pointer hover:text-white/50 transition-colors">Jan</span>
              <span className="cursor-pointer hover:text-white/50 transition-colors">Mar</span>
            </div>
          </div>

          {/* Dates Ribbon */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 snap-x">
            {DATES.map((item, idx) => (
              <button 
                key={idx}
                className={cn(
                  "flex flex-col items-center justify-center w-[76px] h-[92px] rounded-full shrink-0 snap-center cursor-pointer transition-all border",
                  item.active 
                    ? "bg-accent border-accent text-[#080B10] shadow-[0_0_35px_rgba(190,242,100,0.25)]" 
                    : "bg-[#121623] border-white/5 text-white/50 hover:bg-white/5"
                )}
              >
                <span className={cn("text-[20px] font-semibold mb-1 tracking-tight", item.active ? "text-[#080B10]" : "text-white")}>
                  {item.day}
                </span>
                <span className={cn("text-[10px] font-bold tracking-widest uppercase", item.active ? "text-[#080B10]/70" : "text-[#4A5570]")}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* KPI Score Card */}
        <div className="bg-[#121623] border border-white/[0.04] rounded-[32px] p-7 mb-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle glowing orb in background */}
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-accent/5 rounded-full blur-[30px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-center">
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#5C6A8A] uppercase mb-[18px]">
              Monthly Audit Grade
            </p>
            <h2 className="text-[25px] text-white font-medium leading-[1.1] tracking-tight mb-4 text-shadow-sm">
              Total Audits<br />Completed
            </h2>
            <div className="flex items-center gap-2.5">
              <div className="w-[5px] h-[5px] rounded-full bg-accent shadow-[0_0_8px_rgba(190,242,100,0.8)]" />
              <span className="text-accent text-[13px] font-semibold tracking-wide">
                24 Tasks this month
              </span>
            </div>
          </div>

          {/* Grade Circle */}
          <div className="relative z-10 shrink-0 w-[76px] h-[76px] rounded-full border border-[#2D3548] flex items-center justify-center shadow-inner bg-[#1A1F2E]/30 text-accent text-[30px] font-light tracking-tighter">
            A+
          </div>
        </div>

        {/* Your Activity Section */}
        <div className="w-full">
          <h2 className="text-[23px] text-white font-medium tracking-tight mb-5 px-1">
            Your Activity
          </h2>

          {/* Filter Pills */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 mb-3 snap-x">
            <button className="bg-accent text-[#080B10] px-[28px] py-[13px] rounded-full text-[13px] font-bold tracking-wide shadow-[0_4px_20px_rgba(190,242,100,0.15)] shrink-0 snap-center cursor-pointer border-none">
              All
            </button>
            <button className="bg-transparent border border-[#2A3143] text-[#7180A0] hover:text-white px-[28px] py-[13px] rounded-full text-[13px] font-semibold tracking-wide shrink-0 snap-center cursor-pointer transition-colors">
              Completed
            </button>
            <button className="bg-transparent border border-[#2A3143] text-[#7180A0] hover:text-white px-[28px] py-[13px] rounded-full text-[13px] font-semibold tracking-wide shrink-0 snap-center cursor-pointer transition-colors">
              Pending
            </button>
          </div>

          {/* Task Feed */}
          <div className="flex flex-col gap-4">
            {ACTIVITIES.map((activity) => (
              <div 
                key={activity.id} 
                className="bg-[#121623] rounded-[24px] p-5 flex flex-col justify-between border border-white/[0.03] shadow-lg relative overflow-hidden"
              >
                {/* Event Top Data Row */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Custom Graphic Avatar Block */}
                  <div className={cn("w-[68px] h-[68px] rounded-[18px] shrink-0 border border-white/5 flex items-center justify-center overflow-hidden", activity.iconBg)}>
                     {/* Replace with actual User Avatars later, using lucide icons as placeholders for now */}
                     {activity.icon}
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex flex-col py-1">
                    <h3 className="text-[17px] font-semibold text-white tracking-tight mb-1 line-clamp-2 leading-snug pr-4">
                      {activity.title}
                    </h3>
                    <p className="text-[#6D7A94] text-[13px] tracking-wide mb-2.5 font-medium">
                      {activity.location}
                    </p>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <Clock size={12} strokeWidth={2.5} />
                      <span className="text-[12px] font-bold tracking-wide">{activity.time}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="w-full h-[3px] bg-[#1E2538] rounded-full overflow-hidden mt-2 relative">
                  <div 
                    className={cn("absolute top-0 left-0 bottom-0 rounded-full", activity.progressColor)}
                    style={{ width: `${activity.progress}%` }}
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
