import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'icon' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showTagline?: boolean;
  glow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  showTagline = false,
  glow = false,
}) => {
  const sizeClasses = {
    sm: 'logo-sm',
    md: 'logo-md',
    lg: 'logo-lg',
    xl: 'logo-xl',
  };

  const svgSizes = { sm: 32, md: 48, lg: 64, xl: 80 };
  const svgSize = svgSizes[size];
  const themeClass = theme;

  // Nuru Labs "N" circular logo
  const NuruIcon = () => (
    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="50" cy="50" r="44" fill="rgba(240, 81, 62, 0.08)" />

      {/* Stylized N with wave pattern */}
      <path
        d="M32 72V28L50 56L68 28V72"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Wave accent through N */}
      <path
        d="M28 50C35 44 42 56 50 50C58 44 65 56 72 50"
        stroke="#F0513E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {glow && (
        <>
          <circle cx="50" cy="50" r="46" stroke="#F0513E" strokeWidth="1" opacity="0.15" />
          <circle cx="50" cy="50" r="40" stroke="#F0513E" strokeWidth="0.5" opacity="0.1" />
        </>
      )}
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div
        className={`nuruos-logo-icon ${sizeClasses[size]} ${themeClass}`}
        style={glow ? { filter: 'drop-shadow(0 0 12px rgba(240, 81, 62, 0.3))' } : undefined}
      >
        <NuruIcon />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`nuruos-logo-horizontal ${sizeClasses[size]} ${themeClass}`}>
        <div className="logo-icon">
          <NuruIcon />
        </div>
        <div className="logo-text">
          <span className="logo-title">NuruOS</span>
        </div>
      </div>
    );
  }

  // Full logo with tagline
  return (
    <div
      className={`nuruos-logo-full ${sizeClasses[size]} ${themeClass}`}
      style={glow ? { filter: 'drop-shadow(0 0 20px rgba(240, 81, 62, 0.25))' } : undefined}
    >
      <div className="logo-icon">
        <NuruIcon />
      </div>
      <div className="logo-text">
        <span className="logo-title">NuruOS</span>
        {showTagline && (
          <span className="logo-tagline">Smarter Field Audits. Powered by AI.</span>
        )}
      </div>
    </div>
  );
};