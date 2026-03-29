import ProgressRing from '../ui/ProgressRing';
import StatusBadge from '../ui/StatusBadge';
import StepProgressBar from '../ui/StepProgressBar';
import NeonButton from '../ui/NeonButton';
import GlassCard from '../ui/GlassCard';
import BottomNav from '../ui/BottomNav';
import { colors } from '../../design-system';

interface AuditFormStepProps {
  auditName: string;
  auditType: 'farm' | 'business';
  dateRange?: string;
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  progress: number;
  status: 'in_progress' | 'action_required';
  hasErrors?: boolean;
  errorMessage?: string;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export default function AuditFormStep({
  auditName,
  auditType,
  dateRange,
  currentStep,
  totalSteps,
  stepLabels,
  progress,
  status,
  hasErrors = false,
  errorMessage,
  onBack,
  onNext,
  children,
}: AuditFormStepProps) {
  const typeIcon = auditType === 'farm' ? 'eco' : 'store';
  const sectionTitle = stepLabels[currentStep - 1] ?? `Step ${currentStep}`;

  return (
    <div className="min-h-dvh bg-bg-deep pb-40">
      {/* Header */}
      <div className="flex items-start justify-between px-8 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <span className="material-symbols-outlined text-white/60 text-[28px]">
              {typeIcon}
            </span>
          </div>
          <div>
            <h1 className="font-sora text-[28px] font-light text-white">{auditName}</h1>
            {dateRange && (
              <p className="mt-0.5 font-manrope text-[11px] text-gray-500">{dateRange}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} size="sm" />
          <ProgressRing
            percent={progress}
            size={56}
            color={hasErrors ? colors.neonRed : colors.neonLime}
          />
        </div>
      </div>

      {/* Step Progress */}
      {hasErrors ? (
        <ErrorStepTimeline
          totalSteps={totalSteps}
          currentStep={currentStep}
          stepLabels={stepLabels}
          errorMessage={errorMessage}
        />
      ) : (
        <StepProgressBar
          totalSteps={totalSteps}
          currentStep={currentStep}
          stepLabels={stepLabels}
        />
      )}

      {/* Section label */}
      <div className="px-8 mt-8">
        <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          {auditType === 'farm' ? 'FARM DETAILS' : 'BUSINESS DETAILS'}
        </p>
        <p className="mt-1 font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-neon-lime">
          Step {currentStep} &mdash; {sectionTitle}
        </p>
      </div>

      {/* Content */}
      <div className="mt-6 overflow-y-auto px-4 pb-40 scrollbar-hide">
        <GlassCard padding="lg" radius="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sora text-lg font-semibold text-white">{sectionTitle}</h3>
            {hasErrors && (
              <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-neon-red flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                REQUIRED
              </span>
            )}
          </div>
          {children}
        </GlassCard>
      </div>

      {/* Navigation footer */}
      <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-between px-4 pb-6 pt-4"
        style={{
          background: 'linear-gradient(to top, #0B0F19 60%, transparent)',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-6 py-3 font-manrope text-xs font-bold uppercase tracking-[0.15em] text-white transition-all active:scale-95"
          aria-label="Previous step"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          BACK
        </button>
        <NeonButton variant="lime" icon="chevron_right" onClick={onNext}>
          NEXT
        </NeonButton>
      </div>

      <BottomNav active="add" />
    </div>
  );
}

function ErrorStepTimeline({
  totalSteps,
  currentStep,
  stepLabels,
  errorMessage,
}: {
  totalSteps: number;
  currentStep: number;
  stepLabels: string[];
  errorMessage?: string;
}) {
  return (
    <div className="px-8 mt-4">
      <div className="flex flex-col gap-3">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isError = stepNum === currentStep;
          const isFuture = stepNum > currentStep;

          return (
            <div key={stepNum} className="flex items-start gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isCompleted ? 'bg-neon-lime' :
                    isError ? 'bg-neon-red' :
                    'bg-white/10'
                  }`}
                >
                  {isCompleted && (
                    <span className="material-symbols-outlined filled text-black text-[16px]">check</span>
                  )}
                  {isError && (
                    <span className="material-symbols-outlined text-white text-[14px]">priority_high</span>
                  )}
                </div>
                {stepNum < totalSteps && (
                  <div className={`w-[2px] h-4 mt-1 ${isCompleted ? 'bg-neon-lime' : 'bg-white/10'}`} />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className={`font-manrope text-xs font-semibold ${
                  isError ? 'text-neon-red' :
                  isCompleted ? 'text-neon-lime' :
                  'text-white/30'
                }`}>
                  Step {stepNum} &mdash; {stepLabels[i]}
                </p>
                {isError && errorMessage && (
                  <div className="mt-2 flex items-start gap-2 rounded-3xl bg-neon-red/10 p-4">
                    <span className="material-symbols-outlined text-neon-red text-[16px] mt-0.5">error</span>
                    <p className="font-manrope text-[11px] leading-relaxed text-neon-red">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
