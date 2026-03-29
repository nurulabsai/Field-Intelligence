import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  FarmProfile,
  FarmBoundaryDraft,
  BoundaryMethod,
  GeoPoint,
} from '../../../types/auditTypes';
import {
  getAccuracyColor,
  getAccuracyLabel,
  buildPolygonFromPoints,
  buildCirclePolygon,
  calculateAccuracySummary,
  calculateDistance,
} from '../../../utils/geoUtils';

// ─── Props ──────────────────────────────────────────────────────────────────

interface FarmBoundaryStepProps {
  farmProfile: FarmProfile;
  farmBoundary: FarmBoundaryDraft | null;
  onUpdate: (boundary: FarmBoundaryDraft) => void;
}

// ─── View state ─────────────────────────────────────────────────────────────

type ViewState =
  | 'mode_selector'
  | 'walk_capture'
  | 'corner_capture'
  | 'quick_draft';

// ─── Defaults ───────────────────────────────────────────────────────────────

function createDefaultBoundary(farmLocalRef: string): FarmBoundaryDraft {
  return {
    farmLocalRef,
    method: 'walk',
    status: 'not_started',
    polygon: null,
    capturedAt: new Date().toISOString(),
    capturedBy: '',
    gpsAccuracySummary: null,
    confidenceScore: null,
  };
}

// ─── Inline sub-components ──────────────────────────────────────────────────

function SectionHeader({ icon, title, color = '#BEF264' }: { icon: string; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
      <h3 className="text-base font-semibold text-white font-sora">{title}</h3>
    </div>
  );
}

function GlassInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  inputMode,
  min,
  step,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric' | 'decimal';
  min?: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      step={step}
      disabled={disabled}
      className={`w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed`}
    />
  );
}

function GlassTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white
        font-manrope placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 resize-none"
    />
  );
}

// ─── GPS Accuracy Ring ──────────────────────────────────────────────────────

