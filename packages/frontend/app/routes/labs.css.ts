import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const toolSurface = createVar();
const toolAccent = createVar();
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
      opacity: 0.32,
    },
  },
  backgroundImage: 'url("/assets/labs-expressive.svg")',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% auto',
  inset: 0,
  opacity: 0.72,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: -1,
});
export const content = style({
  alignContent: 'start',
  boxSizing: 'border-box',
  display: 'grid',
  gap: '2rem',
  marginInline: 'auto',
  maxWidth: '1120px',
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
  maxWidth: '44rem',
});
export const title = style({
  color: t.color.primary,
  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
  fontWeight: 750,
  letterSpacing: '-0.045em',
  lineHeight: 1.15,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const lead = style({
  fontSize: t.type.body,
  fontWeight: 650,
  lineHeight: 1.5,
  margin: 0,
});
export const body = style({
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const tools = style({
  '@media': {
    [mediaQueries.minWidth600]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [mediaQueries.minWidth1200]: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: t.space.medium,
  gridTemplateColumns: 'minmax(0, 1fr)',
  minWidth: 0,
});
export const tool = style({
  display: 'flex',
  minWidth: 0,
});
export const toolLink = style({
  '@media': {
    [mediaQueries.reducedMotion]: {
      transition: 'none',
    },
  },
  backgroundColor: toolSurface,
  border: '1px solid transparent',
  borderRadius: t.shape.large,
  boxSizing: 'border-box',
  color: t.color.onSurface,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  minWidth: 0,
  padding: '1.25rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
      borderColor: toolAccent,
      textDecoration: 'none',
    },
  },
  textDecoration: 'none',
  transition:
    'background-color ' +
    t.motion.duration +
    ' ' +
    t.motion.easing +
    ', border-color ' +
    t.motion.duration +
    ' ' +
    t.motion.easing,
  width: '100%',
});
export const mandelbrot = style({
  vars: {
    [toolSurface]: t.color.primaryContainer,
    [toolAccent]: t.color.onPrimaryContainer,
  },
});
export const dominantColor = style({
  vars: {
    [toolSurface]: t.color.tertiaryContainer,
    [toolAccent]: t.color.onTertiaryContainer,
  },
});
export const imageOptimize = style({
  vars: {
    [toolSurface]: t.color.secondaryContainer,
    [toolAccent]: t.color.onSecondaryContainer,
  },
});
export const toolCopy = style({
  display: 'grid',
  gap: '0.5rem',
});
export const toolTitle = style({
  color: toolAccent,
  fontSize: '1.25rem',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.3,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const toolDescription = style({
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  lineHeight: 1.6,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const media = style({
  aspectRatio: '8 / 5',
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.medium,
  marginBlockStart: 'auto',
  minWidth: 0,
  overflow: 'hidden',
});
export const previewImage = style({
  display: 'block',
  height: '100%',
  minHeight: 0,
  objectFit: 'cover',
  width: '100%',
});
export const palettePreview = style({
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr) 3rem',
});
export const paletteResult = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  color: t.color.onSurface,
  display: 'flex',
  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  fontSize: '0.8125rem',
  gap: 'min(0.75rem, 12px)',
  lineHeight: 1.5,
  paddingInline: 'min(0.875rem, 14px)',
});
export const colorSwatch = style({
  backgroundColor: '#38596F',
  borderRadius: '0.375rem',
  flexShrink: 0,
  height: '28px',
  width: '28px',
});
export const toolFooter = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem 0.75rem',
  justifyContent: 'space-between',
});
export const runtime = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.8125rem',
  lineHeight: 1.5,
});
export const action = style({
  alignItems: 'center',
  color: toolAccent,
  display: 'inline-flex',
  fontSize: '0.8125rem',
  fontWeight: 650,
  gap: '0.5rem',
  lineHeight: 1.5,
});
export const actionIcon = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.full,
  display: 'inline-flex',
  fontSize: '0.875rem',
  height: '32px',
  justifyContent: 'center',
  width: '32px',
});

globalStyle(`${paletteResult} > span:last-child`, {
  minWidth: 0,
  overflowWrap: 'anywhere',
});

globalStyle(`:root[data-theme="dark"] ${artwork}`, {
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.24,
    },
  },
  opacity: 0.52,
});
