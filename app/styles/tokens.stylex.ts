import { createTheme, defineVars } from '@stylexjs/stylex';

/**
 * Design system tokens using StyleX.
 * Using CSS custom properties for dark mode support via .dark class.
 */
export const tokens = defineVars({
  // Colors - Amber (for navigation border)
  amber200: '#fde68a',
  backgroundDark: '#0f172a', // slate-900
  backgroundLight: 'white',
  // Colors - Backgrounds
  bgColor: 'white',
  black: 'black',

  // Colors - Borders
  borderColor: '#e2e8f0', // slate-200
  borderColorHover: '#cbd5e1', // slate-300
  borderRadius: '0.25rem', // rounded
  borderRadius2xl: '1rem', // rounded-2xl
  borderRadiusLg: '0.5rem', // rounded-lg

  // Layout - Border Radius
  borderRadiusSm: '0.125rem', // rounded-sm
  borderRadiusXl: '0.75rem', // rounded-xl

  // Colors - Semantic
  error: '#dc2626', // red-600
  errorHover: '#991b1b', // red-800
  fontSize2xl: '1.5rem', // text-2xl
  fontSize3xl: '1.875rem', // text-3xl

  // Typography - Sizes
  fontSize4xl: '2.25rem', // text-4xl
  fontSizeLg: '1.125rem', // text-lg
  fontSizeSm: '0.875rem', // text-sm
  fontSizeXl: '1.25rem', // text-xl

  // Typography - Weights
  fontWeightBold: '700',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  info: '#2563eb', // blue-600
  infoHover: '#1e40af', // blue-800
  lineHeightNormal: '1.5',

  // Typography - Line heights
  lineHeightRelaxed: '1.625', // leading-relaxed
  lineHeightTight: '1.25',

  // Layout - Max Widths
  maxWidth2xl: '42rem', // max-w-2xl
  maxWidth4xl: '56rem', // max-w-4xl
  purple: '#9333ea', // purple-600
  purpleHover: '#6b21a8', // purple-800
  slate100: '#f1f5f9',
  slate200: '#e2e8f0', // heading dark mode
  slate300: '#cbd5e1',
  slate400: '#94a3b8', // body text dark mode
  slate500: '#64748b',
  slate600: '#475569', // body text light mode
  slate700: '#334155',
  slate800: '#1e293b',

  // Colors - Slate (precise Tailwind shades)
  slate900: '#0f172a',

  // Layout - Spacing
  spacing1: '0.25rem',
  spacing2: '0.5rem',
  spacing3: '0.75rem',
  spacing4: '1rem',
  spacing6: '1.5rem',
  spacing8: '2rem',
  spacing12: '3rem',
  spacing16: '4rem',
  success: '#16a34a', // green-600
  successHover: '#166534', // green-800

  // Layout - Other
  textAlign: 'center',

  // Transitions
  transitionColors: 'color 0.15s ease-in-out',
  warning: '#d97706', // amber-600
  warningHover: '#b45309', // amber-700

  // Base
  white: 'white',
});

export const darkTokens = defineVars({
  backgroundDark: '#0f172a',
  backgroundLight: 'white',
  bgColor: '#0f172a',
  error: '#f87171',
  errorHover: '#fca5a5',
  info: '#60a5fa',
  infoHover: '#93c5fd',
  purple: '#c084fc',
  purpleHover: '#d8b4fe',
  slate200: '#ffffff',
  slate400: '#94a3b8',
  slate600: '#475569',
  slate800: '#1e293b',
  slate900: '#0f172a',
  success: '#4ade80',
  successHover: '#86efac',
  warning: '#fbbf24',
  warningHover: '#fcd34d',
});

/**
 * Dark Theme Override
 * Note: StyleX doesn't support dark mode per-component with class-based switching.
 * We use CSS media queries instead for proper dark mode support.
 */
export const darkTheme = createTheme(tokens, {
  // Dark mode uses CSS @media (prefers-color-scheme: dark) - defined in global styles
  // These overrides are placeholders if we need explicit class-based dark mode
});
