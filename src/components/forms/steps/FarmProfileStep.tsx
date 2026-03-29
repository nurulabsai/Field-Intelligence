import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FarmerProfile } from '../../../types/farmerTypes';
import type {
  FarmProfile,
  FarmingSystem,
  FarmTenure,
  WaterSource,
} from '../../../types/auditTypes';
import { TANZANIA_REGIONS, getDistricts } from '../../../data/tanzaniaAdminData';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FarmProfileStepProps {
  farmer: FarmerProfile;
  farmProfile: FarmProfile | null;
  onUpdate: (farmProfile: FarmProfile) => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

function createDefaultFarmProfile(farmer: FarmerProfile): FarmProfile {
  return {
    farmerLocalId: farmer.localId,
    farmLocalRef: '',
    farmerName: farmer.identity.fullName,
    farmerContact: farmer.identity.phoneNumber,
    region: '',
    district: '',
    ward: '',
    village: '',
    totalAreaHa: 0,
    tenureType: 'owned',
    farmingSystem: 'rainfed',
    waterSource: undefined,
    notes: '',
    capturedAt: new Date().toISOString(),
    capturedBy: farmer.capturedBy,
  };
}

// ─── Option data ──────────────────────────────────────────────────────────────

const TENURE_OPTIONS: { value: FarmTenure; label: string }[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'leased', label: 'Leased' },
  { value: 'communal', label: 'Communal' },
  { value: 'customary', label: 'Customary' },
  { value: 'other', label: 'Other' },
];

const FARMING_SYSTEM_OPTIONS: { value: FarmingSystem; label: string }[] = [
  { value: 'rainfed', label: 'Rainfed' },
  { value: 'irrigated', label: 'Irrigated' },
  { value: 'mixed', label: 'Mixed' },
];

