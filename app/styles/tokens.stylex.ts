import { createTheme, defineVars } from '@stylexjs/stylex';

/**
 * Design system tokens using StyleX.
 * Follows strict typing as per SKILL.md.
 */
export const tokens = defineVars({
  // Semantic Colors
  bgColor: 'white',
  black: 'black',

  // Borders
  borderRadiusSm: '0.125rem',

  error: '#dc2626', // red-600
  errorHover: '#991b1b', // red-800
  fontSize4xl: '2.25rem',

  // Typography
  fontSizeXl: '1.25rem',
  fontWeightBold: '700',
  fontWeightSemibold: '600',

  info: '#2563eb', // blue-600
  infoHover: '#1e40af', // blue-800

  // Accent Colors (matching existing Tailwind usage: blue, green, purple, red)
  primary: '#2563eb', // blue-600
  primaryHover: '#1e40af', // blue-800

  purple: '#9333ea', // purple-600
  purpleHover: '#6b21a8', // purple-800

  // Spacing
  spacing1: '0.25rem',
  spacing2: '0.5rem',
  spacing4: '1rem',
  spacing8: '2rem',
  spacing16: '4rem',

  success: '#16a34a', // green-600
  successHover: '#166534', // green-800
  textAlign: 'center',
  textColor: '#1e293b', // slate-800 equivalent

  // Transitions
  transitionColors: 'color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',

  warning: '#ea580c', // orange-600 (approx)
  // Colors - Base Palette
  white: 'white',
});

/**
 * Dark Theme Override
 */
export const darkTheme = createTheme(tokens, {
  bgColor: '#0f172a', // slate-900 approx

  error: '#f87171', // red-400
  errorHover: '#fca5a5', // red-300

  info: '#60a5fa', // blue-400
  infoHover: '#93c5fd', // blue-300

  primary: '#60a5fa', // blue-400
  primaryHover: '#93c5fd', // blue-300

  purple: '#c084fc', // purple-400
  purpleHover: '#d8b4fe', // purple-300

  success: '#4ade80', // green-400
  successHover: '#86efac', // green-300
  textColor: '#e2e8f0', // slate-200
});
