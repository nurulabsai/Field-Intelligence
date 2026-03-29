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

  const inputBaseClasses = "w-full py-3 px-4 bg-bg-input rounded-xl text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150";

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">
        Location Details
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Capture farm location and administrative details
      </p>

      <div className="flex flex-col gap-5">
        {/* Region Dropdown */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Region <span className="text-text-accent">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRegionOpen(p => !p)}
              className={`${inputBaseClasses} text-left cursor-pointer flex items-center justify-between`}
              style={{
                border: `1px solid ${errors.region ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span className={region ? 'text-white' : 'text-text-tertiary'}>
                {region || 'Select region'}
              </span>
              <ChevronDown size={18} className="text-text-tertiary" />
            </button>
            {regionOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-bg-tertiary border border-[rgba(255,255,255,0.1)] rounded-xl z-50 max-h-60 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                {TANZANIA_REGIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { handleChange('region', r); setRegionOpen(false); }}
                    className="w-full py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit"
                    style={{
                      background: region === r ? 'rgba(240,81,62,0.15)' : 'transparent',
                      color: region === r ? '#F0513E' : '#FFFFFF',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.region && <p className="text-xs text-[#FCA5A5] mt-1">{errors.region}</p>}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            District <span className="text-text-accent">*</span>
          </label>
          <input
            type="text"
            value={(data.district as string) || ''}
            onChange={e => handleChange('district', e.target.value)}
            placeholder="Enter district"
            className={inputBaseClasses}
            style={{
              border: `1px solid ${errors.district ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
            }}
          />
          {errors.district && <p className="text-xs text-[#FCA5A5] mt-1">{errors.district}</p>}
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Ward</label>
          <input
            type="text"
            value={(data.ward as string) || ''}
            onChange={e => handleChange('ward', e.target.value)}
            placeholder="Enter ward"
            className={`${inputBaseClasses} border border-border`}
          />
        </div>

        {/* Village */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Village</label>
          <input
            type="text"
            value={(data.village as string) || ''}
            onChange={e => handleChange('village', e.target.value)}
            placeholder="Enter village"
            className={`${inputBaseClasses} border border-border`}
          />
        </div>

        {/* GPS Capture */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">GPS Coordinates</label>
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className="flex items-center gap-2.5 py-3.5 px-5 rounded-xl text-sm font-semibold font-inherit w-full justify-center transition-all duration-150"
            style={{
              backgroundColor: lat ? 'rgba(34,197,94,0.1)' : 'rgba(240,81,62,0.1)',
              border: `1px solid ${lat ? 'rgba(34,197,94,0.25)' : 'rgba(240,81,62,0.25)'}`,
              color: lat ? '#22C55E' : '#F0513E',
              cursor: gpsLoading ? 'wait' : 'pointer',
            }}
          >
            {gpsLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[rgba(240,81,62,0.3)] border-t-accent rounded-full animate-[nuru-spin_0.6s_linear_infinite]" />
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
            <div className="mt-3 py-3.5 px-4 bg-bg-input rounded-xl border border-[rgba(255,255,255,0.06)]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[0.688rem] text-text-tertiary uppercase tracking-widest">Latitude</span>
                  <div className="text-sm text-white font-medium tabular-nums">{lat.toFixed(6)}</div>
                </div>
                <div>
                  <span className="text-[0.688rem] text-text-tertiary uppercase tracking-widest">Longitude</span>
                  <div className="text-sm text-white font-medium tabular-nums">{lng.toFixed(6)}</div>
                </div>
              </div>
              {accuracy !== undefined && (
                <div className="mt-2">
                  <span className="text-[0.688rem] text-text-tertiary uppercase tracking-widest">Accuracy</span>
                  <div
                    className="text-sm font-medium"
                    style={{
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
            <div className="flex items-center gap-2 mt-2 py-2.5 px-3.5 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] rounded-[10px]">
              <AlertTriangle size={16} className="text-[#F59E0B] shrink-0" />
              <span className="text-[0.813rem] text-[#FCD34D]">
                GPS accuracy is low ({accuracy.toFixed(0)}m). Move to an open area and try again.
              </span>
            </div>
          )}

          {gpsError && (
            <p className="text-xs text-[#FCA5A5] mt-2">{gpsError}</p>
          )}
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-[200px] bg-bg-input rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-text-tertiary">
          <div className="text-center">
            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-[0.813rem]">
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
