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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const StepComponent = STEPS[currentStep].component;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #0D0D0D)',
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
      }}
    >
      {/* Step Indicator */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            {STEPS.map((step, i) => (
              <div key={step.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '4px',
                    backgroundColor: i <= currentStep ? '#F0513E' : 'rgba(255,255,255,0.08)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Step labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => (
              <button
                key={step.label}
                onClick={() => {
                  if (i <= currentStep) {
                    setCurrentStep(i);
                    persistState(i, formData);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.688rem',
                  fontWeight: i === currentStep ? 600 : 400,
                  color: i === currentStep ? '#F0513E' : i < currentStep ? '#9CA3AF' : '#6B7280',
                  cursor: i <= currentStep ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 2px',
                }}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* Save indicator */}
          {saving && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <Save size={12} style={{ color: '#6B7280' }} />
              <span style={{ fontSize: '0.688rem', color: '#6B7280' }}>Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <StepComponent
          data={formData}
          onChange={handleStepData}
          errors={stepErrors}
        />
      </div>

      {/* Navigation */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: currentStep === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
              color: currentStep === 0 ? '#6B7280' : '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 32px',
                backgroundColor: '#F0513E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 32px',
                backgroundColor: '#22C55E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
              }}
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
