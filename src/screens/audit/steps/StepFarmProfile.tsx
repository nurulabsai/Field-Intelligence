import React, { useState, useCallback } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import type { FarmProfile, TenureType, FarmingSystem } from '../../../lib/audit-types';
import { createFarmProfile } from '../../../lib/audit-types';
import { TANZANIA_REGIONS } from '../../../lib/tanzania-admin-cascade';

interface StepFarmProfileProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const TENURE_OPTIONS: { value: TenureType; label: string }[] = [
  { value: 'owned', label: 'Owned (with title)' },
  { value: 'leased', label: 'Leased' },
  { value: 'communal', label: 'Communal' },
  { value: 'government', label: 'Government land' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'other', label: 'Other' },
];

const FARMING_SYSTEM_OPTIONS: { value: FarmingSystem; label: string }[] = [
  { value: 'rainfed', label: 'Rainfed' },
  { value: 'irrigated', label: 'Irrigated' },
  { value: 'mixed', label: 'Mixed' },
];

const WATER_SOURCES = [
  'Rain', 'River', 'Borehole', 'Dam', 'Spring', 'Piped', 'Well', 'None',
];

const inputBase = "w-full py-3 px-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border";

const StepFarmProfile: React.FC<StepFarmProfileProps> = ({ data, onChange, errors }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const profile: FarmProfile = (data.farm_profile as FarmProfile) || createFarmProfile();

  const update = useCallback((field: keyof FarmProfile, value: unknown) => {
    const updated = { ...profile, [field]: value };
    // Propagate farmer_name to top-level for existing step compatibility
    const extra: Record<string, unknown> = { farm_profile: updated };
    if (field === 'farmer_name') extra.farmer_name = value;
    if (field === 'farmer_phone') extra.farmer_phone = value;
    if (field === 'farm_name') extra.farm_name = value;
    if (field === 'region') extra.region = value;
    if (field === 'district') extra.district = value;
    if (field === 'ward') extra.ward = value;
    if (field === 'village') extra.village = value;
    onChange(extra);
  }, [profile, onChange]);

  const renderDropdown = (
    field: keyof FarmProfile,
    label: string,
    options: { value: string; label: string }[],
    required: boolean,
    icon?: React.ReactNode,
  ) => {
    const value = (profile[field] as string) || '';
    const isOpen = openDropdown === field;
    const error = errors[`farm_profile.${field}`];
    const ddId = `farm-profile-dd-${String(field)}`;

    return (
      <div>
        <label
          htmlFor={ddId}
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-text-accent ml-1">*</span>}
        </label>
        <div className="relative">
          <button
            id={ddId}
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : field)}
            className={cn(
              inputBase,
              'text-left cursor-pointer flex items-center gap-3',
              error ? 'border-error' : isOpen ? 'border-accent' : 'border-border',
            )}
          >
            {icon && <span className="text-text-tertiary shrink-0">{icon}</span>}
            <span className={cn('flex-1', value ? 'text-white' : 'text-text-tertiary')}>
              {options.find(o => o.value === value)?.label || `Select ${label.toLowerCase()}`}
            </span>
            <MaterialIcon name="expand_more" size={18} className={cn("text-text-tertiary transition-transform duration-150", isOpen && "rotate-180")} />
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border-dark rounded-[18px] z-50 max-h-60 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { update(field, opt.value); setOpenDropdown(null); }}
                  className={cn(
                    'w-full min-h-12 py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit',
                    value === opt.value ? 'bg-accent/15 text-accent' : 'bg-transparent text-white',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error-light mt-1">{error}</p>}
      </div>
    );
  };

  const renderInput = (
    field: keyof FarmProfile,
    label: string,
    opts: { type?: string; placeholder?: string; required?: boolean; icon?: React.ReactNode; prefix?: string; suffix?: string } = {},
  ) => {
    const value = (profile[field] as string | number) ?? '';
    const error = errors[`farm_profile.${field}`];
    const { type = 'text', placeholder, required = false, icon, prefix, suffix } = opts;
    const inputId = `farm-profile-${String(field)}`;

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-text-accent ml-1">*</span>}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {icon}
            </span>
          )}
          {prefix && (
            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={e => {
              const v = type === 'number' ? e.target.value : e.target.value;
              update(field, v);
            }}
            placeholder={placeholder}
            step={type === 'number' ? '0.01' : undefined}
            min={type === 'number' ? '0' : undefined}
            className={cn(
              inputBase,
              error ? 'border-error' : 'border-border',
              'focus:border-accent',
            )}
            style={{
              paddingLeft: prefix ? '88px' : icon ? '44px' : undefined,
              paddingRight: suffix ? '52px' : undefined,
            }}
          />
          {suffix && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-error-light mt-1">{error}</p>}
      </div>
    );
  };

  const totalAreaWarning = (() => {
    const v = parseFloat(String(profile.total_area_ha));
    if (v > 100) return 'Farm area > 100 ha — please verify';
    return null;
  })();

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Farm Profile
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Core farm identity and operational details
      </p>

      {/* Farm Identity */}
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5 mb-6">
        <h3 className="text-[0.938rem] font-semibold font-heading text-white flex items-center gap-2">
          <MaterialIcon name="home" size={16} className="text-accent" />
          Farm Identity
        </h3>

        {renderInput('farm_name', 'Farm Name / Local Reference', {
          placeholder: 'e.g. Mchaina Farm',
          required: true,
          icon: <MaterialIcon name="home" size={18} />,
        })}

        {renderInput('farmer_name', 'Farmer Name', {
          placeholder: 'Full name of farmer',
          required: true,
          icon: <MaterialIcon name="person" size={18} />,
        })}

        {renderInput('farmer_phone', 'Farmer Phone', {
          type: 'tel',
          placeholder: '712 345 678',
          required: true,
          icon: <MaterialIcon name="phone" size={18} />,
          prefix: '+255',
        })}

        {renderInput('contact_number', 'Alternative Contact', {
          type: 'tel',
          placeholder: 'Optional secondary number',
          icon: <MaterialIcon name="phone" size={18} />,
        })}
      </div>

      {/* Location */}
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5 mb-6">
        <h3 className="text-[0.938rem] font-semibold font-heading text-white flex items-center gap-2">
          <MaterialIcon name="location_on" size={16} className="text-accent" />
          Administrative Location
        </h3>

        {renderDropdown('region', 'Region', TANZANIA_REGIONS.map(r => ({ value: r, label: r })), true)}

        {renderInput('district', 'District', { placeholder: 'Enter district', required: true })}
        {renderInput('ward', 'Ward', { placeholder: 'Enter ward', required: true })}
        {renderInput('village', 'Village', { placeholder: 'Enter village', required: true })}
      </div>

      {/* Farm Details */}
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        <h3 className="text-[0.938rem] font-semibold font-heading text-white flex items-center gap-2">
          <MaterialIcon name="description" size={16} className="text-accent" />
          Farm Details
        </h3>

        {renderInput('total_area_ha', 'Total Farm Area', {
          type: 'number',
          placeholder: '0.00',
          required: true,
          suffix: 'ha',
        })}

        {totalAreaWarning && (
          <div className="flex items-center gap-2 py-2.5 px-3.5 bg-warning/10 border border-warning/25 rounded-[10px]">
            <MaterialIcon name="error" size={16} className="text-warning shrink-0" />
            <span className="text-[0.813rem] text-warning-light">{totalAreaWarning}</span>
          </div>
        )}

        {renderDropdown('tenure_type', 'Tenure Type', TENURE_OPTIONS, true)}
        {renderDropdown('farming_system', 'Primary Farming System', FARMING_SYSTEM_OPTIONS, true)}

        {renderDropdown(
          'water_source',
          'Water Source',
          WATER_SOURCES.map(w => ({ value: w.toLowerCase(), label: w })),
          false,
          <MaterialIcon name="water_drop" size={18} />,
        )}

        <div>
          <label
            htmlFor="farm-profile-notes"
            className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5"
          >
            General Farm Notes
          </label>
          <textarea
            id="farm-profile-notes"
            value={profile.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any additional context about this farm..."
            rows={3}
            className={cn(inputBase, 'border-border focus:border-accent resize-y min-h-[80px]')}
          />
        </div>
      </div>
    </div>
  );
};

export default StepFarmProfile;
