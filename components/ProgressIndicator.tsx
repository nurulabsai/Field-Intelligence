import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  sectionName?: string;
  sectionNames?: string[];
  errors?: number[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentQuestion,
  totalQuestions,
  sectionName,
  sectionNames,
  errors = [],
}) => {
  return (
    <div className="mt-4 w-full">
      {/* Vertical Step List */}
      <div className="space-y-3 relative px-2 mb-8">
        {/* Vertical connector line */}
        <div className="absolute left-[23px] top-10 bottom-10 w-[1px] bg-white/5"></div>

        {Array.from({ length: totalQuestions }).map((_, i) => {
          const index = i + 1;
          const isCompleted = index < currentQuestion;
          const isCurrent = index === currentQuestion;
          const hasError = errors.includes(index);
          const stepLabel = sectionNames?.[i] || `Step ${index}`;

          // Error state for the current/errored step
          if (hasError) {
            return (
              <div
                key={index}
                className="flex items-start space-x-5 p-6 bg-[#FF4B4B]/5 rounded-[32px] border border-[#FF4B4B]/10"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF4B4B] flex items-center justify-center z-10 shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-white font-sans">{stepLabel}</h3>
                      <p className="text-[10px] text-[#FF4B4B] uppercase font-bold tracking-widest font-sans">
                        Step {index} • Errored
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/30 text-base">visibility_off</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="flex items-center space-x-5 py-2">
              {/* Step Indicator */}
              {isCompleted && (
                <div className="w-6 h-6 rounded-full bg-[#BEF264] flex items-center justify-center z-10 shrink-0">
                  <span className="material-symbols-outlined text-black text-[14px] font-bold">check</span>
                </div>
              )}
              {isCurrent && !hasError && (
                <div className="w-6 h-6 rounded-full border border-[#BEF264] flex items-center justify-center bg-[#BEF264]/10 z-10 shrink-0">
                  <div className="w-2 h-2 bg-[#BEF264] rounded-full shadow-[0_0_8px_rgba(190,242,100,0.5)]"></div>
                </div>
              )}
              {!isCompleted && !isCurrent && (
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 z-10 shrink-0"></div>
              )}

              {/* Step Text */}
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <h3 className={`text-sm font-medium font-sans ${isCompleted || isCurrent ? 'text-white/90' : 'text-white/40'}`}>
                    {stepLabel}
                  </h3>
                  <p className={`text-[10px] uppercase font-bold tracking-widest font-sans ${
                    isCompleted ? 'text-white/30' : isCurrent ? 'text-[#BEF264]' : 'text-white/20'
                  }`}>
                    Step {index} • {isCompleted ? 'Complete' : isCurrent ? 'In Progress' : 'Pending'}
                  </p>
                </div>
                {isCompleted && (
                  <span className="material-symbols-outlined text-white/10">expand_more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sectionName && (
        <div className="mt-2 mb-4">
          <p className="text-[10px] text-[#BEF264] font-bold uppercase tracking-[0.2em] font-sans">
            Step {currentQuestion} — {sectionName}
          </p>
        </div>
      )}
    </div>
  );
};