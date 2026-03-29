/**
 * Official NuruOS logo mark — circle containing a stylized "N"
 * formed by two rounded vertical pill shapes with a diagonal slash.
 *
 * Supports multiple sizes and color variants for consistent branding
 * across all screens (loading, welcome, sign-in, dashboard, nav).
 */

interface NuruOSLogoProps {
  /** Width/height in px (default 56) */
  size?: number;
  /** Fill color for the N mark (default "white") */
  color?: string;
  /** Stroke color for the outer circle (default matches color) */
  ringColor?: string;
  /** Background color for the diagonal cut (default "#0B0F19") */
  bgColor?: string;
  /** Show outer circle ring (default true) */
  showRing?: boolean;
}

export default function NuruOSLogo({
  size = 56,
  color = 'white',
  ringColor,
  bgColor = '#0B0F19',
  showRing = true,
}: NuruOSLogoProps) {
  const ring = ringColor ?? color;
  // All geometry is relative to a 100x100 viewBox
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="NuruOS logo"
      role="img"
    >
      {/* Outer circle ring */}
      {showRing && (
        <circle cx="50" cy="50" r="44" fill="none" stroke={ring} strokeWidth="4" opacity="0.9" />
      )}

      {/* Left vertical pill */}
      <rect x="30" y="28" width="14" height="44" rx="7" fill={color} />

      {/* Right vertical pill */}
      <rect x="56" y="28" width="14" height="44" rx="7" fill={color} />

      {/* Diagonal slash (cut through the N) */}
      <line
        x1="36" y1="66"
        x2="64" y2="34"
        stroke={bgColor}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
