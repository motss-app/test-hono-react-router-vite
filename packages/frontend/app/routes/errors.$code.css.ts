import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';

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
  backgroundColor: '#b91c1c',
  borderRadius: '0.375rem',
  color: colorTokens.white,
  display: 'inline-grid',
  fontWeight: 600,
  gap: '0.5rem',
  gridAutoFlow: 'column',
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#ef4444',
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#fca5a5',
    },
    '&:hover': {
      backgroundColor: '#dc2626',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});

export const ctaPrimaryRuntime = style({
  backgroundColor: '#0891b2',
  color: colorTokens.white,
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#67e8f9',
      color: colorTokens.slate900,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#a5f3fc',
    },
    '&:hover': {
      backgroundColor: '#0284c7',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
});

export const ctaPrimaryWarning = style({
  backgroundColor: '#f59e0b',
  color: colorTokens.slate900,
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
});

export const ctaSecondary = style({
  alignItems: 'center',
  animationDelay: '320ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: heroReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: 'rgba(255, 255, 255, 0.84)',
  borderColor: 'rgba(127, 29, 29, 0.12)',
  borderRadius: '0.375rem',
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
      borderColor: colorTokens.slate400,
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: '#fecaca',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});

export const ctaSecondaryRuntime = style({
  backgroundColor: 'rgba(255, 255, 255, 0.84)',
  borderColor: 'rgba(8, 145, 178, 0.14)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.28)',
      borderColor: 'rgba(103, 232, 249, 0.28)',
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      borderColor: '#67e8f9',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: '#7dd3fc',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
});

export const ctaSecondaryWarning = style({
  backgroundColor: 'rgba(255, 255, 255, 0.84)',
  borderColor: 'rgba(120, 53, 15, 0.12)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.28)',
      borderColor: 'rgba(226, 232, 240, 0.26)',
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      borderColor: colorTokens.slate400,
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: '#fed7aa',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
});

export const dataLabel = style({
  color: '#991b1b',
  fontSize: '0.86rem',
  letterSpacing: '0.08em',
  marginBlockEnd: '0.3rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
});

export const dataList = style({
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  display: 'grid',
  gap: '1rem',
  minInlineSize: 0,
});

export const dataValue = style({
  color: colorTokens.slate900,
  fontSize: '1.1rem',
  lineHeight: 1.55,
  margin: 0,
  minInlineSize: 0,
  overflowWrap: 'anywhere',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});

export const hero = style({
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
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
  color: '#7f1d1d',
  fontSize: '1rem',
  lineHeight: 1.7,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '31rem',
});

export const heroBodyCritical = style({
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const heroBodyRuntime = style({
  color: '#155e75',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const heroBodyWarning = style({
  color: '#7c2d12',
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
  paddingBottom: '2.5rem',
  position: 'relative',
  zIndex: 2,
});

export const heroCritical = style({
  backgroundColor: '#fff5f5',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#12090c',
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
  color: '#991b1b',
  fontSize: '1.28rem',
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1.12,
  marginBlockEnd: '0.85rem',
  marginBlockStart: 0,
  maxWidth: '17ch',
});

export const heroLeadCritical = style({
  color: '#991b1b',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});

export const heroLeadRuntime = style({
  color: '#0f766e',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#67e8f9',
    },
  },
});

export const heroLeadWarning = style({
  color: '#9a3412',
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
  backgroundPosition: '74% center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  inset: 0,
  opacity: 0.82,
  position: 'absolute',
  selectors: {
    ':root[data-theme="dark"] &': {
      opacity: 1,
    },
  },
  transformOrigin: 'center',
});

export const heroMediaCritical = style({
  backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
    },
  },
});

export const heroMediaRuntime = style({
  backgroundImage: 'url("/assets/runtime-error-hero-light.svg")',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage: 'url("/assets/runtime-error-hero-dark.svg")',
    },
  },
});

export const heroMediaWarning = style({
  backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
    },
  },
});

export const heroOverlay = style({
  inset: 0,
  position: 'absolute',
  zIndex: 1,
});

export const heroOverlayCritical = style({
  backgroundImage:
    'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
    },
  },
});

export const heroOverlayRuntime = style({
  backgroundImage:
    'linear-gradient(90deg, rgba(245, 252, 255, 0.995) 0%, rgba(236, 254, 255, 0.95) 28%, rgba(207, 250, 254, 0.8) 48%, rgba(186, 230, 253, 0.46) 68%, rgba(245, 252, 255, 0.18) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(186, 230, 253, 0.12) 100%)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'linear-gradient(90deg, rgba(7, 22, 27, 0.94) 0%, rgba(7, 22, 27, 0.72) 28%, rgba(7, 22, 27, 0.28) 56%, rgba(7, 22, 27, 0.1) 100%), linear-gradient(180deg, rgba(7, 22, 27, 0.16) 0%, rgba(7, 22, 27, 0.18) 100%)',
    },
  },
});

