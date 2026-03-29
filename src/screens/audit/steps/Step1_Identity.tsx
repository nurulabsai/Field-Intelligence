import React, { useCallback } from 'react';
import { User, Phone, CreditCard, Users, Home } from 'lucide-react';

interface Step1Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const FIELDS: {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  required: boolean;
  prefix?: string;
}[] = [
  { key: 'farmer_name', label: 'Farmer Name', type: 'text', placeholder: 'Enter farmer full name', icon: <User size={18} />, required: true },
  { key: 'farmer_phone', label: 'Phone Number', type: 'tel', placeholder: '712 345 678', icon: <Phone size={18} />, required: true, prefix: '+255' },
  { key: 'farmer_national_id', label: 'National ID', type: 'text', placeholder: 'Enter national ID number', icon: <CreditCard size={18} />, required: true },
  { key: 'cooperative', label: 'Cooperative', type: 'text', placeholder: 'Cooperative or group name', icon: <Users size={18} />, required: false },
  { key: 'farm_name', label: 'Farm Name', type: 'text', placeholder: 'Name of the farm', icon: <Home size={18} />, required: true },
];

const Step1_Identity: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  const handleChange = useCallback((key: string, value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Farmer Identity
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '28px' }}>
        Capture the farmer and farm identification details
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {FIELDS.map(field => {
          const value = (data[field.key] as string) || '';
          const error = errors[field.key];

          return (
            <div key={field.key}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.813rem',
                  fontWeight: 500,
                  color: '#9CA3AF',
                  marginBottom: '6px',
                }}
              >
                {field.label}
                {field.required && <span style={{ color: '#F0513E', marginLeft: '4px' }}>*</span>}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: field.prefix ? undefined : '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                    pointerEvents: 'none',
                    ...(field.prefix ? { left: '14px' } : {}),
                  }}
                >
                  {field.icon}
                </span>
                {field.prefix && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '40px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      pointerEvents: 'none',
                    }}
                  >
                    {field.prefix}
                  </span>
                )}
                <input
                  type={field.type}
                  value={value}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingLeft: field.prefix ? '88px' : '44px',
                    backgroundColor: 'var(--color-bg-input, #252525)',
                    border: `1px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.938rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => {
                    if (!error) e.currentTarget.style.borderColor = '#F0513E';
                  }}
                  onBlur={e => {
                    if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                />
              </div>
              {error && (
                <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step1_Identity;
