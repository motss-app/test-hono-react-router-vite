import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { radiusTokens } from '../styles/radius-tokens.contract.css.ts';

const heroReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1.5rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

export const page = style({
  minInlineSize: 0,
  paddingBlockEnd: '4rem',
});

export const hero = style({
  backgroundColor: '#f4f1ff',
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#0b0a18',
    },
  },
});

export const heroInner = style({
  '@media': {
    '(min-width: 768px)': {
      paddingBottom: 0,
    },
  },
  alignItems: 'flex-end',
  display: 'grid',
  marginInline: 'auto',
  maxWidth: '84rem',
  minBlockSize: '100svh',
  minInlineSize: 0,
  paddingBlockEnd: '2rem',
  paddingBlockStart: '4rem',
  paddingInline: '1rem',
  position: 'relative',
});

export const heroCopy = style({
  '@media': {
    '(min-width: 768px)': {
      paddingBottom: '4rem',
    },
  },
  maxWidth: '38rem',
  minInlineSize: 0,
  paddingBlockEnd: '2.5rem',
  position: 'relative',
  zIndex: 2,
});

export const title = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '3.4rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '2.6rem',
  fontWeight: 700,
  letterSpacing: '-0.045em',
  lineHeight: 1.02,
  marginBlockEnd: '1rem',
  marginBlockStart: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const titleAccent = style({
  color: colorTokens.purple,
  display: 'block',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#c4b5fd',
    },
  },
});

export const heroLead = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '1.95rem',
    },
  },
  animationDelay: '110ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  color: colorTokens.slate900,
  fontSize: '1.28rem',
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1.12,
  marginBlockEnd: '0.85rem',
  marginBlockStart: 0,
  maxWidth: '22ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});

export const heroBody = style({
  animationDelay: '160ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  color: colorTokens.slate800,
  fontSize: '1rem',
  lineHeight: 1.7,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '31rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const heroActions = style({
  display: 'inline-grid',
  gap: '0.75rem',
  gridAutoFlow: 'column',
  justifyContent: 'flex-start',
});

export const ctaSecondary = style({
  alignItems: 'center',
  animationDelay: '320ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  borderColor: 'rgba(15, 23, 42, 0.12)',
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  display: 'inline-grid',
  fontWeight: 600,
  gap: '0.5rem',
  gridAutoFlow: 'column',
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.28)',
      borderColor: 'rgba(226, 232, 240, 0.26)',
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: colorTokens.slate400,
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: '#c4b5fd',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});

export const labInner = style({
  marginInline: 'auto',
  maxWidth: '84rem',
  minInlineSize: 0,
  paddingBlockStart: '3.5rem',
  paddingInline: '1rem',
});

export const sectionTitle = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '2.6rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 0.98,
  marginBlockEnd: '0.75rem',
  marginBlockStart: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const sectionIntro = style({
  color: colorTokens.slate700,
  fontSize: '1rem',
  lineHeight: 1.7,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '34rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const toolList = style({
  borderTopColor: colorTokens.slate200,
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      borderTopColor: colorTokens.slate800,
    },
  },
});

export const toolRow = style({
  borderBottomColor: colorTokens.slate200,
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      borderBottomColor: colorTokens.slate800,
    },
  },
});

export const toolPanel = style({
  '@media': {
    '(min-width: 960px)': {
      gridTemplateColumns: '5.5rem minmax(0, 1fr) auto',
    },
  },
  alignItems: 'center',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: '1fr',
  minInlineSize: 0,
  paddingBlockEnd: '1.45rem',
  paddingBlockStart: '1.45rem',
  paddingInlineEnd: '0.5rem',
  paddingInlineStart: '0.5rem',
});

export const toolNumber = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '2rem',
    },
  },
  color: colorTokens.purple,
  fontSize: '1.45rem',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#c4b5fd',
    },
  },
});

export const toolContent = style({
  minInlineSize: 0,
});

export const toolTitle = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '1.35rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '1.15rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  marginBlockEnd: '0.35rem',
  marginBlockStart: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});

export const toolBody = style({
  color: colorTokens.slate700,
  fontSize: '0.98rem',
  lineHeight: 1.65,
  margin: 0,
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const toolLink = style({
  alignItems: 'center',
  backgroundColor: 'transparent',
  borderColor: colorTokens.borderColor,
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  display: 'inline-grid',
  fontWeight: 600,
  justifyContent: 'center',
  padding: '0.6rem 1.1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate700,
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      borderColor: '#c4b5fd',
    },
    '&:hover': {
      borderColor: colorTokens.purple,
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});

export const footerNote = style({
  borderTopColor: colorTokens.slate200,
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  color: colorTokens.slate600,
  fontSize: '0.9rem',
  lineHeight: 1.7,
  marginBlockStart: '1rem',
  maxWidth: '46rem',
  paddingBlockStart: '1.5rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderTopColor: colorTokens.slate800,
      color: colorTokens.slate400,
    },
  },
});

export const codeInline = style({
  backgroundColor: 'rgba(148, 163, 184, 0.16)',
  borderRadius: radiusTokens.radiusXxs,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em',
  padding: '0.1rem 0.35rem',
});
