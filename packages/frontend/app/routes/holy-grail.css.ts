import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

export const headerHeight = createVar();
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
  vars: {
    [headerHeight]: '80px',
  },
});
export const workspace = style({
  alignContent: 'start',
  display: 'grid',
  gridTemplateRows: 'auto auto auto',
  minWidth: 0,
});
export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 20,
});
export const main = style({
  '@media': {
    [mediaQueries.minWidth1200]: {
      gridTemplateColumns: 'minmax(0, 960px) 224px',
    },
  },
  alignItems: 'start',
  boxSizing: 'border-box',
  display: 'grid',
  gap: '2.5rem',
  gridTemplateColumns: 'minmax(0, 1fr)',
  isolation: 'isolate',
  justifyContent: 'center',
  marginInline: 'auto',
  minWidth: 0,
  outline: 'none',
  overflow: 'clip',
  padding: `1.5rem clamp(1rem, 3.5vw, 3rem) ${t.space.pageFooterGap}`,
  position: 'relative',
  width: '100%',
});
export const article = style({
  minWidth: 0,
});
export const intro = style({
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} both`,
  isolation: 'isolate',
  marginBottom: '2rem',
  position: 'relative',
});
export const artwork = style({
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.36,
    },
  },
  backgroundImage: 'url("/assets/holy-grail-expressive.svg")',
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
  display: 'inline-block',
});
export const lead = style({
  color: t.color.onSurface,
  fontSize: t.type.body,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: '62ch',
});
export const sectionTitle = style({
  fontSize: t.type.headline,
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.25,
  margin: '0 0 0.75rem',
  overflowWrap: 'anywhere',
});
export const body = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  lineHeight: 1.65,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const explorer = style({
  animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} 80ms both`,
});
export const previewWidth = createVar();
export const previewControls = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.25rem 0.75rem',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  marginBlock: '1.25rem',
});
export const previewWidthLabel = style({
  display: 'flex',
  fontSize: t.type.label,
  fontWeight: 650,
  gridColumn: '1 / -1',
  justifyContent: 'space-between',
  lineHeight: 1.5,
});
export const widthSlider = style({
  accentColor: t.color.primary,
  cursor: 'pointer',
  height: '44px',
  margin: 0,
  minWidth: 0,
  selectors: {
    '&:focus-visible': {
      borderRadius: t.shape.small,
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
  },
  width: '100%',
});
export const resetButton = style({
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  color: t.color.primary,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: t.type.label,
  minHeight: '44px',
  padding: '0.5rem 1rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
});
export const previewFrame = style({
  backgroundColor: t.color.surfaceContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.large,
  boxSizing: 'border-box',
  containerType: 'inline-size',
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  marginInline: 'auto',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  width: previewWidth,
});
export const previewHeader = style({
  backgroundColor: t.color.primaryContainer,
  color: t.color.onPrimaryContainer,
  padding: '1rem',
});
export const previewPartLabel = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  lineHeight: 1.5,
  margin: 0,
});
export const previewTitle = style({
  fontSize: t.type.title,
  fontWeight: 650,
  lineHeight: 1.4,
  margin: '0.5rem 0 0',
  overflowWrap: 'anywhere',
});
export const previewBody = style({
  '@container': {
    [mediaQueries.minWidth40rem]: {
      gridTemplateAreas: '"navigation main aside"',
      gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 2fr) minmax(0, 0.85fr)',
    },
  },
  '@media': {
    [mediaQueries.maxWidth599]: {
      height: 'clamp(15rem, 50svh, 28rem)',
    },
  },
  alignItems: 'start',
  boxSizing: 'border-box',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateAreas: '"main" "navigation" "aside"',
  gridTemplateColumns: 'minmax(0, 1fr)',
  height: 'clamp(18rem, 60svh, 34rem)',
  minHeight: 0,
  minWidth: 0,
  overflow: 'auto',
  overscrollBehavior: 'contain',
  padding: '0.75rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '-3px',
    },
  },
});
export const previewNavigation = style({
  '@container': {
    [mediaQueries.minWidth40rem]: {
      position: 'sticky',
      top: 0,
    },
  },
  backgroundColor: t.color.surfaceContainer,
  gridArea: 'navigation',
  minWidth: 0,
  padding: '0.5rem',
});
export const previewAside = style({
  '@container': {
    [mediaQueries.minWidth40rem]: {
      position: 'sticky',
      top: 0,
    },
  },
  backgroundColor: t.color.surfaceContainer,
  display: 'grid',
  gap: '1rem',
  gridArea: 'aside',
  minWidth: 0,
  padding: '0.5rem',
});
export const previewArticle = style({
  backgroundColor: t.color.surfaceRaised,
  borderRadius: t.shape.medium,
  gridArea: 'main',
  minWidth: 0,
  padding: '1rem',
});
export const previewHeading = style({
  alignItems: 'center',
  display: 'flex',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  lineHeight: 1.5,
  margin: '0 0 0.75rem',
  overflowWrap: 'anywhere',
});
export const previewLinks = style({
  display: 'grid',
  gap: '0.25rem',
  listStyle: 'none',
  margin: '0.75rem 0',
  padding: 0,
});
export const previewLink = style({
  alignItems: 'center',
  borderRadius: t.shape.small,
  boxSizing: 'border-box',
  color: t.color.primary,
  display: 'flex',
  fontSize: t.type.label,
  lineHeight: 1.5,
  minHeight: '44px',
  overflowWrap: 'anywhere',
  padding: '0.5rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
    },
  },
  textDecoration: 'none',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
});
export const previewSection = style({
  borderTop: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '0.75rem',
  marginTop: '1.25rem',
  paddingTop: '1rem',
  scrollMarginBlockStart: `calc(${headerHeight} + 1rem)`,
  selectors: {
    '&:target, &:focus': {
      borderRadius: t.shape.small,
      outline: `2px solid ${t.color.primary}`,
      outlineOffset: '4px',
    },
  },
});
export const previewSectionTitle = style({
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
  margin: 0,
});
export const previewMetadata = style({
  borderTop: `1px solid ${t.color.outline}`,
  paddingTop: '1rem',
});
export const previewFooter = style({
  backgroundColor: t.color.primaryContainer,
  borderTop: `1px solid ${t.color.outline}`,
  color: t.color.onPrimaryContainer,
  display: 'grid',
  gap: '0.25rem',
  padding: '0.75rem 1rem',
});
export const notes = style({
  '@media': {
    [mediaQueries.minWidth1200]: {
      position: 'sticky',
      top: `calc(${headerHeight} + 1.5rem)`,
    },
  },
  backgroundColor: t.color.surfaceContainer,
  borderRadius: t.shape.large,
  minWidth: 0,
  padding: '1.25rem',
});
export const notesTitle = style({
  alignItems: 'center',
  display: 'flex',
  fontSize: t.type.title,
  fontWeight: 650,
  gap: '0.625rem',
  lineHeight: 1.45,
  margin: '0 0 1rem',
});
export const notesIcon = style({
  color: t.color.primary,
  fontSize: '1rem',
});
export const notesList = style({
  color: t.color.onSurfaceVariant,
  display: 'grid',
  fontSize: t.type.label,
  gap: '1rem',
  lineHeight: 1.65,
  margin: '1.25rem 0',
  paddingInlineStart: '1rem',
});
export const noteLabel = style({
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
  margin: '0 0 0.5rem',
});
