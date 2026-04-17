import React, { useState, useCallback, useMemo, useRef } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import { useUIStore } from '../../../store/index';
import { MARKET_CHANNEL_OPTIONS, optionsForDropdown, ORTAMISEMI_CONSTRAINT_OPTIONS } from '../../../lib/wizard-enums';

interface Step6Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const CONSTRAINT_ROWS: { key: 'pests' | 'diseases' | 'drought' | 'flooding'; label: string }[] = [
  { key: 'pests', label: 'Pests' },
  { key: 'diseases', label: 'Diseases' },
  { key: 'drought', label: 'Drought' },
  { key: 'flooding', label: 'Flooding' },
];

const SEVERITY_LEVELS = [
  { value: 0, label: 'None', color: 'var(--color-severity-none)' },
  { value: 1, label: 'Low', color: 'var(--color-severity-low)' },
  { value: 2, label: 'Moderate', color: 'var(--color-severity-med)' },
  { value: 3, label: 'High', color: 'var(--color-severity-high)' },
  { value: 4, label: 'Critical', color: 'var(--color-severity-critical)' },
];

function formatTZS(amount: number): string {
  if (isNaN(amount)) return 'TZS 0';
  return `TZS ${amount.toLocaleString('en-TZ')}`;
}

function readNum(data: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function photosAsStrings(data: Record<string, unknown>): string[] {
  const raw = data.photos;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === 'string') return raw as string[];
  return (raw as { dataUrl?: string }[]).map((x) => x.dataUrl).filter((x): x is string => typeof x === 'string');
}

const inputClasses =
  'w-full py-3 px-4 bg-bg-input border border-border rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 focus:border-accent';

