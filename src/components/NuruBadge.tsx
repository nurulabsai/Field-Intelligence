import React from 'react';

interface NuruBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const NuruBadge: React.FC<NuruBadgeProps> = ({
  variant = 'default',
  children,
  size = 'md',
}) => {
  const variantColors: Record<string, { bg: string; text: string }> = {
    default: { bg: 'rgba(255,255,255,0.1)', text: '#9CA3AF' },
    success: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    warning: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
    error: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
    info: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: '12px', padding: '2px 8px' },
    md: { fontSize: '14px', padding: '4px 12px' },
  };

  const colors = variantColors[variant] ?? variantColors['default']!

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    backgroundColor: colors.bg,
    color: colors.text,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
  };

  return <span style={style}>{children}</span>;
};

export default NuruBadge;
