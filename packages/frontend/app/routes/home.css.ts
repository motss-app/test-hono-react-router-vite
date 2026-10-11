import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';

const cardSurface = createVar();
const cardAccent = createVar();
const reveal = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(16px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});
const drift = keyframes({
  from: {
    transform: 'translateY(0) scale(1)',
  },
  to: {
    transform: 'translateY(-10px) scale(1.025)',
  },
});

export const page = style({
  '@media': {
    '(max-width: 599px)': {
      minHeight: 'calc(100svh - 72px)',
    },
  },
  isolation: 'isolate',
  minHeight: 'calc(100svh - 80px)',
  outline: 'none',
  overflow: 'clip',
  position: 'relative',
});
export const artwork = style({
  '@media': {
    '(max-width: 599px)': {
      backgroundPosition: 'right top',
      backgroundSize: 'auto 680px',
      opacity: 0.36,
    },
  },
  animation: `${drift} 14s ${t.motion.easing} infinite alternate`,
  backgroundImage: 'url("/assets/home-expressive.svg")',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  inset: 0,
  opacity: 0.8,
  pointerEvents: 'none',
  position: 'absolute',
  transformOrigin: 'right center',
  zIndex: -1,
});

globalStyle(`:root[data-theme="dark"] ${artwork}`, {
  '@media': {
    '(max-width: 599px)': {
      opacity: 0.28,
    },
  },
  opacity: 0.62,
});
export const content = style({
  marginInline: 'auto',
  maxWidth: '1120px',
  paddingBlockEnd: t.space.extraLarge,
  paddingInline: 'clamp(1rem, 3.5vw, 3rem)',
  position: 'relative',
});
export const hero = style({
  '@media': {
    '(max-width: 599px)': {
      paddingBlock: '1.5rem 2.5rem',
    },
  },
  maxWidth: '46rem',
  paddingBlock: '1.5rem clamp(2.5rem, 4vw, 3rem)',
});
export const eyebrow = style({
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} both`,
  color: t.color.primary,
  fontSize: t.type.label,
  fontWeight: 650,
  letterSpacing: '0.025em',
  margin: '0 0 1rem',
});
export const title = style({
  '@media': {
    '(max-width: 599px)': {
      fontSize: '2.5rem',
      maxWidth: '14ch',
    },
  },
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} 60ms both`,
  color: t.color.onSurface,
  fontSize: t.type.display,
  fontWeight: 750,
  letterSpacing: '-0.055em',
  lineHeight: 1.08,
  margin: '0 0 1.25rem',
  maxWidth: '15ch',
  overflowWrap: 'anywhere',
});
export const titleAccent = style({
  color: t.color.primary,
  display: 'block',
});
export const heroLead = style({
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} 120ms both`,
  color: t.color.onSurfaceVariant,
  fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
  lineHeight: 1.65,
  margin: '0 0 1.75rem',
  maxWidth: '40ch',
});
export const heroActions = style({
  alignItems: 'center',
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} 180ms both`,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
});
const button = style({
  alignItems: 'center',
  borderRadius: t.shape.full,
  boxSizing: 'border-box',
  display: 'inline-flex',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.75rem',
  justifyContent: 'center',
  lineHeight: 1.4,
  minHeight: '48px',
  padding: '0.75rem 1.5rem',
  selectors: {
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '4px',
    },
    '&:hover': {
      textDecoration: 'none',
      transform: 'translateY(-2px)',
    },
  },
  textDecoration: 'none',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, transform ${t.motion.duration} ${t.motion.easing}`,
});
export const ctaPrimary = style([
  button,
  {
    backgroundColor: t.color.primary,
    boxShadow: t.elevation.raised,
    color: t.color.onPrimary,
    selectors: {
      '&:hover': {
        backgroundColor: t.color.primaryHover,
      },
    },
  },
]);
export const ctaSecondary = style([
  button,
  {
    backgroundColor: t.color.surface,
    border: `1px solid ${t.color.outline}`,
    color: t.color.primary,
    selectors: {
      '&:hover': {
        backgroundColor: t.color.primaryContainer,
      },
    },
  },
]);
export const demos = style({
  position: 'relative',
});
export const sectionHeading = style({
  alignItems: 'baseline',
  display: 'flex',
  flexWrap: 'wrap',
  gap: t.space.medium,
  justifyContent: 'space-between',
  marginBottom: t.space.large,
});
export const sectionTitle = style({
  fontSize: t.type.headline,
  fontWeight: 700,
  letterSpacing: '-0.035em',
  lineHeight: 1.2,
  margin: 0,
});
export const sectionNote = style({
  color: t.color.onSurface,
  fontSize: '0.8125rem',
});
export const demoGrid = style({
  '@media': {
    '(min-width: 600px) and (max-width: 1199px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '(min-width: 1200px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: t.space.medium,
  gridTemplateColumns: 'minmax(0, 1fr)',
});
export const demoCard = style({
  '@media': {
    '(max-width: 599px)': {
      alignItems: 'center',
      display: 'grid',
      gap: '0.375rem 1rem',
      gridTemplateColumns: '48px minmax(0, 1fr) 24px',
      padding: '1.25rem',
    },
  },
  alignItems: 'flex-start',
  backgroundColor: cardSurface,
  borderRadius: t.shape.large,
  color: t.color.onSurface,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: '1.5rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '4px',
    },
    '&:hover': {
      boxShadow: t.elevation.raised,
      textDecoration: 'none',
      transform: 'translateY(-4px)',
    },
  },
  textDecoration: 'none',
  transition: `transform ${t.motion.duration} ${t.motion.easing}, box-shadow ${t.motion.duration} ${t.motion.easing}`,
});
export const rendering = style({
  vars: {
    [cardSurface]: t.color.primaryContainer,
    [cardAccent]: t.color.onPrimaryContainer,
  },
});
export const rpc = style({
  vars: {
    [cardSurface]: t.color.secondaryContainer,
    [cardAccent]: t.color.onSecondaryContainer,
  },
});
export const labs = style({
  vars: {
    [cardSurface]: t.color.tertiaryContainer,
    [cardAccent]: t.color.onTertiaryContainer,
  },
});
export const errors = style({
  vars: {
    [cardSurface]: t.color.errorContainer,
    [cardAccent]: t.color.onErrorContainer,
  },
});
export const demoIcon = style({
  '@media': {
    '(max-width: 599px)': {
      gridColumn: 1,
      gridRow: '1 / 3',
      marginBottom: 0,
    },
  },
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.medium,
  color: cardAccent,
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '1.25rem',
  height: '48px',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  width: '48px',
});
export const demoTitle = style({
  '@media': {
    '(max-width: 599px)': {
      fontSize: '1rem',
      gridColumn: 2,
      margin: 0,
    },
  },
  fontSize: t.type.title,
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.3,
  margin: '0 0 0.5rem',
});
export const demoDescription = style({
  '@media': {
    '(max-width: 599px)': {
      fontSize: '0.8125rem',
      gridColumn: 2,
      gridRow: 2,
      margin: 0,
    },
  },
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  lineHeight: 1.6,
  margin: '0 0 1.5rem',
});
export const demoAction = style({
  '@media': {
    '(max-width: 599px)': {
      alignSelf: 'center',
      fontSize: 0,
      gridColumn: 3,
      gridRow: '1 / 3',
      margin: 0,
    },
  },
  alignItems: 'center',
  alignSelf: 'stretch',
  color: cardAccent,
  display: 'inline-flex',
  fontSize: '0.8125rem',
  fontWeight: 650,
  gap: '0.5rem',
  justifyContent: 'space-between',
  marginTop: 'auto',
});
globalStyle(`${demoAction} svg`, {
  flexShrink: 0,
  fontSize: '1rem',
});
export const footer = style({
  borderTop: `1px solid ${t.color.outline}`,
  marginTop: t.space.extraLarge,
  paddingBlockStart: t.space.extraLarge,
});
export const poweredLabel = style({
  color: t.color.onSurface,
  fontSize: '0.75rem',
  margin: '0 0 0.75rem',
});
export const technologies = style({
  '@media': {
    '(max-width: 599px)': {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem 2rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
globalStyle(`${technologies} li`, {
  alignItems: 'center',
  display: 'flex',
  fontSize: '0.8125rem',
  fontWeight: 650,
  gap: '0.5rem',
  minWidth: 0,
});
globalStyle(`${technologies} li > span`, {
  minWidth: 0,
  overflowWrap: 'anywhere',
});
globalStyle(`${technologies} li img`, {
  flexShrink: 0,
  height: '1.5rem',
  objectFit: 'contain',
  width: '1.75rem',
});
export const lightLogo = style({
  selectors: {
    ':root[data-theme="dark"] &': {
      display: 'none',
    },
  },
});
export const darkLogo = style({
  display: 'none',
  selectors: {
    ':root[data-theme="dark"] &': {
      display: 'block',
    },
  },
});
