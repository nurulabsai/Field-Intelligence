import React, { useState, useCallback, useMemo, useRef } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import type {
  Plot, PlotObservation, CropCondition, StressLevel,
} from '../../../lib/audit-types';
import { createPlotObservation } from '../../../lib/audit-types';

interface StepPlotObservationsProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const CROP_CONDITIONS: { value: CropCondition; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: '#22C55E' },
  { value: 'good', label: 'Good', color: '#86EFAC' },
  { value: 'fair', label: 'Fair', color: '#F59E0B' },
  { value: 'poor', label: 'Poor', color: '#F97316' },
  { value: 'failed', label: 'Failed', color: '#EF4444' },
];

const STRESS_LEVELS: { value: StressLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'severe', label: 'Severe' },
];

const VIGOR_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const MOISTURE_OPTIONS = [
  { value: 'saturated', label: 'Saturated' },
  { value: 'wet', label: 'Wet' },
  { value: 'moist', label: 'Moist' },
  { value: 'dry', label: 'Dry' },
  { value: 'very_dry', label: 'Very Dry' },
];

const YIELD_OUTLOOK = [
  { value: 'above_average', label: 'Above Average' },
  { value: 'average', label: 'Average' },
  { value: 'below_average', label: 'Below Average' },
  { value: 'crop_failure', label: 'Crop Failure' },
];

const COMMON_PESTS = [
  'Fall Armyworm', 'Stalk Borer', 'Aphids', 'Whitefly', 'Locusts',
  'Rodents', 'Birds', 'Nematodes', 'Mites', 'Other',
];

const COMMON_DISEASES = [
  'Maize Lethal Necrosis', 'Cassava Mosaic', 'Rust', 'Blight',
  'Bacterial Wilt', 'Powdery Mildew', 'Root Rot', 'Leaf Spot', 'Other',
];

const inputClasses = "w-full py-2.5 px-3.5 bg-bg-input border border-border rounded-[14px] text-white text-sm font-inherit outline-none transition-colors duration-150 focus:border-accent";

