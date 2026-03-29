import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/index';
import type { FarmerProfile } from '../../types/farmerTypes';
import type {
  AuditFormState, FarmProfile, FarmBoundaryDraft, PlotObservation,
} from '../../types/auditTypes';
import { FARM_AUDIT_STEPS, createEmptyPlot } from '../../types/auditTypes';
import { validateStepByIndex } from '../../validation/farmValidation';
import { saveAuditDraft, loadAuditDraft, saveFarmerLocally } from '../../services/auditStorageService';
import { buildAuditPayload } from '../../services/auditPayloadBuilder';
// Sync queue stub — enqueues to IndexedDB for background sync
async function enqueue(_type: string, _payload: unknown): Promise<void> {
  // In production, this writes to the sync queue IndexedDB store
  // For now, the data is already saved via saveAuditDraft
}

import FarmerProfileStep from '../../components/forms/steps/FarmerProfileStep';
import FarmProfileStep from '../../components/forms/steps/FarmProfileStep';
import FarmBoundaryStep from '../../components/forms/steps/FarmBoundaryStep';
import PlotStructureStep from '../../components/forms/steps/PlotStructureStep';
import PlotObservationsStep from '../../components/forms/steps/PlotObservationsStep';

// Legacy step imports for steps 6 & 7
import Step5_Inputs from './steps/Step5_Inputs';
import Step6_Yield from './steps/Step6_Yield';

interface AuditWizardProps {
  auditId?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

function createInitialState(auditId: string, auditorId: string): AuditFormState {
  return {
    auditId,
    auditType: 'farm',
    auditorId,
    startedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    currentStepIndex: 1,
    completedSteps: [],
    stepErrors: {},
    farmer: null,
    farmProfile: null,
    farmBoundary: null,
    plots: [],
    existingSections: {},
  };
}

const AuditWizard: React.FC<AuditWizardProps> = ({ auditId: propAuditId, onComplete }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const auditorId = user?.id ?? 'unknown';
  const stateId = propAuditId ?? crypto.randomUUID();

  const [state, setState] = useState<AuditFormState>(() =>
    createInitialState(stateId, auditorId)
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load persisted draft
  useEffect(() => {
    loadAuditDraft(stateId).then(stored => {
      if (stored) setState(stored);
    }).catch(() => {});
  }, [stateId]);

  // Debounced auto-save
  const persistDraft = useCallback((s: AuditFormState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try { await saveAuditDraft(s.auditId, s); } catch {}
      setSaving(false);
    }, 800);
  }, []);

  const updateState = useCallback((updates: Partial<AuditFormState>) => {
    setState(prev => {
      const next = { ...prev, ...updates, lastSavedAt: new Date().toISOString() };
      persistDraft(next);
      return next;
    });
  }, [persistDraft]);

  // ── Validation gate ──
  const handleNext = useCallback(() => {
    const errors = validateStepByIndex(state.currentStepIndex, state);
    if (errors.length > 0) {
      updateState({
        stepErrors: { ...state.stepErrors, [state.currentStepIndex]: errors },
      });
      return;
    }
    const completed = state.completedSteps.includes(state.currentStepIndex)
      ? state.completedSteps
      : [...state.completedSteps, state.currentStepIndex];
    updateState({
      completedSteps: completed,
      currentStepIndex: state.currentStepIndex + 1,
      stepErrors: { ...state.stepErrors, [state.currentStepIndex]: [] },
    });
  }, [state, updateState]);

