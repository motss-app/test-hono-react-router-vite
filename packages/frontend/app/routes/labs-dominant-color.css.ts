import { keyframes, style } from '@vanilla-extract/css';

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

export const page = style({
  minInlineSize: 0,
  paddingBlockEnd: '5rem',
});
export const hero = style({
  background: 'linear-gradient(135deg, #101827 0%, #1f2937 58%, #365314 100%)',
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
  color: '#bef264',
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
export const backLink = style({
  color: '#d9f99d',
  display: 'inline-block',
  fontWeight: 650,
  marginBlockEnd: '2.5rem',
  textDecoration: 'none',
});
export const inner = style({
  marginInline: 'auto',
  maxWidth: '84rem',
  padding: '4rem 1rem 0',
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
  margin: '0 0 0.75rem',
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
  backgroundColor: '#f7fee7',
  border: '1px dashed #84cc16',
  borderRadius: radiusTokens.radiusMd,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  minBlockSize: '21rem',
  padding: '2rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#1a2413',
      borderColor: '#65a30d',
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: '#25351a',
    },
    '&:hover': {
      backgroundColor: '#ecfccb',
      borderColor: '#4d7c0f',
      transform: 'translateY(-2px)',
    },
  },
  textAlign: 'center',
  transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease',
});
export const dropzoneActive = style({
  backgroundColor: '#ecfccb',
  borderColor: '#365314',
  transform: 'scale(1.01)',
});
export const dropContent = style({
  display: 'grid',
  gap: '0.65rem',
});
export const dropIcon = style({
  color: '#65a30d',
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
  display: 'none',
});
export const preview = style({
  borderRadius: radiusTokens.radiusMd,
  display: 'block',
  maxBlockSize: '21rem',
  maxInlineSize: '100%',
  objectFit: 'contain',
  width: '100%',
});
export const previewWrap = style({
  alignItems: 'center',
  backgroundColor: '#111827',
  borderRadius: radiusTokens.radiusMd,
  display: 'flex',
  justifyContent: 'center',
  minBlockSize: '21rem',
  overflow: 'hidden',
});
export const actionRow = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.8rem',
  marginBlockStart: '1rem',
});
export const action = style({
  backgroundColor: '#365314',
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
    '&:hover': {
      backgroundColor: '#4d7c0f',
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
    '&:hover': {
      color: '#4d7c0f',
    },
  },
});
export const error = style({
  backgroundColor: '#fef2f2',
  borderInlineStart: '3px solid #dc2626',
  color: '#991b1b',
  marginBlockStart: '1rem',
  padding: '0.9rem 1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#32191c',
      color: '#fecaca',
    },
  },
});
export const resultColumn = style({
  animation: `${reveal} 600ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  minInlineSize: 0,
});
export const result = style({
  backgroundColor: '#111827',
  borderRadius: radiusTokens.radiusMd,
  color: '#d1d5db',
  minBlockSize: '21rem',
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
export const swatch = style({
  blockSize: '2.2rem',
  border: '1px solid rgba(255,255,255,0.35)',
  borderRadius: '50%',
  flex: '0 0 auto',
  inlineSize: '2.2rem',
});
export const resultTitle = style({
  color: colorTokens.white,
  fontSize: '1rem',
  fontWeight: 700,
  margin: 0,
});
export const resultMeta = style({
  color: '#9ca3af',
  fontSize: '0.78rem',
  margin: '0.2rem 0 0',
});
export const json = style({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.8rem',
  lineHeight: 1.65,
  margin: 0,
  maxBlockSize: '35rem',
  overflow: 'auto',
  padding: '1.2rem',
});
export const emptyResult = style({
  alignItems: 'center',
  color: colorTokens.slate500,
  display: 'flex',
  justifyContent: 'center',
  minBlockSize: '21rem',
  padding: '2rem',
  textAlign: 'center',
});
export const footer = style({
  borderBlockStart: '1px solid #e5e7eb',
  color: colorTokens.slate500,
  fontSize: '0.85rem',
  lineHeight: 1.6,
  marginBlockStart: '4rem',
  paddingBlockStart: '1.5rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderBlockStartColor: '#374151',
      color: colorTokens.slate400,
    },
  },
});
