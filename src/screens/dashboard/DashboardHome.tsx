import React from 'react';
import { ClipboardList, Send, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import MetricWidget from './components/MetricWidget';
import AuditFeed from './components/AuditFeed';
import CropPriceTable from './components/CropPriceTable';

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

const MOCK_AUDITS = [
  { id: '1', farmName: 'Kilimanjaro Coffee Estate', auditType: 'Farm Audit', date: 'Mar 15, 2026', status: 'verified' as const },
  { id: '2', farmName: 'Mbeya Rice Paddies', auditType: 'Farm Audit', date: 'Mar 14, 2026', status: 'submitted' as const },
  { id: '3', farmName: 'Arusha Maize Farm', auditType: 'Farm Audit', date: 'Mar 14, 2026', status: 'synced' as const },
  { id: '4', farmName: 'Dodoma Sunflower Field', auditType: 'Farm Audit', date: 'Mar 13, 2026', status: 'draft' as const },
  { id: '5', farmName: 'Iringa Tea Plantation', auditType: 'Farm Audit', date: 'Mar 13, 2026', status: 'verified' as const },
  { id: '6', farmName: 'Morogoro Cassava Farm', auditType: 'Farm Audit', date: 'Mar 12, 2026', status: 'submitted' as const },
  { id: '7', farmName: 'Tanga Coconut Grove', auditType: 'Farm Audit', date: 'Mar 12, 2026', status: 'synced' as const },
  { id: '8', farmName: 'Kagera Banana Farm', auditType: 'Farm Audit', date: 'Mar 11, 2026', status: 'failed' as const },
  { id: '9', farmName: 'Mtwara Cashew Farm', auditType: 'Farm Audit', date: 'Mar 11, 2026', status: 'verified' as const },
  { id: '10', farmName: 'Singida Sorghum Field', auditType: 'Farm Audit', date: 'Mar 10, 2026', status: 'draft' as const },
];

const MOCK_PRICES = [
  { id: '1', crop: 'Maize', region: 'Dodoma', pricePerKg: 850, change: 5.2 },
  { id: '2', crop: 'Rice', region: 'Mbeya', pricePerKg: 2400, change: -2.1 },
  { id: '3', crop: 'Coffee (Arabica)', region: 'Kilimanjaro', pricePerKg: 8500, change: 12.4 },
  { id: '4', crop: 'Cashew Nuts', region: 'Mtwara', pricePerKg: 4200, change: 3.8 },
  { id: '5', crop: 'Sunflower', region: 'Singida', pricePerKg: 1600, change: -1.5 },
  { id: '6', crop: 'Tea', region: 'Iringa', pricePerKg: 3200, change: 0 },
  { id: '7', crop: 'Cotton', region: 'Shinyanga', pricePerKg: 1100, change: 7.3 },
];

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName = 'Agent',
  stressAlert,
  isLoading = false,
  stats,
  audits = MOCK_AUDITS,
  prices = MOCK_PRICES,
  onAuditClick,
  onViewAllAudits,
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen nuru-screen font-base p-6 max-w-[1280px] mx-auto">
      {/* Stress Alert */}
      {stressAlert && (
        <div className="flex items-center gap-3 py-3.5 px-5 bg-warning/10 border border-warning/25 rounded-[14px] mb-6">
          <AlertTriangle size={20} className="text-warning shrink-0" />
          <span className="text-sm text-warning-light font-medium">{stressAlert}</span>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-[2.1rem] nuru-hero-title text-white mb-1">
          Hi {userName}! Welcome Back,
        </h1>
        <p className="text-sm text-text-tertiary">{dateStr}</p>
      </div>

      {/* KPI Row */}
      <div className="nuru-kpi-grid grid grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="nuru-glass-card rounded-[24px] h-[156px] border border-border-glass animate-pulse" />
          ))
        ) : (
          <>
            <MetricWidget
              icon={<ClipboardList size={20} />}
              value={stats?.totalAudits ?? 128}
              label="Total Audits"
              trend={12}
              variant="default"
            />
            <MetricWidget
              icon={<Send size={20} />}
              value={stats?.submittedToday ?? 7}
              label="Submitted Today"
              trend={25}
              variant="success"
            />
            <MetricWidget
              icon={<WifiOff size={20} />}
              value={stats?.pendingSync ?? 3}
              label="Pending Sync"
              variant="warning"
            />
            <MetricWidget
              icon={<CheckCircle2 size={20} />}
              value={stats?.verified ?? 112}
              label="Verified"
              trend={8}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="nuru-dashboard-content grid grid-cols-2 gap-6">
        <AuditFeed
          items={audits}
          onItemClick={onAuditClick}
          onViewAll={onViewAllAudits}
        />
        <CropPriceTable data={prices} />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .nuru-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .nuru-dashboard-content { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .nuru-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
