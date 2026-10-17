import { keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const focus = {
  outline: `3px solid ${t.color.primary}`,
  outlineOffset: '3px',
};
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
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
const spin = keyframes({
  to: {
    transform: 'rotate(360deg)',
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
  backgroundImage: 'url("/assets/image-optimize-expressive.svg")',
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
  color: t.color.primary,
  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
  fontWeight: 750,
  letterSpacing: '-0.045em',
  lineHeight: 1.15,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const lead = style({
  color: t.color.onSurfaceVariant,
  lineHeight: 1.65,
  margin: 0,
  maxWidth: '48rem',
});
export const workbench = style({
  backgroundColor: t.color.surfaceContainer,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.extraLarge,
  containerName: 'image-optimize',
  containerType: 'inline-size',
  minWidth: 0,
  padding: 'clamp(0.75rem, 2vw, 1.5rem)',
});
export const workspace = style({
  '@container': {
    'image-optimize (min-width: 37.5rem)': {
      gridTemplateAreas: '"source output" "settings settings" "metrics metrics"',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  display: 'grid',
  gap: '1.5rem',
  gridTemplateAreas: '"source" "settings" "output" "metrics"',
  gridTemplateColumns: 'minmax(0, 1fr)',
});
export const previewPane = style({
  alignContent: 'start',
  containerName: 'optimize-preview',
  containerType: 'inline-size',
  display: 'grid',
  gap: '0.75rem',
  minWidth: 0,
});
export const sourcePane = style({
  gridArea: 'source',
});
export const outputPane = style({
  gridArea: 'output',
});
export const previewHeader = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  minHeight: '48px',
});
export const sectionTitle = style({
  color: t.color.onSurface,
  fontSize: t.type.title,
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
  minWidth: 0,
  overflowWrap: 'anywhere',
});
const secondaryButton = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  color: t.color.onSurface,
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontSize: t.type.label,
  fontWeight: 650,
  gap: '0.5rem',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.625rem 1rem',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
    '&:focus-visible': focus,
    '&:hover:not(:disabled)': {
      backgroundColor: t.color.primaryContainer,
      borderColor: t.color.primary,
      color: t.color.onPrimaryContainer,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, border-color ${t.motion.duration} ${t.motion.easing}`,
});
export const previewAction = style([
  secondaryButton,
  {
    '@container': {
      'optimize-preview (min-width: 24rem)': {
        paddingInline: '1rem',
        width: 'auto',
      },
    },
    flexShrink: 0,
    padding: 0,
    width: '48px',
  },
]);
export const previewActionLabel = style({
  '@container': {
    'optimize-preview (min-width: 24rem)': {
      display: 'inline',
    },
  },
  display: 'none',
  whiteSpace: 'nowrap',
});
export const actionIcon = style({
  flexShrink: 0,
  height: '1em',
  width: '1em',
});
export const previewFrame = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceRaised,
  blockSize: 'clamp(12rem, 24vw, 22rem)',
  border: `2px solid ${t.color.outline}`,
  borderRadius: t.shape.large,
  boxSizing: 'border-box',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: 'minmax(0, 1fr)',
  minWidth: 0,
  overflow: 'hidden',
  padding: '0.75rem',
  position: 'relative',
});
export const dropzone = style([
  previewFrame,
  {
    borderStyle: 'dashed',
    borderWidth: '2px',
    cursor: 'pointer',
    padding: '0.75rem',
    selectors: {
      '&:focus-within': {
        ...focus,
        borderColor: t.color.primary,
      },
      '&:hover': {
        backgroundColor: t.color.primaryContainer,
        borderColor: t.color.primary,
      },
    },
    transition: `background-color ${t.motion.duration} ${t.motion.easing}, border-color ${t.motion.duration} ${t.motion.easing}`,
  },
]);
export const dropzoneActive = style({
  backgroundColor: t.color.primaryContainer,
  borderColor: t.color.primary,
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
export const previewWrap = style({
  blockSize: '100%',
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  minBlockSize: 0,
  minWidth: 0,
});
export const preview = style({
  blockSize: '100%',
  borderRadius: t.shape.medium,
  display: 'block',
  inlineSize: '100%',
  minBlockSize: 0,
  minWidth: 0,
  objectFit: 'contain',
});
export const dropContent = style({
  alignContent: 'center',
  display: 'grid',
  gap: '0.75rem',
  justifyItems: 'center',
  minWidth: 0,
  overflowWrap: 'anywhere',
  padding: '0.5rem',
  pointerEvents: 'none',
  textAlign: 'center',
});
export const dropIcon = style({
  alignItems: 'center',
  backgroundColor: t.color.primaryContainer,
  borderRadius: t.shape.medium,
  color: t.color.onPrimaryContainer,
  display: 'flex',
  fontSize: '1.5rem',
  height: '48px',
  justifyContent: 'center',
  width: '48px',
});
export const dropTitle = style({
  fontSize: t.type.body,
  fontWeight: 650,
  margin: 0,
});
export const note = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.8125rem',
  lineHeight: 1.6,
  margin: 0,
  overflowWrap: 'anywhere',
});
export const caption = style({
  alignContent: 'center',
  blockSize: 'calc(4.5em + 0.25rem)',
  color: t.color.onSurfaceVariant,
  display: 'grid',
  fontSize: t.type.label,
  gap: '0.25rem',
  gridTemplateRows: 'minmax(0, auto) 1.5em',
  lineHeight: 1.5,
  minWidth: 0,
});
export const fileName = style({
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
  whiteSpace: 'nowrap',
});
export const outputCaption = style({
  alignContent: 'center',
  blockSize: 'calc(4.5em + 0.25rem)',
  color: t.color.onSurfaceVariant,
  display: 'grid',
  fontSize: t.type.label,
  gridTemplateRows: 'repeat(3, 1.5em)',
  lineHeight: 1.5,
  minWidth: 0,
  overflowWrap: 'anywhere',
});
export const loadingResult = style({
  alignItems: 'center',
  display: 'grid',
  height: '100%',
  justifyItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
  padding: '1rem',
  position: 'relative',
});
export const loadingPlaceholder = style({
  blockSize: '100%',
  filter: 'blur(2rem)',
  inlineSize: '100%',
  inset: 0,
  objectFit: 'cover',
  opacity: 0.35,
  position: 'absolute',
});
export const loadingOverlay = style({
  alignItems: 'center',
  backgroundColor: t.color.primaryContainer,
  borderRadius: t.shape.full,
  color: t.color.onPrimaryContainer,
  display: 'flex',
  fontSize: t.type.label,
  gap: '0.75rem',
  maxWidth: '100%',
  overflowWrap: 'anywhere',
  padding: '0.875rem',
  position: 'relative',
});
export const loadingSpinner = style({
  '@media': {
    [mediaQueries.reducedMotion]: {
      animation: 'none',
    },
  },
  animation: `${spin} 900ms linear infinite`,
  border: `2px solid ${t.color.outline}`,
  borderRadius: t.shape.full,
  borderTopColor: t.color.primary,
  flexShrink: 0,
  height: '1rem',
  width: '1rem',
});
export const settings = style({
  borderBlockStart: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1rem',
  gridArea: 'settings',
  minWidth: 0,
  paddingBlockStart: '1.5rem',
});
export const presetGroup = style({
  display: 'grid',
  gap: '0.75rem',
  gridAutoRows: '1fr',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
});
export const presetPair = style({
  display: 'grid',
  gap: '0.75rem',
  gridAutoRows: '1fr',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 6.5rem), 1fr))',
  minWidth: 0,
});
export const presetField = style({
  border: 0,
  display: 'grid',
  gap: '0.75rem',
  margin: 0,
  minWidth: 0,
  padding: 0,
});
export const presetChip = style([
  secondaryButton,
  {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
]);
export const presetChipActive = style({
  backgroundColor: t.color.primaryContainer,
  borderColor: t.color.primary,
  color: t.color.onPrimaryContainer,
});
export const fields = style({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))',
});
export const fieldPair = style({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
  minWidth: 0,
});
export const field = style({
  display: 'grid',
  gap: '0.5rem',
  minWidth: 0,
});
export const fieldLabel = style({
  color: t.color.onSurface,
  fontSize: t.type.label,
  fontWeight: 650,
  lineHeight: 1.5,
});
export const fieldInput = style({
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.medium,
  boxSizing: 'border-box',
  color: t.color.onSurface,
  font: 'inherit',
  fontSize: t.type.label,
  height: '48px',
  minWidth: 0,
  padding: '0.75rem',
  selectors: {
    '&:focus-visible': focus,
  },
  width: '100%',
});
export const qualityActions = style({
  alignItems: 'center',
  display: 'grid',
  gap: '1rem 2rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
});
export const qualityHeader = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
});
export const qualityInput = style({
  accentColor: t.color.primary,
  display: 'block',
  height: '32px',
  margin: '0.5rem 0 0',
  width: '100%',
});
export const qualityValue = style({
  color: t.color.onSurfaceVariant,
  fontFamily: mono,
  fontSize: t.type.label,
});
export const actionRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'end',
  minWidth: 0,
});
export const action = style([
  secondaryButton,
  {
    backgroundColor: t.color.primary,
    borderColor: t.color.primary,
    color: t.color.onPrimary,
    maxWidth: '100%',
    minWidth: 0,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: t.color.primaryHover,
        borderColor: t.color.primaryHover,
        color: t.color.onPrimary,
      },
    },
  },
]);
export const actionText = style({
  display: 'grid',
  minWidth: 0,
});
export const actionTextLabel = style({
  gridArea: '1 / 1',
  overflowWrap: 'anywhere',
});
export const actionTextHidden = style([
  actionTextLabel,
  {
    visibility: 'hidden',
  },
]);
export const error = style({
  alignItems: 'start',
  backgroundColor: t.color.errorContainer,
  borderRadius: t.shape.medium,
  color: t.color.onErrorContainer,
  display: 'flex',
  gap: '0.75rem',
  lineHeight: 1.6,
  overflowWrap: 'anywhere',
  padding: '1rem',
});
export const errorIcon = style({
  flexShrink: 0,
  height: '1.25rem',
  marginTop: '0.2rem',
  width: '1.25rem',
});
export const metadataGrid = style({
  display: 'grid',
  gap: '1rem',
  gridArea: 'metrics',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 8rem), 1fr))',
  margin: 0,
});
export const metadataRow = style({
  blockSize: '4.5rem',
  borderBlockStart: `1px solid ${t.color.outline}`,
  boxSizing: 'border-box',
  display: 'grid',
  gap: '0.25rem',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  minWidth: 0,
  paddingBlockStart: '0.75rem',
});
export const metadataLabel = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.75rem',
  lineHeight: 1.5,
});
export const metadataValue = style({
  color: t.color.onSurface,
  fontFamily: mono,
  fontSize: t.type.label,
  lineHeight: 1.5,
  margin: 0,
  minWidth: 0,
  overflowWrap: 'anywhere',
});
export const implementation = style({
  borderBlockStart: `1px solid ${t.color.outline}`,
  display: 'grid',
  gap: '1rem',
  paddingBlockStart: '1.5rem',
});
