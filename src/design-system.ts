/**
 * Design System Tokens — NuruOS Field Intelligence (Stitch Design)
 *
 * Single source of truth for the entire visual system.
 * Aesthetic: Dark precision. Neon-lime (#BEF264) as the one commanding accent.
 * Typography: Sora (headings/display), Manrope (body/UI), IBM Plex Mono (data).
 *
 * DO NOT define colors, fonts, or radii anywhere else.
 */

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export const colors = {
  // Backgrounds
  bgDeep: '#0B0F19',
  bgCard: '#111622',
  bgSlate: '#161C2A',

  // Neon accents
  neonLime: '#BEF264',
  neonCyan: '#67E8F9',
  neonRed: '#FF4B4B',
  neonAmber: '#FFBF00',
  neonPurple: '#D8B4FE',

  // Glass system
  glass: 'rgba(255,255,255,0.03)',
  glassBorder: 'rgba(255,255,255,0.05)',
  glassMid: 'rgba(255,255,255,0.08)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: 'rgba(255,255,255,0.30)',
  textDisabled: 'rgba(255,255,255,0.20)',
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const typography = {
  display: "'Sora', sans-serif",
  body: "'Manrope', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const spacing = {
  screenX: '1.5rem',
  screenXLg: '2rem',
  screenTop: '3rem',
  cardPad: '2rem',
  cardPadSm: '1.5rem',
  navClear: '10rem',
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const radius = {
  card: '32px',
  cardMd: '24px',
  input: '16px',
  iconBox: '20px',
  pill: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const shadows = {
  lime: '0 4px 20px rgba(190,242,100,0.20)',
  limeStrong: '0 8px 24px -4px rgba(190,242,100,0.35)',
  cyan: '0 4px 20px rgba(103,232,249,0.15)',
  red: '0 4px 20px rgba(255,75,75,0.15)',
  glass: '0 10px 40px -10px rgba(0,0,0,0.30)',
  soft: '0 20px 50px -12px rgba(0,0,0,0.50)',
  nav: '0 20px 60px -12px rgba(0,0,0,0.60)',
} as const;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

export const animation = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '350ms ease',
  spring: '200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ---------------------------------------------------------------------------
// Z-index scale
// ---------------------------------------------------------------------------

export const zIndex = {
  nav: 100,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ---------------------------------------------------------------------------
// Touch targets (WCAG 2.5.5)
// ---------------------------------------------------------------------------

export const touchTarget = {
  sm: '44px',
  md: '48px',
  lg: '56px',
  xl: '64px',
} as const;

// ---------------------------------------------------------------------------
// Utility: className merging (zero-dependency)
// ---------------------------------------------------------------------------

export function cn(
  ...inputs: Array<string | false | null | undefined | 0 | ''>
): string {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    const parts = input.split(/\s+/);
    for (const part of parts) {
      if (part && !seen.has(part)) {
        seen.add(part);
        result.push(part);
      }
    }
  }

  return result.join(' ');
}
