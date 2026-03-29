import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { useGPSLocation } from '../hooks/useGPSLocation';
import { BoundaryCorner } from '../types';
import { MapPin, Loader2, Trash2, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import './BoundarySection.css';

interface BoundarySectionProps {
  corners: BoundaryCorner[];
  onChange: (corners: BoundaryCorner[]) => void;
  targetDistrict?: string;
}

export const BoundarySection: React.FC<BoundarySectionProps> = ({
  corners,
  onChange,
}) => {
  const { getCurrentPosition, isLoading, error } = useGPSLocation();
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Calculate area whenever corners change
  useEffect(() => {
    if (corners.length >= 3) {
      try {
        const coordinates = corners.map((c) => [c.lon, c.lat]);
        coordinates.push(coordinates[0]);

        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon);
        const areaHa = area / 10000;
        setCalculatedArea(areaHa);
      } catch (e) {
        console.error('Failed to calculate area:', e);
        setCalculatedArea(null);
      }
    } else {
      setCalculatedArea(null);
    }
  }, [corners]);

  // Validate corners and generate warnings
  useEffect(() => {
    const newWarnings: string[] = [];

    if (corners.length > 0 && corners.length < 4) {
      newWarnings.push(`Need at least 4 corners (currently ${corners.length})`);
    } else if (corners.length > 8) {
      newWarnings.push(`Maximum 8 corners allowed (currently ${corners.length})`);
    }

    const poorAccuracy = corners.filter((c) => (c.accuracy ?? 999) > 50);
    if (poorAccuracy.length > 0) {
      newWarnings.push(`${poorAccuracy.length} corner(s) have poor GPS accuracy (>50m)`);
    }

    setWarnings(newWarnings);
  }, [corners]);

  const handleAddCorner = async () => {
    try {
      const position = await getCurrentPosition();

      const newCorner: BoundaryCorner = {
        lat: position.latitude,
        lon: position.longitude,
        accuracy: position.accuracy,
        timestamp: new Date(position.timestamp || Date.now()).toISOString(),
        sequence: corners.length + 1,
      };

      onChange([...corners, newCorner]);
    } catch (err) {
      console.error('Failed to get GPS position:', err);
      alert('Failed to get GPS reading. Please check device permissions and GPS signal.');
    }
  };

  const handleRemoveCorner = (index: number) => {
    const updated = corners.filter((_, i) => i !== index);
    const resequenced = updated.map((c, i) => ({ ...c, sequence: i + 1 }));
    onChange(resequenced);
  };

  const handleReorderCorner = (fromIndex: number, toIndex: number) => {
    const updated = [...corners];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const resequenced = updated.map((c, i) => ({ ...c, sequence: i + 1 }));
    onChange(resequenced);
  };

  const getAccuracyLabel = (accuracy?: number): { label: string; colorClass: string } => {
    if (!accuracy) return { label: 'Unknown', colorClass: 'acc-unknown' };
    if (accuracy <= 10) return { label: 'Excellent', colorClass: 'acc-excellent' };
    if (accuracy <= 20) return { label: 'Good', colorClass: 'acc-good' };
    if (accuracy <= 50) return { label: 'Fair', colorClass: 'acc-fair' };
    return { label: 'Poor', colorClass: 'acc-poor' };
  };

  return (
    <div className="boundary-section">
      <p className="question-help">
        Walk to each corner of the farm and tap &quot;Add Corner&quot; to record the GPS position.
        You need 4-8 corners to create a valid boundary.
      </p>

      <div className="boundary-stats">
        <div className="stat-box">
          <span>Corners</span>
          <span className={corners.length >= 4 && corners.length <= 8 ? 'valid' : 'invalid'}>
            {corners.length} / 4-8
          </span>
        </div>
        {calculatedArea != null && (
          <div className="stat-box">
            <span>Area</span>
            <span>{calculatedArea.toFixed(2)} ha</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAddCorner}
        disabled={isLoading || corners.length >= 8}
        className="btn btn-primary btn-block"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Getting GPS...
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Add Corner Point
          </>
        )}
      </button>

      {error && (
        <div className="gps-error">
          <AlertTriangle className="w-5 h-5" style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div>
        {corners.map((corner, index) => {
          const acc = getAccuracyLabel(corner.accuracy);
          return (
            <div key={index} className="corner-item">
              <div className="corner-header">
                <div>
                  <span className="corner-number">Corner {corner.sequence}</span>
                  <span className={`accuracy-badge ${acc.colorClass}`}>
                    {acc.label}
                    {corner.accuracy != null ? ` (±${corner.accuracy.toFixed(1)}m)` : ''}
                  </span>
                </div>
                <div className="corner-actions">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleReorderCorner(index, index - 1)}
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < corners.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleReorderCorner(index, index + 1)}
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveCorner(index)}
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="corner-coords">
                {corner.lat.toFixed(6)}, {corner.lon.toFixed(6)}
              </div>
              {corner.timestamp && (
                <div className="corner-time" style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  {new Date(corner.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {warnings.length > 0 && (
        <div className="validation-warnings">
          <h4>
            <AlertTriangle className="w-4 h-4" style={{ display: 'inline', marginRight: 8 }} />
            Validation Warnings
          </h4>
          <ul>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