export const heroOverlayWarning = style({
  backgroundImage:
    'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
    },
  },
});

export const heroRuntime = style({
  backgroundColor: '#ecfeff',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#07161b',
    },
  },
});

export const heroWarning = style({
  backgroundColor: '#fff7ed',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#140d07',
    },
  },
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
  fontSize: '1rem',
  lineHeight: 1.7,
  marginBlockEnd: '2rem',
  marginBlockStart: 0,
  maxWidth: '36rem',
});

export const routesIntroCritical = style({
  color: '#7f1d1d',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const routesIntroRuntime = style({
  color: '#155e75',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const routesIntroWarning = style({
  color: '#7c2d12',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const routesList = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  minInlineSize: 0,
});

export const routesListCritical = style({
  borderColor: '#fecaca',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});

export const routesListRuntime = style({
  borderColor: '#bae6fd',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});

export const routesListWarning = style({
  borderColor: '#fdba74',
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
  marginBlockEnd: '0.3rem',
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

export const rowCodeCritical = style({
  color: '#dc2626',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});

export const rowCodeRuntime = style({
  color: '#0891b2',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#67e8f9',
    },
  },
});

export const rowCodeWarning = style({
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

export const rowPanel = style({
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '6rem minmax(0, 18rem) minmax(0, 1fr)',
    },
  },
  alignItems: 'flex-start',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: '1fr',
  minInlineSize: 0,
  paddingBottom: '1.45rem',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  paddingTop: '1.45rem',
});

export const rowRow = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  minInlineSize: 0,
});

export const rowRowCritical = style({
  borderColor: '#fecaca',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});

export const rowRowRuntime = style({
  borderColor: '#bae6fd',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});

export const rowRowWarning = style({
  borderColor: '#fdba74',
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

export const statusLabel = style({
  fontSize: '0.86rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
});

export const statusLabelCritical = style({
  color: '#991b1b',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});

export const statusLabelRuntime = style({
  color: '#155e75',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});

export const statusLabelWarning = style({
  color: '#9a3412',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});

export const title = style({
  '@media': {
    '(min-width: 768px)': {
      fontSize: '7rem',
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
  fontSize: '4.2rem',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 0.84,
  marginBlockEnd: '1rem',
  marginBlockStart: 0,
  maxWidth: '8ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const titleAccent = style({
  color: '#b91c1c',
  display: 'block',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});

export const titleAccentRuntime = style({
  color: '#0e7490',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#67e8f9',
    },
  },
});

export const titleAccentWarning = style({
  color: '#d97706',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fde68a',
    },
  },
});

export const s = {
  ctaPrimary,
  ctaSecondary,
  dataLabel,
  dataList,
  dataValue,
  hero,
  heroActions,
  heroBody,
  heroCopy,
  heroInner,
  heroLead,
  heroMedia,
  heroOverlay,
  page,
  routesInner,
  routesIntro,
  routesList,
  routesTitle,
  rowBody,
  rowCode,
  rowContent,
  rowPanel,
  rowRow,
  rowTitle,
  statusLabel,
  title,
  titleAccent,
};

export const toneStyles = {
  critical: {
    ctaPrimary,
    ctaSecondary,
    hero: heroCritical,
    heroBody: heroBodyCritical,
    heroLead: heroLeadCritical,
    heroMedia: heroMediaCritical,
    heroOverlay: heroOverlayCritical,
    routesIntro: routesIntroCritical,
    routesList: routesListCritical,
    rowCode: rowCodeCritical,
    rowRow: rowRowCritical,
    statusLabel: statusLabelCritical,
    titleAccent,
  },
  runtime: {
    ctaPrimary: ctaPrimaryRuntime,
    ctaSecondary: ctaSecondaryRuntime,
    hero: heroRuntime,
    heroBody: heroBodyRuntime,
    heroLead: heroLeadRuntime,
    heroMedia: heroMediaRuntime,
    heroOverlay: heroOverlayRuntime,
    routesIntro: routesIntroRuntime,
    routesList: routesListRuntime,
    rowCode: rowCodeRuntime,
    rowRow: rowRowRuntime,
    statusLabel: statusLabelRuntime,
    titleAccent: titleAccentRuntime,
  },
  warning: {
    ctaPrimary: ctaPrimaryWarning,
    ctaSecondary: ctaSecondaryWarning,
    hero: heroWarning,
    heroBody: heroBodyWarning,
    heroLead: heroLeadWarning,
    heroMedia: heroMediaWarning,
    heroOverlay: heroOverlayWarning,
    routesIntro: routesIntroWarning,
    routesList: routesListWarning,
    rowCode: rowCodeWarning,
    rowRow: rowRowWarning,
    statusLabel: statusLabelWarning,
    titleAccent: titleAccentWarning,
  },
};
