import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
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
    onComplete?.(formData);
  }, [formData, onComplete]);

  const StepComponent = STEPS[currentStep]!.component;

  return (
    <div className="min-h-screen bg-bg-primary font-base">
      {/* Step Indicator */}
      <div
        className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] px-6 py-4"
        style={{
          backgroundColor: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[800px] mx-auto">
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex-1 flex items-center gap-1">
                <div
                  className="flex-1 h-[3px] rounded transition-colors duration-300"
                  style={{
                    backgroundColor: i <= currentStep ? '#F0513E' : 'rgba(255,255,255,0.08)',
                  }}
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
                className="bg-transparent border-none text-[0.688rem] uppercase tracking-widest px-0.5 py-1 font-inherit"
                style={{
                  fontWeight: i === currentStep ? 600 : 400,
                  color: i === currentStep ? '#F0513E' : i < currentStep ? '#9CA3AF' : '#6B7280',
                  cursor: i <= currentStep ? 'pointer' : 'default',
                }}
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
        <StepComponent
          data={formData}
          onChange={handleStepData}
          errors={stepErrors}
        />
      </div>

      {/* Navigation */}
      <div
        className="sticky bottom-0 border-t border-[rgba(255,255,255,0.06)] px-6 py-4"
        style={{
          backgroundColor: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[800px] mx-auto flex justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 py-3 px-6 border border-border rounded-xl text-sm font-medium font-inherit transition-all duration-150"
            style={{
              backgroundColor: currentStep === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
              color: currentStep === 0 ? '#6B7280' : '#FFFFFF',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 py-3 px-8 bg-accent text-white border-none rounded-xl text-sm font-semibold cursor-pointer font-inherit transition-colors duration-150"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 py-3 px-8 bg-success text-white border-none rounded-xl text-sm font-semibold cursor-pointer font-inherit transition-colors duration-150"
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
