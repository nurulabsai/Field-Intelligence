import { cn } from '../../design-system';

interface NeonButtonProps {
  variant: 'lime' | 'cyan' | 'ghost' | 'red';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

const VARIANT_STYLES = {
  lime: 'bg-neon-lime text-black font-bold glow-lime active:scale-95',
  cyan: 'bg-neon-cyan text-black font-bold glow-cyan active:scale-95',
  ghost: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
  red: 'bg-neon-red text-white glow-red active:scale-95',
} as const;

const SIZE_STYLES = {
  sm: 'py-3 px-6 text-xs',
  md: 'py-4 px-8 text-sm',
  lg: 'py-5 px-10 text-sm',
} as const;

export default function NeonButton({
  variant,
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  onClick,
  children,
  className,
  type = 'button',
}: NeonButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-manrope font-bold uppercase tracking-[0.15em] transition-all duration-200',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && 'w-full',
        isDisabled && 'pointer-events-none opacity-50',
        className
      )}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </button>
  );
}
