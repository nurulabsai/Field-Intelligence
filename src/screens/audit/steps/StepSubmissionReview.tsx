import React, { useMemo } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import type { FarmProfile } from '../../../lib/audit-types';

interface Props {
  data: Record<string, unknown>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-border-glass/60 last:border-0">
      <span className="text-[0.65rem] uppercase tracking-widest text-text-tertiary">{label}</span>
      <span className="text-sm text-white break-words">{value ?? '—'}</span>
    </div>
  );
}

const StepSubmissionReview: React.FC<Props> = ({ data }) => {
  const fp = data.farm_profile as FarmProfile | undefined;
  const plots = (data.plots as { name?: string; area_ha?: unknown }[]) || [];
  const crops = (data.crops as { crop_id?: string; area_ha?: unknown }[]) || [];
  const tags = (data.ortamisemi_constraint_tags as string[]) || [];

  const summary = useMemo(() => {
    const loc = [
      data.region,
      data.district,
      data.ward,
      data.village,
    ]
      .filter(Boolean)
      .join(' · ');
    return loc || '—';
  }, [data.region, data.district, data.ward, data.village]);

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Review submission
      </h2>
      <p className="text-sm text-text-tertiary mb-6">
        Confirm all captured data before you submit. Use Back to edit a previous step.
      </p>

      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-1 max-h-[min(70vh,560px)] overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mb-2 flex items-center gap-2">
          <MaterialIcon name="person" size={16} />
          Farmer & consent
        </h3>
        <Row label="Name" value={data.farmer_name as string} />
        <Row label="Phone" value={data.farmer_phone as string} />
        <Row label="Gender" value={data.farmer_gender as string} />
        <Row label="Date of birth" value={data.farmer_dob as string} />
        <Row label="Reporting season" value={data.reporting_season as string} />
        <Row label="Labour" value={Array.isArray(data.labour_types) ? (data.labour_types as string[]).join(', ') : ''} />

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="location_on" size={16} />
          Location
        </h3>
        <Row label="Administrative" value={summary} />
        <Row
          label="GPS"
          value={
            typeof data.latitude === 'number' && typeof data.longitude === 'number'
              ? `${(data.latitude as number).toFixed(5)}, ${(data.longitude as number).toFixed(5)}`
              : typeof data.gps_lat === 'number' && typeof data.gps_lng === 'number'
                ? `${(data.gps_lat as number).toFixed(5)}, ${(data.gps_lng as number).toFixed(5)}`
                : '—'
          }
        />

        {fp && (
          <>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
              <MaterialIcon name="agriculture" size={16} />
              Farm profile
            </h3>
            <Row label="Farm name" value={fp.farm_name} />
            <Row label="Area (ha)" value={String(fp.total_area_ha)} />
            <Row label="Tenure" value={fp.tenure_type} />
            <Row label="Farming system" value={fp.farming_system} />
          </>
        )}

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="grass" size={16} />
          Farm characteristics
        </h3>
        <Row label="Soil type" value={data.soil_type as string} />
        <Row label="Irrigation type" value={data.irrigation_type as string} />
        <Row label="Water source" value={data.water_source as string} />

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="map" size={16} />
          Plots
        </h3>
        {plots.length === 0 ? (
          <Row label="Plots" value="—" />
        ) : (
          plots.map((p, i) => (
            <Row key={i} label={`Plot ${i + 1}`} value={`${p.name ?? '—'} — ${String(p.area_ha ?? '')} ha`} />
          ))
        )}

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="spa" size={16} />
          Crops
        </h3>
        {crops.length === 0 ? (
          <Row label="Crops" value="—" />
        ) : (
          crops.map((c, i) => (
            <Row key={i} label={`Crop ${i + 1}`} value={`${c.crop_id ?? '—'} — ${String(c.area_ha ?? '')} ha`} />
          ))
        )}

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="inventory_2" size={16} />
          Inputs
        </h3>
        <Row label="Fertilizer" value={data.fertilizer_type as string} />
        <Row label="Pesticide" value={data.pesticide_type as string} />
        <Row label="Seed" value={`${String(data.seed_type ?? '')} / ${String(data.seed_source ?? '')}`} />

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mt-4 mb-2 flex items-center gap-2">
          <MaterialIcon name="bar_chart" size={16} />
          Yield & constraints
        </h3>
        <Row label="Actual yield (kg/ha)" value={String(data.actual_yield_kg_ha ?? data.actual_yield ?? '')} />
        <Row label="Market channel" value={data.market_channel as string} />
        <Row label="OR-TAMISEMI constraints" value={tags.join(', ') || '—'} />
        <Row label="Notes" value={(data.notes as string) || '—'} />
      </div>
    </div>
  );
};

export default StepSubmissionReview;
