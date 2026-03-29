import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface Step5Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

interface DropdownOption {
  value: string;
  label: string;
}

const FERTILIZER_TYPES: DropdownOption[] = [
  { value: 'none', label: 'None' },
  { value: 'urea', label: 'Urea' },
  { value: 'dap', label: 'DAP' },
  { value: 'npk', label: 'NPK' },
  { value: 'organic', label: 'Organic' },
  { value: 'compost', label: 'Compost' },
];

const PESTICIDE_TYPES: DropdownOption[] = [
  { value: 'none', label: 'None' },
  { value: 'herbicide', label: 'Herbicide' },
  { value: 'insecticide', label: 'Insecticide' },
  { value: 'fungicide', label: 'Fungicide' },
];

const SEED_TYPES: DropdownOption[] = [
  { value: 'local', label: 'Local' },
  { value: 'improved', label: 'Improved' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'certified', label: 'Certified' },
];

const SEED_SOURCES: DropdownOption[] = [
  { value: 'own', label: 'Own Saved' },
  { value: 'market', label: 'Market' },
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'company', label: 'Company' },
];

const inputClasses = "w-full py-3 px-4 bg-bg-input border border-border rounded-xl text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150";

const Step5_Inputs: React.FC<Step5Props> = ({ data, onChange, errors }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = useCallback((key: string, value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  const renderDropdown = (key: string, label: string, options: DropdownOption[]) => {
    const value = (data[key] as string) || '';
    const isOpen = openDropdown === key;

    return (
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : key)}
            className={`${inputClasses} text-left cursor-pointer flex items-center justify-between`}
            style={{
              borderColor: isOpen ? '#F0513E' : 'rgba(255,255,255,0.08)',
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
                  onClick={() => { handleChange(key, opt.value); setOpenDropdown(null); }}
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
        {errors[key] && <p className="text-xs text-[#FCA5A5] mt-1">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">
        Agricultural Inputs
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Record fertilizers, pesticides and seed information
      </p>

      <div className="flex flex-col gap-5">
        {/* Fertilizer Section */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Fertilizer
          </h3>
          <div className="flex flex-col gap-4">
            {renderDropdown('fertilizer_type', 'Fertilizer Type', FERTILIZER_TYPES)}
            {(data.fertilizer_type as string) && (data.fertilizer_type as string) !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.fertilizer_amount_kg as string) || ''}
                  onChange={e => handleChange('fertilizer_amount_kg', e.target.value)}
                  placeholder="Enter amount in kg"
                  className={inputClasses}
                />
              </div>
            )}
          </div>
        </div>

        {/* Pesticide Section */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Pesticide
          </h3>
          <div className="flex flex-col gap-4">
            {renderDropdown('pesticide_type', 'Pesticide Type', PESTICIDE_TYPES)}
            {(data.pesticide_type as string) && (data.pesticide_type as string) !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount (litres)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.pesticide_amount_l as string) || ''}
                  onChange={e => handleChange('pesticide_amount_l', e.target.value)}
                  placeholder="Enter amount in litres"
                  className={inputClasses}
                />
              </div>
            )}
          </div>
        </div>

        {/* Seed Section */}
        <div className="p-5 bg-bg-card rounded-lg border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[0.938rem] font-semibold text-white mb-4">
            Seeds
          </h3>
          <div className="flex flex-col gap-4">
            {renderDropdown('seed_type', 'Seed Type', SEED_TYPES)}
            {renderDropdown('seed_source', 'Seed Source', SEED_SOURCES)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5_Inputs;
