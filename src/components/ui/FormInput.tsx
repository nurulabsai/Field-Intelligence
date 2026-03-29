import { useState, useId } from 'react';
import { cn } from '../../design-system';

interface FormInputProps {
  label: string;
  sublabel?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
}

export default function FormInput({
  label,
  sublabel,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  required = false,
  readOnly = false,
  multiline = false,
  rows = 3,
}: FormInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const borderClass = error
    ? 'border-neon-red bg-neon-red/5 glow-red'
    : focused
      ? 'border-neon-cyan glow-cyan'
      : 'border-white/5 bg-white/[0.03]';

  const sharedClass = cn(
    'w-full rounded-[16px] border px-4 py-3.5 font-manrope text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200',
    borderClass,
    readOnly && 'opacity-50 cursor-not-allowed'
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500"
        >
          {label}
          {required && <span className="ml-0.5 text-neon-red">*</span>}
        </label>
        {sublabel && (
          <span className="text-[10px] text-white/30 italic">{sublabel}</span>
        )}
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            className={cn(sharedClass, 'resize-none')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        ) : (
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={cn(sharedClass, (icon || isPassword) && 'pr-11')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}

        {icon && !isPassword && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-white/30">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 font-manrope text-[11px] text-neon-red"
          role="alert"
        >
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
