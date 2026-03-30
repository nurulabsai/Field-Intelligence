import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  MapPin, Navigation, AlertTriangle, Play, Pause, Square, RotateCcw,
  Crosshair, Footprints, Zap, Trash2, Check, ChevronDown, Undo2,
} from 'lucide-react';
import { cn } from '../../../design-system';
import type {
  FarmBoundary, FarmProfile, GpsBoundaryPoint,
  BoundaryCaptureMethod, GpsAccuracySummary,
} from '../../../lib/audit-types';
import { createFarmBoundary } from '../../../lib/audit-types';

interface StepFarmBoundaryProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

type CaptureState = 'idle' | 'recording' | 'paused' | 'complete';

const MIN_POINTS = 4;
const MAX_POINTS = 50;
const ACCURACY_WARN_THRESHOLD = 30;

function computeAccuracySummary(points: GpsBoundaryPoint[]): GpsAccuracySummary | null {
  if (points.length === 0) return null;
  const accs = points.map(p => p.accuracy).filter(a => a > 0);
  if (accs.length === 0) return null;
  return {
    min: Math.min(...accs),
    max: Math.max(...accs),
    avg: accs.reduce((s, a) => s + a, 0) / accs.length,
    count: accs.length,
  };
}

function computeAreaHa(points: GpsBoundaryPoint[]): number | null {
  if (points.length < 3) return null;
  try {
    const coords = points.map(p => [p.lon, p.lat]);
    coords.push(coords[0]!);
    // Haversine-based shoelace approximation (no turf dependency at render time)
    const toRad = (d: number) => (d * Math.PI) / 180;
    let areaM2 = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lon1, lat1] = coords[i]!;
      const [lon2, lat2] = coords[i + 1]!;
      areaM2 +=
        toRad(lon2! - lon1!) *
        (2 + Math.sin(toRad(lat1!)) + Math.sin(toRad(lat2!)));
    }
    areaM2 = Math.abs((areaM2 * 6378137 * 6378137) / 2);
    return areaM2 / 10_000;
  } catch {
    return null;
  }
}

const MODE_OPTIONS: { value: BoundaryCaptureMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'walk', label: 'Walk Boundary', icon: <Footprints size={20} />, desc: 'Auto-capture GPS as you walk the perimeter' },
  { value: 'corner', label: 'Corner Points', icon: <Crosshair size={20} />, desc: 'Manually tap to capture each corner' },
  { value: 'quick', label: 'Quick Draft', icon: <Zap size={20} />, desc: 'Fast rough capture for low-confidence drafts' },
];

