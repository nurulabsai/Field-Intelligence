import React from 'react';
import MaterialIcon from './MaterialIcon';

interface GeoValue {
  lat: number;
  lng: number;
  accuracy: number;
}

interface MapCaptureButtonProps {
  onCapture: (lat: number, lng: number, accuracy: number) => void;
  value?: GeoValue;
}

const MapCaptureButton: React.FC<MapCaptureButtonProps> = ({
  onCapture,
  value,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCapture = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        onCapture(latitude, longitude, accuracy);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('Failed to get location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const hasLowAccuracy = value && value.accuracy > 50;

  return (
    <div className="font-[Inter,sans-serif]">
      <button
        onClick={handleCapture}
        disabled={loading}
        className="flex items-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-bg-input text-white font-[Inter,sans-serif] text-sm font-medium transition-all duration-200"
        style={{
          border: `1px solid ${
            value
              ? hasLowAccuracy
                ? 'rgba(245,158,11,0.4)'
                : 'rgba(34,197,94,0.3)'
              : 'rgba(255,255,255,0.08)'
          }`,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? (
          <MaterialIcon
            name="progress_activity"
            size={20}
            className="animate-[nuru-geo-spin_1s_linear_infinite] shrink-0"
          />
        ) : (
          <span
            className="inline-flex shrink-0"
            style={{
              color: value ? (hasLowAccuracy ? '#F59E0B' : '#22C55E') : '#9CA3AF',
            }}
          >
            <MaterialIcon name="location_on" size={20} />
          </span>
        )}

        <div className="flex-1 text-left">
          {loading ? (
            <span className="text-text-secondary">Getting location...</span>
          ) : value ? (
            <div>
              <div className="text-[13px]">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: hasLowAccuracy ? '#F59E0B' : '#6B7280' }}
              >
                Accuracy: {Math.round(value.accuracy)}m
              </div>
            </div>
          ) : (
            <span className="text-text-secondary">Capture GPS Location</span>
          )}
        </div>
      </button>

      {hasLowAccuracy && (
        <div className="flex items-center gap-1.5 mt-2 py-2 px-3 rounded-lg bg-[rgba(245,158,11,0.1)] text-xs text-[#F59E0B]">
          <MaterialIcon name="warning" size={14} />
          Low accuracy ({Math.round(value.accuracy)}m). Move to an open area and try again.
        </div>
      )}

      {error && (
        <div className="mt-2 py-2 px-3 rounded-lg bg-[rgba(239,68,68,0.1)] text-xs text-[#EF4444]">
          {error}
        </div>
      )}

      <style>{`
        @keyframes nuru-geo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MapCaptureButton;
