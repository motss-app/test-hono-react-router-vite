import { globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const reveal = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(10px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
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
      opacity: 0.36,
    },
  },
  backgroundImage: 'url("/assets/about-expressive.svg")',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  inset: 0,
  opacity: 0.8,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: -1,
});
globalStyle(`:root[data-theme="dark"] ${artwork}`, {
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.28,
    },
  },
  opacity: 0.62,
});
export const content = style({
  marginInline: 'auto',
  maxWidth: '960px',
  padding: `1.5rem clamp(1rem, 3.5vw, 3rem) ${t.space.pageFooterGap}`,
  position: 'relative',
});
export const intro = style({
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} both`,
  maxWidth: '42rem',
  paddingBlockEnd: '2rem',
});
export const title = style({
  color: t.color.onSurface,
  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
  fontWeight: 750,
  letterSpacing: '-0.045em',
  lineHeight: 1.15,
  margin: '0 0 1rem',
  overflowWrap: 'anywhere',
});
export const titleAccent = style({
  color: t.color.primary,
});
export const lead = style({
  color: t.color.onSurface,
  fontSize: t.type.body,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: '62ch',
});
export const section = style({
  marginBlockEnd: '2rem',
  selectors: {
    '&:last-child': {
      marginBlockEnd: 0,
    },
  },
});
export const sectionTitle = style({
  fontSize: t.type.headline,
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.25,
  margin: '0 0 1rem',
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

export const introSummary = style({
  color: t.color.primary,
  fontSize: t.type.body,
  fontWeight: 650,
  lineHeight: 1.5,
  margin: '0 0 0.75rem',
});
export const stackGroups = style({
  '@media': {
    [mediaQueries.minWidth768]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: '1.75rem 2.5rem',
});
export const stackGroup = style({
  borderTop: `1px solid ${t.color.outline}`,
  minWidth: 0,
  paddingBlockStart: '1.25rem',
});
export const groupTitle = style({
  alignItems: 'center',
  display: 'flex',
  fontSize: t.type.title,
  fontWeight: 700,
  gap: '0.625rem',
  lineHeight: 1.4,
  margin: '0 0 1rem',
  minWidth: 0,
});
export const stackRows = style({
  display: 'grid',
  gap: '1rem',
  margin: 0,
});
export const stackRow = style({
  minWidth: 0,
});
export const technologyName = style({
  alignItems: 'center',
  color: t.color.onSurface,
  display: 'flex',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  lineHeight: 1.5,
  overflowWrap: 'anywhere',
});
export const technologyRole = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  lineHeight: 1.6,
  margin: '0.25rem 0 0 28px',
});
export const choices = style({
  display: 'grid',
  gap: '1.25rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const choice = style({
  alignItems: 'start',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '20px minmax(0, 1fr)',
});
export const choiceIcon = style({
  color: t.color.primary,
  fontSize: '1rem',
  marginTop: '0.25rem',
});
export const choiceTitle = style({
  fontSize: t.type.body,
  fontWeight: 650,
  lineHeight: 1.5,
  margin: '0 0 0.25rem',
});
export const choiceDescription = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  lineHeight: 1.6,
  margin: 0,
});

globalStyle(`${technologyName} > span`, {
  minWidth: 0,
  overflowWrap: 'anywhere',
});
