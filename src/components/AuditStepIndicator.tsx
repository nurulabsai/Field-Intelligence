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
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        padding: '16px 8px',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'auto',
      }}
    >
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
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: index < steps.length - 1 ? 1 : 'none',
            }}
          >
            {/* Step circle + label column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '40px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  color: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                  boxShadow: isCurrent
                    ? '0 0 0 3px rgba(240,81,62,0.25)'
                    : 'none',
                }}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: isCurrent
                    ? '#FFFFFF'
                    : isCompleted
                      ? '#22C55E'
                      : '#6B7280',
                  fontWeight: isCurrent ? 600 : 400,
                  marginTop: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isCompleted
                    ? '#22C55E'
                    : 'rgba(255,255,255,0.08)',
                  marginTop: '-16px',
                  marginLeft: '4px',
                  marginRight: '4px',
                  transition: 'background-color 0.25s ease',
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
