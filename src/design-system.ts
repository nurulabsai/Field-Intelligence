/**
 * Design System Tokens — NuruOS Field Intelligence
 *
 * Extracted from styles/design-system.css.
 * This module exposes every design token as a typed JS object,
 * a ready-to-inject CSS custom-properties string, and a lightweight
 * className-merging helper.
 */

// ---------------------------------------------------------------------------
// Token definitions
// ---------------------------------------------------------------------------

export const tokens = {
  colors: {
    primary: {
      DEFAULT: '#111622',
      dark: '#0B0F19',
      darker: '#070A12',
      light: '#1A2033',
      lighter: '#232A3F',
    },
    secondary: {
      DEFAULT: '#BEF264',
      dark: '#A8D84E',
      light: '#D4F78E',
      lighter: '#1A2A0D',
    },
    accent: {
      DEFAULT: '#BEF264',
      dark: '#A8D84E',
      light: '#D4F78E',
    },
    cyan: {
      DEFAULT: '#67E8F9',
      dark: '#22D3EE',
      light: '#A5F3FC',
    },
    success: {
      DEFAULT: '#22C55E',
      light: '#86EFAC',
      lighter: '#0D2818',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FCD34D',
      lighter: '#2A2008',
    },
    error: {
      DEFAULT: '#EF4444',
      light: '#FCA5A5',
      lighter: '#2A1010',
    },
    info: {
      DEFAULT: '#3B82F6',
      light: '#93C5FD',
      lighter: '#0D1A2A',
    },
    white: '#FFFFFF',
    gray: {
      50: '#0D1520',
      100: '#111622',
      200: 'rgba(255,255,255,0.08)',
      300: 'rgba(255,255,255,0.12)',
      400: '#6B7280',
      500: '#9CA3AF',
      600: '#D1D5DB',
      700: '#E5E7EB',
      800: '#F3F4F6',
      900: '#FFFFFF',
    },
    bg: {
      primary: '#0B0F19',
      secondary: '#111622',
      tertiary: '#1A2033',
      dark: '#070A12',
      overlay: 'rgba(0,0,0,0.7)',
      card: '#111622',
      input: '#0D1520',
      glass: 'rgba(17,22,34,0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.72)',
      tertiary: '#6B7280',
      inverse: '#0B0F19',
      onPrimary: '#FFFFFF',
      onSecondary: '#000000',
      accent: '#BEF264',
    },
    border: {
      DEFAULT: 'rgba(255,255,255,0.08)',
      light: 'rgba(255,255,255,0.04)',
      dark: 'rgba(255,255,255,0.12)',
      focus: '#BEF264',
      glass: 'rgba(255,255,255,0.06)',
    },
  },

  typography: {
    fontFamily: {
      heading: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      base: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'IBM Plex Mono', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  borderWidth: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },

  borderRadius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.3)',
    md: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.5)',
    glowAccent: '0 0 20px rgba(190,242,100,0.15)',
    glowAccentLg: '0 0 40px rgba(190,242,100,0.25)',
    glass: '0 8px 32px rgba(0,0,0,0.4)',
  },

  glass: {
    bg: 'rgba(17,22,34,0.8)',
    border: 'rgba(255,255,255,0.06)',
    blur: 'blur(16px)',
    blurLg: 'blur(24px)',
  },

  transitions: {
    fast: '100ms ease-in-out',
    base: '150ms ease-in-out',
    slow: '250ms ease-in-out',
    spring: '150ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  touchTarget: {
    sm: '48px',
    md: '56px',
    lg: '64px',
  },
} as const;

// ---------------------------------------------------------------------------
// CSS custom properties string (inject via <style> or import in CSS)
// ---------------------------------------------------------------------------

