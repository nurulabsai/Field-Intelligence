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

  const inputStyle = (key: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: `1px solid ${allErrors[key as keyof FieldErrors] && touched[key] ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.938rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

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
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#F0513E', marginLeft: '4px' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : key)}
            style={{
              ...inputStyle(key),
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: showError ? '#EF4444' : isOpen ? '#F0513E' : 'rgba(255,255,255,0.08)',
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
                  onClick={() => {
                    handleChange(key, opt.value);
                    setOpenDropdown(null);
                  }}
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
        {showError && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{error}</p>}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Farm Characteristics
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '28px' }}>
        Record physical farm attributes and resources
      </p>

      {/* Error Summary Banner */}
      {hasErrors && Object.values(touched).some(Boolean) && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FCA5A5', marginBottom: '6px' }}>
              Please fix the following errors
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {errorList.map((err, i) => (
                <li key={i} style={{ fontSize: '0.813rem', color: '#FCA5A5', lineHeight: 1.5 }}>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Total Area */}
        <div>
          <label style={labelStyle}>
            Total Area (ha) <span style={{ color: '#F0513E' }}>*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={(data.total_area_ha as string) || ''}
            onChange={e => handleChange('total_area_ha', e.target.value)}
            placeholder="Enter total farm area in hectares"
            style={inputStyle('total_area_ha')}
            onBlur={() => setTouched(p => ({ ...p, total_area_ha: true }))}
          />
          {allErrors.total_area_ha && touched.total_area_ha && (
            <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{allErrors.total_area_ha}</p>
          )}
        </div>

        {/* Cultivated Area */}
        <div>
          <label style={labelStyle}>
            Cultivated Area (ha) <span style={{ color: '#F0513E' }}>*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={(data.cultivated_area_ha as string) || ''}
            onChange={e => handleChange('cultivated_area_ha', e.target.value)}
            placeholder="Enter cultivated area in hectares"
            style={inputStyle('cultivated_area_ha')}
            onBlur={() => setTouched(p => ({ ...p, cultivated_area_ha: true }))}
          />
          {allErrors.cultivated_area_ha && touched.cultivated_area_ha && (
            <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{allErrors.cultivated_area_ha}</p>
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
        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.813rem',
            color: '#EF4444',
            fontWeight: 500,
          }}
        >
          Fix errors to continue
        </p>
      )}
    </div>
  );
};

export default Step3_FarmChar;
