import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const heroReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1.5rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

export const artworkDrift = keyframes({
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
  backgroundColor: colorTokens.info,
  borderRadius: '9999px',
  color: colorTokens.white,
  display: 'inline-grid',
  fontWeight: 600,
  gap: '0.5rem',
  gridAutoFlow: 'column',
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#bae6fd',
      color: colorTokens.slate900,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#7dd3fc',
    },
    '&:hover': {
      backgroundColor: colorTokens.infoHover,
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
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  borderColor: 'rgba(15, 23, 42, 0.12)',
  borderRadius: '9999px',
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
      borderColor: '#bfdbfe',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});

export const hero = style({
  backgroundColor: '#edf6ff',
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#08101b',
    },
  },
});

export const heroActions = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
});

export const heroBody = style({
  animationDelay: '160ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  color: colorTokens.slate800,
  fontSize: '1rem',
  lineHeight: 1.625,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '28rem',
  position: 'relative',
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
  maxWidth: '38rem',
  minWidth: 0,
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
  color: colorTokens.slate900,
  fontSize: '1.28rem',
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1.12,
  marginBlockEnd: '0.85rem',
  marginBlockStart: 0,
  maxWidth: '15ch',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
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
  backgroundImage: 'url("/assets/home-hero-light.svg")',
  backgroundPosition: '70% center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  inset: 0,
  opacity: 0.76,
  position: 'absolute',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage: 'url("/assets/home-hero-dark.svg")',
      opacity: 1,
    },
  },
  transformOrigin: 'center',
});

export const heroOverlay = style({
  backgroundImage:
    'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
  inset: 0,
  position: 'absolute',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
    },
  },
  zIndex: 1,
});

export const page = style({
  minInlineSize: 0,
  paddingBlockEnd: '4rem',
  position: 'relative',
});

export const routeAction = style({
  color: colorTokens.slate600,
  fontSize: '0.95rem',
  letterSpacing: '-0.025em',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
  transition: 'transform 0.2s ease, color 0.2s ease',
});

export const routeDescription = style({
  color: colorTokens.slate700,
  fontSize: '0.98rem',
  lineHeight: 1.375,
  margin: 0,
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const routeLink = style({
  '@media': {
    '(min-width: 960px)': {
      alignItems: 'center',
      gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
    },
  },
  alignItems: 'flex-start',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.95rem 1rem',
  gridTemplateColumns: '1fr',
  minInlineSize: 0,
  paddingBlockEnd: '1.45rem',
  paddingBlockStart: '1.45rem',
  paddingInlineEnd: '0.5rem',
  paddingInlineStart: '0.5rem',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: 'rgba(15, 23, 42, 0.22)',
    },
    '&:hover': {
      backgroundColor: 'rgba(248, 250, 252, 0.9)',
      transform: 'translate3d(0.35rem, 0, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
});

export const routeNumber = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '2rem',
    },
  },
  color: colorTokens.info,
  fontSize: '1.45rem',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
});

export const routePath = style({
  color: colorTokens.slate600,
  fontSize: '0.86rem',
  letterSpacing: '0.08em',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
});

export const routeRow = style({
  borderBottomColor: colorTokens.slate200,
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  minInlineSize: 0,
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderBottomColor: colorTokens.slate800,
    },
  },
});

export const routesInner = style({
  marginInline: 'auto',
  maxWidth: '84rem',
  minInlineSize: 0,
  paddingBlockStart: '3.5rem',
  paddingInline: '1rem',
  position: 'relative',
});

export const routesIntro = style({
  color: colorTokens.slate700,
  fontSize: '1rem',
  lineHeight: 1.625,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '34rem',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const routesList = style({
  borderTopColor: colorTokens.slate200,
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  minInlineSize: 0,
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderTopColor: colorTokens.slate800,
    },
  },
});

export const routesSection = style({
  position: 'relative',
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
  maxWidth: '12ch',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const routeTitle = style({
  color: colorTokens.slate900,
  fontSize: '1.45rem',
  fontWeight: 600,
  letterSpacing: '-0.04em',
  lineHeight: 1.1,
  marginBlockEnd: '0.3rem',
  marginBlockStart: 0,
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const routeTitleBlock = style({
  position: 'relative',
});

export const title = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '6.4rem',
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
  letterSpacing: '-0.04em',
  lineHeight: 0.84,
  marginBlockEnd: '1rem',
  marginBlockStart: 0,
  maxWidth: '7ch',
  position: 'relative',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const titleAccent = style({
  color: colorTokens.info,
  display: 'block',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
});
