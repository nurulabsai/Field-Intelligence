import React, { useState } from 'react';
import { Search, Bell, Clock } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { ScreenLayout } from './ScreenLayout';

const DAYS = [
  { date: 10, day: 'Mon' },
  { date: 11, day: 'Tue' },
  { date: 12, day: 'Wed' },
  { date: 13, day: 'Thu' },
  { date: 14, day: 'Fri' },
  { date: 15, day: 'Sat' },
  { date: 16, day: 'Sun' },
];

const ACTIVITIES = [
  {
    id: '1',
    title: 'Green Valley Farm Audit',
    location: 'California, US',
    time: '10:00 AM',
    progress: 100,
    color: 'lime',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD89wQuvoLzpExUZevyZsMgZx7IUaVmO0wH6ukF0PjBPl2lNgL1_zwpTkQQU5TgiLVUPjX69H-8pxBSY4flCkfeu3BPZJKnHmGJ8a65Y_0YWKWqCF5oGiHBrVkTAchQJ_HnqjjoqPqHLzj3nsruOzckDhWomkL_JwxKU2DPYVn47qe6Ndi33arHSuDX72KOlVrBMzB_lf62HnaP4kkNDgvqVa6k4dZt428Nq0iUuk-SFQ4ggq6CKrh4Q8PhEW_RUoW9iZWAgk_8qvuW',
  },
  {
    id: '2',
    title: 'Retail Store Inspection',
    location: 'Downtown Branch',
    time: '02:00 PM',
    progress: 72,
    color: 'cyan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcGErLNv0-42J33KKgOm8k2KtmUvcmUufl7U9ZSucXIsKv_DvEGes4HfF3xW6lf-adjl6hBvmcZrTtMmyUftfZBfWwjG6bNHZK7YKUcqKFHgqXfaW5AQKQ-W7KoJWiZYcHPrOkjIB5ylnm6ScbJ-VqAn2ls0s3Z3NsddaAIx9AHikPnXAkw30tkpmbFiFycLzFf6cBE3HJbaWXEGnMeRRLpfqapWPZ8Xt3PFyg1TdaSnV2su3f5XkCyTYa6aNjW7N9n6wxtV958cNY',
  },
  {
    id: '3',
    title: 'Warehouse Audit',
    location: 'Logistics Hub B',
    time: '06:00 PM',
    progress: 5,
    color: 'purple',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgzG3aOGeeO_xElNR0xwi3nB5064c1LuPKV68jILXcXK-lg0ldPkwJZKhCUVu-NfEhuybJKX2XYRzPSMAKyPyEbKt-uYXYhYjSDZ9h-La8YpIM4mY5vy0MsJLC3T_LEUgDsO7r3g8CGG1RjlnKsTHwYKi1a5CvVH-f2U76gGC5VOW_d-ou1Cc16fnoIIbT5JhnWhx8_ofSqQSxDWtdTKQ4b-B4IddbE5kO4S5pOaHM0smRrx58FyefvXzgEpWXCErbqJ8WkNwAtKUb',
  },
];

const FILTERS = ['All', 'Completed', 'Pending', 'Warehouse'];

const progressColors: Record<string, { bar: string; glow: string; text: string }> = {
  lime:   { bar: 'bg-[#BEF264]', glow: 'shadow-[0_0_12px_rgba(190,242,100,0.4)]', text: 'text-[#BEF264]/70' },
  cyan:   { bar: 'bg-[#67E8F9]', glow: 'shadow-[0_0_12px_rgba(103,232,249,0.4)]', text: 'text-[#67E8F9]/70' },
  purple: { bar: 'bg-[#D8B4FE]', glow: 'shadow-[0_0_12px_rgba(216,180,254,0.4)]', text: 'text-[#D8B4FE]/70' },
};

export const ScheduleScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(12);
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <ScreenLayout>

        {/* Header */}
        <div className="px-8 pt-14 pb-6 flex justify-between items-center">
          <h2 className=" text-[32px] font-light tracking-tight text-white leading-tight">My Schedule</h2>
          <div className="flex items-center space-x-3">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)]">
              <Search size={20} className="text-white/80" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)] relative">
              <Bell size={20} className="text-white/80" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-[#BEF264] rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between text-[#94A3B8] font-sans text-xs font-semibold tracking-widest uppercase">
            <span className="text-white">February</span>
            <div className="flex space-x-8">
              <span className="opacity-40">Jan</span>
              <span className="opacity-40">Mar</span>
            </div>
          </div>
        </div>

        {/* Date Pill Scroller */}
        <div className="px-8 pb-10 overflow-x-auto no-scrollbar flex space-x-4 items-center">
          {DAYS.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDay(d.date)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-full transition-all ${
                selectedDay === d.date
                  ? 'bg-[#BEF264] text-black shadow-[0_8px_20px_-4px_rgba(190,242,100,0.3)]'
                  : 'bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)]'
              }`}
            >
              <span className={`text-[18px]  ${selectedDay === d.date ? 'font-extrabold' : 'font-semibold opacity-80'}`}>
                {d.date}
              </span>
              <span className={`text-[10px] font-sans uppercase tracking-widest ${selectedDay === d.date ? 'font-bold' : 'font-medium opacity-40'}`}>
                {d.day}
              </span>
            </button>
          ))}
        </div>

        {/* Monthly Audit Grade Card */}
        <div className="px-8 pb-10">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)] rounded-[32px] p-8 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[#94A3B8] text-xs font-sans font-semibold tracking-wider uppercase mb-2">Monthly Audit Grade</p>
              <h3 className="text-white text-2xl  font-semibold tracking-tight">Total Audits<br />Completed</h3>
              <p className="text-[#BEF264] font-medium mt-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BEF264]"></span>
                24 Tasks this month
              </p>
            </div>
            <div className="relative z-10 w-20 h-20 rounded-full bg-[#BEF264]/5 border border-[#BEF264]/10 flex items-center justify-center">
              <span className="text-[#BEF264] text-3xl font-light ">A+</span>
            </div>
          </div>
        </div>

        {/* Your Activity */}
        <div className="px-8 flex flex-col flex-1 pb-10">
          <h3 className=" font-light text-[28px] tracking-tight text-white mb-8">Your Activity</h3>

          {/* Filter Pills */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-8">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-8 py-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? 'bg-[#BEF264] text-black font-bold shadow-[0_8px_20px_-4px_rgba(190,242,100,0.3)]'
                    : 'bg-white/[0.03] backdrop-blur-xl border border-white/5 text-[#94A3B8]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Activity Cards */}
          <div className="space-y-6">
            {ACTIVITIES.map((activity) => {
              const colors = progressColors[activity.color];
              return (
                <div
                  key={activity.id}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)] rounded-[32px] p-8 flex flex-col relative overflow-hidden"
                >
                  <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-[24px] bg-zinc-900/50 overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                      <img
                        alt={activity.title}
                        className="w-full h-full object-cover opacity-70"
                        src={activity.image}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className=" font-semibold text-[20px] text-white leading-snug">{activity.title}</h4>
                      <p className="font-sans text-[14px] font-medium text-[#94A3B8] mt-1 opacity-80">{activity.location}</p>
                      <div className={`flex items-center gap-1.5 mt-3 ${colors.text}`}>
                        <Clock size={16} />
                        <span className="text-[13px] font-sans font-bold tracking-wide">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 w-full h-[4px] bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} ${colors.glow} rounded-full`}
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav */}
        <BottomNav activeTab="calendar" />

    </ScreenLayout>
  );
};
