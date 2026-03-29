import React, { useState, useCallback } from 'react';
import { MapPin, Navigation, AlertTriangle, ChevronDown } from 'lucide-react';

interface Step2Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const TANZANIA_REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi',
  'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro',
  'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani',
  'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora',
  'Tanga', 'Unguja North', 'Unguja South', 'Zanzibar Central/South',
];

const Step2_Location: React.FC<Step2Props> = ({ data, onChange, errors }) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);

  const lat = data.latitude as number | undefined;
  const lng = data.longitude as number | undefined;
  const accuracy = data.gps_accuracy as number | undefined;

  const handleChange = useCallback((key: string, value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      position => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          gps_accuracy: position.coords.accuracy,
          gps_timestamp: position.timestamp,
        });
        setGpsLoading(false);
      },
      err => {
        setGpsError(err.message || 'Failed to capture GPS location');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [onChange]);

  const region = (data.region as string) || '';

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: `1px solid ${hasError ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.938rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Location Details
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '28px' }}>
        Capture farm location and administrative details
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Region Dropdown */}
        <div>
          <label style={labelStyle}>
            Region <span style={{ color: '#F0513E' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setRegionOpen(p => !p)}
              style={{
                ...inputStyle(!!errors.region),
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: region ? '#FFFFFF' : '#6B7280' }}>
                {region || 'Select region'}
              </span>
              <ChevronDown size={18} style={{ color: '#6B7280' }} />
            </button>
            {regionOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#1E1E1E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  zIndex: 50,
                  maxHeight: '240px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
              >
                {TANZANIA_REGIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { handleChange('region', r); setRegionOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: region === r ? 'rgba(240,81,62,0.15)' : 'transparent',
                      border: 'none',
                      color: region === r ? '#F0513E' : '#FFFFFF',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.region && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{errors.region}</p>}
        </div>

        {/* District */}
        <div>
          <label style={labelStyle}>District <span style={{ color: '#F0513E' }}>*</span></label>
          <input
            type="text"
            value={(data.district as string) || ''}
            onChange={e => handleChange('district', e.target.value)}
            placeholder="Enter district"
            style={inputStyle(!!errors.district)}
          />
          {errors.district && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{errors.district}</p>}
        </div>

        {/* Ward */}
        <div>
          <label style={labelStyle}>Ward</label>
          <input
            type="text"
            value={(data.ward as string) || ''}
            onChange={e => handleChange('ward', e.target.value)}
            placeholder="Enter ward"
            style={inputStyle(false)}
          />
        </div>

        {/* Village */}
        <div>
          <label style={labelStyle}>Village</label>
          <input
            type="text"
            value={(data.village as string) || ''}
            onChange={e => handleChange('village', e.target.value)}
            placeholder="Enter village"
            style={inputStyle(false)}
          />
        </div>

        {/* GPS Capture */}
        <div>
          <label style={labelStyle}>GPS Coordinates</label>
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 20px',
              backgroundColor: lat ? 'rgba(34,197,94,0.1)' : 'rgba(240,81,62,0.1)',
              border: `1px solid ${lat ? 'rgba(34,197,94,0.25)' : 'rgba(240,81,62,0.25)'}`,
              borderRadius: '12px',
              color: lat ? '#22C55E' : '#F0513E',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: gpsLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              width: '100%',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {gpsLoading ? (
              <>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(240,81,62,0.3)',
                    borderTopColor: '#F0513E',
                    borderRadius: '50%',
                    animation: 'nuru-spin 0.6s linear infinite',
                  }}
                />
                Capturing GPS...
              </>
            ) : lat ? (
              <>
                <Navigation size={16} />
                GPS Captured - Tap to Recapture
              </>
            ) : (
              <>
                <MapPin size={16} />
                Capture GPS Location
              </>
            )}
          </button>

          {/* GPS Data Display */}
          {lat !== undefined && lng !== undefined && (
            <div
              style={{
                marginTop: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--color-bg-input, #252525)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.688rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latitude</span>
                  <div style={{ fontSize: '0.875rem', color: '#FFFFFF', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{lat.toFixed(6)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.688rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longitude</span>
                  <div style={{ fontSize: '0.875rem', color: '#FFFFFF', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{lng.toFixed(6)}</div>
                </div>
              </div>
              {accuracy !== undefined && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.688rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</span>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: accuracy <= 50 ? '#22C55E' : '#F59E0B',
                    }}
                  >
                    {accuracy.toFixed(1)}m
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accuracy Warning */}
          {accuracy !== undefined && accuracy > 50 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                padding: '10px 14px',
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '10px',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: '0.813rem', color: '#FCD34D' }}>
                GPS accuracy is low ({accuracy.toFixed(0)}m). Move to an open area and try again.
              </span>
            </div>
          )}

          {gpsError && (
            <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '8px' }}>{gpsError}</p>
          )}
        </div>

        {/* Map Placeholder */}
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: 'var(--color-bg-input, #252525)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <MapPin size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.813rem' }}>
              {lat ? `Location: ${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'Map will display after GPS capture'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nuru-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Step2_Location;
