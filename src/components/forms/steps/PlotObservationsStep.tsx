import { useState, useCallback, useMemo } from 'react';
import type {
  Plot,
  PlotObservation,
  CropCondition,
  StressLevel,
  WeedPressure,
  YieldOutlook,
} from '../../../types/auditTypes';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlotObservationsStepProps {
  plots: Plot[];
  onUpdateObservation: (plotId: string, obs: Partial<PlotObservation>) => void;
}

// ─── Option data ──────────────────────────────────────────────────────────────

const CROP_CONDITION_OPTIONS: { value: CropCondition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'failed', label: 'Failed' },
];

const SEVERITY_OPTIONS: { value: StressLevel; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const STRESS_LEVEL_OPTIONS: { value: StressLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const SOIL_MOISTURE_OPTIONS: { value: 'dry' | 'adequate' | 'waterlogged'; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'adequate', label: 'Adequate' },
  { value: 'waterlogged', label: 'Waterlogged' },
];

const WEED_PRESSURE_OPTIONS: { value: WeedPressure; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const PLANT_VIGOR_OPTIONS: { value: 'strong' | 'moderate' | 'weak'; label: string }[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'weak', label: 'Weak' },
];

const YIELD_OUTLOOK_OPTIONS: { value: YieldOutlook; label: string }[] = [
  { value: 'above_average', label: 'Above avg' },
  { value: 'average', label: 'Average' },
  { value: 'below_average', label: 'Below avg' },
  { value: 'crop_failure', label: 'Crop failure' },
];

// ─── Completion check ─────────────────────────────────────────────────────────

function isObservationComplete(obs: PlotObservation): boolean {
  if (obs.cropCondition === null || obs.pestPresent === null || obs.diseasePresent === null) {
    return false;
  }
  if (obs.pestPresent && (!obs.pestType || !obs.pestSeverity)) {
    return false;
  }
  if (obs.diseasePresent && (!obs.diseaseType || !obs.diseaseSeverity)) {
    return false;
  }
  return true;
}

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
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200"
    />
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

function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 h-11 min-h-[44px] rounded-2xl text-sm font-manrope font-medium transition-all duration-200
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

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
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

function BooleanToggle({
  value,
  onChange,
  yesLabel = 'YES',
  noLabel = 'NO',
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`w-[56px] h-11 min-h-[44px] rounded-2xl text-sm font-manrope font-medium transition-all duration-200
          ${
            value === false
              ? 'bg-white/[0.08] border border-white/[0.15] text-white'
              : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
          }`}
      >
        {noLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`w-[56px] h-11 min-h-[44px] rounded-2xl text-sm font-manrope font-medium transition-all duration-200
          ${
            value === true
              ? 'bg-[#FF4B4B]/10 border border-[#FF4B4B]/40 text-[#FF4B4B]'
              : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
          }`}
      >
        {yesLabel}
      </button>
    </div>
  );
}

function GlassSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as T)}
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
      {placeholder && (
        <option value="" disabled className="bg-[#111622] text-white/40">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111622] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlotObservationsStep({
  plots,
  onUpdateObservation,
}: PlotObservationsStepProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOptional, setShowOptional] = useState(false);

  const completionStates = useMemo(
    () => plots.map((p) => isObservationComplete(p.observation)),
    [plots],
  );

  const completedCount = useMemo(
    () => completionStates.filter(Boolean).length,
    [completionStates],
  );

  const allComplete = completedCount === plots.length;

  const handleUpdate = useCallback(
    (updates: Partial<PlotObservation>) => {
      const plot = plots[activeIndex];
      if (plot) {
        onUpdateObservation(plot.localId, updates);
      }
    },
    [plots, activeIndex, onUpdateObservation],
  );

  const goToPlot = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setShowOptional(false);
    },
    [],
  );

  if (plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-white/20 mb-4">visibility_off</span>
        <p className="text-sm text-white/40 font-manrope">No plots to observe.</p>
        <p className="text-xs text-white/25 font-manrope mt-1">Add plots in the previous step first.</p>
      </div>
    );
  }

  const activePlot = plots[activeIndex];
  if (!activePlot) {
    return null;
  }

  const obs = activePlot.observation;

  return (
    <div className="space-y-5">
      {/* ── 1. Plot Navigator ──────────────────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {plots.map((plot, idx) => {
            const isActive = idx === activeIndex;
            const isComplete = completionStates[idx];

            return (
              <button
                key={plot.localId}
                type="button"
                onClick={() => goToPlot(idx)}
                className={`flex items-center gap-1.5 px-4 h-10 min-h-[44px] rounded-full text-sm font-manrope font-medium
                  transition-all duration-200 whitespace-nowrap shrink-0
                  ${
                    isActive
                      ? 'bg-[#BEF264] text-black shadow-[0_0_20px_rgba(190,242,100,0.25)]'
                      : isComplete
                        ? 'bg-white/[0.08] text-white/70'
                        : 'bg-white/[0.03] border border-white/[0.05] text-white/50 hover:text-white/70'
                  }`}
                aria-label={`Plot ${idx + 1}: ${plot.plotName || `Plot ${idx + 1}`}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete && !isActive && (
                  <span className="material-symbols-outlined text-base text-[#BEF264]">check</span>
                )}
                <span>{plot.plotName || `Plot ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Plot label ──────────────────────────────────────────────── */}
      <p className="text-center text-sm text-white/50 font-manrope">
        Plot {activeIndex + 1} of {plots.length} &mdash;{' '}
        <span className="text-white/70 font-medium">
          {activePlot.plotName || `Plot ${activeIndex + 1}`}
        </span>
      </p>

      {/* ── 3. Completion bar ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 font-manrope">
            {completedCount} of {plots.length} plots complete
          </span>
          <span className="text-xs text-white/40 font-manrope">
            Mashamba {completedCount}/{plots.length} yamekamilika
          </span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#BEF264] rounded-full transition-all duration-500"
            style={{ width: plots.length > 0 ? `${(completedCount / plots.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* ── 4. Observation Card ────────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 space-y-6">

        {/* ── Plot identity chip (always visible) ──────────────────────── */}
        <div className="bg-[#BEF264]/10 border border-[#BEF264]/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BEF264]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#BEF264] text-lg">eco</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white font-manrope truncate">
                {activePlot.plotName || `Plot ${activeIndex + 1}`}
                <span className="text-white/40 mx-1.5">&middot;</span>
                <span className="text-white/60">{activePlot.currentCrop || 'No crop'}</span>
                <span className="text-white/40 mx-1.5">&middot;</span>
                <span className="text-white/60">{activePlot.areaHa > 0 ? `${activePlot.areaHa} ha` : '-- ha'}</span>
              </p>
              <p className="text-xs text-white/30 font-mono mt-0.5 truncate">
                &#8627; {activePlot.farmLocalRef}
              </p>
            </div>
          </div>
        </div>

        {/* ── Required observations ────────────────────────────────────── */}

        {/* Crop Condition */}
        <div>
          <Label en="Crop Condition" sw="Hali ya mazao" />
          <PillSelector<CropCondition>
            options={CROP_CONDITION_OPTIONS}
            value={obs.cropCondition}
            onChange={(v) => handleUpdate({ cropCondition: v })}
          />
        </div>

        {/* Pest Present */}
        <div className="space-y-3">
          <Label en="Pest Present?" sw="Kuna wadudu?" />
          <BooleanToggle
            value={obs.pestPresent}
            onChange={(v) => {
              const updates: Partial<PlotObservation> = { pestPresent: v };
              if (!v) {
                updates.pestType = undefined;
                updates.pestSeverity = undefined;
              }
              handleUpdate(updates);
            }}
          />

          {obs.pestPresent === true && (
            <div className="ml-4 pl-4 border-l-2 border-[#FF4B4B]/20 space-y-4 mt-3">
              <div>
                <Label en="Pest Type" sw="Aina ya wadudu" />
                <GlassInput
                  value={obs.pestType ?? ''}
                  onChange={(v) => handleUpdate({ pestType: v || undefined })}
                  placeholder="e.g. Fall armyworm"
                />
              </div>
              <div>
                <Label en="Pest Severity" sw="Ukali wa wadudu" />
                <SegmentedControl<StressLevel>
                  options={SEVERITY_OPTIONS}
                  value={obs.pestSeverity}
                  onChange={(v) => handleUpdate({ pestSeverity: v })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Disease Present */}
        <div className="space-y-3">
          <Label en="Disease Present?" sw="Kuna ugonjwa?" />
          <BooleanToggle
            value={obs.diseasePresent}
            onChange={(v) => {
              const updates: Partial<PlotObservation> = { diseasePresent: v };
              if (!v) {
                updates.diseaseType = undefined;
                updates.diseaseSeverity = undefined;
              }
              handleUpdate(updates);
            }}
          />

          {obs.diseasePresent === true && (
            <div className="ml-4 pl-4 border-l-2 border-[#FF4B4B]/20 space-y-4 mt-3">
              <div>
                <Label en="Disease Type" sw="Aina ya ugonjwa" />
                <GlassInput
                  value={obs.diseaseType ?? ''}
                  onChange={(v) => handleUpdate({ diseaseType: v || undefined })}
                  placeholder="e.g. Maize lethal necrosis"
                />
              </div>
              <div>
                <Label en="Disease Severity" sw="Ukali wa ugonjwa" />
                <SegmentedControl<StressLevel>
                  options={SEVERITY_OPTIONS}
                  value={obs.diseaseSeverity}
                  onChange={(v) => handleUpdate({ diseaseSeverity: v })}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Optional observations toggle ─────────────────────────────── */}
        <button
          type="button"
          onClick={() => setShowOptional((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 h-11 min-h-[44px] rounded-2xl
            bg-transparent border border-white/[0.08] text-white/50 text-sm font-manrope font-medium
            hover:text-white/70 hover:border-white/[0.15] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-lg">
            {showOptional ? 'expand_less' : 'add'}
          </span>
          {showOptional ? 'Hide extra observations' : '+ Show more observations'}
        </button>

        {showOptional && (
          <div className="space-y-5 pt-1">
            {/* Visible Stress Level */}
            <div>
              <Label en="Visible Stress Level" sw="Kiwango cha msongo unaoonekana" />
              <SegmentedControl<StressLevel>
                options={STRESS_LEVEL_OPTIONS}
                value={obs.visibleStressLevel}
                onChange={(v) => handleUpdate({ visibleStressLevel: v })}
              />
            </div>

            {/* Soil Moisture */}
            <div>
              <Label en="Soil Moisture Impression" sw="Hali ya unyevu wa udongo" />
              <SegmentedControl<'dry' | 'adequate' | 'waterlogged'>
                options={SOIL_MOISTURE_OPTIONS}
                value={obs.soilMoistureImpression}
                onChange={(v) => handleUpdate({ soilMoistureImpression: v })}
              />
            </div>

            {/* Weed Pressure */}
            <div>
              <Label en="Weed Pressure" sw="Shinikizo la magugu" />
              <SegmentedControl<WeedPressure>
                options={WEED_PRESSURE_OPTIONS}
                value={obs.weedPressure}
                onChange={(v) => handleUpdate({ weedPressure: v })}
              />
            </div>

            {/* Plant Vigor */}
            <div>
              <Label en="Plant Vigor" sw="Nguvu ya mimea" />
              <SegmentedControl<'strong' | 'moderate' | 'weak'>
                options={PLANT_VIGOR_OPTIONS}
                value={obs.plantVigor}
                onChange={(v) => handleUpdate({ plantVigor: v })}
              />
            </div>

            {/* Yield Outlook */}
            <div>
              <Label en="Yield Outlook" sw="Matarajio ya mavuno" />
              <GlassSelect<YieldOutlook>
                value={obs.yieldOutlook}
                onChange={(v) => handleUpdate({ yieldOutlook: v })}
                options={YIELD_OUTLOOK_OPTIONS}
                placeholder="Select yield outlook"
              />
            </div>
          </div>
        )}

        {/* ── Notes ────────────────────────────────────────────────────── */}
        <div>
          <Label en="Notes (optional)" sw="Maelezo (hiari)" />
          <GlassTextarea
            value={obs.notes ?? ''}
            onChange={(v) => handleUpdate({ notes: v || undefined })}
            placeholder="Any observations about this plot..."
            rows={2}
          />
        </div>
      </div>

      {/* ── 5. Navigation ──────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => goToPlot(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex-1 h-14 min-h-[56px] flex items-center justify-center gap-2 rounded-full
            bg-transparent border border-white/[0.08] text-white/60 font-manrope font-semibold text-base
            hover:text-white hover:border-white/[0.15] transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/60 disabled:hover:border-white/[0.08]"
          aria-label="Previous plot"
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
          Previous Plot
        </button>

        <button
          type="button"
          onClick={() => goToPlot(activeIndex + 1)}
          disabled={activeIndex === plots.length - 1}
          className="flex-1 h-14 min-h-[56px] flex items-center justify-center gap-2 rounded-full
            bg-[#BEF264] text-black font-manrope font-semibold text-base
            shadow-[0_0_24px_rgba(190,242,100,0.3)] hover:shadow-[0_0_32px_rgba(190,242,100,0.45)]
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          aria-label="Next plot"
        >
          Next Plot
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </div>

      {/* ── Continue button (all complete) ─────────────────────────────── */}
      {allComplete && (
        <button
          type="button"
          className="w-full h-14 min-h-[56px] flex items-center justify-center gap-2 rounded-full
            bg-[#BEF264] text-black font-manrope font-semibold text-base
            shadow-[0_0_24px_rgba(190,242,100,0.3)] hover:shadow-[0_0_32px_rgba(190,242,100,0.45)]
            active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">check_circle</span>
          Continue
          <span className="text-black/50 text-sm font-normal ml-1">Endelea</span>
        </button>
      )}
    </div>
  );
}