const Step6_Yield: React.FC<Step6Props> = ({ data, onChange, errors }) => {
  const language = useUIStore((s) => s.language);
  const marketChannels = useMemo(() => optionsForDropdown(MARKET_CHANNEL_OPTIONS, language), [language]);

  const [gpsLoading, setGpsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const yieldEstimate = readNum(data as Record<string, unknown>, 'yield_estimate_kg_ha', 'yield_estimate');
  const actualYield = readNum(data as Record<string, unknown>, 'actual_yield_kg_ha', 'actual_yield');
  const pricePerKg = readNum(data as Record<string, unknown>, 'price_per_kg_tzs', 'price_per_kg');

  const constraints = useMemo(() => {
    const c = data.constraints as Record<string, number> | undefined;
    return {
      pests: c?.pests ?? (data.constraint_pests as number) ?? 0,
      diseases: c?.diseases ?? (data.constraint_diseases as number) ?? 0,
      drought: c?.drought ?? (data.constraint_drought as number) ?? 0,
      flooding: c?.flooding ?? (data.constraint_flooding as number) ?? 0,
    };
  }, [data]);

  const autoLoss = useMemo(() => {
    if (yieldEstimate > 0 && actualYield >= 0) {
      return ((yieldEstimate - actualYield) / yieldEstimate * 100).toFixed(1);
    }
    return '0';
  }, [yieldEstimate, actualYield]);

  const grossRevenue = useMemo(() => actualYield * pricePerKg, [actualYield, pricePerKg]);

  const photos = useMemo(() => photosAsStrings(data as Record<string, unknown>), [data]);

  const tags = (data.ortamisemi_constraint_tags as string[] | undefined) ?? ['other'];

  const handleChange = useCallback(
    (patch: Record<string, unknown>) => {
      onChange(patch);
    },
    [onChange],
  );

  const setConstraint = useCallback(
    (key: (typeof CONSTRAINT_ROWS)[number]['key'], value: number) => {
      onChange({ constraints: { ...constraints, [key]: value } });
    },
    [constraints, onChange],
  );

  const toggleTag = useCallback(
    (value: string) => {
      let next = [...tags];
      if (next.includes(value)) next = next.filter((t) => t !== value);
      else next.push(value);
      if (next.length === 0) next = ['other'];
      onChange({ ortamisemi_constraint_tags: next });
    },
    [tags, onChange],
  );

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleChange({
          yield_latitude: pos.coords.latitude,
          yield_longitude: pos.coords.longitude,
          yield_gps_accuracy: pos.coords.accuracy,
          gps_capture: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [handleChange]);

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      if (photos.length >= 5) return;
      const remaining = 5 - photos.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          onChange({ photos: [...photos, result] });
        };
        reader.readAsDataURL(file as Blob);
      });
      e.target.value = '';
    },
    [photos, onChange],
  );

  const removePhoto = useCallback(
    (index: number) => {
      const current = [...photos];
      current.splice(index, 1);
      onChange({ photos: current });
    },
    [photos, onChange],
  );

  const yieldLat = data.yield_latitude as number | undefined;
  const yieldLng = data.yield_longitude as number | undefined;
  const lossValue =
    (data.yield_loss_pct as string | number | undefined)?.toString() ||
    (data.yield_loss as string) ||
    autoLoss;

  const lossColorClass =
    parseFloat(String(lossValue)) > 30
      ? 'text-error'
      : parseFloat(String(lossValue)) > 15
        ? 'text-warning'
        : 'text-success';

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Yield & Constraints
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Yield, market, severity (0–4), OR-TAMISEMI constraint categories, photos, and notes
      </p>

      <div className="flex flex-col gap-6">
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">Yield Data</h3>
          <div className="nuru-yield-grid grid grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="yield-estimate" className="block text-sm font-medium text-text-secondary mb-1.5">
                Yield estimate
              </label>
              <div className="relative">
                <input
                  id="yield-estimate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={String(data.yield_estimate_kg_ha ?? data.yield_estimate ?? '')}
                  onChange={(e) => handleChange({ yield_estimate_kg_ha: e.target.value })}
                  placeholder="0"
                  className={inputClasses}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">kg/ha</span>
              </div>
            </div>
            <div>
              <label htmlFor="yield-actual" className="block text-sm font-medium text-text-secondary mb-1.5">
                Actual yield <span className="text-text-accent">*</span>
              </label>
              <div className="relative">
                <input
                  id="yield-actual"
                  type="number"
                  min="0"
                  step="0.1"
                  value={String(data.actual_yield_kg_ha ?? data.actual_yield ?? '')}
                  onChange={(e) => handleChange({ actual_yield_kg_ha: e.target.value })}
                  placeholder="0"
                  className={inputClasses}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">kg/ha</span>
              </div>
            </div>
            <div>
              <label htmlFor="yield-loss" className="block text-sm font-medium text-text-secondary mb-1.5">
                Yield loss %
              </label>
              <input
                id="yield-loss"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={lossValue}
                onChange={(e) => handleChange({ yield_loss_pct: e.target.value })}
                placeholder="Auto"
                className={cn(inputClasses, lossColorClass)}
              />
            </div>
          </div>
        </div>

        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">Market Information</h3>
          <p id="yield-market-channel-label" className="block text-sm font-medium text-text-secondary mb-1.5">
            Market channel <span className="text-text-accent">*</span>
          </p>
          <div role="group" aria-labelledby="yield-market-channel-label" className="flex flex-wrap gap-2 mb-4">
            {marketChannels.map((ch) => {
              const selected = (data.market_channel as string) === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => handleChange({ market_channel: ch.value })}
                  className={cn(
                    'py-2 px-3.5 rounded-full text-xs font-medium cursor-pointer font-inherit transition-all border-2',
                    selected
                      ? 'border-accent bg-accent/[0.12] text-accent'
                      : 'border-border bg-transparent text-text-secondary',
                  )}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          <div className="nuru-market-grid grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="yield-price-per-kg" className="block text-sm font-medium text-text-secondary mb-1.5">
                Price per kg (TZS) <span className="text-text-accent">*</span>
              </label>
              <input
                id="yield-price-per-kg"
                type="number"
                min="0"
                step="1"
                value={String(data.price_per_kg_tzs ?? data.price_per_kg ?? '')}
                onChange={(e) => handleChange({ price_per_kg_tzs: e.target.value })}
                placeholder="0"
                className={inputClasses}
              />
            </div>
            <div>
              <p id="yield-gross-revenue-label" className="block text-sm font-medium text-text-secondary mb-1.5">
                Gross revenue
              </p>
              <div
                role="region"
                aria-labelledby="yield-gross-revenue-label"
                className="py-3 px-4 bg-success/[0.08] border border-success/20 rounded-[16px] text-[0.938rem] font-bold text-success"
              >
                {formatTZS(grossRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* OR-TAMISEMI constraint multiselect */}
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-1">Production constraints</h3>
          <p className="text-xs text-text-tertiary mb-3">OR-TAMISEMI — select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {ORTAMISEMI_CONSTRAINT_OPTIONS.map((opt) => {
              const on = tags.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleTag(opt.value)}
                  className={cn(
                    'py-2 px-3 rounded-full text-xs font-medium border-2',
                    on ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary',
                  )}
                >
                  {language === 'sw' ? opt.labelSw : opt.labelEn}
                </button>
              );
            })}
          </div>
          {errors.ortamisemi_constraint_tags && (
            <p className="text-xs text-error-light mt-2">{errors.ortamisemi_constraint_tags}</p>
          )}
        </div>

        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">Constraint severity (0–4)</h3>
          <div className="flex flex-col gap-3.5">
            {CONSTRAINT_ROWS.map((row) => {
              const selected = constraints[row.key] ?? 0;
              return (
                <div key={row.key}>
                  <p className="block text-sm font-medium text-text-secondary mb-2">{row.label}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {SEVERITY_LEVELS.map((level) => {
                      const isSelected = selected === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setConstraint(row.key, level.value)}
                          className="py-2 px-3.5 rounded-full text-xs font-semibold cursor-pointer font-inherit"
                          style={{
                            border: `2px solid ${isSelected ? level.color : 'transparent'}`,
                            backgroundColor: isSelected
                              ? `color-mix(in srgb, ${level.color} 12%, transparent)`
                              : 'rgba(255,255,255,0.04)',
                            color: isSelected ? level.color : 'var(--color-severity-none)',
                          }}
                        >
                          {level.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-1">Photos</h3>
          <p className="text-xs text-text-tertiary mb-3.5">Upload up to 5 photos ({photos.length}/5)</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 mb-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-[10px] overflow-hidden border border-border">
                <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 min-w-[44px] min-h-[44px] rounded-full bg-overlay border-none text-white cursor-pointer flex items-center justify-center"
                >
                  <MaterialIcon name="close" size={12} />
                </button>
              </div>
            ))}
          </div>
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-border-light border border-dashed border-white/[0.15] rounded-full text-text-secondary text-sm font-medium cursor-pointer font-inherit"
            >
              <MaterialIcon name="photo_camera" size={16} />
              Upload photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            aria-label="Upload yield photos"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className={cn(
              'flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold font-inherit flex-1 justify-center border',
              gpsLoading && 'cursor-wait',
              !gpsLoading && 'cursor-pointer',
              yieldLat ? 'bg-success/10 border-success/25 text-success' : 'bg-accent/10 border-accent/25 text-accent',
            )}
          >
            {gpsLoading ? (
              'Capturing...'
            ) : yieldLat ? (
              <>
                <MaterialIcon name="near_me" size={16} />
                {yieldLat.toFixed(4)}, {yieldLng?.toFixed(4)}
              </>
            ) : (
              <>
                <MaterialIcon name="location_on" size={16} />
                Capture GPS
              </>
            )}
          </button>
        </div>

        <div>
          <label htmlFor="yield-notes" className="block text-sm font-medium text-text-secondary mb-1.5">
            Notes
          </label>
          <textarea
            id="yield-notes"
            value={(data.notes as string) || ''}
            onChange={(e) => handleChange({ notes: e.target.value })}
            rows={4}
            className={`${inputClasses} resize-y min-h-[100px]`}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nuru-yield-grid { grid-template-columns: 1fr !important; }
          .nuru-market-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Step6_Yield;
