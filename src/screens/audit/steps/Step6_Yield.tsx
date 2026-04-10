import React, { useState, useCallback, useMemo, useRef } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';

interface Step6Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const MARKET_CHANNELS = [
  { value: 'farm_gate', label: 'Farm Gate' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'trader', label: 'Trader' },
  { value: 'export', label: 'Export' },
];

const CONSTRAINT_ROWS = [
  { key: 'constraint_pests', label: 'Pests' },
  { key: 'constraint_diseases', label: 'Diseases' },
  { key: 'constraint_drought', label: 'Drought' },
  { key: 'constraint_flooding', label: 'Flooding' },
];

const SEVERITY_LEVELS = [
  { value: 0, label: 'None', color: '#6B7280' },
  { value: 1, label: 'Low', color: '#22C55E' },
  { value: 2, label: 'Moderate', color: '#F59E0B' },
  { value: 3, label: 'High', color: '#F97316' },
  { value: 4, label: 'Critical', color: '#EF4444' },
];

function formatTZS(amount: number): string {
  if (isNaN(amount)) return 'TZS 0';
  return `TZS ${amount.toLocaleString('en-TZ')}`;
}

const inputClasses = "w-full py-3 px-4 bg-bg-input border border-border rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 focus:border-accent";

const Step6_Yield: React.FC<Step6Props> = ({ data, onChange }) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const yieldEstimate = parseFloat((data.yield_estimate as string) || '0');
  const actualYield = parseFloat((data.actual_yield as string) || '0');
  const pricePerKg = parseFloat((data.price_per_kg as string) || '0');

  const autoLoss = useMemo(() => {
    if (yieldEstimate > 0 && actualYield >= 0) {
      return ((yieldEstimate - actualYield) / yieldEstimate * 100).toFixed(1);
    }
    return '0';
  }, [yieldEstimate, actualYield]);

  const grossRevenue = useMemo(() => {
    return actualYield * pricePerKg;
  }, [actualYield, pricePerKg]);

  const photos: string[] = useMemo(() => {
    return (data.photos as string[]) || [];
  }, [data.photos]);

  const handleChange = useCallback((key: string, value: unknown) => {
    onChange({ [key]: value });
  }, [onChange]);

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange({
          yield_latitude: pos.coords.latitude,
          yield_longitude: pos.coords.longitude,
          yield_gps_accuracy: pos.coords.accuracy,
        });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [onChange]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentPhotos = (data.photos as string[]) || [];
    if (currentPhotos.length >= 5) return;

    const remaining = 5 - currentPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        const updated = [...((data.photos as string[]) || []), result];
        onChange({ photos: updated });
      };
      reader.readAsDataURL(file as Blob);
    });
    e.target.value = '';
  }, [data.photos, onChange]);

  const removePhoto = useCallback((index: number) => {
    const current = [...((data.photos as string[]) || [])];
    current.splice(index, 1);
    onChange({ photos: current });
  }, [data.photos, onChange]);

  const toggleVoice = useCallback(() => {
    setRecording(p => !p);
    // Voice recording would use MediaRecorder API in production
  }, []);

  const yieldLat = data.yield_latitude as number | undefined;
  const yieldLng = data.yield_longitude as number | undefined;
  const lossValue = (data.yield_loss as string) || autoLoss;

  const enableVoice = typeof window !== 'undefined' && 'MediaRecorder' in window;

  const lossColorClass = parseFloat(lossValue) > 30
    ? 'text-error'
    : parseFloat(lossValue) > 15
      ? 'text-warning'
      : 'text-success';

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Yield & Constraints
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Record yield data, market information, and field constraints
      </p>

      <div className="flex flex-col gap-6">
        {/* Yield Inputs */}
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
            Yield Data
          </h3>
          <div className="nuru-yield-grid grid grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="yield-estimate" className="block text-sm font-medium text-text-secondary mb-1.5">Yield Estimate</label>
              <div className="relative">
                <input
                  id="yield-estimate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.yield_estimate as string) || ''}
                  onChange={e => handleChange('yield_estimate', e.target.value)}
                  placeholder="0"
                  className={inputClasses}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
                  kg/ha
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="yield-actual" className="block text-sm font-medium text-text-secondary mb-1.5">Actual Yield <span className="text-text-accent">*</span></label>
              <div className="relative">
                <input
                  id="yield-actual"
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.actual_yield as string) || ''}
                  onChange={e => handleChange('actual_yield', e.target.value)}
                  placeholder="0"
                  className={inputClasses}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
                  kg/ha
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="yield-loss" className="block text-sm font-medium text-text-secondary mb-1.5">Yield Loss %</label>
              <input
                id="yield-loss"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={lossValue}
                onChange={e => handleChange('yield_loss', e.target.value)}
                placeholder="Auto"
                className={cn(inputClasses, lossColorClass)}
              />
            </div>
          </div>
        </div>

        {/* Market Channel */}
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
            Market Information
          </h3>

          <p id="yield-market-channel-label" className="block text-sm font-medium text-text-secondary mb-1.5">Market Channel <span className="text-text-accent">*</span></p>
          <div role="group" aria-labelledby="yield-market-channel-label" className="flex flex-wrap gap-2.5 mb-4">
            {MARKET_CHANNELS.map(ch => {
              const selected = (data.market_channel as string) === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => handleChange('market_channel', ch.value)}
                  className={cn(
                    "py-2.5 px-5 rounded-full text-sm font-medium cursor-pointer font-inherit transition-all duration-150 border-2",
                    selected
                      ? "border-accent bg-accent/[0.12] text-accent"
                      : "border-border bg-transparent text-text-secondary"
                  )}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          <div className="nuru-market-grid grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="yield-price-per-kg" className="block text-sm font-medium text-text-secondary mb-1.5">Price per kg (TZS) <span className="text-text-accent">*</span></label>
              <input
                id="yield-price-per-kg"
                type="number"
                min="0"
                step="1"
                value={(data.price_per_kg as string) || ''}
                onChange={e => handleChange('price_per_kg', e.target.value)}
                placeholder="0"
                className={inputClasses}
              />
            </div>
            <div>
              <p id="yield-gross-revenue-label" className="block text-sm font-medium text-text-secondary mb-1.5">Gross Revenue</p>
              <div role="region" aria-labelledby="yield-gross-revenue-label" className="py-3 px-4 bg-success/[0.08] border border-success/20 rounded-[16px] text-[0.938rem] font-bold text-success">
                {formatTZS(grossRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Constraint Severity Grid */}
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
            Constraint Severity
          </h3>

          <div className="flex flex-col gap-3.5">
            {CONSTRAINT_ROWS.map(row => {
              const selected = (data[row.key] as number) ?? -1;
              return (
                <div key={row.key}>
                  <p id={`yield-constraint-${row.key}`} className="block text-sm font-medium text-text-secondary mb-2">{row.label}</p>
                  <div role="group" aria-labelledby={`yield-constraint-${row.key}`} className="flex gap-1.5 flex-wrap">
                    {SEVERITY_LEVELS.map(level => {
                      const isSelected = selected === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handleChange(row.key, level.value)}
                          className="py-2 px-3.5 rounded-full text-xs font-semibold cursor-pointer font-inherit transition-all duration-150"
                          style={{
                            border: `2px solid ${isSelected ? level.color : 'transparent'}`,
                            backgroundColor: isSelected ? `${level.color}20` : 'rgba(255,255,255,0.04)',
                            color: isSelected ? level.color : '#6B7280',
                            outline: isSelected ? `2px solid ${level.color}40` : 'none',
                            outlineOffset: '2px',
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

        {/* Photo Upload */}
        <div className="p-5 nuru-glass-card rounded-[32px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-1">
            Photos
          </h3>
          <p className="text-xs text-text-tertiary mb-3.5">
            Upload up to 5 photos ({photos.length}/5)
          </p>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 mb-3">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-[10px] overflow-hidden border border-border"
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
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
            <>
            <label htmlFor="yield-photo-upload" className="sr-only">Upload photos</label>
            <button
              id="yield-photo-upload"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-border-light border border-dashed border-white/[0.15] rounded-full text-text-secondary text-sm font-medium cursor-pointer font-inherit"
            >
              <MaterialIcon name="photo_camera" size={16} />
              Upload Photo
            </button>
            </>
          )}
          <input
            id="yield-photo-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            aria-label="Upload yield photos"
          />
        </div>

        {/* GPS Capture */}
        <div className="flex gap-3 flex-wrap">
          <button
            id="yield-gps-capture"
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className={cn(
              "flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold tracking-[0.05em] font-inherit flex-1 justify-center border",
              gpsLoading && "cursor-wait",
              !gpsLoading && "cursor-pointer",
              yieldLat
                ? "bg-success/10 border-success/25 text-success"
                : "bg-accent/10 border-accent/25 text-accent"
            )}
          >
            {gpsLoading ? (
              'Capturing...'
            ) : yieldLat ? (
              <>
                <MaterialIcon name="near_me" size={16} />
                {(yieldLat as number).toFixed(4)}, {(yieldLng as number).toFixed(4)}
              </>
            ) : (
              <>
                <MaterialIcon name="location_on" size={16} />
                Capture GPS
              </>
            )}
          </button>

          {/* Voice Note */}
          {enableVoice && (
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "flex items-center gap-2 py-3 px-5 rounded-full text-sm font-medium cursor-pointer font-inherit border",
                recording
                  ? "bg-error/[0.15] border-error/30 text-error"
                  : "bg-border-glass border-border text-text-secondary"
              )}
            >
              {recording ? <MaterialIcon name="mic_off" size={16} /> : <MaterialIcon name="mic" size={16} />}
              {recording ? 'Stop' : 'Voice Note'}
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="yield-notes" className="block text-sm font-medium text-text-secondary mb-1.5">Additional Notes</label>
          <textarea
            id="yield-notes"
            value={(data.notes as string) || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Any additional observations or comments..."
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
