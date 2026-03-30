import React from 'react';
import { cn } from '../design-system';

interface NuruCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

const PADDING_CLASSES: Record<string, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const NuruCard: React.FC<NuruCardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'bg-bg-card border border-border-glass rounded-2xl backdrop-blur-[var(--glass-blur)] transition-all duration-[var(--transition-slow)] shadow-sm',
        PADDING_CLASSES[padding],
        hoverable && 'hover:border-border-dark hover:-translate-y-0.5 hover:shadow-lg',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default NuruCard;
