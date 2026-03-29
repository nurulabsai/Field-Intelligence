import React from 'react';

interface NuruAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NuruAvatar: React.FC<NuruAvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeMap: Record<string, number> = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  const fontSizeMap: Record<string, number> = {
    sm: 12,
    md: 14,
    lg: 20,
  };

  const px = sizeMap[size];

  const getInitials = (n: string): string => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const baseStyle: React.CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'var(--color-bg-input, #252525)',
    color: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: `${fontSizeMap[size]}px`,
    flexShrink: 0,
  };

  if (imageUrl && !imgError) {
    return (
      <div style={baseStyle}>
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  return <div style={baseStyle}>{getInitials(name)}</div>;
};

export default NuruAvatar;
