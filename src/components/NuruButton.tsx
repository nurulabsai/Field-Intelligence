import React from 'react';
import MaterialIcon from './MaterialIcon';
import { cn } from '../design-system';

interface NuruButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-4 py-2 text-[13px] h-9 rounded-full',
  md: 'px-5 py-2.5 text-sm h-11 rounded-full',
  lg: 'px-7 py-3.5 text-base h-[52px] rounded-full',
};

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-accent text-black shadow-[0_10px_28px_-10px_rgba(190,242,100,0.5)] hover:bg-accent-dark active:scale-[0.97]',
  secondary: 'nuru-glass-card text-white border border-border hover:border-border-dark hover:bg-[rgba(255,255,255,0.12)]',
  ghost: 'bg-transparent text-white hover:bg-[rgba(255,255,255,0.05)] rounded-full',
  danger: 'bg-error text-white hover:bg-[#DC2626]',
};

const NuruButton: React.FC<NuruButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold font-base cursor-pointer border-none whitespace-nowrap transition-all duration-[var(--transition-base)] tracking-[0.02em]',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {loading ? (
        <MaterialIcon
          name="progress_activity"
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
          className="animate-spin"
        />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

export default NuruButton;
