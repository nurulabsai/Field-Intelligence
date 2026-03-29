import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface Step3Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

interface DropdownOption {
  value: string;
  label: string;
}

const LAND_TENURE: DropdownOption[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'leased', label: 'Leased' },
  { value: 'communal', label: 'Communal' },
  { value: 'government', label: 'Government' },
];

const SOIL_TYPES: DropdownOption[] = [
  { value: 'clay', label: 'Clay' },
  { value: 'loam', label: 'Loam' },
  { value: 'sand', label: 'Sand' },
  { value: 'silt', label: 'Silt' },
];

const IRRIGATION_TYPES: DropdownOption[] = [
  { value: 'none', label: 'None' },
  { value: 'drip', label: 'Drip' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'flood', label: 'Flood' },
  { value: 'canal', label: 'Canal' },
];

const WATER_SOURCES: DropdownOption[] = [
  { value: 'rain', label: 'Rain' },
  { value: 'river', label: 'River' },
  { value: 'borehole', label: 'Borehole' },
  { value: 'dam', label: 'Dam' },
  { value: 'spring', label: 'Spring' },
];

interface FieldErrors {
  total_area_ha?: string;
  cultivated_area_ha?: string;
  land_tenure?: string;
  soil_type?: string;
  irrigation_type?: string;
  water_source?: string;
}

const Step3_FarmChar: React.FC<Step3Props> = ({ data, onChange, errors: externalErrors }) => {
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const allErrors = useMemo(() => ({ ...localErrors, ...externalErrors }), [localErrors, externalErrors]);
  const errorList = useMemo(() => Object.values(allErrors).filter(Boolean), [allErrors]);
  const hasErrors = errorList.length > 0;

  const handleChange = useCallback((key: string, value: string | number) => {
    onChange({ [key]: value });
    setTouched(p => ({ ...p, [key]: true }));

    // Inline validation
    setLocalErrors(prev => {
      const next = { ...prev };
      if (key === 'total_area_ha') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        if (isNaN(num) || num <= 0) next.total_area_ha = 'Total area must be greater than 0';
        else delete next.total_area_ha;

        const cultivated = parseFloat((data.cultivated_area_ha as string) || '0');
        if (cultivated > num) next.cultivated_area_ha = 'Cultivated area cannot exceed total area';
        else if (next.cultivated_area_ha === 'Cultivated area cannot exceed total area') delete next.cultivated_area_ha;
      }
      if (key === 'cultivated_area_ha') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        const total = parseFloat((data.total_area_ha as string) || '0');
        if (isNaN(num) || num <= 0) next.cultivated_area_ha = 'Cultivated area must be greater than 0';
        else if (num > total && total > 0) next.cultivated_area_ha = 'Cultivated area cannot exceed total area';
        else delete next.cultivated_area_ha;
      }
      if (key === 'land_tenure') {
        if (!value) next.land_tenure = 'Land tenure is required';
        else delete next.land_tenure;
      }
      if (key === 'soil_type') {
        if (!value) next.soil_type = 'Soil type is required';
        else delete next.soil_type;
      }
      return next;
    });
  }, [data, onChange]);

  const inputBaseClasses = "w-full py-3 px-4 bg-bg-input rounded-xl text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150";

  const renderDropdown = (
    key: string,
    label: string,
    options: DropdownOption[],
    required: boolean = true,
  ) => {
    const value = (data[key] as string) || '';
    const isOpen = openDropdown === key;
    const error = allErrors[key as keyof FieldErrors];
    const showError = error && touched[key];

    return (
      <div key={key}>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
          {required && <span className="text-text-accent ml-1">*</span>}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : key)}
            className={`${inputBaseClasses} text-left cursor-pointer flex items-center justify-between`}
            style={{
              borderColor: showError ? '#EF4444' : isOpen ? '#F0513E' : 'rgba(255,255,255,0.08)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <span className={value ? 'text-white' : 'text-text-tertiary'}>
              {options.find(o => o.value === value)?.label || `Select ${label.toLowerCase()}`}
            </span>
            <ChevronDown size={18} className="text-text-tertiary transition-transform duration-150" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-tertiary border border-[rgba(255,255,255,0.1)] rounded-xl z-50 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleChange(key, opt.value);
                    setOpenDropdown(null);
                  }}
                  className="w-full py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit"
                  style={{
                    background: value === opt.value ? 'rgba(240,81,62,0.15)' : 'transparent',
                    color: value === opt.value ? '#F0513E' : '#FFFFFF',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {showError && <p className="text-xs text-[#FCA5A5] mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">
        Farm Characteristics
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Record physical farm attributes and resources
      </p>

      {/* Error Summary Banner */}
      {hasErrors && Object.values(touched).some(Boolean) && (
        <div className="flex gap-3 p-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-[14px] mb-6">
          <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#FCA5A5] mb-1.5">
              Please fix the following errors
            </p>
            <ul className="m-0 pl-4">
              {errorList.map((err, i) => (
                <li key={i} className="text-[0.813rem] text-[#FCA5A5] leading-normal">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Total Area */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Total Area (ha) <span className="text-text-accent">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={(data.total_area_ha as string) || ''}
            onChange={e => handleChange('total_area_ha', e.target.value)}
            placeholder="Enter total farm area in hectares"
            className={`${inputBaseClasses} border`}
            style={{
              borderColor: allErrors.total_area_ha && touched.total_area_ha ? '#EF4444' : 'rgba(255,255,255,0.08)',
            }}
            onBlur={() => setTouched(p => ({ ...p, total_area_ha: true }))}
          />
          {allErrors.total_area_ha && touched.total_area_ha && (
            <p className="text-xs text-[#FCA5A5] mt-1">{allErrors.total_area_ha}</p>
          )}
        </div>

        {/* Cultivated Area */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Cultivated Area (ha) <span className="text-text-accent">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={(data.cultivated_area_ha as string) || ''}
            onChange={e => handleChange('cultivated_area_ha', e.target.value)}
            placeholder="Enter cultivated area in hectares"
            className={`${inputBaseClasses} border`}
            style={{
              borderColor: allErrors.cultivated_area_ha && touched.cultivated_area_ha ? '#EF4444' : 'rgba(255,255,255,0.08)',
            }}
            onBlur={() => setTouched(p => ({ ...p, cultivated_area_ha: true }))}
          />
          {allErrors.cultivated_area_ha && touched.cultivated_area_ha && (
            <p className="text-xs text-[#FCA5A5] mt-1">{allErrors.cultivated_area_ha}</p>
          )}
        </div>

        {/* Dropdowns */}
        {renderDropdown('land_tenure', 'Land Tenure', LAND_TENURE)}
        {renderDropdown('soil_type', 'Soil Type', SOIL_TYPES)}
        {renderDropdown('irrigation_type', 'Irrigation Type', IRRIGATION_TYPES, false)}
        {renderDropdown('water_source', 'Water Source', WATER_SOURCES, false)}
      </div>

      {/* Disabled continue hint */}
      {hasErrors && Object.values(touched).some(Boolean) && (
        <p className="mt-6 text-center text-[0.813rem] text-error font-medium">
          Fix errors to continue
        </p>
      )}
    </div>
  );
};

export default Step3_FarmChar;
