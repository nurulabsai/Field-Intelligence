import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../design-system';
import Step1_Identity from './steps/Step1_Identity';
import Step2_Location from './steps/Step2_Location';
import Step3_FarmChar from './steps/Step3_FarmChar';
import Step4_Crops from './steps/Step4_Crops';
import Step5_Inputs from './steps/Step5_Inputs';
import Step6_Yield from './steps/Step6_Yield';

const STEPS = [
  { label: 'Identity', component: Step1_Identity },
  { label: 'Location', component: Step2_Location },
  { label: 'Farm', component: Step3_FarmChar },
  { label: 'Crops', component: Step4_Crops },
  { label: 'Inputs', component: Step5_Inputs },
  { label: 'Yield', component: Step6_Yield },
];

interface AuditWizardProps {
  auditId?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

const DB_NAME = 'nuruos_audits';
const STORE_NAME = 'wizard_state';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveState(key: string, data: unknown): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(data, key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadState(key: string): Promise<unknown> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const req = tx.objectStore(STORE_NAME).get(key);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const AuditWizard: React.FC<AuditWizardProps> = ({ auditId, onComplete }) => {
  const stateKey = auditId || 'new_audit';
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load persisted state
  useEffect(() => {
    loadState(stateKey).then(stored => {
      if (stored && typeof stored === 'object') {
        const data = stored as { step?: number; formData?: Record<string, unknown> };
        if (data.step !== undefined) setCurrentStep(data.step);
        if (data.formData) setFormData(data.formData);
      }
    }).catch(() => { /* no saved state */ });
  }, [stateKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDirty) {
      sessionStorage.setItem('nuru_audit_dirty', 'true');
    } else {
      sessionStorage.removeItem('nuru_audit_dirty');
    }
    return () => {
      sessionStorage.removeItem('nuru_audit_dirty');
    };
  }, [isDirty]);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isDirty]);

  // Debounced auto-save
  const persistState = useCallback((step: number, data: Record<string, unknown>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveState(stateKey, { step, formData: data });
      } catch {
        // silently fail
      }
      setSaving(false);
    }, 500);
  }, [stateKey]);

  const handleStepData = useCallback((data: Record<string, unknown>) => {
    setFormData(prev => {
      const next = { ...prev, ...data };
      persistState(currentStep, next);
      return next;
    });
    setIsDirty(true);
    setStepErrors({});
  }, [currentStep, persistState]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistState(nextStep, formData);
    }
  }, [currentStep, formData, persistState]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      persistState(prevStep, formData);
    }
  }, [currentStep, formData, persistState]);

  const handleComplete = useCallback(() => {
    setIsDirty(false);
    onComplete?.(formData);
  }, [formData, onComplete]);

  const StepComponent = STEPS[currentStep]!.component;

  return (
    <div className="min-h-screen nuru-screen font-base">
      {/* Step Indicator */}
      <div
        className="sticky top-0 z-40 border-b border-border-glass px-6 py-4 bg-bg-primary/80 backdrop-blur-[18px]"
      >
        <div className="max-w-[800px] mx-auto">
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex-1 flex items-center gap-1">
                <div
                  className={cn(
                    'flex-1 h-[3px] rounded transition-colors duration-[var(--transition-slow)]',
                    i <= currentStep ? 'bg-accent' : 'bg-border',
                  )}
                />
              </div>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between">
            {STEPS.map((step, i) => (
              <button
                key={step.label}
                onClick={() => {
                  if (i <= currentStep) {
                    setCurrentStep(i);
                    persistState(i, formData);
                  }
                }}
                className={cn(
                  'bg-transparent border-none text-[0.688rem] uppercase tracking-widest px-1.5 py-1.5 font-inherit rounded-full',
                  i === currentStep && 'font-semibold text-accent cursor-pointer',
                  i < currentStep && 'font-normal text-text-secondary cursor-pointer',
                  i > currentStep && 'font-normal text-text-tertiary cursor-default',
                )}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* Save indicator */}
          {saving && (
            <div className="flex items-center gap-1.5 mt-2">
              <Save size={12} className="text-text-tertiary" />
              <span className="text-[0.688rem] text-text-tertiary">Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-[800px] mx-auto py-8 px-6">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            Travel Details
          </p>
          <p className="text-[11px] text-accent font-semibold uppercase tracking-[0.12em] mt-1">
            Step {currentStep + 1} - {STEPS[currentStep]!.label}
          </p>
        </div>
        <StepComponent
          data={formData}
          onChange={handleStepData}
          errors={stepErrors}
        />
      </div>

      {/* Navigation */}
      <div
        className="sticky bottom-0 border-t border-border-glass px-6 py-4 bg-bg-primary/80 backdrop-blur-[18px]"
      >
        <div className="max-w-[800px] mx-auto flex justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              'flex items-center gap-2 py-3 px-6 border border-border rounded-full text-sm font-medium font-inherit transition-all duration-[var(--transition-base)]',
              currentStep === 0
                ? 'bg-white/[0.03] text-text-tertiary cursor-not-allowed'
                : 'bg-border-glass text-white cursor-pointer',
            )}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 py-3 px-8 bg-accent text-black border-none rounded-full text-sm font-semibold cursor-pointer font-inherit transition-colors duration-[var(--transition-base)] shadow-[0_10px_28px_-12px_rgba(190,242,100,0.5)]"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 py-3 px-8 bg-success text-white border-none rounded-full text-sm font-semibold cursor-pointer font-inherit transition-colors duration-[var(--transition-base)]"
            >
              Submit Audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditWizard;
