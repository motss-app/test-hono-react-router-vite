import { style } from '@vanilla-extract/css';

import * as s from '../styles/atomic/index.css.ts';
import { colorTokens } from '../styles/tokens.css.ts';

export const button = style([
  s.fixed,
  s.z10,
  {
    alignItems: 'center',
    backgroundColor: colorTokens.primary,
    border: 'none',
    borderRadius: '9999px',
    bottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    color: colorTokens.white,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    padding: '0.75rem',
    right: '1.5rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: colorTokens.info,
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: colorTokens.infoHover,
      },
      '&:hover': {
        backgroundColor: colorTokens.primaryHover,
      },
    },
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
]);
