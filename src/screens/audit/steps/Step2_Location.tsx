import React, { useState, useCallback, useMemo } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import {
  districtsForRegion,
  TARGET_REGION_KEYS,
  TANZANIA_REGIONS,
} from '../../../lib/tanzania-admin-cascade';

interface Step2Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const Step2_Location: React.FC<Step2Props> = ({ data, onChange, errors }) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const lat = (data.latitude as number | undefined) ?? (data.gps_lat as number | undefined);
  const lng = (data.longitude as number | undefined) ?? (data.gps_lng as number | undefined);
  const accuracy = data.gps_accuracy as number | undefined;

  const region = (data.region as string) || '';
  const districtList = useMemo(() => districtsForRegion(region), [region]);
  const useDistrictDropdown = TARGET_REGION_KEYS.includes(region as (typeof TARGET_REGION_KEYS)[number]);

  const handleChange = useCallback(
    (key: string, value: string) => {
      if (key === 'region') {
        const nextDistricts = districtsForRegion(value);
        const currentD = (data.district as string) || '';
        const patch: Record<string, unknown> = { region: value };
        if (nextDistricts.length > 0 && !nextDistricts.includes(currentD)) {
          patch.district = '';
        }
        onChange(patch);
        return;
      }
      onChange({ [key]: value });
    },
    [data.district, onChange],
  );

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const la = position.coords.latitude;
        const lo = position.coords.longitude;
        onChange({
          latitude: la,
          longitude: lo,
          gps_lat: la,
          gps_lng: lo,
          gps_accuracy: position.coords.accuracy,
          gps_timestamp: position.timestamp,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'Failed to capture GPS location');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [onChange]);

  const inputBaseClasses =
    'w-full py-3 px-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150';

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Location Details
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Region, district (cascade for Pwani / Morogoro / Ruvuma), ward, village, and GPS
      </p>

      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        <div>
          <label
            htmlFor="location-region-dd"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            Region <span className="text-text-accent">*</span>
          </label>
          <div className="relative">
            <button
              id="location-region-dd"
              type="button"
              onClick={() => setRegionOpen((p) => !p)}
              className={cn(
                inputBaseClasses,
                'text-left cursor-pointer flex items-center justify-between border',
                errors.region ? 'border-error' : 'border-border',
              )}
            >
              <span className={region ? 'text-white' : 'text-text-tertiary'}>
                {region || 'Select region'}
              </span>
              <MaterialIcon name="expand_more" size={18} className="text-text-tertiary" />
            </button>
            {regionOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border-dark rounded-[18px] z-50 max-h-60 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                {TANZANIA_REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleChange('region', r);
                      setRegionOpen(false);
                    }}
                    className={cn(
                      'w-full min-h-12 py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit',
                      region === r ? 'bg-accent/15 text-accent' : 'bg-transparent text-white',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.region && <p className="text-xs text-error-light mt-1">{errors.region}</p>}
        </div>

        <div>
          <label
            htmlFor="location-district"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            District <span className="text-text-accent">*</span>
          </label>
          {useDistrictDropdown && districtList.length > 0 ? (
            <div className="relative">
              <button
                id="location-district"
                type="button"
                onClick={() => setDistrictOpen((p) => !p)}
                className={cn(
                  inputBaseClasses,
                  'text-left cursor-pointer flex items-center justify-between border w-full',
                  errors.district ? 'border-error' : 'border-border',
                )}
              >
                <span className={(data.district as string) ? 'text-white' : 'text-text-tertiary'}>
                  {(data.district as string) || 'Select district'}
                </span>
                <MaterialIcon name="expand_more" size={18} className="text-text-tertiary" />
              </button>
              {districtOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border-dark rounded-[18px] z-50 max-h-52 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                  {districtList.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        handleChange('district', d);
                        setDistrictOpen(false);
                      }}
                      className={cn(
                        'w-full min-h-12 py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit',
                        (data.district as string) === d ? 'bg-accent/15 text-accent' : 'bg-transparent text-white',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <input
              id="location-district"
              type="text"
              value={(data.district as string) || ''}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="Enter district"
              className={cn(
                inputBaseClasses,
                'border',
                errors.district ? 'border-error' : 'border-border',
                'focus:border-accent',
              )}
            />
          )}
          {errors.district && <p className="text-xs text-error-light mt-1">{errors.district}</p>}
        </div>

        <div>
          <label
            htmlFor="location-ward"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            Ward <span className="text-text-accent">*</span>
          </label>
          <input
            id="location-ward"
            type="text"
            value={(data.ward as string) || ''}
            onChange={(e) => handleChange('ward', e.target.value)}
            placeholder="Enter ward"
            className={cn(
              inputBaseClasses,
              'border border-border focus:border-accent',
              errors.ward ? 'border-error' : 'border-border',
            )}
          />
          {errors.ward && <p className="text-xs text-error-light mt-1">{errors.ward}</p>}
        </div>

        <div>
          <label
            htmlFor="location-village"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            Village <span className="text-text-accent">*</span>
          </label>
          <input
            id="location-village"
            type="text"
            value={(data.village as string) || ''}
            onChange={(e) => handleChange('village', e.target.value)}
            placeholder="Enter village"
            className={cn(
              inputBaseClasses,
              'border border-border focus:border-accent',
              errors.village ? 'border-error' : 'border-border',
            )}
          />
          {errors.village && <p className="text-xs text-error-light mt-1">{errors.village}</p>}
        </div>

        <div>
          <label
            htmlFor="location-gps-capture"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            GPS Coordinates <span className="text-text-accent">*</span>
          </label>
          <button
            id="location-gps-capture"
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className={cn(
              'flex items-center gap-2.5 py-3.5 px-5 rounded-full text-sm font-semibold tracking-[0.05em] font-inherit w-full justify-center transition-all duration-150 border',
              lat ? 'bg-success/10 border-success/25 text-success' : 'bg-accent/10 border-accent/25 text-accent',
              gpsLoading ? 'cursor-wait' : 'cursor-pointer',
            )}
          >
            {gpsLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-[nuru-spin_0.6s_linear_infinite]" />
                Capturing GPS...
              </>
            ) : lat ? (
              <>
                <MaterialIcon name="near_me" size={16} />
                GPS Captured - Tap to Recapture
              </>
            ) : (
              <>
                <MaterialIcon name="location_on" size={16} />
                Capture GPS Location
              </>
            )}
          </button>

          {lat !== undefined && lng !== undefined && (
            <div className="mt-3 py-3.5 px-4 nuru-glass-card rounded-[16px] border border-border-glass">
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
                    className={cn(
                      'text-sm font-medium',
                      accuracy <= 50 ? 'text-success' : 'text-warning',
                    )}
                  >
                    {accuracy.toFixed(1)}m
                  </div>
                </div>
              )}
            </div>
          )}

          {accuracy !== undefined && accuracy > 50 && (
            <div className="flex items-center gap-2 mt-2 py-2.5 px-3.5 bg-warning/10 border border-warning/25 rounded-[10px]">
              <MaterialIcon name="warning" size={16} className="text-warning shrink-0" />
              <span className="text-[0.813rem] text-warning-light">
                GPS accuracy is low ({accuracy.toFixed(0)}m). Move to an open area and try again.
              </span>
            </div>
          )}

          {gpsError && <p className="text-xs text-error-light mt-2">{gpsError}</p>}
        </div>

        <div className="w-full h-[200px] nuru-glass-card rounded-[18px] border border-border-glass flex items-center justify-center text-text-tertiary">
          <div className="text-center">
            <MaterialIcon name="location_on" size={32} className="mx-auto mb-2 opacity-50" />
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
