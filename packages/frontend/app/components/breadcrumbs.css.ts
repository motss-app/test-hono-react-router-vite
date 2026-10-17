import { style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';

export const list = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.375rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const item = style({
  alignItems: 'center',
  display: 'flex',
  fontSize: t.type.label,
  gap: '0.375rem',
  minWidth: 0,
});
export const link = style({
  alignItems: 'center',
  borderRadius: t.shape.small,
  color: t.color.primary,
  display: 'inline-flex',
  minHeight: '44px',
  paddingInline: '0.375rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  textDecoration: 'none',
});
export const current = style({
  alignItems: 'center',
  color: t.color.onSurfaceVariant,
  display: 'inline-flex',
  fontWeight: 600,
  minHeight: '44px',
  overflowWrap: 'anywhere',
  paddingInline: '0.375rem',
});
export const separator = style({
  color: t.color.onSurfaceVariant,
  fontSize: '0.625rem',
});
