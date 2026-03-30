import React from 'react';
import { Menu, User, ShieldCheck, Sprout, Briefcase, TabletSmartphone, LayoutDashboard } from 'lucide-react';

interface DashboardHomeProps {
  userName?: string;
  stressAlert?: string | null;
  isLoading?: boolean;
  stats?: {
    totalAudits: number;
    submittedToday: number;
    pendingSync: number;
    verified: number;
  };
  audits?: Array<{ id: string; farmName: string; auditType: string; date: string; status: 'draft' | 'submitted' | 'verified' | 'synced' | 'failed' }>;
  prices?: Array<{ id: string; crop: string; region: string; pricePerKg: number; change: number }>;
  onAuditClick?: (id: string) => void;
  onViewAllAudits?: () => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
  onAuditClick,
  onViewAllAudits,
}) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-base p-6 pb-24 md:pb-6 relative overflow-x-hidden">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button className="w-11 h-11 rounded-full bg-[#1A2033] border-none flex items-center justify-center cursor-pointer text-white">
          <Menu size={20} strokeWidth={2} />
        </button>
        <span className="text-xl font-light font-heading tracking-wide text-white">NuruOS</span>
        <button className="w-11 h-11 rounded-full bg-[#1A2033] border-none flex items-center justify-center cursor-pointer text-white">
          <User size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Hero Title */}
      <div className="mb-10 flex justify-center">
        <h1 className="text-4xl text-center text-white leading-tight font-heading font-light">
          Your Field<br />Audit Plan
        </h1>
      </div>

      {/* 3-Card Asymmetric Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        
        {/* Left Tall Card - Lime */}
        <div className="row-span-2 rounded-[32px] bg-accent p-6 flex flex-col justify-between shadow-[0_15px_40px_-15px_rgba(190,242,100,0.4)]">
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-8">
            <ShieldCheck size={26} className="text-accent" />
          </div>
          <div>
            <h2 className="text-[2.75rem] font-light leading-none text-black mb-1 font-heading">03</h2>
            <h3 className="text-xl font-bold font-heading text-black leading-tight mb-3">High<br />Priority<br />Audits</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-black/40">Tasks Pending</p>
          </div>
        </div>

        {/* Top Right Card - Cyan */}
        <div className="rounded-[32px] bg-[#67E8F9] p-5 shadow-[0_15px_40px_-15px_rgba(103,232,249,0.3)] min-h-[160px] flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-2">
            <Sprout size={22} className="text-black/80" />
          </div>
          <div>
            <h2 className="text-3xl font-light leading-none text-black mb-1 font-heading">12</h2>
            <h3 className="text-sm font-bold font-heading text-black">Farm Checks</h3>
          </div>
        </div>

        {/* Bottom Right Card - Lavender */}
        <div className="rounded-[32px] bg-[#E9D5FF] p-5 shadow-[0_15px_40px_-15px_rgba(233,213,255,0.3)] min-h-[160px] flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-2">
            <Briefcase size={22} className="text-black/80" />
          </div>
          <div>
            <h2 className="text-3xl font-light leading-none text-black mb-1 font-heading">28</h2>
            <h3 className="text-sm font-bold font-heading text-black leading-tight">Business<br />Reports</h3>
          </div>
        </div>

      </div>

      {/* Ongoing Audits Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light font-heading text-white">Ongoing Audits</h2>
        <button 
          onClick={onViewAllAudits}
          className="text-xs font-semibold py-2 px-4 rounded-full bg-white/5 text-white/50 border border-white/5 uppercase tracking-wider cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Ongoing Audits List */}
      <div className="flex flex-col gap-4">
        
        {/* Item 1 */}
        <div 
          className="bg-[#141A27] rounded-[28px] p-5 flex items-center cursor-pointer shadow-lg overflow-hidden relative"
          onClick={() => onAuditClick?.('1')}
        >
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#1E253A] flex items-center justify-center mr-4">
            <TabletSmartphone size={24} className="text-[#67E8F9]" />
          </div>
          <div className="flex-1 w-full min-w-0 pr-4">
            <h4 className="text-white font-semibold text-[15px] mb-1 truncate">Green Valley Farm</h4>
            <p className="text-white/40 text-sm mb-3">Field Inspection</p>
            {/* Progress Bar Container */}
            <div className="w-full h-[6px] bg-white/5 rounded-full relative">
              <div className="absolute left-0 top-0 h-full bg-[#67E8F9] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
          <div className="text-[#67E8F9] text-base font-light">50%</div>
        </div>

        {/* Item 2 */}
        <div 
          className="bg-[#141A27] rounded-[28px] p-5 flex items-center cursor-pointer shadow-lg overflow-hidden relative"
          onClick={() => onAuditClick?.('2')}
        >
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#1E253A] flex items-center justify-center mr-4">
            <LayoutDashboard size={24} className="text-[#E9D5FF]" />
          </div>
          <div className="flex-1 w-full min-w-0 pr-4">
            <h4 className="text-white font-semibold text-[15px] mb-1 truncate">Downtown Retail</h4>
            <p className="text-white/40 text-sm mb-3">Compliance Check</p>
            {/* Progress Bar Container */}
            <div className="w-full h-[6px] bg-white/5 rounded-full relative">
              <div className="absolute left-0 top-0 h-full bg-[#E9D5FF] rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="text-[#E9D5FF] text-base font-light">80%</div>
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;