function AccuracyRing({ accuracy }: { accuracy: number | null }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const color = accuracy !== null ? getAccuracyColor(accuracy) : '#6B7280';
  const label = accuracy !== null ? getAccuracyLabel(accuracy) : 'Acquiring GPS...';

  // Map accuracy to a progress percentage (0m = 100%, 50m+ = 10%)
  const progress = accuracy !== null
    ? Math.max(10, Math.min(100, 100 - (accuracy / 50) * 90))
    : 0;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={120} height={120} viewBox="0 0 120 120" aria-hidden="true">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />
        {/* Accuracy ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        {/* Center text */}
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fill={color}
          className="font-sora"
          fontSize="22"
          fontWeight="600"
        >
          {accuracy !== null ? `${accuracy.toFixed(0)}` : '--'}
        </text>
        <text
          x="60"
          y="74"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="11"
          className="font-manrope"
        >
          meters
        </text>
      </svg>
      <p className="text-xs font-manrope text-center" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

// ─── Method card ────────────────────────────────────────────────────────────

function MethodCard({
  icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-5
        flex items-start gap-4 text-left transition-all duration-200
        hover:border-white/[0.12] active:scale-[0.98] min-h-[44px]"
      style={{ '--hover-glow': `${color}15` } as React.CSSProperties}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white font-sora mb-1">{title}</p>
        <p className="text-xs text-white/50 font-manrope leading-relaxed">{description}</p>
      </div>
      <span className="material-symbols-outlined text-white/20 text-xl mt-1 shrink-0">chevron_right</span>
    </button>
  );
}

// ─── Captured summary card ──────────────────────────────────────────────────

function BoundarySummaryCard({
  boundary,
  onRecapture,
}: {
  boundary: FarmBoundaryDraft;
  onRecapture: () => void;
}) {
  const methodLabels: Record<BoundaryMethod, string> = {
    walk: 'GPS Walk',
    corner_points: 'Corner Points',
    quick_draft: 'Quick Draft',
  };

  const statusColors: Record<string, string> = {
    complete: '#BEF264',
    draft: '#FFBF00',
    skipped: '#FF4B4B',
    in_progress: '#67E8F9',
    not_started: '#6B7280',
  };

  const statusColor = statusColors[boundary.status] ?? '#6B7280';

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader icon="fence" title="Boundary Captured" />
        <span
          className="text-xs font-medium font-manrope px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
        >
          {boundary.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-2xl p-3">
          <p className="text-xs text-white/40 font-manrope mb-1">Method</p>
          <p className="text-sm text-white font-manrope font-medium">
            {methodLabels[boundary.method]}
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-3">
          <p className="text-xs text-white/40 font-manrope mb-1">Area</p>
          <p className="text-sm text-white font-mono font-medium">
            {boundary.polygon?.area !== undefined && boundary.polygon.area !== null
              ? `${boundary.polygon.area.toFixed(2)} ha`
              : '--'}
          </p>
        </div>
        {boundary.gpsAccuracySummary && (
          <div className="bg-white/[0.03] rounded-2xl p-3 col-span-2">
            <p className="text-xs text-white/40 font-manrope mb-1">GPS Accuracy</p>
            <p className="text-sm text-white font-mono font-medium">
              avg {boundary.gpsAccuracySummary.avg.toFixed(1)}m
              {' '}(min {boundary.gpsAccuracySummary.min.toFixed(1)}m,
              {' '}max {boundary.gpsAccuracySummary.max.toFixed(1)}m)
            </p>
          </div>
        )}
      </div>

      {boundary.confidenceScore !== null && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${boundary.confidenceScore}%`,
                backgroundColor: boundary.confidenceScore >= 70 ? '#BEF264' : '#FFBF00',
              }}
            />
          </div>
          <span className="text-xs text-white/50 font-mono">
            {boundary.confidenceScore}%
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onRecapture}
        className="w-full h-12 min-h-[44px] rounded-2xl border border-white/[0.08] text-sm font-manrope font-medium
          text-white/60 hover:text-white hover:border-white/[0.15] transition-all duration-200"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">refresh</span>
          Recapture Boundary
        </span>
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function FarmBoundaryStep({
  farmProfile,
  farmBoundary,
  onUpdate,
}: FarmBoundaryStepProps) {
  // Initialize boundary from prop or create default
  const [boundary, setBoundary] = useState<FarmBoundaryDraft>(() =>
    farmBoundary
      ? { ...farmBoundary }
      : createDefaultBoundary(farmProfile.farmLocalRef),
  );

  // View state
  const [view, setView] = useState<ViewState>(() => {
    if (farmBoundary && (farmBoundary.status === 'complete' || farmBoundary.status === 'draft' || farmBoundary.status === 'skipped')) {
      return 'mode_selector';
    }
    return 'mode_selector';
  });

  // Live GPS accuracy
  const [liveAccuracy, setLiveAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Walk capture state
  const [walkPoints, setWalkPoints] = useState<GeoPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const walkWatchIdRef = useRef<number | null>(null);

  // Corner capture state
  const [cornerPoints, setCornerPoints] = useState<GeoPoint[]>([]);
  const [isCapturingCorner, setIsCapturingCorner] = useState(false);

  // Quick draft state
  const [draftCenter, setDraftCenter] = useState<GeoPoint | null>(null);
  const [draftRadius, setDraftRadius] = useState('');
  const [isCapturingCenter, setIsCapturingCenter] = useState(false);

  // Skip state
  const [showSkipInput, setShowSkipInput] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  // GPS error
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Push changes to parent
  useEffect(() => {
    onUpdate(boundary);
  }, [boundary, onUpdate]);

  // Live GPS watch for mode selector accuracy ring
  useEffect(() => {
    if (view !== 'mode_selector') return;

    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveAccuracy(pos.coords.accuracy);
        setGpsError(null);
      },
      (err) => {
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );
    watchIdRef.current = id;

    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [view]);

  // ── Walk capture GPS watch ──────────────────────────────────────────────

  const startWalkWatch = useCallback(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveAccuracy(pos.coords.accuracy);
        setGpsError(null);

        setWalkPoints((prev) => {
          const newPoint: GeoPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude ?? undefined,
            capturedAt: new Date().toISOString(),
          };

          // Only add if moved >3m from last point
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            if (lastPoint) {
              const dist = calculateDistance(lastPoint, newPoint);
              if (dist < 3) return prev;
            }
          }

          return [...prev, newPoint];
        });
      },
      (err) => {
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    walkWatchIdRef.current = id;
  }, []);

  const stopWalkWatch = useCallback(() => {
    if (walkWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(walkWatchIdRef.current);
      walkWatchIdRef.current = null;
    }
  }, []);

  // Cleanup walk watch on unmount
  useEffect(() => {
    return () => {
      stopWalkWatch();
    };
  }, [stopWalkWatch]);

  // ── Walk controls ─────────────────────────────────────────────────────

  const handleWalkStart = useCallback(() => {
    setWalkPoints([]);
    setIsRecording(true);
    setIsPaused(false);
    startWalkWatch();
  }, [startWalkWatch]);

  const handleWalkPause = useCallback(() => {
    setIsPaused(true);
    stopWalkWatch();
  }, [stopWalkWatch]);

  const handleWalkResume = useCallback(() => {
    setIsPaused(false);
    startWalkWatch();
  }, [startWalkWatch]);

  const handleWalkFinish = useCallback(() => {
    stopWalkWatch();
    setIsRecording(false);
    setIsPaused(false);

    if (walkPoints.length >= 4) {
      const polygon = buildPolygonFromPoints(walkPoints);
      const summary = calculateAccuracySummary(walkPoints);
      const avgAcc = summary?.avg ?? 50;
      const confidence = avgAcc < 5 ? 95 : avgAcc < 10 ? 85 : avgAcc < 20 ? 65 : 40;

      setBoundary((prev) => ({
        ...prev,
        method: 'walk',
        status: 'complete',
        polygon,
        capturedAt: new Date().toISOString(),
        gpsAccuracySummary: summary,
        confidenceScore: confidence,
      }));
      setView('mode_selector');
    }
  }, [walkPoints, stopWalkWatch]);

  // Calculate estimated walk area
  const walkEstimatedArea = walkPoints.length >= 3
    ? (() => {
        try {
          return buildPolygonFromPoints(walkPoints).area ?? 0;
        } catch {
          return 0;
        }
      })()
    : 0;

  // ── Corner capture ────────────────────────────────────────────────────

  const handleAddCorner = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsCapturingCorner(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude ?? undefined,
          capturedAt: new Date().toISOString(),
        };
        setCornerPoints((prev) => [...prev, point]);
        setLiveAccuracy(pos.coords.accuracy);
        setIsCapturingCorner(false);
      },
      (err) => {
        setGpsError(err.message);
        setIsCapturingCorner(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  const handleRemoveCorner = useCallback((index: number) => {
    setCornerPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCloseCornerPolygon = useCallback(() => {
    if (cornerPoints.length < 3) return;

    const polygon = buildPolygonFromPoints(cornerPoints);
    const summary = calculateAccuracySummary(cornerPoints);
    const avgAcc = summary?.avg ?? 50;
    const confidence = avgAcc < 5 ? 90 : avgAcc < 10 ? 80 : avgAcc < 20 ? 60 : 35;

    setBoundary((prev) => ({
      ...prev,
      method: 'corner_points',
      status: 'complete',
      polygon,
      capturedAt: new Date().toISOString(),
      gpsAccuracySummary: summary,
      confidenceScore: confidence,
    }));
    setView('mode_selector');
  }, [cornerPoints]);

  const handleSaveCornerDraft = useCallback(() => {
    if (cornerPoints.length < 3) return;

    const polygon = buildPolygonFromPoints(cornerPoints);
    const summary = calculateAccuracySummary(cornerPoints);

    setBoundary((prev) => ({
      ...prev,
      method: 'corner_points',
      status: 'draft',
      polygon,
      capturedAt: new Date().toISOString(),
      gpsAccuracySummary: summary,
      confidenceScore: 50,
    }));
    setView('mode_selector');
  }, [cornerPoints]);

  // ── Quick draft capture ───────────────────────────────────────────────

  const handleCaptureCenter = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsCapturingCenter(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude ?? undefined,
          capturedAt: new Date().toISOString(),
        };
        setDraftCenter(point);
        setLiveAccuracy(pos.coords.accuracy);
        setIsCapturingCenter(false);
      },
      (err) => {
        setGpsError(err.message);
        setIsCapturingCenter(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  const handleSaveQuickDraft = useCallback(() => {
    if (!draftCenter) return;
    const radiusNum = parseFloat(draftRadius);
    if (Number.isNaN(radiusNum) || radiusNum <= 0) return;

    const polygon = buildCirclePolygon(draftCenter, radiusNum);
    const summary = calculateAccuracySummary([draftCenter]);

    setBoundary((prev) => ({
      ...prev,
      method: 'quick_draft',
      status: 'draft',
      polygon,
      capturedAt: new Date().toISOString(),
      gpsAccuracySummary: summary,
      confidenceScore: 25,
    }));
    setView('mode_selector');
  }, [draftCenter, draftRadius]);

  // ── Skip ──────────────────────────────────────────────────────────────

  const handleSkip = useCallback(() => {
    setBoundary((prev) => ({
      ...prev,
      status: 'skipped',
      skipReason,
    }));
    setShowSkipInput(false);
  }, [skipReason]);

  // ── Recapture ─────────────────────────────────────────────────────────

  const handleRecapture = useCallback(() => {
    setBoundary(createDefaultBoundary(farmProfile.farmLocalRef));
    setWalkPoints([]);
    setCornerPoints([]);
    setDraftCenter(null);
    setDraftRadius('');
    setIsRecording(false);
    setIsPaused(false);
    setShowSkipInput(false);
    setSkipReason('');
    setView('mode_selector');
  }, [farmProfile.farmLocalRef]);

  // ── Select method and switch view ─────────────────────────────────────

  const selectMethod = useCallback((method: BoundaryMethod) => {
    setBoundary((prev) => ({ ...prev, method, status: 'in_progress' }));
    const viewMap: Record<BoundaryMethod, ViewState> = {
      walk: 'walk_capture',
      corner_points: 'corner_capture',
      quick_draft: 'quick_draft',
    };
    setView(viewMap[method]);
  }, []);

  // ── Back to mode selector ─────────────────────────────────────────────

  const handleBack = useCallback(() => {
    stopWalkWatch();
    setIsRecording(false);
    setIsPaused(false);
    setView('mode_selector');
  }, [stopWalkWatch]);

  // =====================================================================
  // RENDER
  // =====================================================================

  const hasCapturedBoundary =
    boundary.status === 'complete' || boundary.status === 'draft' || boundary.status === 'skipped';

  // ── MODE SELECTOR VIEW ──────────────────────────────────────────────

  if (view === 'mode_selector') {
    return (
      <div className="space-y-5">
        {/* Farm reference chip */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BEF264]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#BEF264] text-lg">agriculture</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 font-manrope">Farm Reference</p>
            <p className="text-sm font-medium text-white font-mono truncate">
              {farmProfile.farmLocalRef || 'No reference'}
            </p>
          </div>
        </div>

        {/* Show summary if already captured */}
        {hasCapturedBoundary ? (
          <BoundarySummaryCard boundary={boundary} onRecapture={handleRecapture} />
        ) : (
          <>
            {/* GPS Accuracy Ring */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 flex flex-col items-center">
              <AccuracyRing accuracy={liveAccuracy} />
              {gpsError && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20">
                  <span className="material-symbols-outlined text-[#FF4B4B] text-base">error</span>
                  <span className="text-xs text-[#FF4B4B] font-manrope">{gpsError}</span>
                </div>
              )}
            </div>

            {/* Method selector heading */}
            <p className="text-sm font-medium text-white/60 font-manrope px-1">
              Choose boundary capture method:
            </p>

            {/* Method cards */}
            <div className="space-y-3">
              <MethodCard
                icon="fence"
                title="Walk Boundary"
                description="Walk the farm perimeter while recording GPS"
                color="#BEF264"
                onClick={() => selectMethod('walk')}
              />
              <MethodCard
                icon="place"
                title="Corner Points"
                description="Tap at each corner of the farm"
                color="#67E8F9"
                onClick={() => selectMethod('corner_points')}
              />
              <MethodCard
                icon="draw"
                title="Quick Draft"
                description="Rough boundary — refine later"
                color="#FFBF00"
                onClick={() => selectMethod('quick_draft')}
              />
            </div>

            {/* Skip for now */}
            {!showSkipInput ? (
              <button
                type="button"
                onClick={() => setShowSkipInput(true)}
                className="w-full h-12 min-h-[44px] rounded-2xl border border-white/[0.08] text-sm font-manrope font-medium
                  text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all duration-200"
              >
                Skip for Now
              </button>
            ) : (
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-5 space-y-3">
                <p className="text-sm font-medium text-white font-manrope">Why are you skipping?</p>
                <GlassTextarea
                  value={skipReason}
                  onChange={setSkipReason}
                  placeholder="e.g. Bad weather, farmer not present..."
                  rows={2}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSkipInput(false)}
                    className="flex-1 h-11 min-h-[44px] rounded-2xl border border-white/[0.08] text-sm font-manrope
                      text-white/50 hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 h-11 min-h-[44px] rounded-2xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/20 text-sm
                      font-manrope font-medium text-[#FF4B4B] hover:bg-[#FF4B4B]/25 transition-all duration-200"
                  >
                    Confirm Skip
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── WALK CAPTURE VIEW ───────────────────────────────────────────────

  if (view === 'walk_capture') {
    return (
      <div className="space-y-5">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-manrope transition-colors min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to methods
        </button>

        <SectionHeader icon="fence" title="Walk Boundary" color="#BEF264" />

        {/* Stats card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-white font-sora">{walkPoints.length}</p>
              <p className="text-xs text-white/40 font-manrope mt-1">points recorded</p>
            </div>
          </div>

          {walkEstimatedArea > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#BEF264] text-base">square_foot</span>
              <span className="text-sm text-white/70 font-mono">
                ~{walkEstimatedArea.toFixed(2)} ha estimated
              </span>
            </div>
          )}

          {/* GPS status banner */}
          {liveAccuracy !== null && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
              style={{
                backgroundColor: `${getAccuracyColor(liveAccuracy)}10`,
                borderWidth: 1,
                borderColor: `${getAccuracyColor(liveAccuracy)}20`,
              }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: getAccuracyColor(liveAccuracy) }}>
                gps_fixed
              </span>
              <span className="text-xs font-manrope" style={{ color: getAccuracyColor(liveAccuracy) }}>
                {getAccuracyLabel(liveAccuracy)}
              </span>
            </div>
          )}

          {gpsError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 mb-4">
              <span className="material-symbols-outlined text-[#FF4B4B] text-base">error</span>
              <span className="text-xs text-[#FF4B4B] font-manrope">{gpsError}</span>
            </div>
          )}

          {/* Walk controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleWalkStart}
                className="w-16 h-16 min-h-[44px] rounded-full bg-[#BEF264] flex items-center justify-center
                  shadow-[0_0_30px_rgba(190,242,100,0.35)] hover:shadow-[0_0_40px_rgba(190,242,100,0.5)]
                  active:scale-95 transition-all duration-200"
                aria-label="Start recording"
              >
                <span className="material-symbols-outlined text-black text-3xl">play_arrow</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    type="button"
                    onClick={handleWalkResume}
                    className="w-14 h-14 min-h-[44px] rounded-full bg-[#67E8F9] flex items-center justify-center
                      shadow-[0_0_24px_rgba(103,232,249,0.3)] active:scale-95 transition-all duration-200"
                    aria-label="Resume recording"
                  >
                    <span className="material-symbols-outlined text-black text-2xl">play_arrow</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWalkPause}
                    className="w-14 h-14 min-h-[44px] rounded-full bg-[#FFBF00] flex items-center justify-center
                      shadow-[0_0_24px_rgba(255,191,0,0.3)] active:scale-95 transition-all duration-200"
                    aria-label="Pause recording"
                  >
                    <span className="material-symbols-outlined text-black text-2xl">pause</span>
                  </button>
                )}

                {walkPoints.length >= 4 && (
                  <button
                    type="button"
                    onClick={handleWalkFinish}
                    className="w-16 h-16 min-h-[44px] rounded-full bg-[#BEF264] flex items-center justify-center
                      shadow-[0_0_30px_rgba(190,242,100,0.35)] active:scale-95 transition-all duration-200"
                    aria-label="Finish recording"
                  >
                    <span className="material-symbols-outlined text-black text-3xl">check</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Instructions */}
          {!isRecording && (
            <p className="text-xs text-white/30 font-manrope text-center mt-4">
              Press start, then walk slowly along the farm perimeter
            </p>
          )}
          {isRecording && !isPaused && (
            <p className="text-xs text-[#BEF264]/60 font-manrope text-center mt-4 animate-pulse">
              Recording... walk along the boundary
            </p>
          )}
          {isPaused && (
            <p className="text-xs text-[#FFBF00]/60 font-manrope text-center mt-4">
              Paused. Tap resume to continue or finish if done.
            </p>
          )}
          {isRecording && walkPoints.length < 4 && (
            <p className="text-xs text-white/30 font-manrope text-center mt-2">
              Need at least 4 points to finish ({4 - walkPoints.length} more)
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── CORNER POINT CAPTURE VIEW ─────────────────────────────────────────

  if (view === 'corner_capture') {
    return (
      <div className="space-y-5">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-manrope transition-colors min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to methods
        </button>

        <SectionHeader icon="place" title="Corner Points" color="#67E8F9" />

        {/* Corner list */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-5 space-y-3">
          {cornerPoints.length === 0 ? (
            <p className="text-sm text-white/30 font-manrope text-center py-4">
              No corners captured yet. Tap "Add Corner" at each farm corner.
            </p>
          ) : (
            <div className="space-y-2">
              {cornerPoints.map((pt, i) => (
                <div
                  key={`corner-${pt.capturedAt}`}
                  className="flex items-center gap-3 bg-white/[0.03] rounded-2xl px-4 py-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#67E8F915' }}
                  >
                    <span className="text-xs font-bold text-[#67E8F9] font-mono">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-mono">
                      {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
                    </p>
                    <p className="text-xs font-manrope mt-0.5" style={{ color: getAccuracyColor(pt.accuracy) }}>
                      {'\u00B1'}{pt.accuracy.toFixed(1)}m
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCorner(i)}
                    className="w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl
                      hover:bg-[#FF4B4B]/10 transition-colors"
                    aria-label={`Remove corner ${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-[#FF4B4B]/60 text-lg">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {gpsError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20">
              <span className="material-symbols-outlined text-[#FF4B4B] text-base">error</span>
              <span className="text-xs text-[#FF4B4B] font-manrope">{gpsError}</span>
            </div>
          )}

          {/* Add corner button */}
          <button
            type="button"
            onClick={handleAddCorner}
            disabled={isCapturingCorner}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-[#67E8F9]/15 border border-[#67E8F9]/20 text-sm
              font-manrope font-medium text-[#67E8F9] hover:bg-[#67E8F9]/25 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCapturingCorner ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Capturing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">add_location</span>
                Add Corner
              </>
            )}
          </button>

          {/* Action buttons */}
          {cornerPoints.length >= 3 && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveCornerDraft}
                className="flex-1 h-12 min-h-[44px] rounded-2xl border border-white/[0.08] text-sm font-manrope
                  font-medium text-white/60 hover:text-white hover:border-white/[0.15] transition-all duration-200"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleCloseCornerPolygon}
                className="flex-1 h-12 min-h-[44px] rounded-2xl bg-[#67E8F9] text-sm font-manrope font-semibold
                  text-black shadow-[0_0_20px_rgba(103,232,249,0.25)] hover:shadow-[0_0_30px_rgba(103,232,249,0.4)]
                  active:scale-[0.98] transition-all duration-200"
              >
                Close Polygon
              </button>
            </div>
          )}

          {cornerPoints.length > 0 && cornerPoints.length < 3 && (
            <p className="text-xs text-white/30 font-manrope text-center">
              Need at least 3 corners ({3 - cornerPoints.length} more)
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── QUICK DRAFT VIEW ──────────────────────────────────────────────────

  if (view === 'quick_draft') {
    const radiusNum = parseFloat(draftRadius);
    const canSave = draftCenter !== null && !Number.isNaN(radiusNum) && radiusNum > 0;

    return (
      <div className="space-y-5">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-manrope transition-colors min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to methods
        </button>

        <SectionHeader icon="draw" title="Quick Draft" color="#FFBF00" />

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-5 space-y-4">
          {/* Low confidence notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/20">
            <span className="material-symbols-outlined text-[#FFBF00] text-base">info</span>
            <span className="text-xs text-[#FFBF00] font-manrope">
              Quick draft creates a rough circular boundary. Refine later for accuracy.
            </span>
          </div>

          {/* Capture center */}
          <div>
            <p className="text-sm font-medium text-white font-manrope mb-2">Farm Center Point</p>
            {draftCenter ? (
              <div className="flex items-center gap-3 bg-white/[0.03] rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-[#FFBF00]">location_on</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-mono">
                    {draftCenter.lat.toFixed(6)}, {draftCenter.lng.toFixed(6)}
                  </p>
                  <p className="text-xs font-manrope mt-0.5" style={{ color: getAccuracyColor(draftCenter.accuracy) }}>
                    {'\u00B1'}{draftCenter.accuracy.toFixed(1)}m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureCenter}
                  className="text-xs text-[#67E8F9] font-manrope font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCaptureCenter}
                disabled={isCapturingCenter}
                className="w-full h-12 min-h-[44px] rounded-2xl bg-[#FFBF00]/15 border border-[#FFBF00]/20 text-sm
                  font-manrope font-medium text-[#FFBF00] hover:bg-[#FFBF00]/25 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCapturingCenter ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    Capturing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">my_location</span>
                    Capture Farm Center
                  </>
                )}
              </button>
            )}
          </div>

          {gpsError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20">
              <span className="material-symbols-outlined text-[#FF4B4B] text-base">error</span>
              <span className="text-xs text-[#FF4B4B] font-manrope">{gpsError}</span>
            </div>
          )}

          {/* Radius input */}
          <div>
            <p className="text-sm font-medium text-white font-manrope mb-2">
              Estimated Radius (meters)
            </p>
            <GlassInput
              value={draftRadius}
              onChange={setDraftRadius}
              type="number"
              inputMode="numeric"
              placeholder="e.g. 100"
              min="1"
              step="1"
            />
            {radiusNum > 0 && !Number.isNaN(radiusNum) && (
              <p className="text-xs text-white/30 font-manrope mt-2">
                Approximate area: {((Math.PI * radiusNum * radiusNum) / 10000).toFixed(2)} ha
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSaveQuickDraft}
            disabled={!canSave}
            className="w-full h-12 min-h-[44px] rounded-2xl bg-[#FFBF00] text-sm font-manrope font-semibold
              text-black shadow-[0_0_20px_rgba(255,191,0,0.25)] hover:shadow-[0_0_30px_rgba(255,191,0,0.4)]
              active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
              disabled:shadow-none"
          >
            Save as Draft
          </button>
        </div>
      </div>
    );
  }

  return null;
}
