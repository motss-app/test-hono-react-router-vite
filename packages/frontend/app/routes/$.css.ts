import { style } from '@vanilla-extract/css';

import { m0, mt8 } from '../styles/atomic/layout/box-model/margin.css.ts';
import { p8 } from '../styles/atomic/layout/box-model/padding.css.ts';
import { dark, darkHover, hover } from '../styles/atomic/other/selectors.css.ts';
import { noUnderline, textCenter } from '../styles/atomic/text/text-props/text-transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const s = {
  container: style([
    textCenter,
    p8,
    {
      fontFamily: 'system-ui',
    },
  ]),
  h1: style([
    m0,
    {
      fontSize: '4rem',
    },
  ]),
  link: style([
    noUnderline,
    {
      color: colorTokens.info,
    },
    dark({
      color: '#93c5fd',
    }),
    darkHover({
      color: '#bfdbfe',
    }),
    hover({
      color: '#004499',
    }),
  ]),
  marginTop: style([
    mt8,
  ]),
};
