import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import './NavigationButtons.css';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isSubmitting?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  canGoBack,
  canGoNext,
  isLastQuestion,
  isSubmitting = false,
}) => {
  return (
    <div className="flex items-center justify-between mt-12 mb-4 w-full">
      {/* Previous Button */}
      {canGoBack ? (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors py-4 px-8 rounded-full border border-white/5 hover:bg-white/5 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
      ) : <div /> /* Placeholder to keep Next button on the right */}

      {/* Next or Submit Button */}
      {!isLastQuestion ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className={`px-12 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
            canGoNext ? 'bg-neonLime text-black neon-glow-lime shadow-lg active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          NEXT
          <ChevronRight className="w-5 h-5 font-bold" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className={`px-12 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
            canGoNext && !isSubmitting ? 'bg-neonLime text-black neon-glow-lime shadow-lg active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              SUBMITTING...
            </>
          ) : (
             <>
              SUBMIT
              <Check className="w-5 h-5 font-bold" />
            </>
          )}
        </button>
      )}
    </div>
  );
};