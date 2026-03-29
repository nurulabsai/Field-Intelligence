import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuditStore, useUIStore } from '../store/index';
import AuditFormStep from '../components/forms/AuditFormStep';
import FormInput from '../components/ui/FormInput';
import GPSCaptureField from '../components/forms/GPSCaptureField';
import PhotoCaptureField from '../components/forms/PhotoCaptureField';

const FARM_STEPS = ['Location', 'Farmer Profile', 'Land & Crops', 'Soil Samples', 'Media', 'Review & Submit'];
const BUSINESS_STEPS = ['Business Profile', 'Location', 'Inventory', 'Sales Data', 'Compliance', 'Media + Review'];

// Per-step required field definitions
const FARM_REQUIRED: Record<number, string[]> = {
  1: ['region', 'district'],
  2: ['name'],
  3: ['farmSize', 'primaryCrop'],
};

const BUSINESS_REQUIRED: Record<number, string[]> = {
  1: ['name', 'businessType'],
  2: ['region'],
};

interface FormData {
  [key: string]: string | number | null;
}

interface PhotoItem {
  id: string;
  thumbnail: string;
  analyzing?: boolean;
  result?: string;
}

function validatePhoneNumber(phone: string): string | null {
  if (!phone) return null; // optional field
  if (!/^\+255[1-9]\d{8}$/.test(phone)) {
    return 'Must be a valid Tanzanian phone (+255XXXXXXXXX)';
  }
  return null;
}

function validateGPSBounds(lat: number | null, lng: number | null): string | null {
  if (lat === null || lng === null) return null;
  if (lat < -11.75 || lat > -1.0) return 'Latitude out of Tanzania bounds';
  if (lng < 29.0 || lng > 40.5) return 'Longitude out of Tanzania bounds';
  return null;
}

