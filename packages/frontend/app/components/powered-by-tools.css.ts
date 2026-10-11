import { globalStyle, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

export const label = style({
  color: t.color.onSurface,
  fontSize: '0.75rem',
  margin: '0 0 0.75rem',
});
export const tools = style({
  '@media': {
    [mediaQueries.maxWidth599]: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem 2rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
globalStyle(`${tools} li`, {
  alignItems: 'center',
  display: 'flex',
  fontSize: '0.8125rem',
  fontWeight: 650,
  gap: '0.5rem',
  minWidth: 0,
});
globalStyle(`${tools} li > span`, {
  minWidth: 0,
  overflowWrap: 'anywhere',
});
