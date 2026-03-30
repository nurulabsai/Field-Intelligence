import React, { useCallback } from 'react';
import { User, Phone, CreditCard, Users, Home } from 'lucide-react';
import { cn } from '../../../design-system';

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
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Farmer Identity
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        Capture the farmer and farm identification details
      </p>

      <div className="nuru-glass-card rounded-[28px] p-6 flex flex-col gap-5">
        {FIELDS.map(field => {
          const value = (data[field.key] as string) || '';
          const error = errors[field.key];

          return (
            <div key={field.key}>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
                {field.label}
                {field.required && <span className="text-text-accent ml-1">*</span>}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  {field.icon}
                </span>
                {field.prefix && (
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                    {field.prefix}
                  </span>
                )}
                <input
                  type={field.type}
                  value={value}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={cn(
                    "w-full py-3 pr-4 nuru-glass-card rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border",
                    error ? 'border-error' : 'border-border',
                    'focus:border-accent',
                  )}
                  style={{
                    paddingLeft: field.prefix ? '88px' : '44px',
                  }}
                />
              </div>
              {error && (
                <p className="text-xs text-error-light mt-1">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step1_Identity;