const StepFarmBoundary: React.FC<StepFarmBoundaryProps> = ({ data, onChange, errors }) => {
  const farmProfile = data.farm_profile as FarmProfile | undefined;
  const farmId = farmProfile?.id || '';

  const boundary: FarmBoundary = (data.farm_boundary as FarmBoundary) || createFarmBoundary(farmId);

  const [captureState, setCaptureState] = useState<CaptureState>(
    boundary.status === 'complete' ? 'complete' : boundary.points.length > 0 ? 'paused' : 'idle',
  );
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showSkipReason, setShowSkipReason] = useState(false);
  const watchRef = useRef<number | null>(null);

  const updateBoundary = useCallback((partial: Partial<FarmBoundary>) => {
    const updated = { ...boundary, ...partial, farm_id: farmId };
    onChange({ farm_boundary: updated });
  }, [boundary, farmId, onChange]);

  const addPoint = useCallback((lat: number, lon: number, accuracy: number) => {
    if (boundary.points.length >= MAX_POINTS) return;
    const point: GpsBoundaryPoint = {
      lat, lon, accuracy,
      timestamp: new Date().toISOString(),
      sequence: boundary.points.length + 1,
    };
    const points = [...boundary.points, point];
    const summary = computeAccuracySummary(points);
    const areaHa = computeAreaHa(points);
    updateBoundary({ points, gps_accuracy_summary: summary, area_ha: areaHa });
  }, [boundary.points, updateBoundary]);

  const removeLastPoint = useCallback(() => {
    if (boundary.points.length === 0) return;
    const points = boundary.points.slice(0, -1).map((p, i) => ({ ...p, sequence: i + 1 }));
    const summary = computeAccuracySummary(points);
    const areaHa = computeAreaHa(points);
    updateBoundary({ points, gps_accuracy_summary: summary, area_ha: areaHa });
  }, [boundary.points, updateBoundary]);

  const captureOnePoint = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentAccuracy(pos.coords.accuracy);
        addPoint(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      err => setGpsError(err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [addPoint]);

  const startWalkCapture = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }
    setGpsError(null);
    setCaptureState('recording');
    updateBoundary({ captured_at: new Date().toISOString() });

    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        setCurrentAccuracy(pos.coords.accuracy);
        const last = boundary.points[boundary.points.length - 1];
        if (last) {
          const dlat = Math.abs(pos.coords.latitude - last.lat);
          const dlon = Math.abs(pos.coords.longitude - last.lon);
          if (dlat < 0.00003 && dlon < 0.00003) return;
        }
        addPoint(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      err => setGpsError(err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
    );
  }, [addPoint, boundary.points, updateBoundary]);

  const pauseCapture = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setCaptureState('paused');
  }, []);

  const resumeCapture = useCallback(() => {
    if (boundary.capture_method === 'walk') {
      startWalkCapture();
    } else {
      setCaptureState('recording');
    }
  }, [boundary.capture_method, startWalkCapture]);

  const finishCapture = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    const confidence = (() => {
      const summary = computeAccuracySummary(boundary.points);
      if (!summary) return 'low' as const;
      if (summary.avg <= 10 && boundary.points.length >= 6) return 'high' as const;
      if (summary.avg <= 20) return 'medium' as const;
      return 'low' as const;
    })();

    setCaptureState('complete');
    updateBoundary({ status: 'complete', confidence });
  }, [boundary.points, updateBoundary]);

  const resetCapture = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setCaptureState('idle');
    updateBoundary({
      capture_method: '',
      points: [],
      status: 'draft',
      confidence: '',
      gps_accuracy_summary: null,
      area_ha: null,
    });
  }, [updateBoundary]);

  const selectMode = useCallback((mode: BoundaryCaptureMethod) => {
    updateBoundary({ capture_method: mode, captured_at: new Date().toISOString() });
    if (mode === 'walk') {
      startWalkCapture();
    } else {
      setCaptureState('recording');
    }
  }, [updateBoundary, startWalkCapture]);

  const handleSkip = useCallback((reason: string) => {
    updateBoundary({ status: 'skipped', skip_reason: reason });
    setCaptureState('complete');
    setShowSkipReason(false);
  }, [updateBoundary]);

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  const accuracyColor = currentAccuracy === null
    ? 'text-text-tertiary'
    : currentAccuracy <= 10 ? 'text-success' : currentAccuracy <= ACCURACY_WARN_THRESHOLD ? 'text-warning' : 'text-error';

  const pointCount = boundary.points.length;
  const canFinish = pointCount >= MIN_POINTS;

  const polygonPreview = useMemo(() => {
    if (pointCount < 3) return null;
    const lats = boundary.points.map(p => p.lat);
    const lons = boundary.points.map(p => p.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const padLat = (maxLat - minLat) * 0.15 || 0.001;
    const padLon = (maxLon - minLon) * 0.15 || 0.001;
    const vMinLat = minLat - padLat;
    const vMaxLat = maxLat + padLat;
    const vMinLon = minLon - padLon;
    const vMaxLon = maxLon + padLon;
    const w = 300;
    const h = 200;
    const toX = (lon: number) => ((lon - vMinLon) / (vMaxLon - vMinLon)) * w;
    const toY = (lat: number) => h - ((lat - vMinLat) / (vMaxLat - vMinLat)) * h;
    const pathData = boundary.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.lon).toFixed(1)},${toY(p.lat).toFixed(1)}`)
      .join(' ') + ' Z';
    const dots = boundary.points.map((p, i) => (
      <circle key={i} cx={toX(p.lon)} cy={toY(p.lat)} r={4} fill={i === 0 ? '#BEF264' : '#67E8F9'} />
    ));
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[200px]">
        <path d={pathData} fill="rgba(190,242,100,0.12)" stroke="#BEF264" strokeWidth={2} />
        {dots}
      </svg>
    );
  }, [boundary.points, pointCount]);

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Farm Boundary
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Capture the farm perimeter using GPS
      </p>

      {/* GPS Accuracy Banner */}
      {currentAccuracy !== null && captureState !== 'idle' && (
        <div className={cn(
          "flex items-center gap-3 py-3 px-4 rounded-[14px] mb-4 border",
          currentAccuracy <= 10
            ? "bg-success/10 border-success/25"
            : currentAccuracy <= ACCURACY_WARN_THRESHOLD
              ? "bg-warning/10 border-warning/25"
              : "bg-error/10 border-error/25",
        )}>
          <Navigation size={16} className={accuracyColor} />
          <span className={cn("text-sm font-medium", accuracyColor)}>
            GPS Accuracy: {currentAccuracy.toFixed(1)}m
          </span>
          {currentAccuracy > ACCURACY_WARN_THRESHOLD && (
            <span className="text-xs text-error-light ml-auto">Move to open sky</span>
          )}
        </div>
      )}

      {gpsError && (
        <div className="flex items-center gap-2 py-2.5 px-3.5 bg-error/10 border border-error/25 rounded-[10px] mb-4">
          <AlertTriangle size={16} className="text-error shrink-0" />
          <span className="text-[0.813rem] text-error-light">{gpsError}</span>
        </div>
      )}

      {/* Mode Selection */}
      {captureState === 'idle' && !boundary.capture_method && (
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-secondary mb-1">
            Select Capture Mode
          </p>
          {MODE_OPTIONS.map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => selectMode(mode.value)}
              className="nuru-glass-card border border-border-glass rounded-[20px] p-5 text-left cursor-pointer flex items-start gap-4 transition-all duration-150 hover:border-accent/40"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                {mode.icon}
              </div>
              <div>
                <p className="text-[0.938rem] font-semibold text-white">{mode.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{mode.desc}</p>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowSkipReason(true)}
            className="text-xs text-text-tertiary underline text-center mt-2 bg-transparent border-none cursor-pointer font-inherit"
          >
            Skip boundary capture (with reason)
          </button>

          {showSkipReason && (
            <div className="nuru-glass-card rounded-[20px] p-5 border border-border-glass mt-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-2">
                Reason for skipping
              </label>
              <div className="flex flex-col gap-2">
                {['Cannot access full perimeter', 'GPS too weak in area', 'Farm too large for walking', 'Will capture later'].map(reason => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleSkip(reason)}
                    className="py-2.5 px-4 bg-border-light border border-border rounded-full text-sm text-text-secondary cursor-pointer font-inherit text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recording Controls */}
      {(captureState === 'recording' || captureState === 'paused') && (
        <div className="nuru-glass-card rounded-[28px] p-6 mb-6">
          {/* Status header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {captureState === 'recording' && (
                <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
              )}
              <span className="text-sm font-semibold text-white">
                {captureState === 'recording' ? 'Recording' : 'Paused'}
              </span>
              <span className="text-xs text-text-tertiary">
                ({boundary.capture_method})
              </span>
            </div>
            <span className="text-sm font-mono text-accent">{pointCount} pts</span>
          </div>

          {/* Manual capture button (corner/quick modes) */}
          {(boundary.capture_method === 'corner' || boundary.capture_method === 'quick') && captureState === 'recording' && (
            <button
              type="button"
              onClick={captureOnePoint}
              className="w-full py-4 mb-4 bg-accent/15 border-2 border-accent/30 rounded-[18px] text-accent text-lg font-bold cursor-pointer font-inherit flex items-center justify-center gap-3 transition-all active:scale-[0.97]"
            >
              <MapPin size={24} />
              Capture Point
            </button>
          )}

          {/* Control buttons */}
          <div className="flex gap-3 flex-wrap">
            {captureState === 'recording' && (
              <button
                type="button"
                onClick={pauseCapture}
                className="flex-1 min-w-[120px] py-3 flex items-center justify-center gap-2 bg-warning/15 border border-warning/25 rounded-full text-warning text-sm font-semibold cursor-pointer font-inherit"
              >
                <Pause size={16} /> Pause
              </button>
            )}

            {captureState === 'paused' && (
              <button
                type="button"
                onClick={resumeCapture}
                className="flex-1 min-w-[120px] py-3 flex items-center justify-center gap-2 bg-accent/15 border border-accent/25 rounded-full text-accent text-sm font-semibold cursor-pointer font-inherit"
              >
                <Play size={16} /> Resume
              </button>
            )}

            {pointCount > 0 && (
              <button
                type="button"
                onClick={removeLastPoint}
                className="py-3 px-4 flex items-center justify-center gap-2 bg-border-glass border border-border rounded-full text-text-secondary text-sm font-medium cursor-pointer font-inherit"
              >
                <Undo2 size={14} /> Undo
              </button>
            )}

            <button
              type="button"
              onClick={finishCapture}
              disabled={!canFinish}
              className={cn(
                "flex-1 min-w-[120px] py-3 flex items-center justify-center gap-2 rounded-full text-sm font-semibold font-inherit",
                canFinish
                  ? "bg-success/15 border border-success/25 text-success cursor-pointer"
                  : "bg-border-glass border border-border text-text-tertiary cursor-not-allowed",
              )}
            >
              <Square size={14} /> Finish
            </button>

            <button
              type="button"
              onClick={resetCapture}
              className="py-3 px-4 flex items-center justify-center gap-2 bg-error/10 border border-error/20 rounded-full text-error text-xs font-medium cursor-pointer font-inherit"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {!canFinish && pointCount > 0 && (
            <p className="text-xs text-warning-light mt-3 text-center">
              Minimum {MIN_POINTS} points required ({MIN_POINTS - pointCount} more needed)
            </p>
          )}
        </div>
      )}

      {/* Polygon Preview */}
      {pointCount >= 3 && (
        <div className="nuru-glass-card rounded-[28px] p-5 mb-6 border border-border-glass">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-accent" /> Boundary Preview
          </h3>
          <div className="bg-bg-dark rounded-[14px] overflow-hidden border border-border">
            {polygonPreview}
          </div>
          <div className="flex justify-between mt-3 text-xs text-text-tertiary">
            <span>{pointCount} points captured</span>
            {boundary.area_ha !== null && (
              <span className="text-accent font-medium">{boundary.area_ha.toFixed(2)} ha (estimated)</span>
            )}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {captureState === 'complete' && boundary.status !== 'skipped' && (
        <div className="nuru-glass-card rounded-[28px] p-6 mb-6 border border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
              <Check size={20} className="text-success" />
            </div>
            <div>
              <p className="text-[0.938rem] font-semibold text-white">Boundary Captured</p>
              <p className="text-xs text-text-tertiary">
                {pointCount} points · {boundary.capture_method} mode · Confidence: {boundary.confidence || 'N/A'}
              </p>
            </div>
          </div>

          {boundary.gps_accuracy_summary && (
            <div className="grid grid-cols-3 gap-3">
              <div className="py-2.5 px-3 bg-bg-dark rounded-[10px] text-center">
                <p className="text-xs text-text-tertiary">Min Acc</p>
                <p className="text-sm font-semibold text-success">{boundary.gps_accuracy_summary.min.toFixed(1)}m</p>
              </div>
              <div className="py-2.5 px-3 bg-bg-dark rounded-[10px] text-center">
                <p className="text-xs text-text-tertiary">Avg Acc</p>
                <p className="text-sm font-semibold text-warning">{boundary.gps_accuracy_summary.avg.toFixed(1)}m</p>
              </div>
              <div className="py-2.5 px-3 bg-bg-dark rounded-[10px] text-center">
                <p className="text-xs text-text-tertiary">Max Acc</p>
                <p className="text-sm font-semibold text-error">{boundary.gps_accuracy_summary.max.toFixed(1)}m</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={resetCapture}
            className="mt-4 text-xs text-text-tertiary underline bg-transparent border-none cursor-pointer font-inherit"
          >
            Recapture boundary
          </button>
        </div>
      )}

      {/* Skipped */}
      {captureState === 'complete' && boundary.status === 'skipped' && (
        <div className="nuru-glass-card rounded-[28px] p-6 mb-6 border border-warning/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-warning" />
            <div>
              <p className="text-[0.938rem] font-semibold text-white">Boundary Skipped</p>
              <p className="text-xs text-text-tertiary">{boundary.skip_reason}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetCapture}
            className="mt-3 text-xs text-accent underline bg-transparent border-none cursor-pointer font-inherit"
          >
            Capture now instead
          </button>
        </div>
      )}

      {/* Notes */}
      <div className="mt-4">
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
          Boundary Notes
        </label>
        <textarea
          value={boundary.notes}
          onChange={e => updateBoundary({ notes: e.target.value })}
          placeholder="Any notes about boundary conditions, access, or limitations..."
          rows={2}
          className="w-full py-3 px-4 nuru-glass-card rounded-[16px] text-white text-[0.938rem] font-inherit outline-none border border-border focus:border-accent resize-y min-h-[60px]"
        />
      </div>

      {errors['farm_boundary'] && (
        <p className="text-xs text-error-light mt-3">{errors['farm_boundary']}</p>
      )}
    </div>
  );
};

export default StepFarmBoundary;
