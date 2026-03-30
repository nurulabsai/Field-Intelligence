import React from 'react';
import { cn } from '../design-system';

interface NuruBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<string, string> = {
  default: 'bg-white/10 text-text-secondary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

const NuruBadge: React.FC<NuruBadgeProps> = ({
  variant = 'default',
  children,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
      )}
    >
      {children}
    </span>
  );
};

export default NuruBadge;
