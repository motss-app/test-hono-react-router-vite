import { globalStyle, style } from '@vanilla-extract/css';

import { colorTokens } from './styles/color-tokens.contract.css.ts';
import { fontWeightTokens } from './styles/font-weight-tokens.contract.css.ts';
import './styles/global-themes.css.ts';

// Global Styles
globalStyle('html', {
  boxSizing: 'border-box',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.5,
  margin: 0,
  padding: 0,
  textRendering: 'optimizeLegibility',
});

globalStyle('body', {
  backgroundColor: colorTokens.backgroundLight,
  color: colorTokens.textColor,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  MozOsxFontSmoothing: 'grayscale',
  margin: 0,
  minHeight: '100vh',
  WebkitFontSmoothing: 'antialiased',
});

globalStyle(':root[data-theme="dark"] body', {
  backgroundColor: colorTokens.backgroundDark,
  color: colorTokens.slate200,
});

// Named Styles
export const errorStyles = {
  container: style({
    backgroundColor: colorTokens.backgroundDark,
    borderRadius: '0.375rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    maxWidth: '42rem',
    padding: '2rem',
    textAlign: 'center',
    width: '100%',
  }),
  details: style({
    color: colorTokens.slate200,
    fontSize: '1.25rem',
    marginBottom: '2rem',
  }),
  icon: style({
    fontSize: '3.75rem',
    marginBottom: '1rem',
  }),
  iconBug: style({
    color: '#f87171',
  }),
  iconClientError: style({
    color: colorTokens.warning,
  }),
  iconServerError: style({
    color: colorTokens.error,
  }),
  link: style({
    alignItems: 'center',
    backgroundColor: colorTokens.info,
    borderRadius: '0.375rem',
    color: colorTokens.white,
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
  }),
  main: style({
    alignItems: 'center',
    backgroundColor: colorTokens.backgroundDark,
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
  }),
  stackDetails: style({
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colorTokens.slate700,
    borderRadius: '0.0625rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: '2rem',
    padding: '1rem',
    textAlign: 'left',
  }),
  stackPre: style({
    backgroundColor: colorTokens.slate800,
    borderRadius: '0.125rem',
    color: colorTokens.slate200,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'auto',
    padding: '1rem',
  }),
  stackSummary: style({
    alignItems: 'center',
    color: colorTokens.slate200,
    cursor: 'pointer',
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    marginBottom: '1rem',
  }),
  title: style({
    fontSize: '2.25rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1rem',
  }),
  titleClientError: style({
    color: colorTokens.warning,
  }),
  titleServerError: style({
    color: colorTokens.error,
  }),
};

export const utilities = {
  linkReset: style({
    selectors: {
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    textDecoration: 'none',
  }),
  maxWidth2xl: style({
    marginBlockEnd: '0px',
    marginBlockStart: '0px',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
  }),
  paragraphSpacing: style({
    marginBlock: '0.5rem',
  }),
};

// Locale Switcher
globalStyle('.locale-switcher-trigger', {
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: `1px solid ${colorTokens.borderColor}`,
  borderRadius: '0.375rem',
  color: 'inherit',
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '0.875rem',
  fontWeight: 500,
  gap: '0.25rem',
  maxWidth: 'fit-content',
  padding: '0.5rem 0.875rem',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
});

globalStyle('.locale-switcher-trigger:hover', {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderColor: 'rgba(255, 255, 255, 0.3)',
});

globalStyle('.locale-switcher-trigger:focus-visible', {
  outline: `2px solid ${colorTokens.primary}`,
  outlineOffset: '2px',
});

globalStyle('.locale-switcher-popup', {
  backgroundColor: colorTokens.slate800,
  border: `1px solid ${colorTokens.borderColor}`,
  borderRadius: '0.375rem',
  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
  listStyle: 'none',
  margin: 0,
  minWidth: '150px',
  overflow: 'hidden',
  padding: '0.375rem',
  zIndex: 1000,
});

globalStyle('.locale-switcher-item', {
  alignItems: 'center',
  borderRadius: '0.25rem',
  color: colorTokens.slate200,
  cursor: 'pointer',
  display: 'flex',
  fontSize: '0.875rem',
  fontWeight: 500,
  gap: '0.5rem',
  justifyContent: 'space-between',
  listStyle: 'none',
  padding: '0.5rem 0.75rem',
  transition: 'background-color 0.1s ease',
  whiteSpace: 'nowrap',
});

globalStyle('.locale-switcher-item:hover', {
  backgroundColor: colorTokens.slate700,
});

globalStyle('.locale-switcher-item:focus-visible', {
  outline: `2px solid ${colorTokens.primary}`,
  outlineOffset: '-2px',
});

globalStyle('.locale-switcher-item[aria-selected="true"]', {
  backgroundColor: colorTokens.slate700,
  color: colorTokens.slate100,
});

globalStyle('.locale-switcher-item[aria-selected="true"]:hover', {
  backgroundColor: colorTokens.slate600,
});

globalStyle('.locale-switcher-check', {
  color: colorTokens.slate400,
  flexShrink: 0,
  fontSize: '0.875rem',
  fontWeight: 400,
  marginInlineStart: 'auto',
});

// Locale Switcher Icon (replaces inline style="display:block" on SVG icons)
globalStyle('.locale-switcher-icon', {
  display: 'block',
});

// Locale Switcher Suspense Fallback (replaces inline style on Suspense fallback span)
globalStyle('.locale-switcher-fallback', {
  fontSize: '0.875rem',
  opacity: 0.6,
});
