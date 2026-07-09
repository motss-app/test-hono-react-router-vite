import { createGlobalTheme } from '@vanilla-extract/css';

import { colorTokens } from './color-tokens.contract.css.ts';
import { fontWeightTokens } from './font-weight-tokens.contract.css.ts';
import { radiusTokens } from './radius-tokens.contract.css.ts';

const commonColors = {
  amber200: '#fde68a',
  backgroundDark: '#0f172a',
  backgroundLight: 'white',
  black: 'black',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  white: 'white',
};

const commonFontWeights = {
  fontWeightBold: '700',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
};

// Light Theme (Default) — always available at :root
createGlobalTheme(':root', colorTokens, {
  ...commonColors,
  bgColor: 'white',
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
  success: '#16a34a',
  successHover: '#166534',
  textColor: '#111827',
  warning: '#d97706',
  warningHover: '#b45309',
});

createGlobalTheme(':root', fontWeightTokens, commonFontWeights);

createGlobalTheme(':root', radiusTokens, {
  radiusMd: '0.375rem',
  radiusSm: '0.25rem',
  radiusXs: '0.125rem',
  radiusXxs: '0.0625rem',
});

// Dark Theme — activates when [data-theme="dark"] is set on <html>
createGlobalTheme(':root[data-theme="dark"]', colorTokens, {
  ...commonColors,
  bgColor: '#0f172a',
  borderColor: '#334155',
  borderColorHover: '#475569',
  error: '#ef4444',
  errorHover: '#f87171',
  info: '#3b82f6',
  infoHover: '#60a5fa',
  primary: '#3b82f6',
  primaryHover: '#60a5fa',
  purple: '#a855f7',
  purpleHover: '#c084fc',
  success: '#22c55e',
  successHover: '#4ade80',
  textColor: '#f1f5f9',
  warning: '#f59e0b',
  warningHover: '#fbbf24',
});
