import { useState, useCallback, useMemo } from 'react';
import type {
  FarmProfile,
  Plot,
  GeoPoint,
  PlotStatus,
  GrowthStage,
  IrrigationStatus,
} from '../../../types/auditTypes';
import { TANZANIA_CROPS } from '../../../data/cropList';
import { getAccuracyColor, getAccuracyLabel } from '../../../utils/geoUtils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlotStructureStepProps {
  farmProfile: FarmProfile;
  plots: Plot[];
  auditId: string;
  onAddPlot: () => void;
  onUpdatePlot: (plotId: string, updates: Partial<Plot>) => void;
  onRemovePlot: (plotId: string) => void;
}

// ─── Option data ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: PlotStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'fallow', label: 'Fallow' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'abandoned', label: 'Abandoned' },
];

const GROWTH_STAGE_OPTIONS: { value: GrowthStage; label: string }[] = [
  { value: 'pre_planting', label: 'Pre-Planting' },
  { value: 'germination', label: 'Germination' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'fruiting', label: 'Fruiting' },
  { value: 'maturity', label: 'Maturity' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'post_harvest', label: 'Post-Harvest' },
];

const IRRIGATION_OPTIONS: { value: IrrigationStatus; label: string }[] = [
  { value: 'rainfed', label: 'Rainfed' },
  { value: 'irrigated', label: 'Irrigated' },
  { value: 'partial', label: 'Partial' },
];

const CROP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Select crop / Chagua zao' },
  ...TANZANIA_CROPS.map((c) => ({ value: c, label: c })),
];

// ─── Reusable inline components ───────────────────────────────────────────────

function Label({ en, sw }: { en: string; sw?: string }) {
  return (
    <label className="block mb-1.5">
      <span className="text-sm font-medium text-white font-manrope">{en}</span>
      {sw && <span className="block text-xs text-white/40 font-manrope mt-0.5">{sw}</span>}
    </label>
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
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  min?: string;
  step?: string;
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
      className="w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200"
    />
  );
}

function GlassSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 appearance-none"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23BEF264\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111622] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function GlassTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
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

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-11 min-h-[44px] rounded-2xl text-sm font-manrope font-medium transition-all duration-200
            ${
              value === opt.value
                ? 'bg-[#BEF264] text-black shadow-[0_0_20px_rgba(190,242,100,0.25)]'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15]'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function PlotStatusBadge({ status }: { status: PlotStatus }) {
  const config: Record<PlotStatus, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-[#BEF264]/10', text: 'text-[#BEF264]', label: 'Active' },
    fallow: { bg: 'bg-[#FFBF00]/10', text: 'text-[#FFBF00]', label: 'Fallow' },
    prepared: { bg: 'bg-[#67E8F9]/10', text: 'text-[#67E8F9]', label: 'Prepared' },
    abandoned: { bg: 'bg-[#FF4B4B]/10', text: 'text-[#FF4B4B]', label: 'Abandoned' },
  };
  const c = config[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-manrope ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─── Plot Card ────────────────────────────────────────────────────────────────

interface PlotCardProps {
  plot: Plot;
  index: number;
  canRemove: boolean;
  onUpdate: (updates: Partial<Plot>) => void;
  onRemove: () => void;
}

function PlotCard({ plot, index, canRemove, onUpdate, onRemove }: PlotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showOtherCrop, setShowOtherCrop] = useState(
    plot.currentCrop !== '' && !TANZANIA_CROPS.includes(plot.currentCrop as typeof TANZANIA_CROPS[number]),
  );

  const cropDisplayName = plot.currentCrop || 'No crop set';
  const hasCenter = plot.centerPoint !== null;

  const handleCropChange = useCallback(
    (value: string) => {
      if (value === 'Other') {
        setShowOtherCrop(true);
        onUpdate({ currentCrop: '' });
      } else {
        setShowOtherCrop(false);
        onUpdate({ currentCrop: value });
      }
    },
    [onUpdate],
  );

  const handleCaptureGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this device.');
      return;
    }

    setCapturingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          capturedAt: new Date().toISOString(),
        };
        onUpdate({ centerPoint: point });
        setCapturingGps(false);
      },
      (err) => {
        setGpsError(err.message);
        setCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    );
  }, [onUpdate]);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden transition-all duration-300">
      {/* ── Collapsed header ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-3 p-4 min-h-[56px] text-left"
        aria-expanded={expanded}
        aria-controls={`plot-content-${plot.localId}`}
      >
        {/* Plot number chip */}
        <span className="shrink-0 w-8 h-8 rounded-lg bg-[#BEF264]/10 flex items-center justify-center text-xs font-semibold text-[#BEF264] font-mono">
          {index + 1}
        </span>

        {/* Farm ref */}
        <span className="text-xs text-white/30 italic font-manrope shrink-0 hidden sm:inline">
          {plot.farmLocalRef}
        </span>

        {/* GPS dot */}
        <span
          className={`shrink-0 w-2.5 h-2.5 rounded-full ${hasCenter ? 'bg-[#BEF264] shadow-[0_0_8px_rgba(190,242,100,0.5)]' : 'bg-[#FF4B4B] shadow-[0_0_8px_rgba(255,75,75,0.4)]'}`}
          aria-label={hasCenter ? 'GPS captured' : 'GPS not captured'}
        />

        {/* Crop name */}
        <span className="flex-1 min-w-0 text-sm text-white/70 font-manrope truncate">
          {cropDisplayName}
        </span>

        {/* Status badge */}
        <PlotStatusBadge status={plot.status} />

        {/* Chevron */}
        <span
          className={`material-symbols-outlined text-white/40 text-xl transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>

        {/* Remove button */}
        {canRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="shrink-0 w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#FF4B4B]/60 hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-all duration-200 -mr-1"
            aria-label={`Remove plot ${index + 1}`}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </button>

      {/* ── Expanded content ──────────────────────────────────────────────── */}
      {expanded && (
        <div
          id={`plot-content-${plot.localId}`}
          className="px-6 pb-6 pt-2 space-y-5 border-t border-white/[0.05]"
        >
          {/* Plot Name */}
          <div>
            <Label en="Plot Name" sw="Jina la kiwanja" />
            <GlassInput
              value={plot.plotName}
              onChange={(v) => onUpdate({ plotName: v })}
              placeholder="e.g. Plot A, Block 1"
            />
          </div>

          {/* Area */}
          <div>
            <Label en="Area (hectares)" sw="Eneo (hekta)" />
            <GlassInput
              value={plot.areaHa ? String(plot.areaHa) : ''}
              onChange={(v) => {
                const parsed = parseFloat(v);
                onUpdate({ areaHa: Number.isNaN(parsed) ? 0 : parsed });
              }}
              type="number"
              inputMode="decimal"
              placeholder="0.01"
              min="0.01"
              step="0.01"
            />
          </div>

          {/* Status */}
          <div>
            <Label en="Plot Status" sw="Hali ya kiwanja" />
            <SegmentedControl
              options={STATUS_OPTIONS}
              value={plot.status}
              onChange={(v) => onUpdate({ status: v as PlotStatus })}
            />
          </div>

          {/* Crop */}
          <div>
            <Label en="Current Crop" sw="Zao la sasa" />
            <GlassSelect
              value={showOtherCrop ? 'Other' : plot.currentCrop}
              onChange={handleCropChange}
              options={CROP_OPTIONS}
            />
            {showOtherCrop && (
              <div className="mt-2">
                <GlassInput
                  value={plot.currentCrop}
                  onChange={(v) => onUpdate({ currentCrop: v })}
                  placeholder="Enter crop name"
                />
              </div>
            )}
          </div>

          {/* Variety */}
          <div>
            <Label en="Variety (optional)" sw="Aina ya mbegu (hiari)" />
            <GlassInput
              value={plot.variety ?? ''}
              onChange={(v) => onUpdate({ variety: v || undefined })}
              placeholder="e.g. Stuka, Situka"
            />
          </div>

          {/* Growth Stage */}
          <div>
            <Label en="Growth Stage" sw="Hatua ya ukuaji" />
            <GlassSelect
              value={plot.growthStage}
              onChange={(v) => onUpdate({ growthStage: v as GrowthStage })}
              options={GROWTH_STAGE_OPTIONS}
            />
          </div>

          {/* Irrigation */}
          <div>
            <Label en="Irrigation Status" sw="Hali ya umwagiliaji" />
            <SegmentedControl
              options={IRRIGATION_OPTIONS}
              value={plot.irrigationStatus}
              onChange={(v) => onUpdate({ irrigationStatus: v as IrrigationStatus })}
            />
          </div>

          {/* Planting Month */}
          <div>
            <Label en="Planting Month (optional)" sw="Mwezi wa kupanda (hiari)" />
            <input
              type="month"
              value={plot.plantingMonth ?? ''}
              onChange={(e) => onUpdate({ plantingMonth: e.target.value || undefined })}
              className="w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
                font-manrope focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
                transition-all duration-200 [color-scheme:dark]"
            />
          </div>

          {/* GPS Center Point */}
          <div>
            <Label en="GPS Center Point" sw="Kituo cha GPS" />

            {plot.centerPoint ? (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getAccuracyColor(plot.centerPoint.accuracy) }}
                  />
                  <span className="text-xs font-manrope" style={{ color: getAccuracyColor(plot.centerPoint.accuracy) }}>
                    {getAccuracyLabel(plot.centerPoint.accuracy)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                  <span>{plot.centerPoint.lat.toFixed(6)}, {plot.centerPoint.lng.toFixed(6)}</span>
                  {plot.centerPoint.altitude !== undefined && (
                    <span>{plot.centerPoint.altitude.toFixed(1)}m alt</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={capturingGps}
                  className="mt-1 text-xs text-[#67E8F9] font-manrope font-medium hover:underline disabled:opacity-40"
                >
                  {capturingGps ? 'Recapturing...' : 'Recapture GPS'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={capturingGps}
                className="w-full h-12 min-h-[44px] flex items-center justify-center gap-2 bg-white/[0.04] border border-dashed border-white/[0.15]
                  rounded-2xl text-sm font-manrope text-white/60 hover:text-white hover:border-[#BEF264]/40 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg text-[#BEF264]">my_location</span>
                {capturingGps ? 'Capturing GPS...' : 'Capture Plot Center GPS'}
              </button>
            )}

            {gpsError && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20">
                <span className="material-symbols-outlined text-[#FF4B4B] text-base">error</span>
                <span className="text-xs text-[#FF4B4B] font-manrope">{gpsError}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label en="Notes (optional)" sw="Maelezo (hiari)" />
            <GlassTextarea
              value={plot.notes ?? ''}
              onChange={(v) => onUpdate({ notes: v || undefined })}
              placeholder="Any notes about this plot..."
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlotStructureStep({
  farmProfile,
  plots,
  auditId: _auditId,
  onAddPlot,
  onUpdatePlot,
  onRemovePlot,
}: PlotStructureStepProps) {
  const totalPlotArea = useMemo(
    () => plots.reduce((sum, p) => sum + (p.areaHa || 0), 0),
    [plots],
  );

  const farmTotalHa = farmProfile.totalAreaHa || 0;
  const areaFraction = farmTotalHa > 0 ? Math.min(totalPlotArea / farmTotalHa, 1.5) : 0;
  const areaPercent = Math.min(areaFraction * 100, 100);
  const isOverAllocated = farmTotalHa > 0 && totalPlotArea > farmTotalHa * 1.1;

  const handleUpdatePlot = useCallback(
    (plotId: string) => (updates: Partial<Plot>) => {
      onUpdatePlot(plotId, updates);
    },
    [onUpdatePlot],
  );

  const handleRemovePlot = useCallback(
    (plotId: string) => () => {
      onRemovePlot(plotId);
    },
    [onRemovePlot],
  );

  return (
    <div className="space-y-6">
      {/* ── Farm Reference Chip ─────────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#BEF264] text-xl">agriculture</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white font-manrope truncate">
              {farmProfile.farmLocalRef || 'Unnamed farm'}
            </p>
            <p className="text-xs text-white/40 font-mono">
              {farmTotalHa > 0 ? `${farmTotalHa} ha total` : 'No area set'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Plot Area Tracker ──────────────────────────────────────────── */}
      {farmTotalHa > 0 && (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-manrope text-white/70">Plot area allocation</span>
            <span className={`text-sm font-mono font-medium ${isOverAllocated ? 'text-[#FFBF00]' : 'text-white'}`}>
              {totalPlotArea.toFixed(2)} / {farmTotalHa.toFixed(2)} ha used
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverAllocated ? 'bg-[#FFBF00]' : 'bg-[#BEF264]'}`}
              style={{ width: `${areaPercent}%` }}
            />
          </div>

          {isOverAllocated && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/20">
              <span className="material-symbols-outlined text-[#FFBF00] text-base">warning</span>
              <span className="text-xs text-[#FFBF00] font-manrope">
                Plot areas exceed farm total by more than 10%. Please verify.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Plot Cards ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {plots.map((plot, idx) => (
          <PlotCard
            key={plot.localId}
            plot={plot}
            index={idx}
            canRemove={plots.length > 1}
            onUpdate={handleUpdatePlot(plot.localId)}
            onRemove={handleRemovePlot(plot.localId)}
          />
        ))}
      </div>

      {/* ── Add Plot Button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onAddPlot}
        className="w-full h-14 min-h-[56px] flex items-center justify-center gap-2 rounded-full
          bg-[#BEF264] text-black font-manrope font-semibold text-base
          shadow-[0_0_24px_rgba(190,242,100,0.3)] hover:shadow-[0_0_32px_rgba(190,242,100,0.45)]
          active:scale-[0.98] transition-all duration-200"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Add Plot
      </button>
    </div>
  );
}