const StepPlotObservations: React.FC<StepPlotObservationsProps> = ({ data, onChange, errors }) => {
  const plots: Plot[] = (data.plots as Plot[]) || [];

  const observations: PlotObservation[] = useMemo(() => {
    const raw = data.plot_observations as PlotObservation[] | undefined;
    if (raw && raw.length === plots.length) return raw;
    return plots.map(p => {
      const existing = raw?.find(o => o.plot_id === p.id);
      return existing || createPlotObservation(p);
    });
  }, [data.plot_observations, plots]);

  const [activePlotIndex, setActivePlotIndex] = useState(0);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  const activePlot = plots[activePlotIndex];
  const activeObs = observations[activePlotIndex];

  const updateObservation = useCallback((field: keyof PlotObservation, value: unknown) => {
    if (!activeObs) return;
    const updated = observations.map((o, i) =>
      i === activePlotIndex ? { ...o, [field]: value } : o,
    );
    onChange({ plot_observations: updated });
  }, [activeObs, observations, activePlotIndex, onChange]);

  const goNext = useCallback(() => {
    if (activePlotIndex < plots.length - 1) setActivePlotIndex(activePlotIndex + 1);
  }, [activePlotIndex, plots.length]);

  const goPrev = useCallback(() => {
    if (activePlotIndex > 0) setActivePlotIndex(activePlotIndex - 1);
  }, [activePlotIndex]);

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateObservation('photo', ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [updateObservation]);

  const completedCount = observations.filter(o => o.crop_condition).length;

  if (plots.length === 0) {
    return (
      <div className="text-center py-16">
        <MaterialIcon name="error" size={48} className="mx-auto mb-4 text-text-tertiary opacity-50" />
        <p className="text-white font-medium mb-2">No Plots Defined</p>
        <p className="text-sm text-text-tertiary">Go back to Plot Structure and add at least one plot</p>
      </div>
    );
  }

  if (!activePlot || !activeObs) return null;

  const renderPillSelector = (
    field: keyof PlotObservation,
    label: string,
    options: { value: string; label: string; color?: string }[],
    required: boolean,
  ) => {
    const value = activeObs[field] as string;
    const labelId = `obs-pill-${String(field)}-${activePlotIndex}`;

    return (
      <div>
        <p id={labelId} className="block text-xs font-medium text-text-tertiary mb-2">
          {label}{required && <span className="text-text-accent ml-0.5">*</span>}
        </p>
        <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
          {options.map(opt => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateObservation(field, opt.value)}
                className="py-2 px-3.5 rounded-full text-xs font-semibold cursor-pointer font-inherit transition-all duration-150"
                style={{
                  border: `2px solid ${isSelected ? (opt.color || 'var(--color-accent)') : 'transparent'}`,
                  backgroundColor: isSelected
                    ? `${opt.color || 'var(--color-accent)'}20`
                    : 'rgba(255,255,255,0.04)',
                  color: isSelected ? (opt.color || 'var(--color-accent)') : '#6B7280',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYesNo = (
    field: 'pest_present' | 'disease_present',
    label: string,
    icon: React.ReactNode,
  ) => {
    const value = activeObs[field];
    const groupId = `obs-yn-${field}-${activePlotIndex}`;

    return (
      <div>
        <p id={groupId} className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-2">
          {icon} {label}<span className="text-text-accent ml-0.5">*</span>
        </p>
        <div role="group" aria-labelledby={groupId} className="flex gap-3">
          <button
            type="button"
            onClick={() => updateObservation(field, true)}
            className={cn(
              'flex-1 py-3 rounded-full text-sm font-semibold font-inherit cursor-pointer border-2 transition-all',
              value === true
                ? 'border-error bg-error/15 text-error'
                : 'border-border bg-transparent text-text-secondary',
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateObservation(field, false)}
            className={cn(
              'flex-1 py-3 rounded-full text-sm font-semibold font-inherit cursor-pointer border-2 transition-all',
              value === false
                ? 'border-success bg-success/15 text-success'
                : 'border-border bg-transparent text-text-secondary',
            )}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  const renderDropdown = (
    field: keyof PlotObservation,
    label: string,
    options: string[],
  ) => {
    const value = activeObs[field] as string;
    const ddKey = `obs_${activePlotIndex}_${String(field)}`;
    const ddId = `obs-dd-${activePlotIndex}-${String(field)}`;
    const isOpen = !!openDropdowns[ddKey];

    return (
      <div>
        <label htmlFor={ddId} className="block text-xs font-medium text-text-tertiary mb-1">{label}</label>
        <div className="relative">
          <button
            id={ddId}
            type="button"
            onClick={() => setOpenDropdowns(p => ({ ...p, [ddKey]: !p[ddKey] }))}
            className={cn(inputClasses, 'text-left cursor-pointer flex items-center justify-between')}
          >
            <span className={value ? 'text-white' : 'text-text-tertiary'}>
              {value || 'Select'}
            </span>
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border rounded-[14px] z-50 max-h-[200px] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    updateObservation(field, opt);
                    setOpenDropdowns(p => ({ ...p, [ddKey]: false }));
                  }}
                  className={cn(
                    'w-full min-h-12 py-2.5 px-3.5 border-none text-sm text-left cursor-pointer font-inherit',
                    value === opt ? 'bg-accent/15 text-accent' : 'bg-transparent text-white',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Plot Observations
      </h2>
      <p className="text-sm text-text-tertiary mb-4">
        Record field conditions for each plot
      </p>

      {/* Plot navigator */}
      <div className="flex items-center justify-between py-3 px-4 nuru-glass-card rounded-[16px] border border-border-glass mb-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={activePlotIndex === 0}
          className={cn(
            'p-2 rounded-full border-none font-inherit',
            activePlotIndex === 0
              ? 'text-text-tertiary cursor-default bg-transparent'
              : 'text-accent cursor-pointer bg-accent/10',
          )}
        >
          <MaterialIcon name="chevron_left" size={18} />
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-semibold text-white">{activePlot.name}</p>
          <p className="text-[10px] text-text-tertiary uppercase tracking-widest">
            Plot {activePlotIndex + 1} of {plots.length} · {completedCount}/{plots.length} done
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={activePlotIndex === plots.length - 1}
          className={cn(
            'p-2 rounded-full border-none font-inherit',
            activePlotIndex === plots.length - 1
              ? 'text-text-tertiary cursor-default bg-transparent'
              : 'text-accent cursor-pointer bg-accent/10',
          )}
        >
          <MaterialIcon name="chevron_right" size={18} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-6">
        {plots.map((_, i) => {
          const obs = observations[i];
          const done = !!obs?.crop_condition;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActivePlotIndex(i)}
              className={cn(
                'w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all',
                i === activePlotIndex
                  ? 'bg-accent w-6'
                  : done ? 'bg-success/50' : 'bg-border',
              )}
            />
          );
        })}
      </div>

      {/* Plot info banner */}
      <div className="py-3 px-4 bg-bg-tertiary rounded-[12px] mb-6 flex items-center gap-3">
        <MaterialIcon name="eco" size={16} className="text-accent" />
        <div className="text-xs text-text-secondary">
          <span className="font-medium text-white">{activePlot.name}</span>
          {' · '}
          {activePlot.current_crop || 'No crop'} · {activePlot.area_ha || '?'} ha · {activePlot.growth_stage || 'Unknown stage'}
        </div>
      </div>

      {errors[`plot_observations.${activePlotIndex}`] && (
        <p className="text-xs text-error-light mb-4">{errors[`plot_observations.${activePlotIndex}`]}</p>
      )}

      {/* Observation Form */}
      <div className="flex flex-col gap-6">
        {/* Crop Condition */}
        {renderPillSelector('crop_condition', 'Overall Crop Condition', CROP_CONDITIONS, true)}

        {/* Pest / Disease */}
        <div className="nuru-glass-card rounded-[32px] p-5 border border-border-glass">
          <h3 className="text-sm font-semibold font-heading text-white mb-4 flex items-center gap-2">
            <MaterialIcon name="bug_report" size={14} className="text-warning" /> Pest & Disease
          </h3>

          <div className="flex flex-col gap-5">
            {renderYesNo('pest_present', 'Pest Present?', <MaterialIcon name="bug_report" size={14} />)}

            {activeObs.pest_present === true && (
              <div className="flex flex-col gap-3 pl-2 border-l-2 border-warning/25">
                {renderDropdown('pest_type', 'Pest Type', COMMON_PESTS)}
                {renderPillSelector('pest_severity', 'Pest Severity', STRESS_LEVELS, false)}
              </div>
            )}

            {renderYesNo('disease_present', 'Disease Present?', <MaterialIcon name="eco" size={14} />)}

            {activeObs.disease_present === true && (
              <div className="flex flex-col gap-3 pl-2 border-l-2 border-error/25">
                {renderDropdown('disease_type', 'Disease Type', COMMON_DISEASES)}
                {renderPillSelector('disease_severity', 'Disease Severity', STRESS_LEVELS, false)}
              </div>
            )}
          </div>
        </div>

        {/* Agronomic Observations */}
        <div className="nuru-glass-card rounded-[32px] p-5 border border-border-glass">
          <h3 className="text-sm font-semibold font-heading text-white mb-4 flex items-center gap-2">
            <MaterialIcon name="wb_sunny" size={14} className="text-accent" /> Agronomic Observations
          </h3>

          <div className="flex flex-col gap-5">
            {renderPillSelector('stress_level', 'Visible Stress Level', STRESS_LEVELS, false)}
            {renderPillSelector('plant_vigor', 'Plant Vigor', VIGOR_OPTIONS, false)}
            {renderPillSelector(
              'soil_moisture',
              'Soil Moisture Impression',
              MOISTURE_OPTIONS.map(m => ({ ...m, color: undefined })),
              false,
            )}
            {renderPillSelector('weed_pressure', 'Weed Pressure', STRESS_LEVELS, false)}
            {renderPillSelector('yield_outlook', 'Estimated Yield Outlook', YIELD_OUTLOOK, false)}
          </div>
        </div>

        {/* Media & Notes */}
        <div className="nuru-glass-card rounded-[32px] p-5 border border-border-glass">
          <h3 className="text-sm font-semibold font-heading text-white mb-4">Evidence & Notes</h3>

          {/* Photo */}
          <div className="mb-4">
            {activeObs.photo ? (
              <p className="block text-xs font-medium text-text-tertiary mb-1">Plot photo</p>
            ) : (
              <label htmlFor={`obs-photo-btn-${activePlotIndex}`} className="block text-xs font-medium text-text-tertiary mb-1">Plot photo</label>
            )}
            {activeObs.photo ? (
              <div className="relative w-full h-32 rounded-[12px] overflow-hidden border border-border">
                <img src={activeObs.photo} alt="Observation" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                <button
                  type="button"
                  onClick={() => updateObservation('photo', '')}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-overlay border-none text-white cursor-pointer flex items-center justify-center"
                >
                  <MaterialIcon name="close" size={12} />
                </button>
              </div>
            ) : (
              <button
                id={`obs-photo-btn-${activePlotIndex}`}
                type="button"
                onClick={() => photoRef.current?.click()}
                className="w-full py-3 flex items-center justify-center gap-2 bg-border-light border border-dashed border-white/10 rounded-full text-text-secondary text-sm cursor-pointer font-inherit"
              >
                <MaterialIcon name="photo_camera" size={16} /> Add Plot Photo
              </button>
            )}
            <input
              ref={photoRef}
              id={`obs-photo-file-${activePlotIndex}`}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
              aria-label="Plot observation photo"
            />
          </div>

          {/* Notes */}
          <label htmlFor={`obs-notes-${activePlotIndex}`} className="block text-xs font-medium text-text-tertiary mb-1">Notes</label>
          <textarea
            id={`obs-notes-${activePlotIndex}`}
            value={activeObs.notes}
            onChange={e => updateObservation('notes', e.target.value)}
            placeholder="Additional observations about this plot..."
            rows={3}
            className={cn(inputClasses, 'resize-y min-h-[60px]')}
          />
        </div>
      </div>

      {/* Quick nav to next plot */}
      {activePlotIndex < plots.length - 1 && activeObs.crop_condition && (
        <button
          type="button"
          onClick={goNext}
          className="w-full mt-6 py-3.5 flex items-center justify-center gap-2 bg-accent/10 border border-accent/25 rounded-full text-accent text-sm font-semibold cursor-pointer font-inherit"
        >
          Next: {plots[activePlotIndex + 1]?.name || `Plot ${activePlotIndex + 2}`}
          <MaterialIcon name="chevron_right" size={16} />
        </button>
      )}

      {activePlotIndex === plots.length - 1 && activeObs.crop_condition && (
        <div className="mt-6 py-3.5 px-4 bg-success/10 border border-success/25 rounded-[14px] flex items-center justify-center gap-2">
          <MaterialIcon name="check" size={16} className="text-success" />
          <span className="text-sm text-success font-medium">All plot observations complete</span>
        </div>
      )}
    </div>
  );
};

export default StepPlotObservations;
