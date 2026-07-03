import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { fontWeightTokens } from '../styles/font-weight-tokens.contract.css.ts';

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

const artworkDrift = keyframes({
  '0%': {
    transform: 'scale(1.02) translate3d(0, 0, 0)',
  },
  '50%': {
    transform: 'scale(1.05) translate3d(-0.75%, 0.5%, 0)',
  },
  '100%': {
    transform: 'scale(1.03) translate3d(-0.25%, -0.35%, 0)',
  },
});

export const ctaPrimary = style({
  alignItems: 'center',
  animationDelay: '240ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: '#f59e0b',
  borderRadius: '9999px',
  color: colorTokens.slate900,
  display: 'inline-grid',
  fontWeight: fontWeightTokens.fontWeightSemibold,
  gap: '0.5rem',
  gridAutoFlow: 'column',
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#fcd34d',
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#fde68a',
    },
    '&:hover': {
      backgroundColor: '#d97706',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});
export const ctaSecondary = style({
  alignItems: 'center',
  animationDelay: '320ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: 'rgba(255, 255, 255, 0.82)',
  borderColor: 'rgba(120, 53, 15, 0.12)',
  borderRadius: '9999px',
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  display: 'inline-grid',
  fontWeight: fontWeightTokens.fontWeightSemibold,
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
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: '#fed7aa',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});
export const hero = style({
  backgroundColor: '#fff7ed',
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#140d07',
    },
  },
});
export const heroActions = style({
  display: 'inline-grid',
  gap: '0.75rem',
  gridAutoFlow: 'column',
  justifyContent: 'flex-start',
});
export const heroBody = style({
  animationDelay: '160ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  color: '#7c2d12',
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
export const heroCopy = style({
  '@media': {
    '(min-width: 768px)': {
      paddingBottom: '4rem',
    },
  },
  maxWidth: '40rem',
  minInlineSize: 0,
  paddingBlockEnd: '2.5rem',
  position: 'relative',
  zIndex: 2,
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
  color: '#9a3412',
  fontSize: '1.28rem',
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1.12,
  marginBlockEnd: '0.85rem',
  marginBlockStart: 0,
  maxWidth: '17ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fde68a',
    },
  },
});
export const heroMedia = style({
  '@media': {
    '(min-width: 768px)': {
      backgroundPosition: 'center center',
    },
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: 1,
    },
  },
  animationDirection: 'alternate',
  animationDuration: '18s',
  animationIterationCount: 'infinite',
  animationName: artworkDrift,
  animationTimingFunction: 'ease-in-out',
  backgroundImage: 'url("/assets/errors-hero-light.svg")',
  backgroundPosition: '74% center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  inset: 0,
  opacity: 0.82,
  position: 'absolute',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage: 'url("/assets/errors-hero-dark.svg")',
      opacity: 1,
    },
  },
  transformOrigin: 'center',
});
export const heroOverlay = style({
  backgroundImage:
    'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  inset: 0,
  position: 'absolute',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
    },
  },
  zIndex: 1,
});
export const page = style({
  minInlineSize: 0,
  paddingBlockEnd: '4rem',
});
export const routesInner = style({
  marginInline: 'auto',
  maxWidth: '84rem',
  minInlineSize: 0,
  paddingBlockStart: '3.5rem',
  paddingInline: '1rem',
});
export const routesIntro = style({
  color: '#7c2d12',
  fontSize: '1rem',
  lineHeight: 1.7,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '37rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const routesList = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: '#fdba74',
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});
export const routesTitle = style({
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
  maxWidth: '13ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const rowBody = style({
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
export const rowCode = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '2rem',
    },
  },
  fontSize: '1.45rem',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 1.0,
});
export const rowCodeCriticalBase = style({
  color: '#dc2626',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});
export const rowCodeRuntimeBase = style({
  color: '#0891b2',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#67e8f9',
    },
  },
});
export const rowCodeWarningBase = style({
  color: '#d97706',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fde68a',
    },
  },
});
export const rowContent = style({
  minInlineSize: 0,
});
export const rowDetail = style({
  color: colorTokens.slate700,
  display: 'grid',
  gap: '0.75rem',
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const rowDetailText = style({
  color: colorTokens.slate700,
  fontSize: '0.98rem',
  lineHeight: 1.65,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const rowLink = style({
  display: 'inline-grid',
  fontWeight: 600,
  gap: '0.5rem',
  gridAutoColumns: 'max-content',
  gridAutoFlow: 'column',
  inlineSize: 'fit-content',
  textDecoration: 'none',
});
export const rowLinkCritical = style({
  color: '#dc2626',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});
export const rowLinkRuntime = style({
  color: '#0891b2',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#67e8f9',
    },
  },
});
export const rowLinkWarning = style({
  color: '#d97706',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fde68a',
    },
  },
});
export const rowPanel = style({
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '6rem minmax(0, 19rem) minmax(0, 1fr)',
    },
  },
  alignItems: 'flex-start',
  display: 'grid',
  gap: '1rem 1rem',
  gridTemplateColumns: '1fr',
  minInlineSize: 0,
  paddingBlockEnd: '1.45rem',
  paddingBlockStart: '1.45rem',
  paddingInlineEnd: '0.5rem',
  paddingInlineStart: '0.5rem',
});
export const rowRow = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: '#fed7aa',
  minInlineSize: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});
export const rowTitle = style({
  color: colorTokens.slate900,
  fontSize: '1.45rem',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBlockEnd: '0.3rem',
  marginBlockStart: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const sectionSpacer = style({
  marginTop: '3.5rem',
});
export const statusLabel = style({
  color: '#9a3412',
  fontSize: '0.86rem',
  letterSpacing: '0.08em',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
});
export const title = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '6.2rem',
    },
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: 1,
    },
  },
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  color: colorTokens.slate900,
  fontSize: '3.95rem',
  fontWeight: 700,
  letterSpacing: '-0.07em',
  lineHeight: 0.84,
  marginBlockEnd: '1rem',
  marginBlockStart: 0,
  maxWidth: '7ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const titleAccent = style({
  color: '#d97706',
  display: 'block',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fde68a',
    },
  },
});

export const toneStyles = {
  critical: {
    code: rowCodeCriticalBase,
    link: rowLinkCritical,
  },
  runtime: {
    code: rowCodeRuntimeBase,
    link: rowLinkRuntime,
  },
  warning: {
    code: rowCodeWarningBase,
    link: rowLinkWarning,
  },
};

export const routesIntroSpacer = style({});

export const rowCodeCritical = style({});
export const rowCodeRuntime = style({});
export const rowCodeWarning = style({});
