import { create } from '@stylexjs/stylex';

import { colorTokens, fontWeightTokens, themeConditions } from './styles/tokens.stylex.ts';

const vendorPrefixFontSmoothing = {
  mozOsxFontSmoothing: '-moz-osx-font-smoothing',
  webkitFontSmoothing: '-webkit-font-smoothing',
} as const;

export const globalStyles = create({
  body: {
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    margin: 0,
    minHeight: '100vh',
    [vendorPrefixFontSmoothing.mozOsxFontSmoothing]: 'grayscale',
    [vendorPrefixFontSmoothing.webkitFontSmoothing]: 'antialiased',
    backgroundColor: {
      [themeConditions.dataThemeDark]: colorTokens.backgroundDark,
      default: colorTokens.backgroundLight,
    },
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.textColor,
    },
  },
  html: {
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    margin: 0,
    padding: 0,
    textRendering: 'optimizeLegibility',
  },
});

export const errorStyles = create({
  container: {
    backgroundColor: colorTokens.backgroundDark,
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    maxWidth: '42rem',
    padding: '2rem',
    textAlign: 'center',
    width: '100%',
  },
  details: {
    color: colorTokens.slate200,
    fontSize: '1.25rem',
    marginBottom: '2rem',
  },
  icon: {
    fontSize: '3.75rem',
    marginBottom: '1rem',
  },
  iconBug: {
    color: '#f87171',
  },
  iconClientError: {
    color: colorTokens.warning,
  },
  iconServerError: {
    color: colorTokens.error,
  },
  link: {
    alignItems: 'center',
    backgroundColor: colorTokens.info,
    borderRadius: '0.5rem',
    color: colorTokens.white,
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
  },
  main: {
    alignItems: 'center',
    backgroundColor: colorTokens.backgroundDark,
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
  },
  stackDetails: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colorTokens.slate700,
    borderRadius: '0.125rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: '2rem',
    padding: '1rem',
    textAlign: 'left',
  },
  stackPre: {
    backgroundColor: colorTokens.slate800,
    borderRadius: '0.25rem',
    color: colorTokens.slate200,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'auto',
    padding: '1rem',
  },
  stackSummary: {
    alignItems: 'center',
    color: colorTokens.slate200,
    cursor: 'pointer',
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1rem',
  },
  titleClientError: {
    color: colorTokens.warning,
  },
  titleServerError: {
    color: colorTokens.error,
  },
});

export const utilities = create({
  linkReset: {
    ':hover': {
      textDecoration: 'underline',
    },
    textDecoration: 'none',
  },
  maxWidth2xl: {
    marginBlockEnd: '0px',
    marginBlockStart: '0px',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
  },
  paragraphSpacing: {
    marginBlock: '0.5rem',
  },
});
