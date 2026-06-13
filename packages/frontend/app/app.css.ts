import { globalStyle, style } from '@vanilla-extract/css';

import { colorTokens, fontWeightTokens } from './styles/tokens.css.ts';

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
    borderRadius: '1rem',
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
    borderRadius: '0.5rem',
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
    borderRadius: '0.125rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: '2rem',
    padding: '1rem',
    textAlign: 'left',
  }),
  stackPre: style({
    backgroundColor: colorTokens.slate800,
    borderRadius: '0.25rem',
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
