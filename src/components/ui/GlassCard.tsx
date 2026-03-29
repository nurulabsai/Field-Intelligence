import { cn } from '../../design-system';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'lg';
  radius?: 'md' | 'lg';
  onClick?: () => void;
}

const PADDING_MAP = {
  none: '',
  sm: 'p-6',
  lg: 'p-8',
} as const;

const RADIUS_MAP = {
  md: 'rounded-[24px]',
  lg: 'rounded-[32px]',
} as const;

export default function GlassCard({
  children,
  className,
  padding = 'lg',
  radius = 'lg',
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card overflow-hidden',
        RADIUS_MAP[radius],
        PADDING_MAP[padding],
        onClick && 'cursor-pointer transition-transform active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
