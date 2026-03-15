import { create } from '@stylexjs/stylex';

import { themeConditions, tokens } from './styles/tokens.stylex.ts';

const vendorPrefixFontSmoothing = {
  mozOsxFontSmoothing: '-moz-osx-font-smoothing',
  webkitFontSmoothing: '-webkit-font-smoothing',
} as const;

export const globalStyles = create({
  body: {
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    margin: 0,
    [vendorPrefixFontSmoothing.mozOsxFontSmoothing]: 'grayscale',
    [vendorPrefixFontSmoothing.webkitFontSmoothing]: 'antialiased',
    backgroundColor: {
      [themeConditions.dataThemeDark]: tokens.backgroundDark,
      [themeConditions.prefersDarkMode]: tokens.backgroundDark,
      default: tokens.backgroundLight,
    },
    color: {
      [themeConditions.dataThemeDark]: tokens.slate200,
      [themeConditions.prefersDarkMode]: tokens.slate200,
      default: tokens.textColor,
    },
  },
  global: {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
});

export const errorStyles = create({
  container: {
    backgroundColor: tokens.backgroundDark,
    borderRadius: tokens.borderRadius2xl,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    maxWidth: tokens.maxWidth2xl,
    padding: tokens.spacing8,
    textAlign: tokens.textAlign,
    width: '100%',
  },
  details: {
    color: tokens.slate200,
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
  },
  icon: {
    fontSize: '3.75rem',
    marginBottom: tokens.spacing4,
  },
  iconBug: {
    color: '#f87171',
  },
  iconClientError: {
    color: tokens.warning,
  },
  iconServerError: {
    color: tokens.error,
  },
  link: {
    alignItems: 'center',
    backgroundColor: tokens.info,
    borderRadius: tokens.borderRadiusLg,
    color: tokens.white,
    display: 'inline-flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
  },
  main: {
    alignItems: 'center',
    backgroundColor: tokens.backgroundDark,
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacing4,
  },
  stackDetails: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: tokens.borderRadiusSm,
    marginBottom: tokens.spacing8,
    padding: tokens.spacing4,
    textAlign: 'left',
  },
  stackPre: {
    backgroundColor: tokens.slate800,
    borderRadius: tokens.borderRadius,
    color: tokens.slate200,
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeSm,
    overflow: 'auto',
    padding: tokens.spacing4,
  },
  stackSummary: {
    alignItems: 'center',
    color: tokens.slate200,
    cursor: 'pointer',
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    marginBottom: tokens.spacing4,
  },
  title: {
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing4,
  },
  titleClientError: {
    color: tokens.warning,
  },
  titleServerError: {
    color: tokens.error,
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
    maxWidth: tokens.maxWidth2xl,
  },
  paragraphSpacing: {
    marginBlock: tokens.spacing2,
  },
});
