import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Plus, Trash2, MapPin, Navigation, AlertTriangle, ChevronDown,
  ChevronUp, Camera, Grid3X3, X, AlertCircle,
} from 'lucide-react';
import { cn } from '../../../design-system';
import type { Plot, FarmProfile, PlotStatus, GrowthStage } from '../../../lib/audit-types';
import { createPlot } from '../../../lib/audit-types';

interface StepPlotStructureProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const PLOT_STATUSES: { value: PlotStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'fallow', label: 'Fallow', color: 'warning' },
  { value: 'prepared', label: 'Prepared', color: 'info' },
  { value: 'abandoned', label: 'Abandoned', color: 'error' },
];

const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
  { value: 'germination', label: 'Germination' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'fruiting', label: 'Fruiting' },
  { value: 'maturity', label: 'Maturity' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'post_harvest', label: 'Post-harvest' },
];

const IRRIGATION_OPTIONS = [
  { value: 'rainfed', label: 'Rainfed' },
  { value: 'irrigated', label: 'Irrigated' },
  { value: 'supplemental', label: 'Supplemental' },
];

const CROP_OPTIONS = [
  'Maize', 'Rice', 'Wheat', 'Sorghum', 'Millet', 'Cassava', 'Sweet Potato',
  'Beans', 'Groundnuts', 'Sunflower', 'Sesame', 'Cotton', 'Coffee', 'Tea',
  'Cashew Nuts', 'Tobacco', 'Banana', 'Coconut', 'Pigeon Pea', 'Tomato',
  'Onion', 'Cabbage', 'Other',
];

const SEASONS = ['Long rains (Masika)', 'Short rains (Vuli)', 'Dry season', 'Year-round'];

const inputClasses = "w-full py-2.5 px-3.5 nuru-glass-card border border-border rounded-[14px] text-white text-sm font-inherit outline-none transition-colors duration-150 focus:border-accent";