export default function AuditFormScreen() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const saveDraft = useAuditStore(s => s.saveDraft);
  const addToast = useUIStore(s => s.addToast);
  const isOnline = useUIStore(s => s.isOnline);
  const incrementPendingSync = useUIStore(s => s.incrementPendingSync);

  const auditType = type === 'business' ? 'business' : 'farm';
  const stepLabels = auditType === 'farm' ? FARM_STEPS : BUSINESS_STEPS;
  const totalSteps = stepLabels.length;
  const requiredFields = auditType === 'farm' ? FARM_REQUIRED : BUSINESS_REQUIRED;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gps, setGps] = useState<{ lat: number | null; lng: number | null; acc: number | null }>({
    lat: null, lng: null, acc: null,
  });
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = Math.round((currentStep / totalSteps) * 100);

  const updateField = useCallback((key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Validate current step's required fields
  const validateCurrentStep = (): boolean => {
    const required = requiredFields[currentStep] ?? [];
    const newErrors: Record<string, string> = {};

    for (const field of required) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} is required`;
      }
    }

    // Phone validation for farm step 2
    if (auditType === 'farm' && currentStep === 2 && formData['phone']) {
      const phoneError = validatePhoneNumber(formData['phone'] as string);
      if (phoneError) newErrors['phone'] = phoneError;
    }

    // GPS bounds validation for location steps
    const isLocationStep = (auditType === 'farm' && currentStep === 1) || (auditType === 'business' && currentStep === 2);
    if (isLocationStep) {
      const gpsError = validateGPSBounds(gps.lat, gps.lng);
      if (gpsError) newErrors['gps'] = gpsError;
    }

    // Farm size validation
    if (auditType === 'farm' && currentStep === 3) {
      const size = Number(formData['farmSize']);
      if (formData['farmSize'] && (isNaN(size) || size <= 0 || size > 10000)) {
        newErrors['farmSize'] = 'Farm size must be between 0 and 10,000 acres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(s => s - 1);
    }
  };

  const handleNext = async () => {
    // Validate before advancing (skip validation on review step)
    if (currentStep < totalSteps && !validateCurrentStep()) {
      addToast({ message: 'Please fix the highlighted errors', type: 'error' });
      return;
    }

    // Save draft on each step
    saveDraft({
      ...formData,
      _step: currentStep,
      _auditType: auditType,
      _gps: gps.lat !== null ? { lat: gps.lat, lng: gps.lng, accuracy: gps.acc } : undefined,
      _photoCount: photos.length,
    } as Partial<FullAuditData>);

    if (currentStep >= totalSteps) {
      // Final submission
      await handleSubmit();
      return;
    }
    setCurrentStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        // Direct submission when online
        const supabaseModule = await import('../lib/supabase');
        await supabaseModule.audits.create({
          auditor_id: '',
          farm_id: '',
          campaign_id: '',
          status: 'submitted',
          data: formData,
          gps_lat: gps.lat,
          gps_lng: gps.lng,
          gps_accuracy: gps.acc,
        } as Parameters<typeof supabaseModule.audits.create>[0]);

        useAuditStore.getState().resetDraft();
        addToast({ message: 'Audit submitted successfully!', type: 'success' });
      } else {
        // Queue for later sync when offline
        const { enqueue } = await import('../lib/sync-queue');
        await enqueue('create_audit', {
          auditType,
          formData,
          gps,
          photoCount: photos.length,
          createdAt: new Date().toISOString(),
        });
        incrementPendingSync();
        useAuditStore.getState().resetDraft();
        addToast({ message: 'Audit saved offline — will sync when connected', type: 'info' });
      }
      navigate('/dashboard');
    } catch (err) {
      // If online submission fails, queue it offline
      try {
        const { enqueue } = await import('../lib/sync-queue');
        await enqueue('create_audit', {
          auditType,
          formData,
          gps,
          photoCount: photos.length,
          createdAt: new Date().toISOString(),
        });
        incrementPendingSync();
        useAuditStore.getState().resetDraft();
        addToast({ message: 'Submission queued — will retry when connected', type: 'warning' });
        navigate('/dashboard');
      } catch {
        addToast({ message: 'Failed to save audit. Please try again.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGpsCapture = (lat: number, lng: number, accuracy: number) => {
    setGps({ lat, lng, acc: accuracy });
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    // Clear GPS errors
    setErrors(prev => {
      const next = { ...prev };
      delete next['gps'];
      return next;
    });
  };

  const handlePhotoCapture = (file: File) => {
    const id = crypto.randomUUID();
    const thumbnail = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { id, thumbnail, analyzing: true }]);

    // Store photo blob in IndexedDB for offline persistence
    import('../lib/photo-storage').then(({ savePhoto }) => {
      savePhoto(file, 'current-draft').catch(() => {
        // Non-fatal: photo will still be in memory
      });
    });

    // Simulate AI analysis completion
    setTimeout(() => {
      setPhotos(prev =>
        prev.map(p =>
          p.id === id ? { ...p, analyzing: false, result: 'Healthy crop detected' } : p
        )
      );
    }, 2000);
  };

  const handlePhotoRemove = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const hasErrors = Object.keys(errors).length > 0;
  const auditName = (formData['name'] as string) ?? (auditType === 'farm' ? 'New Farm Audit' : 'New Business Audit');

  return (
    <AuditFormStep
      auditName={auditName}
      auditType={auditType}
      dateRange={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' \u2192 ongoing'}
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepLabels={stepLabels}
      progress={progress}
      status={hasErrors ? 'action_required' : 'in_progress'}
      hasErrors={hasErrors}
      errorMessage={Object.values(errors)[0]}
      onBack={handleBack}
      onNext={handleNext}
    >
      {renderStepContent()}
    </AuditFormStep>
  );

  function renderStepContent() {
    if (auditType === 'farm') {
      switch (currentStep) {
        case 1:
          return (
            <div className="flex flex-col gap-5">
              <GPSCaptureField
                latitude={gps.lat}
                longitude={gps.lng}
                accuracy={gps.acc}
                onCapture={handleGpsCapture}
              />
              {errors['gps'] && (
                <p className="font-manrope text-xs text-neon-red">{errors['gps']}</p>
              )}
              <FormInput
                label="Region"
                value={(formData['region'] as string) ?? ''}
                onChange={v => updateField('region', v)}
                placeholder="e.g. Morogoro"
                required
                error={errors['region']}
              />
              <FormInput
                label="District"
                value={(formData['district'] as string) ?? ''}
                onChange={v => updateField('district', v)}
                placeholder="e.g. Kilombero"
                required
                error={errors['district']}
              />
            </div>
          );
        case 2:
          return (
            <div className="flex flex-col gap-5">
              <FormInput
                label="Farmer Name"
                value={(formData['name'] as string) ?? ''}
                onChange={v => updateField('name', v)}
                placeholder="Full name"
                required
                error={errors['name']}
              />
              <FormInput
                label="Age"
                type="number"
                value={(formData['age'] as string) ?? ''}
                onChange={v => updateField('age', v)}
                placeholder="Age"
              />
              <FormInput
                label="Phone Number"
                type="tel"
                value={(formData['phone'] as string) ?? ''}
                onChange={v => updateField('phone', v)}
                placeholder="+255..."
                icon="phone"
                error={errors['phone']}
              />
            </div>
          );
        case 3:
          return (
            <div className="flex flex-col gap-5">
              <FormInput
                label="Farm Size (acres)"
                type="number"
                value={(formData['farmSize'] as string) ?? ''}
                onChange={v => updateField('farmSize', v)}
                placeholder="e.g. 5.0"
                required
                error={errors['farmSize']}
              />
              <FormInput
                label="Primary Crop"
                value={(formData['primaryCrop'] as string) ?? ''}
                onChange={v => updateField('primaryCrop', v)}
                placeholder="e.g. Maize, Rice"
                required
                error={errors['primaryCrop']}
              />
              <FormInput
                label="Secondary Crops"
                value={(formData['secondaryCrops'] as string) ?? ''}
                onChange={v => updateField('secondaryCrops', v)}
                placeholder="e.g. Beans, Cassava"
              />
            </div>
          );
        case 4:
          return (
            <div className="flex flex-col gap-5">
              <FormInput
                label="Sample Count"
                type="number"
                value={(formData['sampleCount'] as string) ?? ''}
                onChange={v => updateField('sampleCount', v)}
                placeholder="Number of soil samples"
              />
              <FormInput
                label="Soil Type"
                value={(formData['soilType'] as string) ?? ''}
                onChange={v => updateField('soilType', v)}
                placeholder="e.g. Loam, Clay"
              />
              <FormInput
                label="Notes"
                value={(formData['soilNotes'] as string) ?? ''}
                onChange={v => updateField('soilNotes', v)}
                placeholder="Additional observations"
                multiline
                rows={3}
              />
            </div>
          );
        case 5:
          return (
            <div className="flex flex-col gap-5">
              <PhotoCaptureField
                photos={photos}
                onCapture={handlePhotoCapture}
                onRemove={handlePhotoRemove}
                maxPhotos={5}
              />
              <FormInput
                label="Photo Notes"
                value={(formData['photoNotes'] as string) ?? ''}
                onChange={v => updateField('photoNotes', v)}
                placeholder="Describe conditions captured"
                multiline
                rows={3}
              />
            </div>
          );
        case 6:
          return renderReviewStep();
        default:
          return null;
      }
    }

    // Business audit steps
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-5">
            <FormInput
              label="Business Name"
              value={(formData['name'] as string) ?? ''}
              onChange={v => updateField('name', v)}
              placeholder="Business name"
              required
              error={errors['name']}
            />
            <FormInput
              label="Business Type"
              value={(formData['businessType'] as string) ?? ''}
              onChange={v => updateField('businessType', v)}
              placeholder="e.g. Agrovet, Retailer"
              required
              error={errors['businessType']}
            />
            <FormInput
              label="Owner Name"
              value={(formData['owner'] as string) ?? ''}
              onChange={v => updateField('owner', v)}
              placeholder="Full name"
            />
            <FormInput
              label="Registration Number"
              value={(formData['regNumber'] as string) ?? ''}
              onChange={v => updateField('regNumber', v)}
              placeholder="TIN or business reg"
              icon="badge"
            />
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-5">
            <GPSCaptureField
              latitude={gps.lat}
              longitude={gps.lng}
              accuracy={gps.acc}
              onCapture={handleGpsCapture}
            />
            {errors['gps'] && (
              <p className="font-manrope text-xs text-neon-red">{errors['gps']}</p>
            )}
            <FormInput
              label="Region"
              value={(formData['region'] as string) ?? ''}
              onChange={v => updateField('region', v)}
              placeholder="e.g. Dar es Salaam"
              required
              error={errors['region']}
            />
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-5">
            <FormInput
              label="Stock Levels"
              value={(formData['stockLevels'] as string) ?? ''}
              onChange={v => updateField('stockLevels', v)}
              placeholder="e.g. High / Medium / Low"
            />
            <FormInput
              label="Product Categories"
              value={(formData['productCategories'] as string) ?? ''}
              onChange={v => updateField('productCategories', v)}
              placeholder="e.g. Seeds, Fertilizers"
              multiline
              rows={3}
            />
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-5">
            <FormInput
              label="Monthly Revenue Range"
              value={(formData['revenue'] as string) ?? ''}
              onChange={v => updateField('revenue', v)}
              placeholder="e.g. TZS 1M - 5M"
            />
            <FormInput
              label="Customer Volume (daily)"
              type="number"
              value={(formData['customerVolume'] as string) ?? ''}
              onChange={v => updateField('customerVolume', v)}
              placeholder="Average daily customers"
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-5">
            <FormInput
              label="Business License"
              value={(formData['license'] as string) ?? ''}
              onChange={v => updateField('license', v)}
              placeholder="License number"
              icon="verified"
              required
              error={errors['license']}
            />
            <FormInput
              label="Safety Certification"
              value={(formData['safety'] as string) ?? ''}
              onChange={v => updateField('safety', v)}
              placeholder="Certification details"
            />
            <FormInput
              label="Compliance Notes"
              value={(formData['complianceNotes'] as string) ?? ''}
              onChange={v => updateField('complianceNotes', v)}
              placeholder="Additional compliance info"
              multiline
              rows={3}
            />
          </div>
        );
      case 6:
        return renderReviewStep();
      default:
        return null;
    }
  }

  function renderReviewStep() {
    const entries = Object.entries(formData).filter(([key]) => !key.startsWith('_'));
    const hasData = entries.length > 0;

    return (
      <div className="flex flex-col gap-5">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="flex items-center gap-2 rounded-2xl bg-neon-amber/10 p-4">
            <span className="material-symbols-outlined text-neon-amber text-[18px]">cloud_off</span>
            <p className="font-manrope text-xs text-neon-amber">
              You are offline. The audit will be saved locally and synced when you reconnect.
            </p>
          </div>
        )}

        <p className="font-manrope text-sm text-white/60">
          Review all data before submitting. {isOnline ? 'The audit will be submitted immediately.' : 'The audit will be queued for sync.'}
        </p>

        {/* GPS Summary */}
        {gps.lat !== null && (
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="font-manrope text-xs text-white/40">GPS Location</span>
            <span className="font-mono text-xs text-white">
              {gps.lat?.toFixed(6)}, {gps.lng?.toFixed(6)}
              {gps.acc !== null && ` (±${Math.round(gps.acc)}m)`}
            </span>
          </div>
        )}

        {/* Photos Summary */}
        {photos.length > 0 && (
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="font-manrope text-xs text-white/40">Photos</span>
            <span className="font-manrope text-xs text-white">{photos.length} captured</span>
          </div>
        )}

        {/* Field Summary */}
        {hasData ? (
          <div className="space-y-3">
            {entries.map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-manrope text-xs text-white/40 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="font-manrope text-xs text-white max-w-[60%] text-right">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-manrope text-sm text-white/30 text-center py-8">No data entered yet</p>
        )}

        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="material-symbols-outlined animate-spin text-neon-lime text-[20px]">progress_activity</span>
            <span className="font-manrope text-xs text-white/60">Submitting...</span>
          </div>
        )}
      </div>
    );
  }
}

// Type import for saveDraft compatibility
type FullAuditData = import('../lib/validations').FullAuditData;
