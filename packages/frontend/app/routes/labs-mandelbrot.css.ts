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

const panelReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1rem, 0)',
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

export const panel = style({
  animationDelay: '80ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: panelReveal,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: colorTokens.white,
  borderColor: colorTokens.borderColor,
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  marginBlockEnd: '2.5rem',
  minInlineSize: 0,
  padding: '1.25rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      borderColor: colorTokens.slate800,
    },
  },
});

export const canvasShell = style({
  '@media': {
    '(min-width: 768px)': {
      aspectRatio: '16 / 9',
    },
  },
  aspectRatio: '4 / 3',
  backgroundColor: '#0b0a18',
  borderRadius: radiusTokens.radiusSm,
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
});

export const canvas = style({
  cursor: 'crosshair',
  display: 'block',
  height: '100%',
  touchAction: 'none',
  width: '100%',
});

/*
 * The page keeps one canvas per context type (2D for the CPU engines,
 * WebGL2 for the GPU) and shows only the active one.
 */
export const canvasHidden = style({
  display: 'none',
});

export const canvasOverlay = style({
  alignItems: 'center',
  backgroundColor: 'rgba(11, 10, 24, 0.72)',
  color: colorTokens.slate100,
  display: 'grid',
  fontSize: '0.95rem',
  inset: 0,
  justifyContent: 'center',
  placeItems: 'center',
  position: 'absolute',
  textAlign: 'center',
});

export const controlsRow = style({
  '@media': {
    '(min-width: 768px)': {
      gridAutoFlow: 'column',
      justifyContent: 'space-between',
    },
  },
  display: 'grid',
  gap: '1rem',
  marginBlockStart: '1rem',
  minInlineSize: 0,
});

export const controlGroup = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.6rem',
  gridAutoFlow: 'column',
  justifyContent: 'flex-start',
  minInlineSize: 0,
});

export const controlLabel = style({
  color: colorTokens.slate600,
  fontSize: '0.86rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

export const rangeInput = style({
  accentColor: colorTokens.purple,
  minInlineSize: 0,
  width: '11rem',
});

export const selectInput = style({
  backgroundColor: colorTokens.white,
  borderColor: colorTokens.borderColor,
  borderRadius: radiusTokens.radiusSm,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  fontSize: '0.95rem',
  padding: '0.4rem 0.6rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: colorTokens.slate900,
      borderColor: colorTokens.slate700,
      color: colorTokens.slate100,
    },
  },
});

export const zoomButton = style({
  backgroundColor: colorTokens.white,
  borderColor: colorTokens.borderColor,
  borderRadius: radiusTokens.radiusSm,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 600,
  padding: '0.4rem 0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: colorTokens.slate900,
      borderColor: colorTokens.slate700,
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      borderColor: colorTokens.slate500,
    },
    '&:hover': {
      borderColor: colorTokens.purple,
    },
  },
  transition: 'border-color 0.2s ease',
});

export const statusBar = style({
  '@media': {
    '(min-width: 768px)': {
      gridAutoFlow: 'column',
      justifyContent: 'space-between',
    },
  },
  display: 'grid',
  gap: '0.75rem 1.5rem',
  marginBlockStart: '1rem',
  minInlineSize: 0,
});

export const statusItem = style({
  minInlineSize: 0,
});

export const statusLabel = style({
  color: colorTokens.slate600,
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  marginBlockEnd: '0.15rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
});

export const statusValue = style({
  color: colorTokens.slate900,
  fontSize: '1rem',
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  overflowWrap: 'anywhere',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});

export const actionButton = style({
  backgroundColor: colorTokens.purple,
  border: 'none',
  borderRadius: radiusTokens.radiusMd,
  color: colorTokens.white,
  cursor: 'pointer',
  fontWeight: 600,
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#c4b5fd',
      color: '#1e1b4b',
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#ddd6fe',
    },
    '&:hover': {
      backgroundColor: colorTokens.purpleHover,
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  transition: 'background-color 0.2s ease, transform 0.2s ease',
});

export const actionButtonLoading = style({
  backgroundColor: colorTokens.slate400,
  color: colorTokens.slate100,
  cursor: 'not-allowed',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: colorTokens.slate500,
    },
  },
});

export const raceRow = style({
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '9rem minmax(0, 1fr) 8rem',
    },
  },
  alignItems: 'center',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '1fr',
  minInlineSize: 0,
  paddingBlock: '0.6rem',
});

export const raceName = style({
  color: colorTokens.slate700,
  fontSize: '0.95rem',
  fontWeight: 600,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const raceTrack = style({
  backgroundColor: 'rgba(148, 163, 184, 0.18)',
  borderRadius: radiusTokens.radiusXs,
  minInlineSize: 0,
  overflow: 'hidden',
});

export const raceFill = style({
  borderRadius: radiusTokens.radiusXs,
  height: '0.9rem',
  minWidth: '2px',
  transition: 'inline-size 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
});

export const raceFillJs = style({
  backgroundColor: colorTokens.warning,
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#fbbf24',
    },
  },
});

export const raceFillWasm = style({
  backgroundColor: colorTokens.success,
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#34d399',
    },
  },
});

export const raceFillGpu = style({
  backgroundColor: colorTokens.purple,
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#c4b5fd',
    },
  },
});

export const raceValue = style({
  color: colorTokens.slate900,
  fontSize: '0.95rem',
  fontVariantNumeric: 'tabular-nums',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
  textAlign: 'end',
});

export const gpuNote = style({
  color: colorTokens.slate600,
  fontSize: '0.85rem',
  lineHeight: 1.6,
  marginBlockStart: '0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});

export const edgeActions = style({
  display: 'grid',
  gap: '0.75rem',
  justifyItems: 'start',
});

export const edgeResult = style({
  marginBlockStart: '1.25rem',
  minInlineSize: 0,
});

export const edgeImage = style({
  borderColor: colorTokens.borderColor,
  borderRadius: radiusTokens.radiusSm,
  borderStyle: 'solid',
  borderWidth: '1px',
  display: 'block',
  minInlineSize: 0,
  width: '100%',
});

export const edgeMeta = style({
  '@media': {
    '(min-width: 768px)': {
      gridAutoFlow: 'column',
      justifyContent: 'space-between',
    },
  },
  alignItems: 'center',
  display: 'grid',
  gap: '0.75rem',
  marginBlockStart: '0.75rem',
  minInlineSize: 0,
});

export const edgeDownload = style({
  color: colorTokens.info,
  fontWeight: 600,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
  textDecoration: 'underline',
});

export const errorBox = style({
  backgroundColor: '#fef2f2',
  borderColor: '#ef4444',
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: '#b91c1c',
  marginBlockStart: '1rem',
  padding: '1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#7f1d1d',
      borderColor: '#dc2626',
      color: '#fca5a5',
    },
  },
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
