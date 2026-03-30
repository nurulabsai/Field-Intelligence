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
        'nuru-glass-card rounded-2xl transition-all duration-[var(--transition-slow)]',
        PADDING_CLASSES[padding],
        hoverable && 'hover:border-border-dark hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(190,242,100,0.35)]',
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
