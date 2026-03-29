import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAuditStore, useUIStore } from '../store/index';
import BottomNav from '../components/ui/BottomNav';
import GlassCard from '../components/ui/GlassCard';
import SyncStatusBar from '../components/ui/SyncStatusBar';
import NuruOSLogo from '../components/ui/NuruOSLogo';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const audits = useAuditStore(s => s.audits);
  const isOnline = useUIStore(s => s.isOnline);
  const pendingSyncCount = useUIStore(s => s.pendingSyncCount);

  const inProgress = audits.filter(a => a.status === 'in_progress');
  const highPriority = audits.filter(a => a.status === 'draft' || a.status === 'in_progress').length || 3;
  const farmCount = audits.filter(a => a.farm_id).length || 12;
  const businessCount = audits.length || 28;

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <NuruOSLogo size={24} color="#BEF264" bgColor="#0B0F19" showRing={false} />
          </div>
          <span className="font-sora text-xl font-light text-white">NuruOS</span>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5"
          aria-label="Profile"
          onClick={() => navigate('/settings')}
        >
          <span className="material-symbols-outlined text-white text-[20px]">person</span>
        </button>
      </div>

      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingSyncCount}
      />

      {/* Hero */}
      <div className="mt-4 mb-6 px-6 text-center">
        <h1 className="font-sora text-4xl font-light leading-tight tracking-tight text-white">
          Your Field<br />Audit Plan
        </h1>
      </div>

      {/* Stats Grid — bento style */}
      <div className="grid grid-cols-2 gap-4 px-6" style={{ height: '320px' }}>
        {/* Left: High Priority — full height */}
        <div className="flex flex-col justify-between rounded-[32px] bg-neon-lime p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/10">
            <span className="material-symbols-outlined text-neon-lime text-[28px]" style={{ color: '#0B0F19' }}>
              verified_user
            </span>
          </div>
          <div>
            <p className="font-sora text-5xl font-bold text-slate-900">
              {String(highPriority).padStart(2, '0')}
            </p>
            <p className="mt-1 font-sora text-sm font-bold text-slate-900">
              High Priority<br />Audits
            </p>
            <p className="mt-2 font-manrope text-[10px] uppercase tracking-[0.15em] text-black/60">
              TASKS PENDING
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Farm Checks */}
          <div className="flex flex-1 flex-col justify-between rounded-[32px] bg-neon-cyan p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10">
              <span className="material-symbols-outlined text-[22px]" style={{ color: '#0B0F19' }}>
                eco
              </span>
            </div>
            <div>
              <p className="font-sora text-2xl font-bold text-slate-900">{farmCount}</p>
              <p className="font-sora text-xs font-bold text-slate-900">Farm Checks</p>
            </div>
          </div>

          {/* Business Reports */}
          <div className="flex flex-1 flex-col justify-between rounded-[32px] bg-neon-purple/80 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10">
              <span className="material-symbols-outlined text-[22px]" style={{ color: '#0B0F19' }}>
                store
              </span>
            </div>
            <div>
              <p className="font-sora text-2xl font-bold text-slate-900">{businessCount}</p>
              <p className="font-sora text-xs font-bold text-slate-900">Business Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Audits */}
      <div className="mt-8 px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sora text-lg font-semibold text-white">Ongoing Audits</h2>
          <button
            onClick={() => navigate('/schedule')}
            className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-neon-lime"
          >
            VIEW ALL
          </button>
        </div>

        {inProgress.length === 0 ? (
          <>
            {/* Placeholder cards */}
            <OngoingAuditCard
              name="Green Valley Farm"
              type="Field Inspection"
              progress={55}
              color="lime"
              onClick={() => navigate('/audit/select')}
            />
            <OngoingAuditCard
              name="Downtown Retail"
              type="Compliance Check"
              progress={80}
              color="cyan"
              onClick={() => navigate('/audit/select')}
            />
          </>
        ) : (
          inProgress.map(audit => (
            <OngoingAuditCard
              key={audit.id}
              name={audit.farm_id}
              type={audit.status}
              progress={50}
              color="lime"
              onClick={() => navigate(`/audit/${audit.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function OngoingAuditCard({
  name,
  type,
  progress,
  color,
  onClick,
}: {
  name: string;
  type: string;
  progress: number;
  color: 'lime' | 'cyan';
  onClick: () => void;
}) {
  const barColor = color === 'lime' ? 'bg-neon-lime' : 'bg-neon-cyan';
  const glowClass = color === 'lime' ? 'glow-lime' : 'glow-cyan';

  return (
    <GlassCard padding="lg" radius="lg" className="mb-4" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <span className="material-symbols-outlined text-white/60 text-[20px]">
              {color === 'lime' ? 'eco' : 'store'}
            </span>
          </div>
          <div>
            <p className="font-sora text-sm font-semibold text-white">{name}</p>
            <p className="font-manrope text-[11px] text-slate-400">{type}</p>
          </div>
        </div>
        <span className="font-sora text-sm font-semibold text-white">{progress}%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${barColor} ${glowClass} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </GlassCard>
  );
}
