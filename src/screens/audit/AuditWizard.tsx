import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../design-system';
import { useAuditStore, useUIStore } from '../../store/index';
import { validateStep, TOTAL_STEPS } from '../../lib/validations';
import {
  createFarmProfile,
  createFarmBoundary,
  createPlot,
  createPlotObservation,
} from '../../lib/audit-types';
import type {
  FarmProfile,
  FarmBoundary,
  Plot,
  PlotObservation,
  AuditSubmissionPayload,
} from '../../lib/audit-types';

import { parseAreaHa } from '../../lib/utils';

import AuditStepIndicator from '../../components/AuditStepIndicator';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Step1_Identity from './steps/Step1_Identity';
import Step2_Location from './steps/Step2_Location';
import StepFarmProfile from './steps/StepFarmProfile';
import StepFarmBoundary from './steps/StepFarmBoundary';
import StepPlotStructure from './steps/StepPlotStructure';
import StepPlotObservations from './steps/StepPlotObservations';
import Step3_FarmChar from './steps/Step3_FarmChar';
import Step4_Crops from './steps/Step4_Crops';
import Step5_Inputs from './steps/Step5_Inputs';
import Step6_Yield from './steps/Step6_Yield';
import StepSubmissionReview from './steps/StepSubmissionReview';
import ConsentGateModal from '../../components/forms/ConsentGateModal';
import type { ConsentRecord } from '../../lib/consent-types';
import { isConsentComplete } from '../../lib/consent-types';

interface AuditWizardProps {
  auditId?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

const STEP_LABELS = [
  'Identity',
  'Location',
  'Farm Profile',
  'Boundary',
  'Plots',
  'Observations',
  'Farm Details',
  'Crops',
  'Inputs',
  'Yield',
  'Review',
];

const STEPS_WITH_INLINE_VALIDATION = new Set([2, 3, 4, 5]);

function buildSubmissionPayload(
  data: Record<string, unknown>,
  auditId: string,
): AuditSubmissionPayload {
  const farm = data.farm_profile as FarmProfile;
  const boundary = data.farm_boundary as FarmBoundary;
  const plots = (data.plots as Plot[]) || [];
  const observations = (data.plot_observations as PlotObservation[]) || [];

  // Strict area parsing. Step validation runs before submit, so a null here
  // indicates a bug (validation gap or state corruption) — fail loud instead
  // of silently submitting 0 ha. The caller's try/catch surfaces it as a toast.
  const farmAreaHa = parseAreaHa(farm.total_area_ha);
  if (farmAreaHa === null) {
    throw new Error('Farm area is required and must be a positive number');
  }

  return {
    audit_id: auditId,
    farm: {
      local_id: farm.id,
      farm_name: farm.farm_name,
      farmer_name: farm.farmer_name,
      farmer_phone: farm.farmer_phone,
      village: farm.village,
      ward: farm.ward,
      district: farm.district,
      region: farm.region,
      total_area_ha: farmAreaHa,
      tenure_type: farm.tenure_type as string,
      farming_system: farm.farming_system as string,
      contact_number: farm.contact_number || undefined,
      water_source: farm.water_source || undefined,
      notes: farm.notes || undefined,
    },
    farm_boundary: {
      local_id: boundary.id,
      farm_local_id: farm.id,
      capture_method: boundary.capture_method as string,
      points: boundary.points,
      status: boundary.status,
      confidence: boundary.confidence as string,
      captured_at: boundary.captured_at,
      captured_by: boundary.captured_by,
      gps_accuracy_summary: boundary.gps_accuracy_summary,
      area_ha: boundary.area_ha,
      notes: boundary.notes || undefined,
      skip_reason: boundary.skip_reason || undefined,
    },
    plots: plots.map(p => {
      const plotAreaHa = parseAreaHa(p.area_ha);
      if (plotAreaHa === null) {
        throw new Error(`Plot "${p.name || p.id}": area is required and must be a positive number`);
      }
      return ({
      local_id: p.id,
      farm_local_id: farm.id,
      name: p.name,
      area_ha: plotAreaHa,
      status: p.status as string,
      current_crop: p.current_crop,
      variety: p.variety || undefined,
      growth_stage: p.growth_stage as string,
      irrigation_status: p.irrigation_status as string,
      center_gps: p.center_gps,
      planting_season: p.planting_season || undefined,
      notes: p.notes || undefined,
      });
    }),
    plot_observations: observations.map(o => ({
      local_id: o.id,
      plot_local_id: o.plot_id,
      observed_at: new Date().toISOString(),
      crop_condition: o.crop_condition as string,
      pest_present: o.pest_present ?? false,
      disease_present: o.disease_present ?? false,
      pest_type: o.pest_type || undefined,
      pest_severity: (o.pest_severity as string) || undefined,
      disease_type: o.disease_type || undefined,
      disease_severity: (o.disease_severity as string) || undefined,
      stress_level: (o.stress_level as string) || undefined,
      plant_vigor: (o.plant_vigor as string) || undefined,
      soil_moisture: (o.soil_moisture as string) || undefined,
      weed_pressure: (o.weed_pressure as string) || undefined,
      yield_outlook: (o.yield_outlook as string) || undefined,
      notes: o.notes || undefined,
    })),
  };
}

function validateInlineStep(
  stepIndex: number,
  data: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepIndex === 2) {
    const profile = data.farm_profile as FarmProfile | undefined;
    if (!profile) return { 'farm_profile': 'Farm profile is required' };
    if (!profile.farm_name) errors['farm_profile.farm_name'] = 'Farm name is required';
    if (!profile.farmer_name) errors['farm_profile.farmer_name'] = 'Farmer name is required';
    if (!profile.farmer_phone) errors['farm_profile.farmer_phone'] = 'Phone is required';
    if (!profile.village) errors['farm_profile.village'] = 'Village is required';
    if (!profile.ward) errors['farm_profile.ward'] = 'Ward is required';
    if (!profile.district) errors['farm_profile.district'] = 'District is required';
    if (!profile.region) errors['farm_profile.region'] = 'Region is required';
    const area = parseAreaHa(profile.total_area_ha);
    if (area === null || area <= 0) errors['farm_profile.total_area_ha'] = 'Farm area must be > 0';
    if (!profile.tenure_type) errors['farm_profile.tenure_type'] = 'Tenure type is required';
    if (!profile.farming_system) errors['farm_profile.farming_system'] = 'Farming system is required';
  }

