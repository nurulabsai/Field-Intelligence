import React from 'react';
import { Settings, Download, Calendar as CalendarIcon, FileArchive, FileText, File, RefreshCw } from 'lucide-react';
import './SyncStatusScreen.css';
import { BottomNav } from './BottomNav';

interface SyncItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'syncing' | 'synced' | 'error' | 'pending';
}

interface SyncStatusScreenProps {
  syncProgress: number; // 0-100
  syncedItems: SyncItem[];
  onClose: () => void;
  offlineMode?: boolean;
}

export const SyncStatusScreen: React.FC<SyncStatusScreenProps> = ({
  syncProgress,
  syncedItems,
  onClose,
  offlineMode = false,
}) => {
  const getColorForStatus = (status: string) => {
    if (status === 'error') return '#FF4D4D';
    if (status === 'synced') return '#BEF264';
    return '#67E8F9';
  };

  const getIconForTitle = (title: string, status: string) => {
    const color = getColorForStatus(status);
    if (title.toLowerCase().includes('zip')) return <FileArchive color={color} size={24} />;
    if (title.toLowerCase().includes('pdf') || title.toLowerCase().includes('report')) return <FileText color={color} size={24} />;
    return <File color={color} size={24} />;
  };

  return (
    <div className="bg-[#0B0F19] font-sans text-white min-h-screen flex flex-col">
      <div className="flex-1 pb-40">
        <header className="px-6 pt-12 pb-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className=" font-light text-[24px] tracking-tight leading-none">System Tracking &amp; Sync</h1>
            <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5">
              <Settings className="text-slate-300" size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex-1 text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm" style={{ backgroundColor: '#BEF264' }}>
              <Download size={20} />
              Export CSV
            </button>
            <button className="flex-1 glass-material text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm">
              <CalendarIcon size={20} />
              Filter Dates
            </button>
          </div>
        </header>

        <main className="px-6 flex flex-col gap-8">
          <section>
            <h2 className=" font-semibold text-[20px] text-white mb-4">Active Sync</h2>
            <div className="flex flex-col gap-3">
              {syncedItems.length === 0 ? (
                <div className="glass-material rounded-[32px] p-8 text-center text-slate-400 text-sm">No items configured for sync.</div>
              ) : (
                syncedItems.map((item) => {
                  if (item.status === 'syncing') {
                    return (
                      <div key={item.id} className="glass-material rounded-[32px] p-8 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#67E8F9]/10 rounded-2xl flex items-center justify-center">
                              {getIconForTitle(item.title, item.status)}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm">{item.title}</h3>
                              <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                            </div>
                          </div>
                          <div className="px-4 py-1.5 bg-[#67E8F9]/10 text-[#67E8F9] text-[10px] font-bold rounded-full animate-pulse-cyan flex items-center gap-1 border border-[#67E8F9]/30">
                            Syncing
                          </div>
                        </div>
                        <div className="h-[6px] bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#67E8F9] rounded-full shadow-[0_0_8px_rgba(103,232,249,0.5)]" 
                            style={{ width: `${syncProgress}%`, transition: 'width 0.3s ease' }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (item.status === 'synced') {
                    return (
                      <div key={item.id} className="glass-material rounded-[32px] p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#BEF264]/10 rounded-2xl flex items-center justify-center">
                            {getIconForTitle(item.title, item.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{item.title}</h3>
                            <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 bg-[#BEF264]/10 text-[#BEF264] text-[10px] font-bold rounded-full border border-[#BEF264]/30">
                          Completed
                        </div>
                      </div>
                    );
                  }

                  if (item.status === 'error') {
                    return (
                      <div key={item.id} className="glass-material rounded-[32px] p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#FF4D4D]/10 rounded-2xl flex items-center justify-center">
                            {getIconForTitle(item.title, item.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{item.title}</h3>
                            <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-4 py-1.5 bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] font-bold rounded-full border border-[#FF4D4D]/30">
                            Failed
                          </div>
                          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 border border-white/5">
                            <RefreshCw size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })
              )}
            </div>
          </section>

          <section className="flex-1 flex flex-col min-h-0">
            <h2 className=" font-semibold text-[20px] text-white mb-4">Activity Tracking</h2>
            <div className="glass-material rounded-[32px] flex-1 flex flex-col overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 z-10 glass-material border-none">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-8 py-5">Activity ID</th>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5">Action Type</th>
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    <tr className="table-row-alt border-b border-white/5">
                      <td className="px-8 py-6 font-mono text-slate-400">#NR-9821</td>
                      <td className="px-8 py-6 font-semibold text-white">John Doe</td>
                      <td className="px-8 py-6 text-slate-300">Site Visit</td>
                      <td className="px-8 py-6 text-slate-400">10:45 AM</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#BEF264]/10 text-[#BEF264] text-[10px] font-bold rounded-full border border-[#BEF264]/20">Completed</span>
                      </td>
                    </tr>
                    <tr className="table-row-alt border-b border-white/5">
                      <td className="px-8 py-6 font-mono text-slate-400">#NR-9819</td>
                      <td className="px-8 py-6 font-semibold text-white">Sarah M.</td>
                      <td className="px-8 py-6 text-slate-300">Data Entry</td>
                      <td className="px-8 py-6 text-slate-400">09:12 AM</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#BEF264]/10 text-[#BEF264] text-[10px] font-bold rounded-full border border-[#BEF264]/20">Completed</span>
                      </td>
                    </tr>
                    <tr className="table-row-alt border-b border-white/5">
                      <td className="px-8 py-6 font-mono text-slate-400">#NR-9815</td>
                      <td className="px-8 py-6 font-semibold text-white">Mike R.</td>
                      <td className="px-8 py-6 text-slate-300">Export</td>
                      <td className="px-8 py-6 text-slate-400">Yesterday</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] font-bold rounded-full border border-[#FF4D4D]/20">Failed</span>
                      </td>
                    </tr>
                    <tr className="table-row-alt">
                      <td className="px-8 py-6 font-mono text-slate-400">#NR-9804</td>
                      <td className="px-8 py-6 font-semibold text-white">John Doe</td>
                      <td className="px-8 py-6 text-slate-300">Audit Final</td>
                      <td className="px-8 py-6 text-slate-400">Yesterday</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#BEF264]/10 text-[#BEF264] text-[10px] font-bold rounded-full border border-[#BEF264]/20">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                <button className="px-6 py-2.5 glass-material rounded-full text-[11px] font-bold text-slate-400 uppercase active:scale-95 transition-all">Prev</button>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-[#BEF264] text-black text-[11px] font-bold shadow-[0_0_15px_rgba(190,242,100,0.3)]">1</button>
                  <button className="w-10 h-10 rounded-full glass-material text-[11px] font-bold text-slate-400 hover:text-white transition-colors">2</button>
                  <button className="w-10 h-10 rounded-full glass-material text-[11px] font-bold text-slate-400 hover:text-white transition-colors">3</button>
                </div>
                <button className="px-6 py-2.5 glass-material rounded-full text-[11px] font-bold text-slate-400 uppercase active:scale-95 transition-all">Next</button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <BottomNav activeTab="stats" />
    </div>
  );
};