const StepPlotStructure: React.FC<StepPlotStructureProps> = ({ data, onChange, errors }) => {
  const farmProfile = data.farm_profile as FarmProfile | undefined;
  const farmId = farmProfile?.id || '';

  const plots: Plot[] = useMemo(() => {
    const raw = data.plots as Plot[] | undefined;
    return raw && raw.length > 0 ? raw : [createPlot(farmId, 0)];
  }, [data.plots, farmId]);

  const [expandedPlots, setExpandedPlots] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (plots.length > 0) init[plots[0]!.id] = true;
    return init;
  });
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [gpsLoading, setGpsLoading] = useState<Record<string, boolean>>({});
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updatePlots = useCallback((updated: Plot[]) => {
    onChange({ plots: updated });
  }, [onChange]);

  const updatePlot = useCallback((plotId: string, field: keyof Plot, value: unknown) => {
    updatePlots(plots.map(p => p.id === plotId ? { ...p, [field]: value } : p));
  }, [plots, updatePlots]);

  const addPlot = useCallback(() => {
    const newPlot = createPlot(farmId, plots.length);
    const updated = [...plots, newPlot];
    updatePlots(updated);
    setExpandedPlots(prev => ({ ...prev, [newPlot.id]: true }));
  }, [farmId, plots, updatePlots]);

  const removePlot = useCallback((plotId: string) => {
    if (plots.length <= 1) return;
    updatePlots(plots.filter(p => p.id !== plotId));
    setExpandedPlots(prev => {
      const next = { ...prev };
      delete next[plotId];
      return next;
    });
  }, [plots, updatePlots]);

  const captureGPS = useCallback((plotId: string) => {
    if (!navigator.geolocation) return;
    setGpsLoading(prev => ({ ...prev, [plotId]: true }));
    navigator.geolocation.getCurrentPosition(
      pos => {
        updatePlot(plotId, 'center_gps', {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        });
        setGpsLoading(prev => ({ ...prev, [plotId]: false }));
      },
      () => setGpsLoading(prev => ({ ...prev, [plotId]: false })),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [updatePlot]);

  const handlePhoto = useCallback((plotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updatePlot(plotId, 'photo', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [updatePlot]);

  const toggleExpand = (plotId: string) => {
    setExpandedPlots(prev => ({ ...prev, [plotId]: !prev[plotId] }));
  };

  const totalPlotArea = plots.reduce((s, p) => s + (parseFloat(String(p.area_ha)) || 0), 0);
  const farmArea = parseFloat(String(farmProfile?.total_area_ha)) || 0;
  const areaOverflow = farmArea > 0 && totalPlotArea > farmArea * 1.2;

  const renderDropdown = (
    plotId: string,
    field: keyof Plot,
    label: string,
    options: { value: string; label: string }[],
    required: boolean,
  ) => {
    const plot = plots.find(p => p.id === plotId)!;
    const value = plot[field] as string;
    const ddKey = `${plotId}_${field}`;
    const isOpen = !!openDropdowns[ddKey];

    return (
      <div>
        <label className="block text-xs font-medium text-text-tertiary mb-1">
          {label}{required && <span className="text-text-accent ml-0.5">*</span>}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdowns(p => ({ ...p, [ddKey]: !p[ddKey] }))}
            className={cn(inputClasses, 'text-left cursor-pointer flex items-center justify-between')}
          >
            <span className={value ? 'text-white' : 'text-text-tertiary'}>
              {options.find(o => o.value === value)?.label || `Select`}
            </span>
            <ChevronDown size={14} className="text-text-tertiary" />
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border rounded-[14px] z-50 max-h-[200px] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    updatePlot(plotId, field, opt.value);
                    setOpenDropdowns(p => ({ ...p, [ddKey]: false }));
                  }}
                  className={cn(
                    'w-full py-2.5 px-3.5 border-none text-sm text-left cursor-pointer font-inherit',
                    value === opt.value ? 'bg-accent/15 text-accent' : 'bg-transparent text-white',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Plot Structure
      </h2>
      <p className="text-sm text-text-tertiary mb-2">
        Define each plot within this farm
      </p>

      {/* Summary bar */}
      <div className="flex items-center justify-between py-3 px-4 nuru-glass-card rounded-[14px] border border-border-glass mb-6">
        <div className="flex items-center gap-3">
          <Grid3X3 size={16} className="text-accent" />
          <span className="text-sm text-white font-medium">{plots.length} plot{plots.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-xs text-text-tertiary">
          Total: {totalPlotArea.toFixed(2)} ha
          {farmArea > 0 && <span className="ml-1">/ {farmArea} ha farm</span>}
        </span>
      </div>

      {areaOverflow && (
        <div className="flex items-center gap-2 py-2.5 px-3.5 bg-warning/10 border border-warning/25 rounded-[10px] mb-4">
          <AlertCircle size={16} className="text-warning shrink-0" />
          <span className="text-[0.813rem] text-warning-light">
            Total plot area ({totalPlotArea.toFixed(2)} ha) exceeds farm area ({farmArea} ha) by more than 20%
          </span>
        </div>
      )}

      {errors['plots'] && (
        <p className="text-xs text-error-light mb-4">{errors['plots']}</p>
      )}

      {/* Plot Cards */}
      <div className="flex flex-col gap-4">
        {plots.map((plot, index) => {
          const isExpanded = !!expandedPlots[plot.id];
          const gps = plot.center_gps;
          const isLoading = !!gpsLoading[plot.id];
          const plotError = errors[`plots.${index}`];

          return (
            <div
              key={plot.id}
              className={cn(
                "nuru-glass-card border rounded-[24px] transition-all duration-150",
                isExpanded ? "border-accent/20" : "border-border-glass",
              )}
            >
              {/* Collapsed header */}
              <button
                type="button"
                onClick={() => toggleExpand(plot.id)}
                className="w-full p-5 flex items-center justify-between bg-transparent border-none cursor-pointer font-inherit text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-[10px] flex items-center justify-center text-sm font-bold",
                    plot.status === 'active' ? "bg-success/10 text-success"
                      : plot.status === 'fallow' ? "bg-warning/10 text-warning"
                        : "bg-border-glass text-text-secondary",
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-[0.938rem] font-semibold text-white">{plot.name || `Plot ${index + 1}`}</p>
                    <p className="text-xs text-text-tertiary">
                      {plot.current_crop || 'No crop'} · {plot.area_ha ? `${plot.area_ha} ha` : 'No area'}
                      {gps && ' · GPS ✓'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plots.length > 1 && (
                    <span
                      role="button"
                      onClick={e => { e.stopPropagation(); removePlot(plot.id); }}
                      className="p-1.5 bg-error/10 rounded-full text-error cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={18} className="text-text-tertiary" /> : <ChevronDown size={18} className="text-text-tertiary" />}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  {plotError && (
                    <p className="text-xs text-error-light">{plotError}</p>
                  )}

                  {/* Plot Name */}
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">
                      Plot Name<span className="text-text-accent ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={plot.name}
                      onChange={e => updatePlot(plot.id, 'name', e.target.value)}
                      placeholder="e.g. Shamba la nyuma"
                      className={inputClasses}
                    />
                  </div>

                  {/* Area + Status row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-tertiary mb-1">
                        Area (ha)<span className="text-text-accent ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={plot.area_ha}
                        onChange={e => updatePlot(plot.id, 'area_ha', e.target.value)}
                        placeholder="0.00"
                        className={inputClasses}
                      />
                    </div>
                    {renderDropdown(plot.id, 'status', 'Status', PLOT_STATUSES.map(s => ({ value: s.value, label: s.label })), true)}
                  </div>

                  {/* Crop + Variety */}
                  <div className="grid grid-cols-2 gap-3">
                    {renderDropdown(plot.id, 'current_crop', 'Current Crop', CROP_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_'), label: c })), true)}
                    <div>
                      <label className="block text-xs font-medium text-text-tertiary mb-1">Variety</label>
                      <input
                        type="text"
                        value={plot.variety}
                        onChange={e => updatePlot(plot.id, 'variety', e.target.value)}
                        placeholder="e.g. STUKA M1"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Growth Stage + Irrigation */}
                  <div className="grid grid-cols-2 gap-3">
                    {renderDropdown(plot.id, 'growth_stage', 'Growth Stage', GROWTH_STAGES, true)}
                    {renderDropdown(plot.id, 'irrigation_status', 'Irrigation', IRRIGATION_OPTIONS, true)}
                  </div>

                  {/* Season */}
                  {renderDropdown(plot.id, 'planting_season', 'Planting Season', SEASONS.map(s => ({ value: s.toLowerCase().replace(/[^a-z]/g, '_'), label: s })), false)}

                  {/* GPS Center Point */}
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">
                      Plot Center GPS<span className="text-text-accent ml-0.5">*</span>
                    </label>
                    <p className="text-[10px] text-text-tertiary mb-2">Approximate center point (not boundary)</p>
                    <button
                      type="button"
                      onClick={() => captureGPS(plot.id)}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3.5 flex items-center justify-center gap-2 rounded-full text-sm font-semibold font-inherit border transition-all",
                        isLoading && "cursor-wait",
                        gps
                          ? "bg-success/10 border-success/25 text-success"
                          : "bg-accent/10 border-accent/25 text-accent cursor-pointer",
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                          Capturing...
                        </span>
                      ) : gps ? (
                        <>
                          <Navigation size={16} />
                          {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}
                          <span className="text-xs opacity-70">({gps.accuracy.toFixed(0)}m)</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={16} />
                          Capture Plot Center GPS
                        </>
                      )}
                    </button>
                    {gps && gps.accuracy > 30 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertTriangle size={12} className="text-warning" />
                        <span className="text-[10px] text-warning-light">Accuracy {gps.accuracy.toFixed(0)}m — consider recapturing</span>
                      </div>
                    )}
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">Plot Photo</label>
                    {plot.photo ? (
                      <div className="relative w-full h-32 rounded-[12px] overflow-hidden border border-border">
                        <img src={plot.photo} alt="Plot" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => updatePlot(plot.id, 'photo', '')}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-overlay border-none text-white cursor-pointer flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRefs.current[plot.id]?.click()}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-border-light border border-dashed border-white/10 rounded-full text-text-secondary text-sm cursor-pointer font-inherit"
                      >
                        <Camera size={16} /> Take Photo
                      </button>
                    )}
                    <input
                      ref={el => { photoInputRefs.current[plot.id] = el; }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handlePhoto(plot.id, e)}
                      className="hidden"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">Notes</label>
                    <textarea
                      value={plot.notes}
                      onChange={e => updatePlot(plot.id, 'notes', e.target.value)}
                      placeholder="Optional notes about this plot..."
                      rows={2}
                      className={cn(inputClasses, 'resize-y min-h-[50px]')}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Plot */}
      <button
        type="button"
        onClick={addPlot}
        className="flex items-center justify-center gap-2 w-full py-3.5 mt-4 bg-accent/[0.08] border border-dashed border-accent/30 rounded-[14px] text-text-accent text-sm font-semibold cursor-pointer font-inherit"
      >
        <Plus size={16} />
        Add Another Plot
      </button>

      <style>{`
        @media (max-width: 480px) {
          .grid-cols-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default StepPlotStructure;
