import { style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
import { colorTokens } from '../styles/tokens.css.ts';

export const s = {
  container: style([
    a.textCenter,
    a.p8,
    {
      fontFamily: 'system-ui',
    },
  ]),
  h1: style([
    a.m0,
    {
      fontSize: '4rem',
    },
  ]),
  link: style([
    a.noUnderline,
    {
      color: colorTokens.info,
    },
    a.dark({
      color: '#93c5fd',
    }),
    a.darkHover({
      color: '#bfdbfe',
    }),
    a.hover({
      color: '#004499',
    }),
  ]),
  marginTop: style([
    a.mt8,
  ]),
};
