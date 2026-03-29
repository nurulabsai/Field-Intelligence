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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.938rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

  const enableVoice = typeof window !== 'undefined' && 'MediaRecorder' in window;

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Yield & Constraints
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '28px' }}>
        Record yield data, market information, and field constraints
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Yield Inputs */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Yield Data
          </h3>
          <div
            className="nuru-yield-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}
          >
            <div>
              <label style={labelStyle}>Yield Estimate</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.yield_estimate as string) || ''}
                  onChange={e => handleChange('yield_estimate', e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#6B7280' }}>
                  kg/ha
                </span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Actual Yield <span style={{ color: '#F0513E' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.actual_yield as string) || ''}
                  onChange={e => handleChange('actual_yield', e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#6B7280' }}>
                  kg/ha
                </span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Yield Loss %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={lossValue}
                onChange={e => handleChange('yield_loss', e.target.value)}
                placeholder="Auto"
                style={{ ...inputStyle, color: parseFloat(lossValue) > 30 ? '#EF4444' : parseFloat(lossValue) > 15 ? '#F59E0B' : '#22C55E' }}
              />
            </div>
          </div>
        </div>

        {/* Market Channel */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Market Information
          </h3>

          <label style={labelStyle}>Market Channel <span style={{ color: '#F0513E' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {MARKET_CHANNELS.map(ch => {
              const selected = (data.market_channel as string) === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => handleChange('market_channel', ch.value)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: `2px solid ${selected ? '#F0513E' : 'rgba(255,255,255,0.08)'}`,
                    backgroundColor: selected ? 'rgba(240,81,62,0.12)' : 'transparent',
                    color: selected ? '#F0513E' : '#9CA3AF',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          <div className="nuru-market-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Price per kg (TZS) <span style={{ color: '#F0513E' }}>*</span></label>
              <input
                type="number"
                min="0"
                step="1"
                value={(data.price_per_kg as string) || ''}
                onChange={e => handleChange('price_per_kg', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Gross Revenue</label>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '12px',
                  fontSize: '0.938rem',
                  fontWeight: 700,
                  color: '#22C55E',
                }}
              >
                {formatTZS(grossRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Constraint Severity Grid */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Constraint Severity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {CONSTRAINT_ROWS.map(row => {
              const selected = (data[row.key] as number) ?? -1;
              return (
                <div key={row.key}>
                  <label style={{ ...labelStyle, marginBottom: '8px' }}>{row.label}</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {SEVERITY_LEVELS.map(level => {
                      const isSelected = selected === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handleChange(row.key, level.value)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: `2px solid ${isSelected ? level.color : 'transparent'}`,
                            backgroundColor: isSelected ? `${level.color}20` : 'rgba(255,255,255,0.04)',
                            color: isSelected ? level.color : '#6B7280',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s ease',
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
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
            Photos
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '14px' }}>
            Upload up to 5 photos ({photos.length}/5)
          </p>

          {/* Thumbnail grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            {photos.map((photo, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#9CA3AF',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
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
            style={{ display: 'none' }}
          />
        </div>

        {/* GPS Capture */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: yieldLat ? 'rgba(34,197,94,0.1)' : 'rgba(240,81,62,0.1)',
              border: `1px solid ${yieldLat ? 'rgba(34,197,94,0.25)' : 'rgba(240,81,62,0.25)'}`,
              borderRadius: '12px',
              color: yieldLat ? '#22C55E' : '#F0513E',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: gpsLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              flex: 1,
              justifyContent: 'center',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: recording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${recording ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px',
                color: recording ? '#EF4444' : '#9CA3AF',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
              {recording ? 'Stop' : 'Voice Note'}
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Additional Notes</label>
          <textarea
            value={(data.notes as string) || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Any additional observations or comments..."
            rows={4}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
            }}
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