  if (stepIndex === 3) {
    const boundary = data.farm_boundary as FarmBoundary | undefined;
    if (!boundary) return { 'farm_boundary': 'Boundary data is missing' };
    if (boundary.status !== 'complete' && boundary.status !== 'skipped') {
      errors['farm_boundary'] = 'Please capture boundary or provide skip reason';
    }
    if (boundary.status === 'skipped' && !boundary.skip_reason) {
      errors['farm_boundary'] = 'Please provide a reason for skipping';
    }
  }

  if (stepIndex === 4) {
    const plots = data.plots as Plot[] | undefined;
    if (!plots || plots.length === 0) {
      errors['plots'] = 'At least one plot is required';
      return errors;
    }
    plots.forEach((p, i) => {
      if (!p.name) errors[`plots.${i}`] = `Plot ${i + 1}: name is required`;
      const area = parseAreaHa(p.area_ha);
      if (area === null || area <= 0) errors[`plots.${i}`] = `Plot ${i + 1}: area must be > 0`;
      if (!p.status) errors[`plots.${i}`] = `Plot ${i + 1}: status is required`;
      if (!p.current_crop) errors[`plots.${i}`] = `Plot ${i + 1}: crop is required`;
      if (!p.growth_stage) errors[`plots.${i}`] = `Plot ${i + 1}: growth stage is required`;
      if (!p.irrigation_status) errors[`plots.${i}`] = `Plot ${i + 1}: irrigation status is required`;
    });
  }

  if (stepIndex === 5) {
    const observations = data.plot_observations as PlotObservation[] | undefined;
    const plots = data.plots as Plot[] | undefined;
    if (!observations || observations.length === 0) {
      errors['plot_observations'] = 'At least one observation is required';
      return errors;
    }
    observations.forEach((o, i) => {
      if (!o.plot_id) errors[`plot_observations.${i}`] = 'Observation must link to a plot';
      if (!o.crop_condition) errors[`plot_observations.${i}`] = `${plots?.[i]?.name || `Plot ${i + 1}`}: crop condition is required`;
      if (o.pest_present === null) errors[`plot_observations.${i}`] = `${plots?.[i]?.name || `Plot ${i + 1}`}: pest status required`;
      if (o.disease_present === null) errors[`plot_observations.${i}`] = `${plots?.[i]?.name || `Plot ${i + 1}`}: disease status required`;
    });
  }

  return errors;
}

