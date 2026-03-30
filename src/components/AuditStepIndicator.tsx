import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../design-system';

interface AuditStepIndicatorProps {
  totalSteps?: number;
  currentStep: number;
  completedSteps: number[];
}

const STEP_LABELS = ['Identity', 'Location', 'Farm', 'Crops', 'Inputs', 'Yield'];

const AuditStepIndicator: React.FC<AuditStepIndicatorProps> = ({
  totalSteps = 6,
  currentStep,
  completedSteps,
}) => {
  const steps = STEP_LABELS.slice(0, totalSteps);

  return (
    <div className="flex items-start justify-center w-full py-4 px-2 font-base overflow-x-auto">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = currentStep === stepNum;

        return (
          <div
            key={stepNum}
            className="flex items-center"
            style={{
              flex: index < steps.length - 1 ? 1 : 'none',
            }}
          >
            {/* Step circle + label column */}
            <div className="flex flex-col items-center min-w-[44px] py-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-[var(--transition-slow)]',
                  isCurrent && 'bg-accent text-white shadow-[0_0_0_3px_rgba(190,242,100,0.25)]',
                  isCompleted && !isCurrent && 'bg-success text-white',
                  !isCurrent && !isCompleted && 'bg-bg-input text-text-tertiary',
                )}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 whitespace-nowrap',
                  isCurrent && 'text-white font-semibold',
                  isCompleted && !isCurrent && 'text-success font-normal',
                  !isCurrent && !isCompleted && 'text-text-tertiary font-normal',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 -mt-4 mx-1 transition-colors duration-[var(--transition-slow)]',
                  isCompleted ? 'bg-success' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AuditStepIndicator;
