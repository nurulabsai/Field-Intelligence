import React from 'react';

interface NuruCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

const NuruCard: React.FC<NuruCardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const paddingMap: Record<string, string> = {
    sm: '12px',
    md: '16px',
    lg: '24px',
  };

  const style: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card, #1E1E1E)',
    border: `1px solid ${
      isHovered && hoverable
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.06)'
    }`,
    borderRadius: '16px',
    padding: paddingMap[padding],
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    transition: 'all 0.25s ease',
    cursor: onClick ? 'pointer' : 'default',
    transform: isHovered && hoverable ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow:
      isHovered && hoverable
        ? '0 8px 24px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.1)',
  };

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default NuruCard;
