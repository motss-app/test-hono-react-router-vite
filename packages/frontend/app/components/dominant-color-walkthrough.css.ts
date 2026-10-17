import { createVar, keyframes, style, styleVariants } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

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
  borderBlockStart: `1px solid ${t.color.outline}`,
  minWidth: 0,
  paddingBlockStart: '1.5rem',
});

export const intro = style({
  maxWidth: '42rem',
});

export const kicker = style({
  color: t.color.primary,
  fontSize: '0.72rem',
  fontWeight: 750,
  letterSpacing: '0.13em',
  margin: '0 0 0.75rem',
  textTransform: 'uppercase',
});

export const title = style({
  color: t.color.onSurface,
  fontSize: t.type.headline,
  letterSpacing: '-0.025em',
  lineHeight: 1.3,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: t.color.onSurface,
    },
  },
});

export const lead = style({
  color: t.color.onSurfaceVariant,
  fontSize: '1rem',
  lineHeight: 1.65,
  margin: '1rem 0 0',
  maxWidth: '38rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: t.color.onSurfaceVariant,
    },
  },
});

export const shell = style({
  animation: `${rise} ${t.motion.entrance} ${t.motion.easing} both`,
  backgroundColor: t.color.surfaceContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.extraLarge,
  color: t.color.onSurface,
  containerName: 'dominant-walkthrough',
  containerType: 'inline-size',
  marginBlockStart: '1.5rem',
  overflow: 'hidden',
});

/** Fit 48px step keys and action labels within the available panel width. */
export const shellBar = style({
  '@container': {
    'dominant-walkthrough (min-width: 24rem)': {
      gridTemplateAreas: '"count actions" "steps steps"',
      gridTemplateColumns: 'minmax(0, 1fr) max-content',
    },
    'dominant-walkthrough (min-width: 54rem)': {
      gridTemplateAreas: '"count steps actions"',
      gridTemplateColumns: 'max-content minmax(0, 1fr) max-content',
    },
  },
  alignItems: 'center',
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1rem 1.5rem',
  gridTemplateAreas: '"count" "actions" "steps"',
  gridTemplateColumns: 'minmax(0, 1fr)',
  padding: '1rem',
});
export const shellLabel = style({
  color: t.color.onSurfaceVariant,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.8125rem',
  gridArea: 'count',
  lineHeight: 1.5,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const stepRail = style({
  '@container': {
    'dominant-walkthrough (min-width: 17rem)': {
      gridTemplateColumns: 'repeat(4, 48px)',
    },
    'dominant-walkthrough (min-width: 24rem)': {
      justifyContent: 'end',
    },
    'dominant-walkthrough (min-width: 32rem)': {
      gridTemplateColumns: 'repeat(8, 48px)',
      justifyContent: 'end',
    },
    'dominant-walkthrough (min-width: 54rem)': {
      justifyContent: 'center',
    },
  },
  display: 'grid',
  gap: '12px',
  gridArea: 'steps',
  gridTemplateColumns: 'repeat(2, 48px)',
  justifyContent: 'center',
});

export const stepButton = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  color: t.color.onSurfaceVariant,
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  height: '48px',
  justifyContent: 'center',
  padding: 0,
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
      color: t.color.onPrimaryContainer,
    },
  },
  width: '48px',
});

export const stepButtonActive = style({
  backgroundColor: t.color.primary,
  borderColor: t.color.primary,
  color: t.color.onPrimary,
});

export const stepDot = style({
  alignItems: 'center',
  display: 'flex',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: t.type.label,
  height: '1.55rem',
  justifyContent: 'center',
  width: '1.55rem',
});

export const body = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
});

export const stage = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  minWidth: 0,
  overflowWrap: 'anywhere',
  padding: 'clamp(0.75rem, 2vw, 1.5rem)',
});

/** Overlap scenes so the largest one reserves space without a scroll area. */
export const scene = style({
  alignSelf: 'start',
  gridArea: '1 / 1',
  minWidth: 0,
  visibility: 'hidden',
});
export const sceneActive = style({
  visibility: 'visible',
});
export const stepIntros = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
});

export const stageHeader = style({
  color: t.color.onSurfaceVariant,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  marginBlockEnd: '1rem',
  textTransform: 'uppercase',
});

