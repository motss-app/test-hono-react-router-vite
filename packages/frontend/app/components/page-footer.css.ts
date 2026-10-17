import { style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';

export const footer = style({
  backgroundColor: t.color.surface,
  borderTop: `1px solid ${t.color.outline}`,
  color: t.color.onSurface,
  padding: '1.5rem clamp(1rem, 3.5vw, 3rem) 2rem',
});
export const footerInner = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem 2rem',
  justifyContent: 'space-between',
  marginInline: 'auto',
  maxWidth: '1120px',
  minWidth: 0,
});