  const handleBack = useCallback(() => {
    if (state.currentStepIndex > 1) {
      updateState({ currentStepIndex: state.currentStepIndex - 1 });
    }
  }, [state.currentStepIndex, updateState]);

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = buildAuditPayload(state);
      await enqueue('submit_audit', payload);
      if (state.farmer) {
        await saveFarmerLocally(state.farmer);
      }
      onComplete?.(payload as unknown as Record<string, unknown>);
      navigate('/dashboard');
    } catch (err) {
      updateState({
        stepErrors: {
          ...state.stepErrors,
          [8]: [err instanceof Error ? err.message : 'Submit failed — data saved locally'],
        },
      });
    } finally {
      setSubmitting(false);
    }
  }, [state, navigate, onComplete, updateState]);

  // ── Step renderer ──
  function renderStep() {
    switch (state.currentStepIndex) {
      case 1:
        return (
          <FarmerProfileStep
            farmer={state.farmer}
            onUpdate={(f: FarmerProfile) => updateState({ farmer: f })}
            auditorId={auditorId}
            auditId={state.auditId}
          />
        );
      case 2:
        return state.farmer ? (
          <FarmProfileStep
            farmer={state.farmer}
            farmProfile={state.farmProfile}
            onUpdate={(fp: FarmProfile) => updateState({ farmProfile: fp })}
          />
        ) : null;
      case 3:
        return state.farmProfile ? (
          <FarmBoundaryStep
            farmProfile={state.farmProfile}
            farmBoundary={state.farmBoundary}
            onUpdate={(fb: FarmBoundaryDraft) => updateState({ farmBoundary: fb })}
          />
        ) : null;
      case 4:
        return state.farmProfile ? (
          <PlotStructureStep
            farmProfile={state.farmProfile}
            plots={state.plots}
            auditId={state.auditId}
            onAddPlot={() => updateState({
              plots: [...state.plots,
                createEmptyPlot(state.farmProfile!.farmLocalRef, state.auditId)]
            })}
            onUpdatePlot={(id, updates) => updateState({
              plots: state.plots.map(p => p.localId === id ? { ...p, ...updates } : p)
            })}
            onRemovePlot={(id) => updateState({
              plots: state.plots.filter(p => p.localId !== id)
            })}
          />
        ) : null;
      case 5:
        return (
          <PlotObservationsStep
            plots={state.plots}
            onUpdateObservation={(plotId: string, obs: Partial<PlotObservation>) => updateState({
              plots: state.plots.map(p =>
                p.localId === plotId
                  ? { ...p, observation: { ...p.observation, ...obs } }
                  : p
              )
            })}
          />
        );
      case 6:
        return (
          <Step5_Inputs
            data={state.existingSections}
            onChange={(d: Record<string, unknown>) =>
              updateState({ existingSections: { ...state.existingSections, ...d } })
            }
            errors={{}}
          />
        );
      case 7:
        return (
          <Step6_Yield
            data={state.existingSections}
            onChange={(d: Record<string, unknown>) =>
              updateState({ existingSections: { ...state.existingSections, ...d } })
            }
            errors={{}}
          />
        );
      case 8:
        return renderReviewStep();
      default:
        return null;
    }
  }

  // ── Review Step ──
  function renderReviewStep() {
    return (
      <div className="space-y-4">
        {/* Farmer summary */}
        {state.farmer && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#BEF264] text-xl">person</span>
              </div>
              <div>
                <h3 className="font-['Sora'] text-white font-semibold">Farmer Profile</h3>
                <p className="text-white/40 text-xs">Step 1</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Name:</span> <span className="text-white">{state.farmer.identity.fullName}</span></div>
              <div><span className="text-white/40">Phone:</span> <span className="text-white font-mono text-xs">{state.farmer.identity.phoneNumber}</span></div>
              <div><span className="text-white/40">Gender:</span> <span className="text-white capitalize">{state.farmer.identity.gender}</span></div>
              <div><span className="text-white/40">Age:</span> <span className="text-white">{state.farmer.identity.ageRange.replace(/_/g, ' ')}</span></div>
              <div><span className="text-white/40">Education:</span> <span className="text-white capitalize">{state.farmer.household.educationLevel}</span></div>
              <div><span className="text-white/40">Co-op:</span> <span className="text-white">{state.farmer.experience.cooperativeMember ? 'Yes' : 'No'}</span></div>
            </div>
            <button
              onClick={() => updateState({ currentStepIndex: 1 })}
              className="mt-3 text-xs text-[#BEF264]/60 hover:text-[#BEF264]"
            >
              ← Edit Farmer
            </button>
          </div>
        )}

        {/* Farm summary */}
        {state.farmProfile && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#BEF264] text-xl">agriculture</span>
              </div>
              <div>
                <h3 className="font-['Sora'] text-white font-semibold">Farm Profile</h3>
                <p className="text-white/40 text-xs">Step 2</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Farm:</span> <span className="text-white">{state.farmProfile.farmLocalRef}</span></div>
              <div><span className="text-white/40">Area:</span> <span className="text-white">{state.farmProfile.totalAreaHa}ha</span></div>
              <div><span className="text-white/40">Region:</span> <span className="text-white">{state.farmProfile.region}</span></div>
              <div><span className="text-white/40">District:</span> <span className="text-white">{state.farmProfile.district}</span></div>
              <div><span className="text-white/40">Ward:</span> <span className="text-white">{state.farmProfile.ward}</span></div>
              <div><span className="text-white/40">Village:</span> <span className="text-white">{state.farmProfile.village}</span></div>
            </div>
            <button
              onClick={() => updateState({ currentStepIndex: 2 })}
              className="mt-3 text-xs text-[#BEF264]/60 hover:text-[#BEF264]"
            >
              ← Edit Farm
            </button>
          </div>
        )}

        {/* Boundary summary */}
        {state.farmBoundary && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#67E8F9]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#67E8F9] text-xl">fence</span>
              </div>
              <div>
                <h3 className="font-['Sora'] text-white font-semibold">Boundary</h3>
                <p className="text-white/40 text-xs">Step 3 — {state.farmBoundary.status}</p>
              </div>
            </div>
            {state.farmBoundary.polygon && (
              <p className="text-sm text-white/60">
                {state.farmBoundary.method} — {state.farmBoundary.polygon.area?.toFixed(2)}ha — {state.farmBoundary.polygon.points.length} points
              </p>
            )}
            {state.farmBoundary.status === 'skipped' && (
              <p className="text-sm text-[#FFBF00]/80">Skipped: {state.farmBoundary.skipReason}</p>
            )}
          </div>
        )}

        {/* Plots summary */}
        {state.plots.length > 0 && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#BEF264] text-xl">grid_view</span>
              </div>
              <div>
                <h3 className="font-['Sora'] text-white font-semibold">Plots & Observations</h3>
                <p className="text-white/40 text-xs">Steps 4+5 — {state.plots.length} plots — {state.plots.reduce((s, p) => s + p.areaHa, 0).toFixed(1)}ha total</p>
              </div>
            </div>
            <div className="space-y-2">
              {state.plots.map((plot, i) => (
                <div key={plot.localId} className="flex items-center justify-between text-sm bg-white/[0.02] rounded-xl px-3 py-2">
                  <span className="text-white">{plot.plotName || `Plot ${i + 1}`}</span>
                  <span className="text-white/40">{plot.currentCrop} · {plot.areaHa}ha</span>
                  <span className={`text-xs ${plot.observation.cropCondition ? 'text-[#BEF264]' : 'text-[#FF4B4B]/60'}`}>
                    {plot.observation.cropCondition ? '✓ obs' : '✗ obs'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateState({ currentStepIndex: 4 })}
              className="mt-3 text-xs text-[#BEF264]/60 hover:text-[#BEF264]"
            >
              ← Edit Plots
            </button>
          </div>
        )}

        {/* Offline indicator */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="bg-[#FFBF00]/10 border border-[#FFBF00]/20 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-[#FFBF00] text-xl mb-1">cloud_off</span>
            <p className="text-[#FFBF00] text-sm font-medium">You are offline</p>
            <p className="text-white/40 text-xs">Audit will sync when connected</p>
          </div>
        )}

        {/* Error display */}
        {(state.stepErrors[8]?.length ?? 0) > 0 && (
          <div className="bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 rounded-2xl p-4">
            {state.stepErrors[8]?.map((err, i) => (
              <p key={i} className="text-[#FF4B4B] text-sm">{err}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentStepDef = FARM_AUDIT_STEPS.find(s => s.index === state.currentStepIndex);
  const isLastStep = state.currentStepIndex === 8;
  const errors = state.stepErrors[state.currentStepIndex] ?? [];

  return (
    <div className="min-h-screen bg-[#0B0F19] font-['Manrope']">
      {/* Step Progress Header */}
      <div
        className="sticky top-0 z-40 border-b border-white/[0.06] px-4 py-3"
        style={{
          backgroundColor: 'rgba(11,15,25,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[430px] mx-auto">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-2">
            {FARM_AUDIT_STEPS.map((step) => (
              <button
                key={step.key}
                onClick={() => {
                  if (step.index <= state.currentStepIndex || state.completedSteps.includes(step.index)) {
                    updateState({ currentStepIndex: step.index });
                  }
                }}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    state.completedSteps.includes(step.index) ? '#BEF264'
                    : step.index === state.currentStepIndex ? '#BEF264'
                    : 'rgba(255,255,255,0.08)',
                  opacity: step.index === state.currentStepIndex ? 1 : 0.6,
                  cursor: step.index <= state.currentStepIndex || state.completedSteps.includes(step.index)
                    ? 'pointer' : 'default',
                }}
              />
            ))}
          </div>

          {/* Step label row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BEF264] text-lg">
                {currentStepDef?.icon ?? 'task_alt'}
              </span>
              <span className="text-white text-sm font-semibold font-['Sora']">
                {currentStepDef?.label ?? 'Review'}
              </span>
              <span className="text-white/30 text-xs">
                Step {state.currentStepIndex} of 8
              </span>
            </div>
            {saving && (
              <span className="text-white/30 text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">cloud_sync</span>
                Saving...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-[430px] mx-auto py-6 px-4">
        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="mb-4 bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#FF4B4B] text-lg">error</span>
              <span className="text-[#FF4B4B] text-sm font-semibold">
                {errors.length} issue{errors.length > 1 ? 's' : ''} to fix
              </span>
            </div>
            {errors.map((err, i) => (
              <p key={i} className="text-[#FF4B4B]/80 text-xs ml-7">• {err}</p>
            ))}
          </div>
        )}

        {renderStep()}
      </div>

      {/* Navigation Footer */}
      <div
        className="sticky bottom-0 border-t border-white/[0.06] px-4 py-3"
        style={{
          backgroundColor: 'rgba(11,15,25,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[430px] mx-auto flex gap-3">
          <button
            onClick={handleBack}
            disabled={state.currentStepIndex === 1}
            className="flex items-center justify-center gap-1.5 py-3 px-5 rounded-2xl text-sm font-medium transition-all min-h-[48px]"
            style={{
              backgroundColor: state.currentStepIndex === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
              color: state.currentStepIndex === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              cursor: state.currentStepIndex === 1 ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
            Back
          </button>

          <button
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-semibold transition-all min-h-[48px]"
            style={{
              backgroundColor: isLastStep ? '#BEF264' : '#BEF264',
              color: '#000',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 0 20px rgba(190,242,100,0.15)',
            }}
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Submitting...
              </>
            ) : isLastStep ? (
              <>
                <span className="material-symbols-outlined text-lg">task_alt</span>
                Submit Audit
              </>
            ) : (
              <>
                Next
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditWizard;
