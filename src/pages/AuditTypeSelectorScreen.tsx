import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import StatusBadge from '../components/ui/StatusBadge';

export default function AuditTypeSelectorScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-14 pb-10">
        <h1 className="font-sora text-[32px] font-light text-white">
          Select Audit Type
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="glass-card flex h-12 w-12 items-center justify-center rounded-full"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-white text-[20px]">close</span>
        </button>
      </div>

      {/* Audit type cards */}
      <div className="flex flex-col gap-6 px-8">
        {/* Farm Audit */}
        <GlassCard padding="lg" radius="lg">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-neon-lime/20 bg-neon-lime/10">
              <span className="material-symbols-outlined text-neon-lime text-[32px]">
                potted_plant
              </span>
            </div>
            <StatusBadge status="completed" label="Outdoor" size="sm" />
          </div>

          <h2 className="font-sora text-2xl font-semibold text-white">Farm Audit</h2>
          <p className="mt-2 font-manrope text-sm leading-relaxed text-white/50">
            Comprehensive assessment of crop health, irrigation, soil quality,
            and GPS boundary capture for farms across Tanzania.
          </p>

          <div className="mt-4 flex items-center gap-2">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-card bg-white/10">
                <span className="material-symbols-outlined text-white/60 text-[14px]">person</span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-card bg-white/10">
                <span className="material-symbols-outlined text-white/60 text-[14px]">person</span>
              </div>
            </div>
            <span className="font-manrope text-[11px] text-white/40">
              12 available templates
            </span>
          </div>

          <div className="mt-6">
            <NeonButton
              variant="lime"
              fullWidth
              onClick={() => navigate('/audit/new/farm')}
            >
              Start Farm Audit
            </NeonButton>
          </div>
        </GlassCard>

        {/* Business Inspection */}
        <GlassCard padding="lg" radius="lg">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-neon-cyan/20 bg-neon-cyan/10">
              <span className="material-symbols-outlined text-neon-cyan text-[32px]">
                store
              </span>
            </div>
            <StatusBadge status="syncing" label="Retail" size="sm" />
          </div>

          <h2 className="font-sora text-2xl font-semibold text-white">Business Inspection</h2>
          <p className="mt-2 font-manrope text-sm leading-relaxed text-white/50">
            Standard compliance audit for agrovets and agribusiness retailers,
            covering inventory, safety, and operational standards.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-card bg-white/10">
                <span className="material-symbols-outlined text-white/60 text-[14px]">person</span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-card bg-white/10">
                <span className="material-symbols-outlined text-white/60 text-[14px]">person</span>
              </div>
            </div>
            <span className="font-manrope text-[11px] text-white/40">
              8 available templates
            </span>
          </div>

          <div className="mt-6">
            <NeonButton
              variant="cyan"
              fullWidth
              onClick={() => navigate('/audit/new/business')}
            >
              Start Business Audit
            </NeonButton>
          </div>
        </GlassCard>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
