import React, { useState, useCallback, useMemo } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import { useUIStore } from '../../../store/index';
import {
  FERTILIZER_TYPE_OPTIONS,
  optionsForDropdown,
  PESTICIDE_TYPE_OPTIONS,
  SEED_SOURCE_OPTIONS,
  SEED_TYPE_OPTIONS,
} from '../../../lib/wizard-enums';

interface Step5Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

interface DropdownOption {
  value: string;
  label: string;
}

const inputClasses = "w-full py-3 px-4 bg-bg-input border border-border rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 focus:border-accent";

const Step5_Inputs: React.FC<Step5Props> = ({ data, onChange, errors }) => {
  const language = useUIStore((s) => s.language);
  const FERTILIZER_TYPES = useMemo(() => optionsForDropdown(FERTILIZER_TYPE_OPTIONS, language), [language]);
  const PESTICIDE_TYPES = useMemo(() => optionsForDropdown(PESTICIDE_TYPE_OPTIONS, language), [language]);
  const SEED_TYPES = useMemo(() => optionsForDropdown(SEED_TYPE_OPTIONS, language), [language]);
  const SEED_SOURCES = useMemo(() => optionsForDropdown(SEED_SOURCE_OPTIONS, language), [language]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = useCallback((key: string, value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  const renderDropdown = (key: string, label: string, options: DropdownOption[]) => {
    const value = (data[key] as string) || '';
    const isOpen = openDropdown === key;
    const ddId = `inputs-dd-${key}`;

    return (
      <div>
        <label htmlFor={ddId} className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
        <div className="relative">
          <button
            id={ddId}
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : key)}
            className={cn(
              inputClasses,
              "text-left cursor-pointer flex items-center justify-between",
              isOpen && "border-accent"
            )}
          >
            <span className={value ? 'text-white' : 'text-text-tertiary'}>
              {options.find(o => o.value === value)?.label || `Select ${label.toLowerCase()}`}
            </span>
            <MaterialIcon name="expand_more" size={18} className={cn("text-text-tertiary transition-transform duration-150", isOpen && "rotate-180")} />
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 nuru-glass-card border border-border rounded-[16px] z-50 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { handleChange(key, opt.value); setOpenDropdown(null); }}
                  className={cn(
                    "w-full min-h-12 py-2.5 px-4 border-none text-sm text-left cursor-pointer font-inherit",
                    value === opt.value
                      ? "bg-accent/[0.15] text-accent"
                      : "bg-transparent text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors[key] && <p className="text-xs text-error-light mt-1">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Agricultural Inputs
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Record fertilizers, pesticides and seed information
      </p>

      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        {/* Fertilizer Section */}
        <div className="p-5 nuru-glass-card rounded-[20px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
            Fertilizer
          </h3>
          <div className="flex flex-col gap-4">
            {renderDropdown('fertilizer_type', 'Fertilizer Type', FERTILIZER_TYPES)}
            {(data.fertilizer_type as string) && (data.fertilizer_type as string) !== 'none' && (
              <div>
                <label htmlFor="inputs-fertilizer-amount-kg" className="block text-sm font-medium text-text-secondary mb-1.5">Amount (kg)</label>
                <input
                  id="inputs-fertilizer-amount-kg"
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
        <div className="p-5 nuru-glass-card rounded-[20px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
            Pesticide
          </h3>
          <div className="flex flex-col gap-4">
            {renderDropdown('pesticide_type', 'Pesticide Type', PESTICIDE_TYPES)}
            {(data.pesticide_type as string) && (data.pesticide_type as string) !== 'none' && (
              <div>
                <label htmlFor="inputs-pesticide-amount-l" className="block text-sm font-medium text-text-secondary mb-1.5">Amount (litres)</label>
                <input
                  id="inputs-pesticide-amount-l"
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
        <div className="p-5 nuru-glass-card rounded-[20px] border border-border-glass">
          <h3 className="text-[0.938rem] font-semibold font-heading text-white mb-4">
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
