import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

export const raceWidth = createVar();
const reveal = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(8px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});
const focus = {
  outline: `3px solid ${t.color.primary}`,
  outlineOffset: '3px',
};
const secondaryButton = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  color: t.color.onSurface,
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  justifyContent: 'center',
  lineHeight: 1.5,
  minHeight: '44px',
  padding: '0.5rem 0.875rem',
  selectors: {
    '&:focus-visible': focus,
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
      borderColor: t.color.primary,
      color: t.color.onPrimaryContainer,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, border-color ${t.motion.duration} ${t.motion.easing}, color ${t.motion.duration} ${t.motion.easing}`,
});
export const layout = style({
  '@media': {
    [mediaQueries.minWidth1000]: {
      gridTemplateColumns: '232px minmax(0, 1fr)',
    },
  },
  backgroundColor: t.color.surface,
  color: t.color.onSurface,
  display: 'grid',
  minHeight: '100svh',
});
export const workspace = style({
  minWidth: 0,
});
export const page = style({
  isolation: 'isolate',
  minWidth: 0,
  outline: 'none',
  overflow: 'clip',
  position: 'relative',
});
export const artwork = style({
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.24,
    },
  },
  backgroundImage: 'url("/assets/mandelbrot-expressive.svg")',
  backgroundPosition: 'center top',
  backgroundRepeat: 'repeat-y',
  backgroundSize: '100% auto',
  inset: 0,
  opacity: 0.62,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: -1,
});
export const content = style({
  boxSizing: 'border-box',
  display: 'grid',
  gap: '2rem',
  marginInline: 'auto',
  maxWidth: '1280px',
  minWidth: 0,
  padding: `1.5rem clamp(1rem, 3.5vw, 3rem) ${t.space.pageFooterGap}`,
  width: '100%',
});
export const intro = style({
  '@media': {
    [mediaQueries.reducedMotion]: {
      animation: 'none',
    },
  },
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} both`,
  display: 'grid',
  gap: '0.75rem',
});
export const title = style({
  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
  fontWeight: 750,
  letterSpacing: '-0.045em',
  lineHeight: 1.15,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const titleAccent = style({
  color: t.color.primary,
});
export const heroLead = style({
  color: t.color.onSurface,
  fontSize: t.type.body,
  lineHeight: 1.65,
  margin: 0,
  maxWidth: '48rem',
});
export const explorer = style({
  '@media': {
    [mediaQueries.minWidth1200]: {
      gridTemplateColumns: 'minmax(0, 1fr) 16rem',
    },
  },
  alignItems: 'start',
  backgroundColor: t.color.surfaceContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.large,
  display: 'grid',
  gap: '1.5rem',
  minWidth: 0,
  padding: '1rem',
});
export const canvasColumn = style({
  display: 'grid',
  gap: '1rem',
  minWidth: 0,
});
export const canvasShell = style({
  aspectRatio: '16 / 9',
  backgroundColor: '#10121c',
  borderRadius: t.shape.medium,
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    '&:focus-visible': focus,
  },
  width: '100%',
});
export const canvas = style({
  cursor: 'crosshair',
  display: 'block',
  height: '100%',
  touchAction: 'none',
  width: '100%',
});
export const canvasHidden = style({
  display: 'none',
});
export const canvasOverlay = style({
  alignItems: 'center',
  backgroundColor: 'rgb(16 18 28 / 0.8)',
  color: '#f1eafa',
  display: 'grid',
  fontSize: t.type.label,
  inset: 0,
  padding: '1rem',
  placeItems: 'center',
  position: 'absolute',
  textAlign: 'center',
});
export const canvasHint = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.8125rem',
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const controlsPanel = style({
  display: 'grid',
  gap: '1.25rem',
  minWidth: 0,
});
export const controlTitle = style({
  fontSize: t.type.title,
  fontWeight: 700,
  lineHeight: 1.4,
  margin: 0,
});
export const controlsRow = style({
  '@media': {
    [mediaQueries.width600To1199]: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: '1.25rem',
  minWidth: 0,
});
export const controlGroup = style({
  display: 'grid',
  gap: '0.5rem',
  minWidth: 0,
});
export const controlHeading = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  justifyContent: 'space-between',
});
export const controlLabel = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
});
export const rangeInput = style({
  accentColor: t.color.primary,
  height: '44px',
  margin: 0,
  minWidth: 0,
  selectors: {
    '&:focus-visible': focus,
  },
  width: '100%',
});
export const selectInput = style({
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.small,
  boxSizing: 'border-box',
  color: t.color.onSurface,
  fontFamily: 'inherit',
  fontSize: t.type.label,
  lineHeight: 1.5,
  minHeight: '44px',
  minWidth: 0,
  padding: '0.625rem 0.5rem',
  selectors: {
    '&:focus-visible': focus,
  },
  width: '100%',
});
export const viewNavigation = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
});
export const zoomControls = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
});
export const panControls = style({
  border: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.375rem',
  margin: 0,
  minWidth: 0,
  padding: 0,
});
export const zoomButton = secondaryButton;
export const panButton = style([
  secondaryButton,
  {
    flexShrink: 0,
    padding: '0.5rem',
    width: '44px',
  },
]);
export const statusBar = style({
  '@media': {
    [mediaQueries.minWidth600]: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },
  borderTop: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.875rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  minWidth: 0,
  paddingTop: '1rem',
});
export const statusItem = style({
  minWidth: 0,
});
export const statusLabel = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.75rem',
  lineHeight: 1.5,
  margin: '0 0 0.375rem',
  overflowWrap: 'anywhere',
});
export const statusValue = style({
  color: t.color.onSurface,
  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  fontSize: '0.8125rem',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.5,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const gpuNote = canvasHint;
export const renderingTools = style({
  '@media': {
    [mediaQueries.minWidth768]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'auto auto auto',
    },
  },
  alignItems: 'stretch',
  display: 'grid',
  gap: '2rem',
  minWidth: 0,
});
export const toolSection = style({
  '@media': {
    [mediaQueries.minWidth768]: {
      gridRow: 'span 3',
      gridTemplateRows: 'subgrid',
    },
  },
  alignContent: 'start',
  borderTop: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1.25rem',
  minWidth: 0,
  paddingTop: '1.25rem',
});
export const sectionHeading = style({
  display: 'grid',
  gap: '0.75rem',
});
export const sectionTitle = style({
  fontSize: t.type.headline,
  fontWeight: 700,
  letterSpacing: '-0.035em',
  lineHeight: 1.25,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const sectionIntro = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const actionButton = style({
  alignItems: 'center',
  backgroundColor: t.color.primary,
  border: '1px solid transparent',
  borderRadius: t.shape.full,
  color: t.color.onPrimary,
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  justifyContent: 'center',
  justifySelf: 'start',
  lineHeight: 1.5,
  maxWidth: '100%',
  minHeight: '44px',
  padding: '0.625rem 1.25rem',
  selectors: {
    '&:focus-visible': focus,
    '&:hover:not(:disabled)': {
      backgroundColor: t.color.primaryHover,
    },
  },
  textAlign: 'start',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
});
export const actionButtonLoading = style({
  backgroundColor: t.color.surfaceRaised,
  borderColor: t.color.outline,
  color: t.color.onSurfaceVariant,
  cursor: 'wait',
});
export const raceRow = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.5rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  minWidth: 0,
  paddingBlock: '0.75rem',
});
export const raceName = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
  overflowWrap: 'anywhere',
});
export const raceResults = style({
  minWidth: 0,
});
export const raceMetric = style({
  alignContent: 'center',
  display: 'grid',
  fontSize: '0.8125rem',
  gridTemplateRows: 'minmax(1.5em, auto) minmax(1.5em, auto)',
  minHeight: '4rem',
  minWidth: 0,
});
export const raceTrack = style({
  backgroundColor: t.color.surfaceContainer,
  borderRadius: t.shape.full,
  gridColumn: '1 / -1',
  gridRow: 2,
  height: '0.625rem',
  minWidth: 0,
  overflow: 'hidden',
});
export const raceFill = style({
  borderRadius: t.shape.full,
  height: '100%',
  minWidth: 0,
  transition: `width ${t.motion.duration} ${t.motion.easing}`,
  width: raceWidth,
});
export const raceFillJs = style({
  backgroundColor: t.color.onSecondaryContainer,
});
export const raceFillWasm = style({
  backgroundColor: t.color.onTertiaryContainer,
});
export const raceFillGpu = style({
  backgroundColor: t.color.primary,
});
export const raceValue = style({
  color: t.color.onSurface,
  fontSize: '0.8125rem',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.5,
  overflowWrap: 'anywhere',
  textAlign: 'end',
});
export const edgeResult = style({
  display: 'grid',
  gap: '1rem',
  minWidth: 0,
});
export const edgeImage = style({
  display: 'block',
  height: '100%',
  inset: 0,
  minWidth: 0,
  objectFit: 'contain',
  position: 'absolute',
  width: '100%',
});
export const edgeMeta = style({
  alignItems: 'center',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  minWidth: 0,
});
export const edgeDownload = style([
  secondaryButton,
  {
    gridColumn: '1 / -1',
    selectors: {
      '&:disabled': {
        backgroundColor: t.color.surfaceContainer,
        color: t.color.onSurfaceVariant,
        cursor: 'not-allowed',
      },
    },
    textDecoration: 'none',
  },
]);
export const implementation = style({
  borderTop: `1px solid ${t.color.outline}`,
  minWidth: 0,
  paddingTop: '1rem',
});
export const edgePreview = style({
  aspectRatio: '16 / 9',
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.medium,
  boxSizing: 'border-box',
  minHeight: '10rem',
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative',
});
export const edgeMessage = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  boxSizing: 'border-box',
  color: t.color.onSurfaceVariant,
  display: 'grid',
  fontSize: t.type.label,
  inset: 0,
  lineHeight: 1.65,
  overflow: 'auto',
  overflowWrap: 'anywhere',
  padding: '1rem',
  position: 'absolute',
  selectors: {
    '&[role="alert"]': {
      backgroundColor: t.color.errorContainer,
      color: t.color.onErrorContainer,
    },
  },
  textAlign: 'center',
});
export const edgeMetric = style({
  minHeight: '3rem',
});
export const visuallyHidden = style({
  clipPath: 'inset(50%)',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
});
export const footerNote = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: '0.75rem 0 0',
  overflowWrap: 'anywhere',
});
export const codeInline = style({
  backgroundColor: t.color.surfaceRaised,
  borderRadius: '0.25rem',
  boxDecorationBreak: 'clone',
  color: t.color.onSurface,
  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  fontSize: '0.92em',
  overflowWrap: 'anywhere',
  padding: '0.125rem 0.375rem',
});
globalStyle(`:root[data-theme="dark"] ${artwork}`, {
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.18,
    },
  },
  opacity: 0.42,
});
