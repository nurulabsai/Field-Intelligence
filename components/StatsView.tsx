
import React, { useRef } from 'react';
import { Trophy, Target, Clock, Activity, Download, Award, Shield, FileSpreadsheet, FileJson, Save, FileText, Upload } from 'lucide-react';
import { AuditRecord } from '../types';
import { calculateStats } from '../services/trainingService';
import { exportToCSV, exportToJSON, createBackup, generatePDFReport } from '../services/exportService';
import { restoreBackup } from '../services/storageService';
import { Language, translations } from '../services/i18n';

interface StatsViewProps {
  audits: AuditRecord[];
  lang: Language;
  onClose: () => void;
}

const StatCard = ({ icon: Icon, value, label, sub, color }: any) => (
  <div className={`p-4 rounded-2xl border bg-white ${color} flex items-start gap-4`}>
    <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium opacity-80">{label}</div>
      {sub && <div className="text-xs mt-1 opacity-60">{sub}</div>}
    </div>
  </div>
);

const Badge = ({ icon: Icon, title, desc, unlocked }: any) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border ${unlocked ? 'bg-white border-green-200' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
    <div className={`p-2 rounded-full ${unlocked ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </div>
  </div>
);

const StatsView: React.FC<StatsViewProps> = ({ audits, lang, onClose }) => {
  const stats = calculateStats(audits);
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await restoreBackup(e.target.files[0]);
      alert(res.message + (res.success ? ` (${res.count} records)` : ''));
      if(res.success) {
          // Ideally refresh parent state, but simple reload works for this scope
          window.location.reload(); 
      }
    }
  };

  const user = JSON.parse(localStorage.getItem('audit_pro_user') || '{"name":"User"}');

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-in slide-in-from-bottom">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              {t.stats}
            </h2>
            <p className="text-slate-500">Track your performance and manage data</p>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-300">
            Close
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard 
            icon={Trophy} 
            value={stats.total} 
            label="Total Audits" 
            sub={`${stats.trainingCount} Training, ${stats.realCount} Live`}
            color="bg-blue-50 text-blue-900 border-blue-100"
          />
          <StatCard 
            icon={Target} 
            value={`${stats.avgAccuracy}m`} 
            label="Avg. Accuracy" 
            sub={stats.avgAccuracy < 10 ? "Excellent Signal!" : "Needs Improvement"}
            color={stats.avgAccuracy < 10 ? "bg-green-50 text-green-900 border-green-100" : "bg-amber-50 text-amber-900 border-amber-100"}
          />
          <StatCard 
            icon={Shield} 
            value={`${stats.qualityScore}%`} 
            label="Quality Score" 
            sub="Based on data completeness"
            color="bg-purple-50 text-purple-900 border-purple-100"
          />
          <StatCard 
            icon={Clock} 
            value="28m" 
            label="Avg. Time" 
            sub="Per audit session"
            color="bg-slate-100 text-slate-900 border-slate-200"
          />
        </div>

        {/* Gamification */}
        <h3 className="font-bold text-lg mb-4 text-slate-800">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Badge icon={Award} title="Rookie Auditor" desc="Complete 5 Training Audits" unlocked={stats.trainingCount >= 5} />
          <Badge icon={Target} title="Precision Master" desc="Achieve <5m GPS Accuracy" unlocked={stats.avgAccuracy < 5 && stats.total > 0} />
          <Badge icon={Trophy} title="Field Expert" desc="Complete 50 Total Audits" unlocked={stats.total >= 50} />
          <Badge icon={Shield} title="Data Perfectionist" desc="95%+ Quality Score" unlocked={stats.qualityScore >= 95 && stats.total > 5} />
        </div>

        {/* Export & Backup Section */}
        <div className="border-t pt-8">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-600" /> Data Export & Backup
          </h3>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
            
            {/* CSV Exports */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">CSV Exports (Spreadsheet)</h4>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => exportToCSV(audits, 'farm')}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-colors"
                    >
                        <FileSpreadsheet className="w-5 h-5" /> Farm CSV
                    </button>
                    <button 
                        onClick={() => exportToCSV(audits, 'business')}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                    >
                        <FileSpreadsheet className="w-5 h-5" /> Business CSV
                    </button>
                </div>
            </div>

            {/* Reports & JSON */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Reports & Backup</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                        onClick={() => generatePDFReport(audits, user)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                    >
                        <FileText className="w-5 h-5" /> PDF Summary Report
                    </button>
                    <button 
                        onClick={() => exportToJSON(audits)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        <FileJson className="w-5 h-5" /> Export Full JSON
                    </button>
                </div>
            </div>

            {/* System Backup/Restore */}
            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">System Recovery</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={() => createBackup(audits)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg"
                    >
                        <Save className="w-5 h-5" /> Backup to Device
                    </button>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        <Upload className="w-5 h-5" /> Restore Backup
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleRestore} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Note: Restoring a backup will merge records into your current local database.
                </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
