import React from 'react';
import { Check } from 'lucide-react';

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
    <div className="flex items-start justify-center w-full py-4 px-2 font-[Inter,sans-serif] overflow-x-auto">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = currentStep === stepNum;
        let circleBg = '#252525';
        let circleColor = '#6B7280';
        if (isCurrent) {
          circleBg = '#F0513E';
          circleColor = '#FFFFFF';
        } else if (isCompleted) {
          circleBg = '#22C55E';
          circleColor = '#FFFFFF';
        }

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
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-[250ms]"
                style={{
                  backgroundColor: circleBg,
                  color: circleColor,
                  boxShadow: isCurrent
                    ? '0 0 0 3px rgba(240,81,62,0.25)'
                    : 'none',
                }}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                className="text-xs mt-1.5 whitespace-nowrap"
                style={{
                  color: isCurrent
                    ? '#FFFFFF'
                    : isCompleted
                      ? '#22C55E'
                      : '#6B7280',
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 -mt-4 mx-1 transition-colors duration-[250ms]"
                style={{
                  backgroundColor: isCompleted
                    ? '#22C55E'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AuditStepIndicator;
