import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/index';
import AuditFormStep from '../components/forms/AuditFormStep';
import FormInput from '../components/ui/FormInput';
import GPSCaptureField from '../components/forms/GPSCaptureField';
import PhotoCaptureField from '../components/forms/PhotoCaptureField';

const FARM_STEPS = ['Location', 'Farmer Profile', 'Land & Crops', 'Soil Samples', 'Media', 'Review & Submit'];
const BUSINESS_STEPS = ['Business Profile', 'Location', 'Inventory', 'Sales Data', 'Compliance', 'Media + Review'];

interface FormData {
  [key: string]: string | number | null;
}

interface PhotoItem {
  id: string;
  thumbnail: string;
  analyzing?: boolean;
  result?: string;
}

export default function AuditFormScreen() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const saveDraft = useAuditStore(s => s.saveDraft);

  const auditType = type === 'business' ? 'business' : 'farm';
  const stepLabels = auditType === 'farm' ? FARM_STEPS : BUSINESS_STEPS;
  const totalSteps = stepLabels.length;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gps, setGps] = useState<{ lat: number | null; lng: number | null; acc: number | null }>({
    lat: null, lng: null, acc: null,
  });
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const progress = Math.round((currentStep / totalSteps) * 100);

  const updateField = useCallback((key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(s => s - 1);
    }
  };

  const handleNext = () => {
    // Save draft on each step
    saveDraft({ ...formData, _step: currentStep });

    if (currentStep >= totalSteps) {
      // Final submission
      navigate('/dashboard');
      return;
    }
    setCurrentStep(s => s + 1);
  };

  const handleGpsCapture = (lat: number, lng: number, accuracy: number) => {
    setGps({ lat, lng, acc: accuracy });
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handlePhotoCapture = (file: File) => {
    const id = crypto.randomUUID();
    const thumbnail = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { id, thumbnail, analyzing: true }]);

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
              <FormInput
                label="Region"
                value={(formData['region'] as string) ?? ''}
                onChange={v => updateField('region', v)}
                placeholder="e.g. Morogoro"
                required
              />
              <FormInput
                label="District"
                value={(formData['district'] as string) ?? ''}
                onChange={v => updateField('district', v)}
                placeholder="e.g. Kilombero"
                required
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
              />
              <FormInput
                label="Primary Crop"
                value={(formData['primaryCrop'] as string) ?? ''}
                onChange={v => updateField('primaryCrop', v)}
                placeholder="e.g. Maize, Rice"
                required
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
          return (
            <div className="flex flex-col gap-5">
              <p className="font-manrope text-sm text-white/60">
                Review all data before submitting. Once submitted, the audit will be
                queued for sync and cannot be edited.
              </p>
              <div className="space-y-3">
                {Object.entries(formData)
                  .filter(([key]) => !key.startsWith('_'))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-manrope text-xs text-white/40 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-manrope text-xs text-white">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          );
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
            />
            <FormInput
              label="Business Type"
              value={(formData['businessType'] as string) ?? ''}
              onChange={v => updateField('businessType', v)}
              placeholder="e.g. Agrovet, Retailer"
              required
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
            <FormInput
              label="Region"
              value={(formData['region'] as string) ?? ''}
              onChange={v => updateField('region', v)}
              placeholder="e.g. Dar es Salaam"
              required
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
        return (
          <div className="flex flex-col gap-5">
            <PhotoCaptureField
              photos={photos}
              onCapture={handlePhotoCapture}
              onRemove={handlePhotoRemove}
              maxPhotos={5}
            />
            <p className="font-manrope text-sm text-white/60">
              Review all data before submitting.
            </p>
            <div className="space-y-3">
              {Object.entries(formData)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-manrope text-xs text-white/40 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-manrope text-xs text-white">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}
