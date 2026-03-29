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

const Step5_Inputs: React.FC<Step5Props> = ({ data, onChange, errors }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = useCallback((key: string, value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.938rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

  const renderDropdown = (key: string, label: string, options: DropdownOption[]) => {
    const value = (data[key] as string) || '';
    const isOpen = openDropdown === key;

    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : key)}
            style={{
              ...inputStyle,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: isOpen ? '#F0513E' : 'rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ color: value ? '#FFFFFF' : '#6B7280' }}>
              {options.find(o => o.value === value)?.label || `Select ${label.toLowerCase()}`}
            </span>
            <ChevronDown size={18} style={{ color: '#6B7280', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#1E1E1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                zIndex: 50,
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { handleChange(key, opt.value); setOpenDropdown(null); }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: value === opt.value ? 'rgba(240,81,62,0.15)' : 'transparent',
                    border: 'none',
                    color: value === opt.value ? '#F0513E' : '#FFFFFF',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors[key] && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Agricultural Inputs
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '28px' }}>
        Record fertilizers, pesticides and seed information
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Fertilizer Section */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Fertilizer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderDropdown('fertilizer_type', 'Fertilizer Type', FERTILIZER_TYPES)}
            {(data.fertilizer_type as string) && (data.fertilizer_type as string) !== 'none' && (
              <div>
                <label style={labelStyle}>Amount (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.fertilizer_amount_kg as string) || ''}
                  onChange={e => handleChange('fertilizer_amount_kg', e.target.value)}
                  placeholder="Enter amount in kg"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </div>

        {/* Pesticide Section */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Pesticide
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderDropdown('pesticide_type', 'Pesticide Type', PESTICIDE_TYPES)}
            {(data.pesticide_type as string) && (data.pesticide_type as string) !== 'none' && (
              <div>
                <label style={labelStyle}>Amount (litres)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(data.pesticide_amount_l as string) || ''}
                  onChange={e => handleChange('pesticide_amount_l', e.target.value)}
                  placeholder="Enter amount in litres"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </div>

        {/* Seed Section */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Seeds
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderDropdown('seed_type', 'Seed Type', SEED_TYPES)}
            {renderDropdown('seed_source', 'Seed Source', SEED_SOURCES)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5_Inputs;
