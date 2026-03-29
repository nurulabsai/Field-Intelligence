import React from 'react';
import { ClipboardList, Send, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import MetricWidget from './components/MetricWidget';
import AuditFeed from './components/AuditFeed';
import CropPriceTable from './components/CropPriceTable';

interface DashboardHomeProps {
  userName?: string;
  stressAlert?: string | null;
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
  onAuditClick,
  onViewAllAudits,
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #0D0D0D)',
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Stress Alert */}
      {stressAlert && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            backgroundColor: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <AlertTriangle size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#FCD34D', fontWeight: 500 }}>{stressAlert}</span>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
          Hi {userName}! Welcome Back,
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{dateStr}</p>
      </div>

      {/* KPI Row */}
      <div
        className="nuru-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <MetricWidget
          icon={<ClipboardList size={20} />}
          value="128"
          label="Total Audits"
          trend={12}
          variant="default"
        />
        <MetricWidget
          icon={<Send size={20} />}
          value="7"
          label="Submitted Today"
          trend={25}
          variant="success"
        />
        <MetricWidget
          icon={<WifiOff size={20} />}
          value="3"
          label="Pending Sync"
          variant="warning"
        />
        <MetricWidget
          icon={<CheckCircle2 size={20} />}
          value="112"
          label="Verified"
          trend={8}
          variant="success"
        />
      </div>

      {/* Content Grid */}
      <div
        className="nuru-dashboard-content"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        <AuditFeed
          items={MOCK_AUDITS}
          onItemClick={onAuditClick}
          onViewAll={onViewAllAudits}
        />
        <CropPriceTable data={MOCK_PRICES} />
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
