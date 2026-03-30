import React from 'react';
import { Settings, Download, Calendar, Folder, FileText, RotateCw } from 'lucide-react';

// Maintaining the props signature so App.tsx does not crash
interface AuditListProps {
  audits?: any[];
  isLoading?: boolean;
  onAuditClick?: (id: string) => void;
  onNewAudit?: () => void;
}

const AuditList: React.FC<AuditListProps> = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-base p-6 pb-[120px] max-w-[800px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.75rem] font-light text-white font-heading tracking-tight">
          System Tracking & Sync
        </h1>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-white/10">
          <Settings size={20} className="text-white/70" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-10">
        <button className="flex-1 py-3 px-5 rounded-full bg-accent text-black font-semibold text-[15px] flex items-center justify-center gap-2 border-none cursor-pointer">
          <Download size={18} strokeWidth={2.5} />
          Export CSV
        </button>
        <button className="flex-1 py-3 px-5 rounded-full bg-transparent border border-white/10 text-white font-medium text-[15px] flex items-center justify-center gap-2 cursor-pointer">
          <Calendar size={18} className="text-white/70" />
          Filter Dates
        </button>
      </div>

      {/* Active Sync Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Active Sync</h2>
        <div className="flex flex-col gap-4">
          
          {/* Sync Card 1 - Uploading */}
          <div className="w-full p-5 bg-[#121623] border border-white/5 rounded-[24px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#1E2538] flex items-center justify-center shrink-0">
                  <Folder size={24} className="text-[#67E8F9]" fill="#67E8F9" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-[15px] mb-0.5 tracking-wide">Site_Photos_A.zip</h4>
                  <p className="text-white/40 text-[13px] font-medium">34MB • Uploading...</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-[#67E8F9]/10 border border-[#67E8F9]/20 text-[#67E8F9] text-[11px] font-bold tracking-wider uppercase">
                Syncing
              </div>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-white/5 rounded-full relative mt-1 overflow-hidden pointer-events-none">
              <div className="absolute left-0 top-0 h-full bg-[#67E8F9] rounded-full w-[60%] shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
            </div>
          </div>

          {/* Sync Card 2 - Completed */}
          <div className="w-full p-5 bg-[#121623] border border-white/5 rounded-[24px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#1E2538] flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-accent" fill="#BEF264" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-[15px] mb-0.5 tracking-wide">Audit_Report_v2.pdf</h4>
                  <p className="text-white/40 text-[13px] font-medium">2MB • 2 mins ago</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold tracking-wider uppercase">
                Completed
              </div>
            </div>
          </div>

          {/* Sync Card 3 - Failed */}
          <div className="w-full p-5 bg-[#121623] border border-white/5 rounded-[24px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#2A1C24] flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-[#F87171]" fill="#F87171" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-[15px] mb-0.5 tracking-wide">Soil_Data.csv</h4>
                  <p className="text-white/40 text-[13px] font-medium">12MB • Failed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#F87171] text-[11px] font-bold tracking-wider uppercase">
                  Failed
                </div>
                <button className="w-10 h-10 rounded-full bg-[#1A2033] border border-white/5 flex items-center justify-center cursor-pointer text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                  <RotateCw size={18} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Activity Tracking Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Activity Tracking</h2>
        <div className="bg-[#121623] rounded-[24px] border border-white/5 overflow-hidden pb-6">
          
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-6 py-5 border-b border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Activity ID</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">User</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Action Type</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-6 py-5 items-center border-b border-white/5">
              <div className="text-[14px] text-white/50 font-medium">#NR-9821</div>
              <div className="text-[14px] text-white font-semibold">John Doe</div>
              <div className="text-[14px] text-white/80">Site Visit</div>
            </div>

            <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-6 py-5 items-center border-b border-white/5">
              <div className="text-[14px] text-white/50 font-medium">#NR-9819</div>
              <div className="text-[14px] text-white font-semibold">Sarah M.</div>
              <div className="text-[14px] text-white/80">Data Entry</div>
            </div>

            <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-6 py-5 items-center border-b border-white/5">
              <div className="text-[14px] text-white/50 font-medium">#NR-9815</div>
              <div className="text-[14px] text-white font-semibold">Mike R.</div>
              <div className="text-[14px] text-white/80">Export</div>
            </div>

            <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-6 py-5 items-center border-b border-white/5">
              <div className="text-[14px] text-white/50 font-medium">#NR-9804</div>
              <div className="text-[14px] text-white font-semibold flex flex-col gap-0.5">
                <span>John Doe</span>
              </div>
              <div className="text-[14px] text-white/80">Audit Final</div>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 pt-6 flex justify-between items-center gap-2">
            <button className="h-10 px-4 rounded-full bg-[#1A2033] text-[11px] font-bold tracking-widest uppercase text-white/50 border-none cursor-pointer">PREV</button>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 rounded-full bg-accent text-black font-bold text-sm flex items-center justify-center border-none shadow-[0_0_15px_rgba(190,242,100,0.4)] cursor-pointer">
                1
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1A2033] text-white/50 font-medium text-sm flex items-center justify-center border-none cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
                2
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1A2033] text-white/50 font-medium text-sm flex items-center justify-center border-none cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
                3
              </button>
            </div>
            <button className="h-10 px-4 rounded-full bg-[#1A2033] text-[11px] font-bold tracking-widest uppercase text-white/50 border-none cursor-pointer">NEXT</button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AuditList;
