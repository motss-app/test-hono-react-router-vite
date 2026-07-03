import { style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const s = {
  container: style({
    fontFamily: 'system-ui',
    padding: '2rem',
    textAlign: 'center',
  }),
  h1: style({
    fontSize: '4rem',
    margin: 0,
  }),
  link: style({
    color: colorTokens.info,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#93c5fd',
      },
      ':root[data-theme="dark"] &:hover': {
        color: '#bfdbfe',
      },
      '&:hover': {
        color: '#004499',
      },
    },
    textDecoration: 'none',
  }),
  marginTop: style({
    marginBlockStart: '2rem',
  }),
};
