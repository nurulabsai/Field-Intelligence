import React from 'react';

interface NuruLogoProps {
  /** Width/height of the SVG in pixels */
  size?: number;
  /** Color of the logo paths */
  color?: string;
  className?: string;
}

/**
 * NuruOS brand mark — two vertical bars with a diagonal slash.
 * Extracted from the Stitch design reference.
 */
const NuruLogo: React.FC<NuruLogoProps> = ({ size = 40, color = 'white', className = '' }) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 100 100"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="NuruOS Logo"
  >
    {/* Left vertical bar */}
    <path
      d="M22 20C22 18.8954 22.8954 18 24 18H34C35.1046 18 36 18.8954 36 20V80C36 81.1046 35.1046 82 34 82H24C22.8954 82 22 81.1046 22 80V20Z"
      fill={color}
    />
    {/* Right vertical bar */}
    <path
      d="M64 20C64 18.8954 64.8954 18 66 18H76C77.1046 18 78 18.8954 78 20V80C78 81.1046 77.1046 82 76 82H66C64.8954 82 64 81.1046 64 80V20Z"
      fill={color}
    />
    {/* Diagonal slash */}
    <path d="M30 25L70 75L76 70L36 20L30 25Z" fill={color} />
  </svg>
);

export default NuruLogo;
