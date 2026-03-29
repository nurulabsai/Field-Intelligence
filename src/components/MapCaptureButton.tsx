import React from 'react';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';

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
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <button
        onClick={handleCapture}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          border: `1px solid ${
            value
              ? hasLowAccuracy
                ? 'rgba(245,158,11,0.4)'
                : 'rgba(34,197,94,0.3)'
              : 'rgba(255,255,255,0.08)'
          }`,
          backgroundColor: 'var(--color-bg-input, #252525)',
          color: '#FFFFFF',
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? (
          <Loader2
            size={20}
            style={{ animation: 'nuru-geo-spin 1s linear infinite', flexShrink: 0 }}
          />
        ) : (
          <MapPin
            size={20}
            color={value ? (hasLowAccuracy ? '#F59E0B' : '#22C55E') : '#9CA3AF'}
            style={{ flexShrink: 0 }}
          />
        )}

        <div style={{ flex: 1, textAlign: 'left' }}>
          {loading ? (
            <span style={{ color: '#9CA3AF' }}>Getting location...</span>
          ) : value ? (
            <div>
              <div style={{ fontSize: '13px' }}>
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: hasLowAccuracy ? '#F59E0B' : '#6B7280',
                  marginTop: '2px',
                }}
              >
                Accuracy: {Math.round(value.accuracy)}m
              </div>
            </div>
          ) : (
            <span style={{ color: '#9CA3AF' }}>Capture GPS Location</span>
          )}
        </div>
      </button>

      {hasLowAccuracy && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245,158,11,0.1)',
            fontSize: '12px',
            color: '#F59E0B',
          }}
        >
          <AlertTriangle size={14} />
          Low accuracy ({Math.round(value.accuracy)}m). Move to an open area and try again.
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            fontSize: '12px',
            color: '#EF4444',
          }}
        >
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
