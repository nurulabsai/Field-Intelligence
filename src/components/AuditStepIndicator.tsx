import React from 'react';
import MaterialIcon from './MaterialIcon';
import { cn } from '../design-system';

interface AuditStepIndicatorProps {
  totalSteps?: number;
  currentStep: number;
  completedSteps: number[];
  stepLabels?: readonly string[];
}

const DEFAULT_LABELS = [
  'Identity',
  'Location',
  'Farm',
  'Boundary',
  'Plots',
  'Observe',
  'Details',
  'Crops',
  'Inputs',
  'Yield',
] as const;

const AuditStepIndicator: React.FC<AuditStepIndicatorProps> = ({
  totalSteps = 10,
  currentStep,
  completedSteps,
  stepLabels,
}) => {
  const labels = stepLabels ?? DEFAULT_LABELS;
  const steps = labels.slice(0, totalSteps);

  return (
    <div className="flex items-center w-full py-2 font-base overflow-x-auto scrollbar-none">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = currentStep === stepNum;
        const isPast = stepNum < currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center shrink-0" style={{ minWidth: '28px' }}>
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200',
                  isCurrent && 'bg-accent text-black shadow-[0_0_0_3px_rgba(190,242,100,0.25)] scale-110',
                  isCompleted && !isCurrent && 'bg-success text-white',
                  !isCurrent && !isCompleted && 'bg-bg-input text-text-tertiary',
                )}
              >
                {isCompleted && !isCurrent ? (
                  <MaterialIcon name="check" size={12} />
                ) : (
                  stepNum
                )}
              </div>
              {(isCurrent || isCompleted) && (
                <span
                  className={cn(
                    'text-[8px] mt-1 whitespace-nowrap font-semibold',
                    isCurrent && 'text-accent',
                    isCompleted && !isCurrent && 'text-success/70',
                  )}
                >
                  {label}
                </span>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] mx-0.5 min-w-[8px] transition-colors duration-200',
                  isPast || isCompleted ? 'bg-success/50' : 'bg-border',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default AuditStepIndicator;
