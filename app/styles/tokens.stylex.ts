import { defineConsts, defineVars } from '@stylexjs/stylex';

export const themeConditions = defineConsts({
  dataThemeDark: ':root[data-theme="dark"]',
});

export const colorTokens = defineVars({
  amber200: '#fde68a',
  backgroundDark: '#0f172a',
  backgroundLight: 'white',
  bgColor: 'white',
  black: 'black',
  borderColor: '#e2e8f0',
  borderColorHover: '#cbd5e1',
  error: '#dc2626',
  errorHover: '#991b1b',
  info: '#2563eb',
  infoHover: '#1e40af',
  primary: '#2563eb',
  primaryHover: '#1e40af',
  purple: '#9333ea',
  purpleHover: '#6b21a8',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  success: '#16a34a',
  successHover: '#166534',
  textColor: '#111827',
  warning: '#d97706',
  warningHover: '#b45309',
  white: 'white',
});

export const fontWeightTokens = defineVars({
  fontWeightBold: '700',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
});
