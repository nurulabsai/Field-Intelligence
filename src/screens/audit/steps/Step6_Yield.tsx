import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Camera, MapPin, Navigation, Mic, MicOff, X } from 'lucide-react';

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

const inputClasses = "w-full py-3 px-4 bg-bg-input border border-border rounded-xl text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150";

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

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">
        Yield & Constraints
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Record yield data, market information, and field constraints
      </p>

      <div className="flex flex-col gap-6">
        {/* Yield Inputs */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Yield Data
          </h3>
          <div className="nuru-yield-grid grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Yield Estimate</label>
              <div className="relative">
                <input
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
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Actual Yield <span className="text-text-accent">*</span></label>
              <div className="relative">
                <input
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
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Yield Loss %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={lossValue}
                onChange={e => handleChange('yield_loss', e.target.value)}
                placeholder="Auto"
                className={inputClasses}
                style={{ color: parseFloat(lossValue) > 30 ? '#EF4444' : parseFloat(lossValue) > 15 ? '#F59E0B' : '#22C55E' }}
              />
            </div>
          </div>
        </div>

        {/* Market Channel */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Market Information
          </h3>

          <label className="block text-sm font-medium text-text-secondary mb-1.5">Market Channel <span className="text-text-accent">*</span></label>
          <div className="flex flex-wrap gap-2.5 mb-4">
            {MARKET_CHANNELS.map(ch => {
              const selected = (data.market_channel as string) === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => handleChange('market_channel', ch.value)}
                  className="py-2.5 px-5 rounded-[10px] text-sm font-medium cursor-pointer font-inherit transition-all duration-150"
                  style={{
                    border: `2px solid ${selected ? '#F0513E' : 'rgba(255,255,255,0.08)'}`,
                    backgroundColor: selected ? 'rgba(240,81,62,0.12)' : 'transparent',
                    color: selected ? '#F0513E' : '#9CA3AF',
                  }}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          <div className="nuru-market-grid grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Price per kg (TZS) <span className="text-text-accent">*</span></label>
              <input
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
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Gross Revenue</label>
              <div className="py-3 px-4 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl text-[0.938rem] font-bold text-[#22C55E]">
                {formatTZS(grossRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Constraint Severity Grid */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Constraint Severity
          </h3>

          <div className="flex flex-col gap-3.5">
            {CONSTRAINT_ROWS.map(row => {
              const selected = (data[row.key] as number) ?? -1;
              return (
                <div key={row.key}>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{row.label}</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {SEVERITY_LEVELS.map(level => {
                      const isSelected = selected === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handleChange(row.key, level.value)}
                          className="py-2 px-3.5 rounded-sm text-xs font-semibold cursor-pointer font-inherit transition-all duration-150"
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
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-1">
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
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-[22px] h-[22px] rounded-full bg-[rgba(0,0,0,0.7)] border-none text-white cursor-pointer flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.15)] rounded-xl text-text-secondary text-sm font-medium cursor-pointer font-inherit"
            >
              <Camera size={16} />
              Upload Photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* GPS Capture */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className="flex items-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold font-inherit flex-1 justify-center"
            style={{
              backgroundColor: yieldLat ? 'rgba(34,197,94,0.1)' : 'rgba(240,81,62,0.1)',
              border: `1px solid ${yieldLat ? 'rgba(34,197,94,0.25)' : 'rgba(240,81,62,0.25)'}`,
              color: yieldLat ? '#22C55E' : '#F0513E',
              cursor: gpsLoading ? 'wait' : 'pointer',
            }}
          >
            {gpsLoading ? (
              'Capturing...'
            ) : yieldLat ? (
              <>
                <Navigation size={16} />
                {(yieldLat as number).toFixed(4)}, {(yieldLng as number).toFixed(4)}
              </>
            ) : (
              <>
                <MapPin size={16} />
                Capture GPS
              </>
            )}
          </button>

          {/* Voice Note */}
          {enableVoice && (
            <button
              type="button"
              onClick={toggleVoice}
              className="flex items-center gap-2 py-3 px-5 rounded-xl text-sm font-medium cursor-pointer font-inherit"
              style={{
                backgroundColor: recording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${recording ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: recording ? '#EF4444' : '#9CA3AF',
              }}
            >
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
              {recording ? 'Stop' : 'Voice Note'}
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Additional Notes</label>
          <textarea
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