const AuditWizardForm: React.FC<AuditWizardProps> = ({ auditId, onComplete }) => {
  const navigate = useNavigate();
  const { currentStep, setStep, currentDraft, saveDraft, resetDraft, setActiveWizardKind } =
    useAuditStore();
  const addToast = useUIStore((s) => s.addToast);
  const language = useUIStore((s) => s.language);

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = { ...(currentDraft ?? {}) };
    if (!initial.farm_profile) {
      initial.farm_profile = createFarmProfile();
    }
    if (!Array.isArray(initial.labour_types)) {
      initial.labour_types = ['none'];
    }
    if (initial.data_use_consent !== true) {
      initial.data_use_consent = false;
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const bootPersisted = useRef(false);

  useEffect(() => {
    setActiveWizardKind('farm');
    if (bootPersisted.current) return;
    bootPersisted.current = true;
    void saveDraft(formData as Record<string, unknown>).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time bootstrap after shell + default entities exist
  }, []);

  useEffect(() => {
    const step = useAuditStore.getState().currentStep;
    if (step < 0 || step >= TOTAL_STEPS) {
      useAuditStore.getState().setStep(Math.min(Math.max(0, step), TOTAL_STEPS - 1));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('nuru_audit_dirty', 'true');
    return () => {
      sessionStorage.removeItem('nuru_audit_dirty');
    };
  }, []);

  useEffect(() => {
    const farmProfile = formData.farm_profile as FarmProfile | undefined;
    if (farmProfile && !formData.farm_boundary) {
      setFormData(prev => ({
        ...prev,
        farm_boundary: createFarmBoundary(farmProfile.id),
      }));
    }
  }, [formData.farm_profile, formData.farm_boundary]);

  useEffect(() => {
    const farmProfile = formData.farm_profile as FarmProfile | undefined;
    const plots = formData.plots as Plot[] | undefined;
    if (farmProfile && (!plots || plots.length === 0)) {
      setFormData(prev => ({
        ...prev,
        plots: [createPlot(farmProfile.id, 0)],
      }));
    }
  }, [formData.farm_profile, formData.plots]);

  const handleChange = useCallback(
    (patch: Record<string, unknown>) => {
      setFormData((prev) => {
        let next: Record<string, unknown> = { ...prev, ...patch };
        if (!('farm_profile' in patch)) {
          const fp = next.farm_profile as FarmProfile | undefined;
          if (fp && typeof fp === 'object') {
            const u: FarmProfile = { ...fp };
            let ch = false;
            if ('farmer_name' in patch) {
              u.farmer_name = String(patch.farmer_name ?? '');
              ch = true;
            }
            if ('farmer_phone' in patch) {
              u.farmer_phone = String(patch.farmer_phone ?? '');
              ch = true;
            }
            if ('farm_name' in patch) {
              u.farm_name = String(patch.farm_name ?? '');
              ch = true;
            }
            for (const k of ['region', 'district', 'ward', 'village'] as const) {
              if (k in patch) {
                (u as unknown as Record<string, string>)[k] = String((patch as Record<string, unknown>)[k] ?? '');
                ch = true;
              }
            }
            if (ch) next = { ...next, farm_profile: u };
          }
        }
        void saveDraft(next as Record<string, unknown>).catch(() => {});
        return next;
      });
      if (Object.keys(errors).length > 0) {
        setErrors({});
      }
    },
    [errors, saveDraft],
  );

  const syncPlotObservations = useCallback((data: Record<string, unknown>): Record<string, unknown> => {
    const plots = (data.plots as Plot[]) || [];
    const existing = (data.plot_observations as PlotObservation[]) || [];

    const synced = plots.map(p => {
      const found = existing.find(o => o.plot_id === p.id);
      if (found) {
        return { ...found, plot_name: p.name };
      }
      return createPlotObservation(p);
    });

    return { ...data, plot_observations: synced };
  }, []);

  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    for (let i = 0; i < currentStep; i++) {
      completed.push(i + 1);
    }
    return completed;
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (STEPS_WITH_INLINE_VALIDATION.has(currentStep)) {
      const inlineErrors = validateInlineStep(currentStep, formData);
      if (Object.keys(inlineErrors).length > 0) {
        setErrors(inlineErrors);
        return;
      }
    } else {
      const result = validateStep(currentStep, formData);
      if (!result.success) {
        const zodErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path.join('.');
          zodErrors[path] = issue.message;
        }
        setErrors(zodErrors);
        return;
      }
    }

    setErrors({});

    let nextData = formData;

    if (currentStep === 4) {
      nextData = syncPlotObservations(formData);
      setFormData(nextData);
    }

    if (currentStep === 2) {
      const profile = nextData.farm_profile as FarmProfile;
      const boundary = nextData.farm_boundary as FarmBoundary | undefined;
      if (boundary && boundary.farm_id !== profile.id) {
        const updated = { ...boundary, farm_id: profile.id };
        nextData = { ...nextData, farm_boundary: updated };
        setFormData(nextData);
      }
      const plots = (nextData.plots as Plot[]) || [];
      const updatedPlots = plots.map(p => ({ ...p, farm_id: profile.id }));
      if (plots.some((p, i) => p.farm_id !== updatedPlots[i]!.farm_id)) {
        nextData = { ...nextData, plots: updatedPlots };
        setFormData(nextData);
      }
    }

    void saveDraft(nextData as Record<string, unknown>).catch(() => {});

    if (currentStep < TOTAL_STEPS - 1) {
      setStep(currentStep + 1);
    }
  }, [currentStep, formData, saveDraft, setStep, syncPlotObservations]);

  const handleBack = useCallback(() => {
    setErrors({});
    if (currentStep > 0) {
      setStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  }, [currentStep, setStep, navigate]);

  const handleSubmit = useCallback(async () => {
    if (currentStep !== TOTAL_STEPS - 1) return;

    const errAccum: Record<string, string> = {};
    for (let s = 0; s < TOTAL_STEPS - 1; s++) {
      if (STEPS_WITH_INLINE_VALIDATION.has(s)) {
        Object.assign(errAccum, validateInlineStep(s, formData));
      } else {
        const result = validateStep(s, formData);
        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path.length ? issue.path.join('.') : '_form';
            errAccum[path] = issue.message;
          }
        }
      }
    }
    if (Object.keys(errAccum).length > 0) {
      setErrors(errAccum);
      addToast({
        type: 'error',
        message:
          language === 'sw'
            ? 'Tafadhali kamilisha hatua zilizo na makosa kisha wasilisha tena.'
            : 'Fix validation errors on earlier steps before submitting.',
      });
      return;
    }

    setConfirmSubmitOpen(true);
  }, [currentStep, formData, addToast, language]);

  const performSubmit = useCallback(async () => {
    setConfirmSubmitOpen(false);
    setSubmitting(true);
    try {
      const id = auditId || crypto.randomUUID();
      const payload = buildSubmissionPayload(formData, id);
      await onComplete?.({
        ...formData,
        _payload: payload,
        farm_id: (formData.farm_profile as FarmProfile)?.id,
        latitude: (formData as Record<string, unknown>).latitude ?? (formData as Record<string, unknown>).gps_lat,
        longitude: (formData as Record<string, unknown>).longitude ?? (formData as Record<string, unknown>).gps_lng,
        gps_accuracy: (formData as Record<string, unknown>).gps_accuracy,
      });
      resetDraft();
    } catch {
      // Error handled by wrapper
    } finally {
      setSubmitting(false);
    }
  }, [formData, auditId, onComplete, resetDraft]);

  const handleSaveDraft = useCallback(async () => {
    try {
      await saveDraft(formData as Record<string, unknown>);
      addToast({
        type: 'success',
        message:
          language === 'sw'
            ? 'Rasimu imehifadhiwa kwenye kifaa hiki.'
            : 'Draft saved on this device.',
      });
    } catch {
      addToast({
        type: 'error',
        message:
          language === 'sw'
            ? 'Imeshindwa kuhifadhi rasimu. Angalia hifadhi ya kifaa.'
            : 'Could not save draft. Check device storage or permissions.',
      });
    }
  }, [formData, saveDraft, addToast, language]);

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const renderStep = () => {
    const props = { data: formData, onChange: handleChange, errors };
    switch (currentStep) {
      case 0: return <Step1_Identity {...props} />;
      case 1: return <Step2_Location {...props} />;
      case 2: return <StepFarmProfile {...props} />;
      case 3: return <StepFarmBoundary {...props} />;
      case 4: return <StepPlotStructure {...props} />;
      case 5: return <StepPlotObservations {...props} />;
      case 6: return <Step3_FarmChar {...props} />;
      case 7: return <Step4_Crops {...props} />;
      case 8: return <Step5_Inputs {...props} />;
      case 9: return <Step6_Yield {...props} />;
      case 10: return <StepSubmissionReview data={formData} />;
      default: return null;
    }
  };

  const consentRecord = formData.consent_record as ConsentRecord | undefined;
  const needsConsent =
    formData.data_use_consent !== true || !consentRecord || !isConsentComplete(consentRecord);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-base min-w-0 overflow-x-hidden relative">
      {needsConsent && (
        <ConsentGateModal
          audit_type="farm_audit"
          language={language}
          consent={consentRecord}
          onChange={(next) => handleChange({ consent_record: next })}
          onAccept={() =>
            handleChange({ data_use_consent: true, consent_completed_at: new Date().toISOString() })
          }
          onDecline={() => navigate(-1)}
          subjectLabel={{ en: 'Farmer', sw: 'Mkulima' }}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border-light px-4 pt-4 pb-2 min-w-0">
        <div className="max-w-[800px] mx-auto min-w-0">
          <div className="flex items-center justify-between mb-3 min-w-0 gap-3">
            <div>
              <h1 className="text-lg font-semibold text-white font-heading tracking-tight">
                Farm Audit
              </h1>
              <p className="text-xs text-text-tertiary">
                Step {currentStep + 1} of {TOTAL_STEPS} — {STEP_LABELS[currentStep]}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 py-2 px-3 bg-border-glass border border-border rounded-full text-xs text-text-secondary font-medium cursor-pointer font-inherit"
            >
              <MaterialIcon name="save" size={14} />
              Save Draft
            </button>
          </div>

          <AuditStepIndicator
            totalSteps={TOTAL_STEPS}
            currentStep={currentStep + 1}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-6 pb-[140px] max-w-[800px] mx-auto w-full">
        {renderStep()}
      </div>

      {/* Error summary */}
      {Object.keys(errors).length > 0 && (
        <div className="fixed bottom-[90px] left-4 right-4 max-w-[800px] mx-auto z-40">
          <div className="flex items-center gap-2 py-2.5 px-4 bg-error/15 border border-error/30 rounded-[12px] backdrop-blur-sm">
            <MaterialIcon name="warning" size={16} className="text-error shrink-0" />
            <p className="text-xs text-error-light truncate">
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before continuing
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div className="max-w-[800px] mx-auto px-4 pb-6 pt-8 flex items-center justify-between bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent pointer-events-auto">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 py-3 px-4 text-text-secondary text-sm font-semibold bg-transparent border-none cursor-pointer font-inherit"
          >
            <MaterialIcon name="chevron_left" size={18} />
            {currentStep === 0 ? 'Exit' : 'Back'}
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "h-[52px] px-8 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 cursor-pointer font-inherit transition-all border-none",
                submitting
                  ? "bg-accent/50 text-black/50 cursor-wait"
                  : "bg-accent text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:scale-[1.02] active:scale-[0.98]",
              )}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  <MaterialIcon name="send" size={16} />
                  Submit Audit
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="h-[52px] px-8 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 cursor-pointer font-inherit transition-all border-none bg-accent text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Next
              <MaterialIcon name="chevron_right" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Submit confirmation modal */}
      {confirmSubmitOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-confirm-title"
        >
          <div className="max-w-md w-full nuru-glass-card rounded-[28px] border border-border-glass p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center">
                <MaterialIcon name="cloud_upload" size={24} className="text-accent" />
              </div>
              <h2 id="submit-confirm-title" className="text-lg font-semibold font-heading text-white m-0">
                {language === 'sw' ? 'Wasilisha ukaguzi?' : 'Submit audit?'}
              </h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {language === 'sw'
                ? 'Rasimu itatumwa (au kusubiri mtandao). Endelea?'
                : 'Submission will upload now or queue offline. Continue?'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={performSubmit}
                className="w-full py-3.5 rounded-full bg-accent text-black font-bold text-sm tracking-wide border-none cursor-pointer font-inherit hover:opacity-95"
              >
                {language === 'sw' ? 'Ndio, wasilisha' : 'Yes, submit'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="w-full py-3 text-sm text-text-secondary bg-transparent border border-border rounded-full cursor-pointer font-inherit"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuditWizard: React.FC<AuditWizardProps> = (props) => {
  const draftRestored = useAuditStore((s) => s.draftRestored);
  if (!draftRestored) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 p-8 font-base">
        <LoadingSkeleton variant="text" count={2} />
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }
  return <AuditWizardForm {...props} />;
};

export default AuditWizard;