export const pixelGrid = style({
  display: 'grid',
  gap: '0.75rem',
  gridAutoRows: '1fr',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(min(100%, max(8rem, calc((100% - 0.75rem) / 2))), 1fr))',
  marginInline: 'auto',
  maxWidth: '28rem',
});

export const pixel = style({
  backgroundColor: t.color.primaryContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.medium,
  color: t.color.onPrimaryContainer,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  justifyContent: 'space-between',
  minBlockSize: '9rem',
  minWidth: 0,
  padding: '0.75rem',
  transition: 'box-shadow 180ms ease, opacity 180ms ease, transform 180ms ease',
});

export const pixelTone = styleVariants({
  cyan: {
    backgroundColor: t.color.tertiaryContainer,
    color: t.color.onTertiaryContainer,
  },
  peach: {
    backgroundColor: t.color.secondaryContainer,
    color: t.color.onSecondaryContainer,
  },
  purple: {},
  'purple-light': {},
});
export const sampleColor = createVar();
export const pixelSample = style({
  backgroundColor: sampleColor,
  blockSize: '2rem',
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.small,
  inlineSize: '3rem',
  maxInlineSize: '100%',
});

export const pixelHighlighted = style({
  boxShadow: `0 0 0 3px ${t.color.primary}`,
  transform: 'translateY(-3px)',
});

export const pixelDimmed = style({
  opacity: 0.38,
});

export const pixelTop = style({
  display: 'flex',
  flexWrap: 'wrap',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
  gap: '0.5rem',
  justifyContent: 'space-between',
});

export const pixelName = style({
  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
  fontWeight: 700,
  lineHeight: 1.3,
  overflowWrap: 'anywhere',
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
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.5rem',
  gridTemplateColumns: '1.8rem minmax(0, 1fr) auto',
  paddingBlock: '0.5rem',
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
  overflowWrap: 'anywhere',
});

export const rowTitle = style({
  color: t.color.onSurface,
  fontSize: '0.88rem',
});

export const rowNote = style({
  color: t.color.onSurfaceVariant,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  lineHeight: 1.5,
  marginBlockStart: 0,
});

export const rowValue = style({
  color: t.color.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  textAlign: 'right',
});

export const mathBlock = style({
  backgroundColor: t.color.surfaceRaised,
  borderInlineStart: `3px solid ${t.color.primary}`,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  lineHeight: 1.7,
  marginBlockEnd: '0.75rem',
  padding: '0.75rem',
});

export const mathLabel = style({
  color: t.color.onSurfaceVariant,
  display: 'block',
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  marginBlockEnd: '0.4rem',
  textTransform: 'uppercase',
});

export const mathValue = style({
  color: t.color.onSurface,
  fontSize: '0.82rem',
  overflowWrap: 'anywhere',
});

export const markerList = style({
  display: 'grid',
  gap: '0.7rem',
});

export const markerRow = style({
  alignItems: 'center',
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '1.5rem minmax(0, 0.6fr) minmax(0, 1fr)',
  paddingBlock: '0.7rem',
});

export const markerName = style({
  color: t.color.onSurface,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
});

export const matchList = style({
  display: 'grid',
  gap: '0.5rem',
});

export const matchRow = style({
  alignItems: 'center',
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  paddingBlock: '0.75rem',
});

export const matchLabel = style({
  color: t.color.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
});

export const matchArrow = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.82rem',
});

export const repeatList = style({
  display: 'grid',
  gap: '0.6rem',
});

export const repeatRow = style({
  alignItems: 'center',
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.5rem',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  paddingBlock: '0.5rem',
});

export const repeatMarker = style({
  color: t.color.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
});

export const repeatText = style({
  color: t.color.onSurface,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  lineHeight: 1.5,
});

export const stable = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.82rem',
  lineHeight: 1.6,
  marginBlockStart: '1rem',
});

export const familyList = style({
  display: 'grid',
  gap: '0.8rem',
});

export const familyRow = style({
  borderBlockEnd: `1px solid ${t.color.outline}`,
  paddingBlock: '0.75rem',
});

export const familyHeader = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.7rem',
  justifyContent: 'space-between',
});

