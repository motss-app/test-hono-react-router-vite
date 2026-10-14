import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const statusAccent = createVar();
const statusSurface = createVar();
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
      opacity: 0.28,
    },
  },
  backgroundImage: 'url("/assets/errors-expressive.svg")',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% auto',
  inset: 0,
  opacity: 0.64,
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
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const groups = style({
  display: 'grid',
  gap: t.space.large,
});
export const group = style({
  '@media': {
    [mediaQueries.minWidth900]: {
      gridTemplateColumns: 'minmax(0, 14rem) minmax(0, 1fr)',
    },
  },
  backgroundColor: statusSurface,
  borderRadius: t.shape.large,
  display: 'grid',
  gap: '1rem 1.5rem',
  minWidth: 0,
  padding: '1.25rem',
});
export const tones = {
  critical: style({
    vars: {
      [statusAccent]: t.color.onErrorContainer,
      [statusSurface]: t.color.errorContainer,
    },
  }),
  runtime: style({
    vars: {
      [statusAccent]: t.color.onTertiaryContainer,
      [statusSurface]: t.color.tertiaryContainer,
    },
  }),
  warning: style({
    vars: {
      [statusAccent]: t.color.onSecondaryContainer,
      [statusSurface]: t.color.secondaryContainer,
    },
  }),
};
export const groupHeading = style({
  alignItems: 'flex-start',
  display: 'flex',
  gap: '0.875rem',
  minWidth: 0,
});
export const groupIcon = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.full,
  color: statusAccent,
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '1.25rem',
  height: '44px',
  justifyContent: 'center',
  width: '44px',
});
export const groupCopy = style({
  display: 'grid',
  gap: '0.5rem',
  minWidth: 0,
});
export const groupTitle = style({
  color: statusAccent,
  fontSize: '1.25rem',
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const groupCases = style({
  minWidth: 0,
});
export const caseList = style({
  display: 'grid',
  gap: '0.5rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const caseLink = style({
  '@media': {
    [mediaQueries.minWidth600]: {
      gridTemplateColumns: '3.5rem minmax(0, 1fr) auto',
    },
    [mediaQueries.reducedMotion]: {
      transition: 'none',
    },
  },
  alignItems: 'center',
  border: '1px solid transparent',
  borderRadius: t.shape.medium,
  color: t.color.onSurface,
  display: 'grid',
  gap: '0.625rem 0.875rem',
  gridTemplateColumns: '3.5rem minmax(0, 1fr)',
  minHeight: '44px',
  minWidth: 0,
  padding: '0.75rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${statusAccent}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: t.color.surfaceRaised,
      borderColor: statusAccent,
      textDecoration: 'none',
    },
  },
  textDecoration: 'none',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, border-color ${t.motion.duration} ${t.motion.easing}`,
});
export const caseCode = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.small,
  color: statusAccent,
  display: 'inline-flex',
  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  fontSize: '1rem',
  fontWeight: 700,
  justifyContent: 'center',
  minHeight: '44px',
  overflowWrap: 'anywhere',
  padding: '0.25rem',
});
export const caseCopy = style({
  display: 'grid',
  gap: '0.375rem',
  minWidth: 0,
});
export const caseTitle = style({
  fontSize: t.type.body,
  fontWeight: 700,
  lineHeight: 1.4,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const caseAction = style({
  '@media': {
    [mediaQueries.minWidth600]: {
      gridColumn: 'auto',
    },
  },
  alignItems: 'center',
  color: statusAccent,
  display: 'inline-flex',
  fontSize: '0.8125rem',
  fontWeight: 650,
  gap: '0.5rem',
  gridColumn: '2',
  justifySelf: 'end',
  lineHeight: 1.5,
});
export const details = style({
  marginTop: '0.5rem',
});
export const detailsToggle = style({
  borderRadius: t.shape.small,
  color: statusAccent,
  cursor: 'pointer',
  fontSize: '0.8125rem',
  fontWeight: 650,
  lineHeight: 1.5,
  padding: '0.875rem 0.75rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${statusAccent}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: t.color.surfaceRaised,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
});
export const detailList = style({
  display: 'grid',
  gap: '1rem',
  margin: 0,
  padding: '0.75rem',
});
export const detailTitle = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
  marginBottom: '0.375rem',
  overflowWrap: 'anywhere',
});
export const detailBody = style({
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const explanation = style({
  display: 'grid',
  gap: '1.5rem',
});
export const sectionTitle = style({
  fontSize: t.type.headline,
  fontWeight: 700,
  letterSpacing: '-0.035em',
  lineHeight: 1.25,
  margin: 0,
});
export const notices = style({
  '@media': {
    [mediaQueries.minWidth768]: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: '1.5rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const notice = style({
  borderTop: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.75rem',
  minWidth: 0,
  paddingTop: '1rem',
});
export const noticeNumber = style({
  color: t.color.primary,
  fontSize: '0.8125rem',
  fontWeight: 700,
});
export const noticeTitle = style({
  fontSize: t.type.body,
  fontWeight: 700,
  lineHeight: 1.4,
  margin: '0 0 0.5rem',
  overflowWrap: 'anywhere',
});
export const inlineCode = style({
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
      opacity: 0.2,
    },
  },
  opacity: 0.46,
});