export const cssVariables = `
:root {
  /* Colors — Primary */
  --color-primary: ${tokens.colors.primary.DEFAULT};
  --color-primary-dark: ${tokens.colors.primary.dark};
  --color-primary-darker: ${tokens.colors.primary.darker};
  --color-primary-light: ${tokens.colors.primary.light};
  --color-primary-lighter: ${tokens.colors.primary.lighter};

  /* Colors — Secondary */
  --color-secondary: ${tokens.colors.secondary.DEFAULT};
  --color-secondary-dark: ${tokens.colors.secondary.dark};
  --color-secondary-light: ${tokens.colors.secondary.light};
  --color-secondary-lighter: ${tokens.colors.secondary.lighter};

  /* Colors — Accent */
  --color-accent: ${tokens.colors.accent.DEFAULT};
  --color-accent-dark: ${tokens.colors.accent.dark};
  --color-accent-light: ${tokens.colors.accent.light};

  /* Semantic */
  --color-success: ${tokens.colors.success.DEFAULT};
  --color-success-light: ${tokens.colors.success.light};
  --color-success-lighter: ${tokens.colors.success.lighter};

  --color-warning: ${tokens.colors.warning.DEFAULT};
  --color-warning-light: ${tokens.colors.warning.light};
  --color-warning-lighter: ${tokens.colors.warning.lighter};

  --color-error: ${tokens.colors.error.DEFAULT};
  --color-error-light: ${tokens.colors.error.light};
  --color-error-lighter: ${tokens.colors.error.lighter};

  --color-info: ${tokens.colors.info.DEFAULT};
  --color-info-light: ${tokens.colors.info.light};
  --color-info-lighter: ${tokens.colors.info.lighter};

  /* Neutrals */
  --color-white: ${tokens.colors.white};
  --color-gray-50: ${tokens.colors.gray[50]};
  --color-gray-100: ${tokens.colors.gray[100]};
  --color-gray-200: ${tokens.colors.gray[200]};
  --color-gray-300: ${tokens.colors.gray[300]};
  --color-gray-400: ${tokens.colors.gray[400]};
  --color-gray-500: ${tokens.colors.gray[500]};
  --color-gray-600: ${tokens.colors.gray[600]};
  --color-gray-700: ${tokens.colors.gray[700]};
  --color-gray-800: ${tokens.colors.gray[800]};
  --color-gray-900: ${tokens.colors.gray[900]};

  /* Backgrounds */
  --color-bg-primary: ${tokens.colors.bg.primary};
  --color-bg-secondary: ${tokens.colors.bg.secondary};
  --color-bg-tertiary: ${tokens.colors.bg.tertiary};
  --color-bg-dark: ${tokens.colors.bg.dark};
  --color-bg-overlay: ${tokens.colors.bg.overlay};
  --color-bg-card: ${tokens.colors.bg.card};
  --color-bg-input: ${tokens.colors.bg.input};
  --color-bg-glass: ${tokens.colors.bg.glass};

  /* Text */
  --color-text-primary: ${tokens.colors.text.primary};
  --color-text-secondary: ${tokens.colors.text.secondary};
  --color-text-tertiary: ${tokens.colors.text.tertiary};
  --color-text-inverse: ${tokens.colors.text.inverse};
  --color-text-on-primary: ${tokens.colors.text.onPrimary};
  --color-text-on-secondary: ${tokens.colors.text.onSecondary};
  --color-text-accent: ${tokens.colors.text.accent};

  /* Border */
  --color-border: ${tokens.colors.border.DEFAULT};
  --color-border-light: ${tokens.colors.border.light};
  --color-border-dark: ${tokens.colors.border.dark};
  --color-border-focus: ${tokens.colors.border.focus};
  --color-border-glass: ${tokens.colors.border.glass};

  /* Typography */
  --font-family-heading: ${tokens.typography.fontFamily.heading};
  --font-family-base: ${tokens.typography.fontFamily.base};
  --font-family-mono: ${tokens.typography.fontFamily.mono};

  --font-size-xs: ${tokens.typography.fontSize.xs};
  --font-size-sm: ${tokens.typography.fontSize.sm};
  --font-size-base: ${tokens.typography.fontSize.base};
  --font-size-lg: ${tokens.typography.fontSize.lg};
  --font-size-xl: ${tokens.typography.fontSize.xl};
  --font-size-2xl: ${tokens.typography.fontSize['2xl']};
  --font-size-3xl: ${tokens.typography.fontSize['3xl']};
  --font-size-4xl: ${tokens.typography.fontSize['4xl']};

  --font-weight-normal: ${tokens.typography.fontWeight.normal};
  --font-weight-medium: ${tokens.typography.fontWeight.medium};
  --font-weight-semibold: ${tokens.typography.fontWeight.semibold};
  --font-weight-bold: ${tokens.typography.fontWeight.bold};

  --line-height-tight: ${tokens.typography.lineHeight.tight};
  --line-height-normal: ${tokens.typography.lineHeight.normal};
  --line-height-relaxed: ${tokens.typography.lineHeight.relaxed};

  /* Spacing */
  --spacing-xs: ${tokens.spacing.xs};
  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
  --spacing-xl: ${tokens.spacing.xl};
  --spacing-2xl: ${tokens.spacing['2xl']};
  --spacing-3xl: ${tokens.spacing['3xl']};

  /* Borders */
  --border-width-thin: ${tokens.borderWidth.thin};
  --border-width-medium: ${tokens.borderWidth.medium};
  --border-width-thick: ${tokens.borderWidth.thick};

  --radius-sm: ${tokens.borderRadius.sm};
  --radius-md: ${tokens.borderRadius.md};
  --radius-lg: ${tokens.borderRadius.lg};
  --radius-xl: ${tokens.borderRadius.xl};
  --radius-2xl: ${tokens.borderRadius['2xl']};
  --radius-full: ${tokens.borderRadius.full};

  /* Shadows */
  --shadow-sm: ${tokens.shadows.sm};
  --shadow-md: ${tokens.shadows.md};
  --shadow-lg: ${tokens.shadows.lg};
  --shadow-xl: ${tokens.shadows.xl};
  --shadow-2xl: ${tokens.shadows['2xl']};
  --shadow-glow-accent: ${tokens.shadows.glowAccent};
  --shadow-glow-accent-lg: ${tokens.shadows.glowAccentLg};

  /* Cyan */
  --color-cyan: ${tokens.colors.cyan.DEFAULT};
  --color-cyan-dark: ${tokens.colors.cyan.dark};
  --color-cyan-light: ${tokens.colors.cyan.light};
  --shadow-glass: ${tokens.shadows.glass};

  /* Glass */
  --glass-bg: ${tokens.glass.bg};
  --glass-border: ${tokens.glass.border};
  --glass-blur: ${tokens.glass.blur};
  --glass-blur-lg: ${tokens.glass.blurLg};

  /* Transitions */
  --transition-fast: ${tokens.transitions.fast};
  --transition-base: ${tokens.transitions.base};
  --transition-slow: ${tokens.transitions.slow};
  --transition-spring: ${tokens.transitions.spring};

  /* Z-Index */
  --z-dropdown: ${tokens.zIndex.dropdown};
  --z-sticky: ${tokens.zIndex.sticky};
  --z-fixed: ${tokens.zIndex.fixed};
  --z-modal-backdrop: ${tokens.zIndex.modalBackdrop};
  --z-modal: ${tokens.zIndex.modal};
  --z-popover: ${tokens.zIndex.popover};
  --z-tooltip: ${tokens.zIndex.tooltip};

  /* Touch targets */
  --touch-target-sm: ${tokens.touchTarget.sm};
  --touch-target-md: ${tokens.touchTarget.md};
  --touch-target-lg: ${tokens.touchTarget.lg};
}
`.trim();

// ---------------------------------------------------------------------------
// Utility: className merging (zero-dependency)
// ---------------------------------------------------------------------------

/**
 * Merge class name values, filtering out falsy entries and deduplicating.
 *
 * @example
 *   cn('btn', isActive && 'btn-active', undefined, 'px-4')
 *   // => 'btn btn-active px-4'
 */
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
