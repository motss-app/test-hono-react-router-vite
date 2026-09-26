import { createVar, keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { radiusTokens } from '../styles/radius-tokens.contract.css.ts';

const reveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(1rem)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

const errorPop = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateX(-0.5rem) scale(0.98)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateX(0) scale(1)',
  },
});

const spin = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

export const previewBackgroundColor = createVar();

export const page = style({
  minInlineSize: 0,
  paddingBlockEnd: '5rem',
});
export const hero = style({
  background: 'linear-gradient(135deg, #101827 0%, #1f2937 58%, #1e3a5f 100%)',
  color: colorTokens.white,
  minInlineSize: 0,
});
export const heroInner = style({
  alignItems: 'end',
  display: 'grid',
  marginInline: 'auto',
  maxWidth: '84rem',
  minBlockSize: '48svh',
  padding: '5rem 1rem 3rem',
});
export const eyebrow = style({
  color: '#93c5fd',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  marginBlockEnd: '1.25rem',
  textTransform: 'uppercase',
});
export const title = style({
  fontSize: 'clamp(2.75rem, 8vw, 6.5rem)',
  fontWeight: 700,
  letterSpacing: '-0.07em',
  lineHeight: 0.9,
  margin: 0,
  maxWidth: '8ch',
});
export const heroLead = style({
  color: '#d1d5db',
  fontSize: 'clamp(1.05rem, 2vw, 1.4rem)',
  lineHeight: 1.45,
  margin: '1.5rem 0 0',
  maxWidth: '34rem',
});
export const heroActions = style({
  '@media': {
    '(max-width: 480px)': {
      gridAutoFlow: 'row',
    },
  },
  display: 'inline-grid',
  gap: '0.75rem',
  gridAutoFlow: 'column',
  justifyContent: 'flex-start',
  marginBlockStart: '2rem',
  maxInlineSize: '100%',
});
export const ctaSecondary = style({
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  borderColor: 'rgba(15, 23, 42, 0.12)',
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  color: colorTokens.slate900,
  display: 'inline-grid',
  fontWeight: 600,
  gap: '0.5rem',
  gridAutoFlow: 'column',
  padding: '0.92rem 1.45rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.28)',
      borderColor: 'rgba(226, 232, 240, 0.26)',
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: colorTokens.slate400,
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: '#93c5fd',
      transform: 'translate3d(0, -0.125rem, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
});
export const inner = style({
  marginInline: 'auto',
  maxWidth: '84rem',
  padding: '4rem 1rem 3rem',
});
export const workspace = style({
  '@media': {
    '(min-width: 900px)': {
      gridTemplateColumns: 'minmax(0, 1.05fr) minmax(20rem, 0.95fr)',
    },
  },
  alignItems: 'start',
  display: 'grid',
  gap: '2rem',
});
export const uploadColumn = style({
  minInlineSize: 0,
});
export const sectionLabel = style({
  color: colorTokens.slate500,
  fontSize: '0.72rem',
  fontWeight: 750,
  letterSpacing: '0.13em',
  margin: '1.5rem 0 0.75rem',
  textTransform: 'uppercase',
});
export const sectionTitle = style({
  color: colorTokens.slate900,
  fontSize: 'clamp(1.75rem, 3vw, 2.6rem)',
  letterSpacing: '-0.05em',
  lineHeight: 1,
  margin: '0 0 0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const sectionBody = style({
  color: colorTokens.slate600,
  lineHeight: 1.65,
  margin: '0 0 1.5rem',
  maxWidth: '38rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const dropzone = style({
  alignItems: 'center',
  animation: `${reveal} 600ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  backgroundColor: '#eff6ff',
  blockSize: '21rem',
  border: '1px dashed #60a5fa',
  borderRadius: radiusTokens.radiusMd,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#172554',
      borderColor: '#60a5fa',
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#1e3a5f',
    },
    '&:hover': {
      backgroundColor: '#eff6ff',
      borderColor: '#2563eb',
      transform: 'translateY(-2px)',
    },
  },
  textAlign: 'center',
  transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease',
});
export const dropzoneActive = style({
  backgroundColor: '#eff6ff',
  borderColor: '#2563eb',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#1e3a5f',
      borderColor: '#93c5fd',
    },
  },
  transform: 'scale(1.01)',
});
export const dropContent = style({
  display: 'grid',
  gap: '0.65rem',
});
export const dropIcon = style({
  color: '#3b82f6',
  fontSize: '2.5rem',
  lineHeight: 1,
});
export const dropTitle = style({
  color: colorTokens.slate900,
  fontSize: '1.2rem',
  fontWeight: 700,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const dropNote = style({
  color: colorTokens.slate600,
  fontSize: '0.9rem',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const input = style({
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
});
export const preview = style({
  blockSize: '100%',
  borderRadius: radiusTokens.radiusMd,
  display: 'block',
  inlineSize: '100%',
  maxBlockSize: '100%',
  maxInlineSize: '100%',
  objectFit: 'contain',
});
export const previewWrap = style({
  alignItems: 'center',
  backgroundColor: previewBackgroundColor,
  blockSize: '100%',
  borderRadius: radiusTokens.radiusMd,
  display: 'flex',
  inlineSize: '100%',
  justifyContent: 'center',
  maxBlockSize: '100%',
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
  vars: {
    [previewBackgroundColor]: '#111827',
  },
});
export const actionRow = style({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: '0.8rem',
  marginBlock: '1rem 1.5rem',
});
export const action = style({
  backgroundColor: '#1e40af',
  border: 0,
  borderRadius: radiusTokens.radiusMd,
  color: colorTokens.white,
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: 700,
  padding: '0.85rem 1.15rem',
  selectors: {
    '&:disabled': {
      cursor: 'wait',
      opacity: 0.55,
    },
    '&:focus-visible': {
      outline: '2px solid #93c5fd',
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-1px)',
    },
  },
  transition: 'background-color 180ms ease, transform 180ms ease',
});
export const subtleAction = style({
  background: 'transparent',
  border: 0,
  color: colorTokens.slate600,
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: 650,
  padding: '0.85rem 0',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
    '&:focus-visible': {
      outline: '2px solid #93c5fd',
      outlineOffset: '2px',
    },
    '&:hover': {
      color: '#1d4ed8',
    },
  },
});
export const error = style({
  alignItems: 'flex-start',
  animation: `${errorPop} 280ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderInlineStart: '3px solid #dc2626',
  borderRadius: radiusTokens.radiusMd,
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)',
  color: '#991b1b',
  display: 'flex',
  gap: '0.65rem',
  marginBlockStart: '1rem',
  padding: '0.9rem 1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#32191c',
      borderColor: '#7f1d1d',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
      color: '#fecaca',
    },
  },
});
export const errorIcon = style({
  blockSize: '1.1rem',
  flexShrink: 0,
  inlineSize: '1.1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#fca5a5',
    },
  },
});
export const errorText = style({
  flex: 1,
  lineHeight: 1.5,
  minInlineSize: 0,
  overflowWrap: 'anywhere',
});
export const resultColumn = style({
  animation: `${reveal} 600ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  minInlineSize: 0,
});
export const result = style({
  backgroundColor: '#0a1222',
  border: '1px solid #5878a8',
  borderRadius: radiusTokens.radiusMd,
  color: '#d1d5db',
  display: 'flex',
  flexDirection: 'column',
  minBlockSize: '20rem',
  overflow: 'hidden',
});
export const resultHeader = style({
  alignItems: 'center',
  borderBlockEnd: '1px solid #374151',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
  padding: '1rem 1.2rem',
});
export const resultTitle = style({
  color: colorTokens.white,
  fontSize: '1rem',
  fontWeight: 700,
  margin: 0,
});
export const resultMeta = style({
  color: '#9ca3af',
  display: 'grid',
  fontSize: '0.78rem',
  gap: '0.15rem',
  lineHeight: 1.45,
  margin: '0.2rem 0 0',
});
export const emptyResult = style({
  alignItems: 'center',
  color: '#f1f5ff',
  display: 'flex',
  flex: '1 1 auto',
  justifyContent: 'center',
  padding: '2rem',
  textAlign: 'center',
});
export const loadingResult = style({
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 auto',
  justifyContent: 'center',
  minBlockSize: '18rem',
  overflow: 'hidden',
  position: 'relative',
});
export const loadingPlaceholder = style({
  blockSize: '100%',
  filter: 'blur(2rem)',
  inlineSize: '100%',
  inset: 0,
  objectFit: 'cover',
  position: 'absolute',
  transform: 'scale(1.15)',
});
export const loadingPlaceholderFallback = style({
  background: 'linear-gradient(135deg, #172554, #0f172a 55%, #1e3a5f)',
  blockSize: '100%',
  inlineSize: '100%',
  inset: 0,
  position: 'absolute',
});
export const loadingOverlay = style({
  alignItems: 'center',
  backgroundColor: 'rgba(10, 18, 34, 0.78)',
  border: '1px solid rgba(147, 197, 253, 0.35)',
  borderRadius: '9999px',
  color: colorTokens.white,
  display: 'flex',
  fontSize: '0.9rem',
  fontWeight: 700,
  gap: '0.65rem',
  padding: '0.8rem 1rem',
  position: 'relative',
});
export const loadingSpinner = style({
  animation: `${spin} 900ms linear infinite`,
  blockSize: '1rem',
  border: '2px solid rgba(255, 255, 255, 0.35)',
  borderRadius: '50%',
  borderTopColor: colorTokens.white,
  display: 'block',
  inlineSize: '1rem',
});
export const optimizedImage = style({
  blockSize: 'auto',
  display: 'block',
  inlineSize: '100%',
  maxBlockSize: '24rem',
  maxInlineSize: '100%',
  objectFit: 'contain',
  padding: '1rem',
});
export const metadataGrid = style({
  borderTop: '1px solid #374151',
  display: 'grid',
  fontSize: '0.8rem',
  gap: '0.1rem',
  padding: '0.8rem 1.2rem',
});
export const metadataRow = style({
  alignItems: 'center',
  borderBottom: '1px solid #26333d',
  display: 'flex',
  justifyContent: 'space-between',
  paddingBlock: '0.45rem',
  paddingInline: '0.1rem',
});
export const metadataLabel = style({
  color: '#9ca3af',
  fontWeight: 500,
});
export const metadataValue = style({
  color: colorTokens.white,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.78rem',
  fontWeight: 600,
});
export const filterGroup = style({
  display: 'grid',
  gap: '0.5rem',
  marginBlockEnd: '1.5rem',
});
export const formatGroup = style({
  display: 'grid',
  gap: '0.5rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  marginBlockEnd: '1rem',
});
export const filterOption = style({
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid transparent',
  borderRadius: radiusTokens.radiusMd,
  cursor: 'pointer',
  display: 'flex',
  gap: '0.6rem',
  padding: '0.65rem 0.85rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },
  },
  transition: 'background-color 150ms ease, border-color 150ms ease',
});
export const filterOptionSelected = style({
  backgroundColor: 'rgba(59, 130, 246, 0.12)',
  borderColor: '#3b82f6',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
  },
});
export const filterRadio = style({
  accentColor: '#3b82f6',
  margin: 0,
});
export const filterLabel = style({
  color: colorTokens.slate900,
  fontSize: '0.9rem',
  fontWeight: 600,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});
export const filterRecommended = style({
  backgroundColor: '#dcfce7',
  border: '1px solid #86efac',
  borderRadius: '9999px',
  color: '#166534',
  fontSize: '0.65rem',
  fontWeight: 700,
  lineHeight: 1,
  marginInlineStart: '0.5rem',
  padding: '0.2rem 0.5rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      color: '#86efac',
    },
  },
  textTransform: 'uppercase',
});
export const dimensionRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: '0.5rem',
  marginBlockEnd: '1rem',
});
export const dimensionInput = style({
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  border: '1px solid #d1d5db',
  borderRadius: radiusTokens.radiusMd,
  color: colorTokens.slate900,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  fontVariantNumeric: 'tabular-nums',
  padding: '0.6rem 0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: '#374151',
      color: colorTokens.slate100,
    },
    '&:focus': {
      borderColor: '#3b82f6',
      outline: 'none',
    },
  },
  transition: 'border-color 150ms ease',
  width: '7rem',
});
export const dimensionSeparator = style({
  color: colorTokens.slate500,
  fontSize: '0.9rem',
  fontWeight: 500,
});
export const qualityHeader = style({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
});
export const qualityInput = style({
  accentColor: '#3b82f6',
  display: 'block',
  marginBlockEnd: '1.5rem',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
  width: '100%',
});
export const qualityValue = style({
  color: colorTokens.slate600,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  fontWeight: 700,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const presetGroup = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
  marginBlockEnd: '1.5rem',
});
export const presetChip = style({
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  border: '1px solid #d1d5db',
  borderRadius: '9999px',
  color: colorTokens.slate700,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '0.78rem',
  fontWeight: 600,
  padding: '0.4rem 0.85rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: '#374151',
      color: colorTokens.slate300,
    },
    ':root[data-theme="dark"] &::hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: '#3b82f6',
      color: colorTokens.white,
    },
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: '#3b82f6',
      color: colorTokens.white,
    },
  },
  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
});
export const presetChipActive = style({
  backgroundColor: '#1e40af',
  borderColor: '#3b82f6',
  color: colorTokens.white,
});
export const comparisonRow = style({
  display: 'grid',
  gap: '1.5rem',
  marginBlockStart: '2rem',
  paddingBlockStart: '2rem',
});
export const comparisonBox = style({
  minInlineSize: 0,
});
export const comparisonLabel = style({
  color: colorTokens.slate500,
  fontSize: '0.72rem',
  fontWeight: 750,
  letterSpacing: '0.13em',
  margin: '0 0 0.75rem',
  textTransform: 'uppercase',
});
export const comparisonImage = style({
  blockSize: 'auto',
  border: '1px solid #374151',
  borderRadius: radiusTokens.radiusMd,
  display: 'block',
  inlineSize: '100%',
  maxBlockSize: '20rem',
  maxInlineSize: '100%',
  objectFit: 'contain',
});
