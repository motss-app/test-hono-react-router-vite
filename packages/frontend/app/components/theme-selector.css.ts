import { style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';

export const visuallyHidden = style({
  border: 0,
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
});
export const positioner = style({
  zIndex: 20,
});
export const portal = style({
  height: 0,
  position: 'absolute',
  width: 0,
});
export const popup = style({
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.medium,
  boxShadow: t.elevation.raised,
  color: t.color.onSurface,
  minWidth: '180px',
  padding: '0.375rem',
});
export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const item = style({
  alignItems: 'center',
  borderRadius: t.shape.small,
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'flex',
  fontSize: t.type.label,
  gap: '0.75rem',
  minHeight: '44px',
  outline: 'none',
  padding: '0.5rem 0.75rem',
  selectors: {
    '&[aria-selected="true"]': {
      fontWeight: 650,
    },
    '&[data-highlighted]': {
      backgroundColor: t.color.primaryContainer,
      color: t.color.onPrimaryContainer,
      outline: `2px solid ${t.color.primary}`,
      outlineOffset: '-2px',
    },
  },
});
export const indicator = style({
  display: 'flex',
  marginInlineStart: 'auto',
});
export const optionIcon = style({
  flexShrink: 0,
  height: '1rem',
  width: '1rem',
});