const WATER_SOURCE_OPTIONS: { value: WaterSource | ''; label: string }[] = [
  { value: '', label: 'Select water source (optional)' },
  { value: 'rain', label: 'Rain' },
  { value: 'river', label: 'River' },
  { value: 'borehole', label: 'Borehole' },
  { value: 'dam', label: 'Dam' },
  { value: 'canal', label: 'Canal' },
  { value: 'none', label: 'None' },
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

function GlassSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full h-12 min-h-[44px] bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
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

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="material-symbols-outlined text-[#BEF264] text-xl">{icon}</span>
      <h3 className="text-base font-semibold text-white font-sora">{title}</h3>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FarmProfileStep({
  farmer,
  farmProfile,
  onUpdate,
}: FarmProfileStepProps) {
  const [form, setForm] = useState<FarmProfile>(() => {
    if (farmProfile) {
      return {
        ...farmProfile,
        farmerLocalId: farmer.localId,
        farmerName: farmer.identity.fullName,
        farmerContact: farmer.identity.phoneNumber,
      };
    }
    return createDefaultFarmProfile(farmer);
  });

  // Sync local state to parent on every change
  const updateField = useCallback(
    <K extends keyof FarmProfile>(key: K, value: FarmProfile[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // When region changes, clear district
        if (key === 'region' && value !== prev.region) {
          return { ...next, district: '' };
        }
        return next;
      });
    },
    [],
  );

  // Push changes to parent whenever form changes
  useEffect(() => {
    onUpdate(form);
  }, [form, onUpdate]);

  // Derived data
  const districts = useMemo(
    () => getDistricts(form.region),
    [form.region],
  );

  const regionOptions = useMemo(
    () => [
      { value: '', label: 'Select region / Chagua mkoa' },
      ...TANZANIA_REGIONS.map((r) => ({ value: r.name, label: r.name })),
    ],
    [],
  );

  const districtOptions = useMemo(
    () => [
      { value: '', label: form.region ? 'Select district / Chagua wilaya' : 'Select region first' },
      ...districts.map((d) => ({ value: d, label: d })),
    ],
    [districts, form.region],
  );

  const showAreaWarning = form.totalAreaHa > 500;

  return (
    <div className="space-y-6">
      {/* ── Farmer Chip (read-only) ─────────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#BEF264] text-xl">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white font-manrope truncate">
              {farmer.identity.fullName || 'Unnamed farmer'}
            </p>
            <p className="text-xs text-white/40 font-mono truncate">
              {farmer.identity.phoneNumber || 'No phone'}
            </p>
          </div>
        </div>
        <p className="text-xs text-white/30 font-manrope mt-3 pl-[52px]">
          This farm will be linked to the farmer above
        </p>
      </div>

      {/* ── Section A - Farm Identity ───────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
        <SectionHeader icon="agriculture" title="A. Farm Identity" />

        <div>
          <Label en="Farm Reference" sw="Jina au kitambulisho cha shamba" />
          <GlassInput
            value={form.farmLocalRef}
            onChange={(v) => updateField('farmLocalRef', v)}
            placeholder="e.g. Shamba ya Mwangi, Block A-12"
          />
        </div>
      </div>

      {/* ── Section B - Location ────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
        <SectionHeader icon="location_on" title="B. Location" />

        <div className="space-y-4">
          <div>
            <Label en="Region" sw="Mkoa" />
            <GlassSelect
              value={form.region}
              onChange={(v) => updateField('region', v)}
              options={regionOptions}
            />
          </div>

          <div>
            <Label en="District" sw="Wilaya" />
            <GlassSelect
              value={form.district}
              onChange={(v) => updateField('district', v)}
              options={districtOptions}
              disabled={!form.region}
            />
          </div>

          <div>
            <Label en="Ward" sw="Kata" />
            <GlassInput
              value={form.ward}
              onChange={(v) => updateField('ward', v)}
              placeholder="Enter ward name"
            />
          </div>

          <div>
            <Label en="Village" sw="Kijiji" />
            <GlassInput
              value={form.village}
              onChange={(v) => updateField('village', v)}
              placeholder="Enter village name"
            />
          </div>
        </div>
      </div>

      {/* ── Section C - Farm Characteristics ────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
        <SectionHeader icon="landscape" title="C. Farm Characteristics" />

        <div className="space-y-4">
          <div>
            <Label en="Total Area (hectares)" sw="Eneo la shamba (hekta)" />
            <GlassInput
              value={form.totalAreaHa ? String(form.totalAreaHa) : ''}
              onChange={(v) => {
                const parsed = parseFloat(v);
                updateField('totalAreaHa', Number.isNaN(parsed) ? 0 : parsed);
              }}
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              min="0.1"
              step="0.1"
            />
            {showAreaWarning && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/20">
                <span className="material-symbols-outlined text-[#FFBF00] text-base">warning</span>
                <span className="text-xs text-[#FFBF00] font-manrope">
                  Area exceeds 500 ha. Please verify this is correct.
                </span>
              </div>
            )}
          </div>

          <div>
            <Label en="Tenure Type" sw="Aina ya umiliki" />
            <GlassSelect
              value={form.tenureType}
              onChange={(v) => updateField('tenureType', v as FarmTenure)}
              options={TENURE_OPTIONS}
            />
          </div>

          <div>
            <Label en="Farming System" sw="Mfumo wa kilimo" />
            <SegmentedControl
              options={FARMING_SYSTEM_OPTIONS}
              value={form.farmingSystem}
              onChange={(v) => updateField('farmingSystem', v as FarmingSystem)}
            />
          </div>

          <div>
            <Label en="Water Source" sw="Chanzo cha maji (hiari)" />
            <GlassSelect
              value={form.waterSource ?? ''}
              onChange={(v) =>
                updateField('waterSource', v === '' ? undefined : (v as WaterSource))
              }
              options={WATER_SOURCE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* ── Section D - Notes ───────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
        <SectionHeader icon="edit_note" title="D. Notes" />

        <div>
          <Label en="Additional Notes" sw="Maelezo ya ziada (hiari)" />
          <GlassTextarea
            value={form.notes ?? ''}
            onChange={(v) => updateField('notes', v)}
            placeholder="Any additional observations about this farm..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
