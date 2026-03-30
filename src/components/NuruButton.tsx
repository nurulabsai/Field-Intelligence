import React from 'react';
import { Loader2 } from 'lucide-react';
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
  sm: 'px-4 py-2 text-[13px] h-9',
  md: 'px-5 py-2.5 text-sm h-11',
  lg: 'px-7 py-3.5 text-base h-[52px]',
};

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-accent text-black hover:bg-accent-dark active:scale-[0.97]',
  secondary: 'bg-bg-input text-white border border-border hover:border-border-dark hover:bg-[rgba(255,255,255,0.12)]',
  ghost: 'bg-transparent text-white hover:bg-[rgba(255,255,255,0.05)]',
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
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold font-base cursor-pointer border-none whitespace-nowrap transition-all duration-[var(--transition-base)]',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {loading ? (
        <Loader2
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
