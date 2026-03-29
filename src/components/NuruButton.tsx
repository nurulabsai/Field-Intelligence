import React from 'react';
import { Loader2 } from 'lucide-react';

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
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '12px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '13px', height: '36px' },
    md: { padding: '10px 20px', fontSize: '14px', height: '44px' },
    lg: { padding: '14px 28px', fontSize: '16px', height: '52px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#F0513E',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#252525',
      color: '#FFFFFF',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
    },
    danger: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const getHoverStyles = (): React.CSSProperties => {
    if (!isHovered || disabled || loading) return {};
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#D4402E' };
      case 'secondary':
        return { backgroundColor: '#2E2E2E', borderColor: 'rgba(255,255,255,0.15)' };
      case 'ghost':
        return { backgroundColor: 'rgba(255,255,255,0.05)' };
      case 'danger':
        return { backgroundColor: '#DC2626' };
      default:
        return {};
    }
  };

  const activeStyles: React.CSSProperties =
    isActive && !disabled && !loading ? { transform: 'scale(0.97)' } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...getHoverStyles(),
        ...activeStyles,
      }}
    >
      {loading ? (
        <Loader2
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
          className="animate-[nuru-spin_1s_linear_infinite]"
        />
      ) : icon ? (
        icon
      ) : null}
      {children}
      <style>{`
        @keyframes nuru-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default NuruButton;
