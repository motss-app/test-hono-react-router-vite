import { style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const footer = style({
  borderTopColor: colorTokens.slate200,
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  paddingBlock: '1.5rem',
  paddingInline: '1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderTopColor: colorTokens.slate800,
    },
  },
});

export const footerInner = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  justifyContent: 'space-between',
  marginInline: 'auto',
  maxInlineSize: '84rem',
});

export const footerNote = style({
  color: colorTokens.slate500,
  fontSize: '0.875rem',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});
