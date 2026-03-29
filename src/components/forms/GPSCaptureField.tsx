import { useState, useCallback } from 'react';
import NeonButton from '../ui/NeonButton';

interface GPSCaptureFieldProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  onCapture: (lat: number, lng: number, accuracy: number) => void;
}

export default function GPSCaptureField({
  latitude,
  longitude,
  accuracy,
  onCapture,
}: GPSCaptureFieldProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onCapture]);

  const accuracyColor =
    accuracy === null ? 'text-white/40' :
    accuracy < 10 ? 'text-green-400' :
    accuracy < 30 ? 'text-neon-amber' :
    'text-neon-red';

  return (
    <div className="flex flex-col gap-3">
      <label className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
        GPS COORDINATES
      </label>

      <NeonButton
        variant="ghost"
        icon="my_location"
        iconPosition="left"
        loading={loading}
        onClick={handleCapture}
        fullWidth
      >
        {latitude !== null ? 'Recapture GPS' : 'Capture GPS Location'}
      </NeonButton>

      {latitude !== null && longitude !== null && (
        <div className="flex items-center justify-between rounded-[16px] border border-white/5 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="font-mono text-xs text-white">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-[14px] ${accuracyColor}`}>
              gps_fixed
            </span>
            <span className={`font-mono text-[10px] ${accuracyColor}`}>
              {accuracy !== null ? `\u00B1${accuracy.toFixed(0)}m` : '--'}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 font-manrope text-[11px] text-neon-red" role="alert">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
