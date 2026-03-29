import { cn } from '../../design-system';

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
  stepLabels?: string[];
}

export default function StepProgressBar({
  totalSteps,
  currentStep,
  stepLabels,
}: StepProgressBarProps) {
  return (
    <div className="px-8">
      {/* Step indicators */}
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-1 items-center last:flex-none">
              {/* Step circle */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-200',
                  isCompleted && 'h-6 w-6 bg-neon-lime',
                  isCurrent && 'h-6 w-6 border-2 border-neon-lime',
                  !isCompleted && !isCurrent && 'h-3 w-3 bg-white/10'
                )}
                aria-label={`Step ${stepNum}${isCompleted ? ' completed' : isCurrent ? ' current' : ''}`}
              >
                {isCompleted && (
                  <span className="material-symbols-outlined filled text-black text-[16px]">
                    check
                  </span>
                )}
                {isCurrent && (
                  <span className="block h-2 w-2 rounded-full bg-neon-lime animate-pulse-lime" />
                )}
              </div>

              {/* Connector line */}
              {stepNum < totalSteps && (
                <div
                  className={cn(
                    'mx-1 h-[2px] flex-1 transition-colors duration-200',
                    isCompleted ? 'bg-neon-lime' : 'bg-white/10'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step label */}
      {stepLabels && stepLabels[currentStep - 1] && (
        <p className="mt-3 font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-neon-lime">
          Step {currentStep} &mdash; {stepLabels[currentStep - 1]}
        </p>
      )}
    </div>
  );
}
