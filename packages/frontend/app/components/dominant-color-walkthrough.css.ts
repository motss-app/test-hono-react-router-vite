import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { radiusTokens } from '../styles/radius-tokens.contract.css.ts';

const rise = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(0.5rem)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const section = style({
  marginBlockStart: '5rem',
  marginInline: 'auto',
  maxWidth: '84rem',
  padding: '0 1rem',
});

export const intro = style({
  maxWidth: '42rem',
});

export const kicker = style({
  color: '#65a30d',
  fontSize: '0.72rem',
  fontWeight: 750,
  letterSpacing: '0.13em',
  margin: '0 0 0.75rem',
  textTransform: 'uppercase',
});

export const title = style({
  color: colorTokens.slate900,
  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
  letterSpacing: '-0.06em',
  lineHeight: 0.98,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});

export const lead = style({
  color: colorTokens.slate600,
  fontSize: '1rem',
  lineHeight: 1.65,
  margin: '1rem 0 0',
  maxWidth: '38rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});

export const shell = style({
  animation: `${rise} 600ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  backgroundColor: '#0f1720',
  border: '1px solid #26333d',
  borderRadius: radiusTokens.radiusMd,
  color: '#ecfdf5',
  marginBlockStart: '2rem',
  overflow: 'hidden',
});

export const shellBar = style({
  alignItems: 'center',
  borderBlockEnd: '1px solid #26333d',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  justifyContent: 'space-between',
  padding: '1rem 1.15rem',
});

export const shellLabel = style({
  color: '#9fb1ad',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
});

export const stepRail = style({
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 18rem',
  gap: '0.35rem',
  justifyContent: 'flex-end',
});

export const stepButton = style({
  background: 'transparent',
  border: 0,
  color: '#60716e',
  cursor: 'pointer',
  font: 'inherit',
  padding: '0.15rem',
  selectors: {
    '&:focus-visible': {
      outline: '2px solid #bef264',
      outlineOffset: '3px',
    },
    '&:hover': {
      color: '#d9f99d',
    },
  },
});

export const stepButtonActive = style({
  color: '#d7f36b',
});

export const stepDot = style({
  alignItems: 'center',
  border: '1px solid currentColor',
  borderRadius: '50%',
  display: 'flex',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.62rem',
  height: '1.55rem',
  justifyContent: 'center',
  width: '1.55rem',
});

export const body = style({
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(15rem, 0.65fr)',
});

export const stage = style({
  minHeight: '31rem',
  padding: 'clamp(1.1rem, 3vw, 2.25rem)',
});

export const stageHeader = style({
  color: '#60716e',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  marginBlockEnd: '1.5rem',
  textTransform: 'uppercase',
});

export const pixelGrid = style({
  display: 'grid',
  gap: '0.65rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  marginInline: 'auto',
  maxWidth: '28rem',
});

export const pixel = style({
  aspectRatio: '1',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: radiusTokens.radiusMd,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
  padding: 'clamp(0.75rem, 2vw, 1.2rem)',
  transition: 'box-shadow 180ms ease, opacity 180ms ease, transform 180ms ease',
});

export const pixelHighlighted = style({
  boxShadow: '0 0 0 3px #d7f36b',
  transform: 'translateY(-3px)',
});

export const pixelDimmed = style({
  opacity: 0.38,
});

export const pixelTop = style({
  display: 'flex',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
  justifyContent: 'space-between',
});

export const pixelName = style({
  fontSize: 'clamp(1.15rem, 3vw, 1.8rem)',
  fontWeight: 700,
  marginBlockStart: '1.5rem',
});

export const pixelValue = style({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
  marginBlockStart: '0.3rem',
  opacity: 0.82,
});

export const addressList = style({
  display: 'grid',
  gap: '0.65rem',
});

export const addressRow = style({
  alignItems: 'center',
  borderBlockEnd: '1px solid #26333d',
  display: 'grid',
  gap: '0.8rem',
  gridTemplateColumns: '1.8rem 1fr auto',
  paddingBlock: '0.75rem',
});

export const swatch = style({
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '0.35rem',
  display: 'block',
  height: '1.5rem',
  width: '1.5rem',
});

export const rowMain = style({
  minWidth: 0,
});

export const rowTitle = style({
  color: '#ecfdf5',
  fontSize: '0.88rem',
});

export const rowNote = style({
  color: '#81928e',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  lineHeight: 1.5,
  marginBlockStart: '0.22rem',
});

export const rowValue = style({
  color: '#d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  textAlign: 'right',
});

export const mathBlock = style({
  backgroundColor: '#141f25',
  borderInlineStart: '3px solid #d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  lineHeight: 1.7,
  marginBlockEnd: '1.25rem',
  padding: '1rem 1.1rem',
});

export const mathLabel = style({
  color: '#8fa19d',
  display: 'block',
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  marginBlockEnd: '0.4rem',
  textTransform: 'uppercase',
});

export const mathValue = style({
  color: '#ecfdf5',
  fontSize: '0.82rem',
  overflowWrap: 'anywhere',
});

export const markerList = style({
  display: 'grid',
  gap: '0.7rem',
});

export const markerRow = style({
  '@media': {
    '(max-width: 520px)': {
      gridTemplateColumns: '1.8rem 1fr',
    },
  },
  alignItems: 'center',
  borderBlockEnd: '1px solid #26333d',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '1.8rem minmax(5rem, 0.55fr) minmax(8rem, 1fr)',
  paddingBlock: '0.7rem',
});

export const markerName = style({
  color: '#ecfdf5',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
});

export const matchList = style({
  display: 'grid',
  gap: '0.5rem',
});

export const matchRow = style({
  alignItems: 'center',
  borderBlockEnd: '1px solid #26333d',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '3rem 1fr auto',
  paddingBlock: '0.75rem',
});

export const matchLabel = style({
  color: '#d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
});

export const matchArrow = style({
  color: '#81928e',
  fontSize: '0.82rem',
});

export const repeatList = style({
  display: 'grid',
  gap: '0.6rem',
});

export const repeatRow = style({
  alignItems: 'center',
  borderBlockEnd: '1px solid #26333d',
  display: 'grid',
  gap: '0.7rem',
  gridTemplateColumns: '4rem 1fr auto',
  paddingBlock: '0.7rem',
});

export const repeatMarker = style({
  color: '#d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
});

export const repeatText = style({
  color: '#c7d5d1',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  lineHeight: 1.5,
});

export const stable = style({
  color: '#9fb1ad',
  fontSize: '0.82rem',
  lineHeight: 1.6,
  marginBlockStart: '1rem',
});

export const familyList = style({
  display: 'grid',
  gap: '0.8rem',
});

export const familyRow = style({
  borderBlockEnd: '1px solid #26333d',
  paddingBlock: '0.75rem',
});

export const familyHeader = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.7rem',
  justifyContent: 'space-between',
});

export const familyName = style({
  color: '#ecfdf5',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.74rem',
});

export const familyWeight = style({
  color: '#9fb1ad',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
});

export const familyTrack = style({
  backgroundColor: '#1c2a31',
  height: '0.5rem',
  marginBlockStart: '0.55rem',
  overflow: 'hidden',
});

export const familyBar = style({
  backgroundColor: '#6b7b78',
  height: '100%',
  transition: 'width 260ms ease, background-color 180ms ease',
});

export const familyBarWinner = style({
  backgroundColor: '#d7f36b',
});

export const familyMembers = style({
  color: '#81928e',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  marginBlockStart: '0.5rem',
});

export const winner = style({
  alignItems: 'center',
  display: 'flex',
  gap: '1rem',
  marginBlockStart: '1.5rem',
});

export const winnerSwatch = style({
  border: '1px solid rgba(255,255,255,0.35)',
  borderRadius: radiusTokens.radiusMd,
  height: '4.5rem',
  width: '4.5rem',
});

export const winnerHex = style({
  color: '#d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1.4rem',
});

export const side = style({
  '@media': {
    '(max-width: 760px)': {
      borderBlockStart: '1px solid #26333d',
      borderInlineStart: 0,
    },
  },
  borderInlineStart: '1px solid #26333d',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
  padding: 'clamp(1.1rem, 3vw, 2rem)',
});

export const stepTitle = style({
  color: '#ecfdf5',
  fontSize: 'clamp(1.35rem, 2.5vw, 2rem)',
  letterSpacing: '-0.04em',
  lineHeight: 1.05,
  margin: '0.55rem 0 0',
});

export const stepCopy = style({
  color: '#aebdb9',
  fontSize: '0.9rem',
  lineHeight: 1.65,
  margin: '1rem 0 0',
});

export const sideLabel = style({
  color: '#60716e',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
});

export const controls = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.55rem',
  justifyContent: 'space-between',
  marginBlockStart: '2rem',
});

export const controlButton = style({
  backgroundColor: 'transparent',
  border: '1px solid #40514f',
  borderRadius: radiusTokens.radiusMd,
  color: '#ecfdf5',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '0.78rem',
  padding: '0.65rem 0.8rem',
  selectors: {
    '&:disabled': {
      color: '#52615f',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    '&:focus-visible': {
      outline: '2px solid #bef264',
      outlineOffset: '3px',
    },
    '&:hover:not(:disabled)': {
      borderColor: '#d7f36b',
    },
  },
});

export const controlButtonPrimary = style({
  backgroundColor: '#d7f36b',
  borderColor: '#d7f36b',
  color: '#152016',
  fontWeight: 700,
});

export const sourceNote = style({
  borderBlockStart: '1px solid #26333d',
  color: '#81928e',
  fontSize: '0.72rem',
  lineHeight: 1.55,
  marginBlockStart: '1.5rem',
  paddingBlockStart: '1rem',
});

export const sourceCode = style({
  color: '#d7f36b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

export const reducedMotion = style({
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transition: 'none',
    },
  },
});
