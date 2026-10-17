import { createVar, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const focus = {
  outline: `3px solid ${t.color.primary}`,
  outlineOffset: '3px',
};
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
export const previewBackgroundColor = createVar();
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
export const pageShell = style({
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
  backgroundImage: 'url("/assets/dominant-color-expressive.svg")',
  backgroundPosition: 'center top',
  backgroundRepeat: 'repeat-y',
  backgroundSize: '100% auto',
  inset: 0,
  opacity: 0.65,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: -1,
});
export const content = style({
  boxSizing: 'border-box',
  display: 'grid',
  gap: t.space.section,
  marginInline: 'auto',
  maxWidth: '1280px',
  minWidth: 0,
  padding: `1.5rem clamp(8px, 3.5vw, 3rem) ${t.space.pageFooterGap}`,
  width: '100%',
});
export const intro = style({
  display: 'grid',
  gap: '0.75rem',
});
export const title = style({
  color: t.color.primary,
  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
  fontWeight: 750,
  letterSpacing: '-0.045em',
  lineHeight: 1.15,
  margin: 0,
});
export const lead = style({
  color: t.color.onSurfaceVariant,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: '48rem',
});
export const workspace = style({
  backgroundColor: t.color.surfaceContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.extraLarge,
  display: 'grid',
  gap: '1.5rem 2rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
  minWidth: 0,
  padding: 'clamp(0.75rem, 2vw, 1.5rem)',
});
export const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  minWidth: 0,
});
export const sectionTitle = style({
  color: t.color.onSurface,
  fontSize: t.type.headline,
  letterSpacing: '-0.025em',
  lineHeight: 1.3,
  margin: 0,
});
export const sectionBody = style({
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  lineHeight: 1.6,
  margin: 0,
});
export const dropzone = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  blockSize: '22rem',
  border: `2px dashed ${t.color.outline}`,
  borderRadius: t.shape.large,
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'grid',
  flex: '1 0 22rem',
  gridTemplateRows: 'minmax(0, 1fr)',
  minBlockSize: 0,
  minWidth: 0,
  overflow: 'hidden',
  padding: '0.75rem',
  position: 'relative',
  selectors: {
    '&:focus-within': {
      ...focus,
      borderColor: t.color.primary,
    },
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
      borderColor: t.color.primary,
    },
    '&[aria-disabled="true"]': {
      cursor: 'wait',
    },
  },
  textAlign: 'center',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, border-color ${t.motion.duration} ${t.motion.easing}`,
});
export const dropzoneActive = style({
  backgroundColor: t.color.primaryContainer,
  borderColor: t.color.primary,
});
export const dropContent = style({
  display: 'grid',
  gap: '0.75rem',
  justifyItems: 'center',
  padding: '1rem',
  pointerEvents: 'none',
});
export const dropIcon = style({
  alignItems: 'center',
  backgroundColor: t.color.primaryContainer,
  borderRadius: t.shape.large,
  color: t.color.onPrimaryContainer,
  display: 'flex',
  fontSize: '1.75rem',
  height: '64px',
  justifyContent: 'center',
  width: '64px',
});
export const dropTitle = style({
  color: t.color.onSurface,
  fontSize: t.type.title,
  fontWeight: 650,
  margin: 0,
});
export const dropNote = style({
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const input = style({
  cursor: 'pointer',
  height: '100%',
  inset: 0,
  opacity: 0,
  position: 'absolute',
  width: '100%',
  zIndex: 1,
});
export const preview = style({
  blockSize: '100%',
  borderRadius: t.shape.medium,
  display: 'block',
  inlineSize: '100%',
  objectFit: 'contain',
});
export const previewWrap = style({
  backgroundColor: previewBackgroundColor,
  blockSize: '100%',
  borderRadius: t.shape.medium,
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
  vars: {
    [previewBackgroundColor]: t.color.surfaceRaised,
  },
});
export const actionRow = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
});
export const fileMeta = style([
  dropNote,
  {
    alignContent: 'center',
    blockSize: 'calc(4.5em + 0.25rem)',
    display: 'grid',
    flex: '1 1 10rem',
    gap: '0.25rem',
    gridTemplateRows: 'minmax(0, auto) 1.5em',
    lineHeight: 1.5,
    minWidth: 'min(100%, 10rem)',
  },
]);
export const fileName = style({
  display: 'block',
  maxBlockSize: '3em',
  minBlockSize: 0,
  minWidth: 0,
  overflowWrap: 'anywhere',
  overflowX: 'hidden',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  selectors: {
    '&:focus-visible': focus,
  },
});
export const fileDetails = style({
  color: t.color.onSurfaceVariant,
  whiteSpace: 'nowrap',
});
export const action = style({
  alignItems: 'center',
  backgroundColor: t.color.primary,
  border: 0,
  borderRadius: t.shape.full,
  color: t.color.onPrimary,
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.625rem',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.75rem 1.25rem',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
    '&:focus-visible': focus,
    '&:hover:not(:disabled)': {
      backgroundColor: t.color.primaryHover,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
});
export const error = style({
  backgroundColor: t.color.errorContainer,
  borderRadius: t.shape.medium,
  color: t.color.onErrorContainer,
  lineHeight: 1.6,
  overflowWrap: 'anywhere',
  padding: '1rem',
});
export const result = style({
  backgroundColor: t.color.surfaceRaised,
  blockSize: '26rem',
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.large,
  display: 'flex',
  flex: '1 0 26rem',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
});
export const resultHeader = style({
  alignItems: 'center',
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  justifyContent: 'space-between',
  padding: '1rem',
});
export const swatch = style({
  blockSize: '4rem',
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.medium,
  flex: '0 0 auto',
  inlineSize: '4rem',
});
export const resultTitle = style({
  color: t.color.onSurface,
  fontFamily: mono,
  fontSize: '1.5rem',
  fontWeight: 700,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const resultMeta = style({
  color: t.color.onSurfaceVariant,
  display: 'grid',
  fontSize: '0.75rem',
  gap: '0.25rem',
  lineHeight: 1.6,
  marginBlockStart: '0.5rem',
  overflowWrap: 'anywhere',
});
export const json = style({
  blockSize: '100%',
  color: t.color.onSurface,
  fontFamily: mono,
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  margin: 0,
  minBlockSize: 0,
  overflow: 'auto',
  overflowWrap: 'anywhere',
  padding: '1rem',
  whiteSpace: 'pre-wrap',
});
export const emptyResult = style({
  alignContent: 'center',
  color: t.color.onSurfaceVariant,
  display: 'grid',
  flex: '1 1 auto',
  gap: '1rem',
  justifyItems: 'center',
  padding: '1.5rem',
  textAlign: 'center',
});
export const outputToggle = style({
  borderBlockEnd: `1px solid ${t.color.outline}`,
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
});
export const outputTab = style({
  backgroundColor: 'transparent',
  border: 0,
  borderRadius: t.shape.full,
  color: t.color.onSurfaceVariant,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: t.type.label,
  minHeight: '44px',
  padding: '0.625rem 1rem',
  selectors: {
    '&:focus-visible': focus,
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
      color: t.color.onPrimaryContainer,
    },
  },
});
export const outputTabActive = style({
  backgroundColor: t.color.primaryContainer,
  color: t.color.onPrimaryContainer,
  fontWeight: 650,
});
export const outputContent = style({
  flex: '1 1 0',
  minBlockSize: 0,
  overflow: 'auto',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '-3px',
    },
  },
});
export const formattedOutput = style({
  padding: '1rem',
});
export const formattedIntro = style({
  paddingBlockEnd: '0.75rem',
});
export const formattedTitle = style({
  fontSize: t.type.title,
  margin: 0,
});
export const formattedNote = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.8125rem',
  lineHeight: 1.6,
  margin: '0.5rem 0 0',
});
export const formatList = style({
  display: 'grid',
});
export const formatRow = style({
  alignItems: 'center',
  borderBlockStart: `1px solid ${t.color.outline}`,
  display: 'flex',
  gap: '0.875rem',
  minBlockSize: '4rem',
  paddingBlock: '0.75rem',
});
export const formatSwatch = style({
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.small,
  flex: '0 0 auto',
  height: '2.5rem',
  width: '2.5rem',
});
export const formatCopy = style({
  minWidth: 0,
});
export const formatHeader = style({
  alignItems: 'baseline',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem 0.75rem',
});
export const formatLabel = style({
  fontSize: t.type.label,
  fontWeight: 650,
});
export const formatSupport = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.6875rem',
});
export const formatValue = style({
  color: t.color.onSurfaceVariant,
  display: 'block',
  fontFamily: mono,
  fontSize: '0.8125rem',
  lineHeight: 1.6,
  marginBlockStart: '0.25rem',
  overflowWrap: 'anywhere',
});
export const implementation = style({
  borderBlockStart: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1rem',
  paddingBlockStart: '1.5rem',
});