export const familyName = style({
  color: t.color.onSurface,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.74rem',
});

export const familyWeight = style({
  color: t.color.onSurfaceVariant,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
});

export const familyTrack = style({
  backgroundColor: t.color.surfaceRaised,
  height: '0.5rem',
  marginBlockStart: '0.55rem',
  overflow: 'hidden',
});

export const familyBar = style({
  backgroundColor: t.color.onSurfaceVariant,
  height: '100%',
  transition: 'width 260ms ease, background-color 180ms ease',
});

export const familyBarWinner = style({
  backgroundColor: t.color.primary,
});

export const familyMembers = style({
  color: t.color.onSurfaceVariant,
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
  borderRadius: t.shape.medium,
  height: '4.5rem',
  width: '4.5rem',
});

export const winnerHex = style({
  color: t.color.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1.4rem',
});

export const side = style({
  alignContent: 'start',
  backgroundColor: t.color.surfaceRaised,
  display: 'grid',
  gap: '1rem',
  minWidth: 0,
  padding: 'clamp(0.75rem, 2vw, 1.5rem)',
});

export const stepTitle = style({
  color: t.color.onSurface,
  fontSize: 'clamp(1.35rem, 2.5vw, 2rem)',
  letterSpacing: '-0.04em',
  lineHeight: 1.05,
  margin: '0.55rem 0 0',
});

export const stepCopy = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.9rem',
  lineHeight: 1.65,
  margin: '1rem 0 0',
});

export const sideLabel = style({
  color: t.color.onSurfaceVariant,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
});

export const controls = style({
  '@container': {
    'dominant-walkthrough (min-width: 24rem)': {
      justifySelf: 'end',
    },
  },
  display: 'grid',
  gap: '12px',
  gridArea: 'actions',
  gridTemplateColumns: 'max-content max-content',
  justifySelf: 'center',
  maxInlineSize: '100%',
});
export const fullActionLabel = style({
  '@container': {
    'dominant-walkthrough (min-width: 17rem)': {
      display: 'inline',
    },
  },
  display: 'none',
});
export const actionIcon = style({
  height: '1em',
  width: '1em',
});

export const controlLabel = style({
  '@container': {
    'dominant-walkthrough (min-width: 17rem)': {
      display: 'block',
    },
  },
  display: 'none',
  gridArea: '1 / 1',
  minWidth: 0,
});
export const controlLabelHidden = style([
  controlLabel,
  {
    visibility: 'hidden',
  },
]);

export const controlButton = style({
  '@container': {
    'dominant-walkthrough (min-width: 17rem)': {
      columnGap: '0.5rem',
      gridTemplateColumns: 'auto auto',
      padding: '0.65rem 0.75rem',
      width: 'auto',
    },
  },
  alignContent: 'center',
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  color: t.color.onSurface,
  cursor: 'pointer',
  display: 'inline-grid',
  font: 'inherit',
  fontSize: t.type.label,
  gridTemplateColumns: 'auto',
  height: '48px',
  justifyContent: 'center',
  minWidth: '48px',
  padding: 0,
  selectors: {
    '&:disabled': {
      color: t.color.onSurfaceVariant,
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
    '&:hover:not(:disabled)': {
      borderColor: t.color.primary,
    },
  },
  whiteSpace: 'nowrap',
  width: '48px',
});
export const controlButtonPrimary = style({
  '@container': {
    'dominant-walkthrough (min-width: 17rem)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
    },
  },
  backgroundColor: t.color.primary,
  borderColor: t.color.primary,
  color: t.color.onPrimary,
  fontWeight: 700,
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: t.color.primaryHover,
      borderColor: t.color.primaryHover,
    },
  },
});

export const sourceNote = style({
  borderBlockStart: `1px solid ${t.color.outline}`,
  color: t.color.onSurfaceVariant,
  fontSize: '0.72rem',
  lineHeight: 1.55,
  marginBlockStart: '1.5rem',
  paddingBlockStart: '1rem',
});

export const sourceCode = style({
  color: t.color.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

export const reducedMotion = style({
  '@media': {
    [mediaQueries.reducedMotion]: {
      animation: 'none',
      transition: 'none',
    },
  },
});
