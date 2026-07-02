import { keyframes, style } from '@vanilla-extract/css';

import {
  anim18s,
  anim700,
  animAlternate,
  animCubic,
  animEaseInOut,
  animFillBoth,
  animInfinite,
} from '../styles/atomic/animation/animation/animation.css.ts';
import { roundedFull, roundedXl } from '../styles/atomic/appearance/border/border-radius.css.ts';
import { border1, borderSolid } from '../styles/atomic/appearance/border/border-style.css.ts';
import {
  itemsCenter,
  itemsEnd,
  itemsStart,
} from '../styles/atomic/flex/flex-container/alignment.css.ts';
import { gap075 } from '../styles/atomic/flex/flex-container/gap.css.ts';
import { flexWrap } from '../styles/atomic/flex/flex-item/flex.css.ts';
import { gridAutoFlowColumn } from '../styles/atomic/grid/grid-container/grid-auto-flow.css.ts';
import { bgCover, bgNoRepeat } from '../styles/atomic/layout/background.css.ts';
import {
  m0,
  mb03,
  mb085,
  mb3,
  mb4,
  mb8,
  mt0,
  mxAuto,
} from '../styles/atomic/layout/box-model/margin.css.ts';
import {
  pb10,
  pb145,
  pb16,
  pb8,
  pl05,
  pr05,
  pt145,
  pt16,
  pt35,
  px4,
} from '../styles/atomic/layout/box-model/padding.css.ts';
import { p092_145 } from '../styles/atomic/layout/box-model/padding.custom.css.ts';
import { minH100svh, minW0 } from '../styles/atomic/layout/box-model/sizing.css.ts';
import {
  block,
  flex,
  grid,
  inlineGrid,
} from '../styles/atomic/layout/display-visibility/display.css.ts';
import { overflowHidden } from '../styles/atomic/layout/display-visibility/overflow.css.ts';
import { absolute, inset0, relative } from '../styles/atomic/layout/positioning/position.css.ts';
import { z1, z2 } from '../styles/atomic/layout/positioning/z-index.css.ts';
import { md, reducedMotion } from '../styles/atomic/other/media.css.ts';
import { dark, darkHover, hover } from '../styles/atomic/other/selectors.css.ts';
import { textBase } from '../styles/atomic/text/font/font-size.css.ts';
import { fontBold, fontMedium, fontSemibold } from '../styles/atomic/text/font/font-weight.css.ts';
import {
  trackingTight,
  trackingTighter,
} from '../styles/atomic/text/text-props/letter-spacing.css.ts';
import {
  leadingNone,
  leadingRelaxed,
  leadingSnug,
} from '../styles/atomic/text/text-props/line-height.css.ts';
import {
  noUnderline,
  textUppercase,
  whitespaceNowrap,
} from '../styles/atomic/text/text-props/text-transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const heroReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1.5rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

export const artworkDrift = keyframes({
  '0%': {
    transform: 'scale(1.02) translate3d(0, 0, 0)',
  },
  '50%': {
    transform: 'scale(1.05) translate3d(-0.75%, 0.5%, 0)',
  },
  '100%': {
    transform: 'scale(1.03) translate3d(-0.25%, -0.35%, 0)',
  },
});

export const ctaPrimary = style([
  inlineGrid,
  itemsCenter,
  roundedFull,
  p092_145,
  fontSemibold,
  whitespaceNowrap,
  noUnderline,
  animFillBoth,
  animCubic,
  anim700,
  gridAutoFlowColumn,
  dark({
    backgroundColor: '#bae6fd',
    color: colorTokens.slate900,
  }),
  darkHover({
    backgroundColor: '#7dd3fc',
  }),
  hover({
    backgroundColor: colorTokens.infoHover,
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    animationDelay: '240ms',
    animationName: heroReveal,
    backgroundColor: colorTokens.info,
    color: colorTokens.white,
    gap: '0.5rem',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
]);

export const ctaSecondary = style([
  inlineGrid,
  itemsCenter,
  roundedFull,
  borderSolid,
  border1,
  p092_145,
  fontSemibold,
  whitespaceNowrap,
  noUnderline,
  animFillBoth,
  animCubic,
  anim700,
  gridAutoFlowColumn,
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  darkHover({
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: colorTokens.slate400,
  }),
  hover({
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: '#bfdbfe',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    color: colorTokens.slate900,
    gap: '0.5rem',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
]);

export const hero = style([
  relative,
  overflowHidden,
  minW0,
  dark({
    backgroundColor: '#08101b',
  }),
  {
    backgroundColor: '#edf6ff',
  },
]);

export const heroActions = style([
  flex,
  itemsCenter,
  flexWrap,
  gap075,
]);

export const heroBody = style([
  relative,
  textBase,
  leadingRelaxed,
  mb8,
  mt0,
  animFillBoth,
  animCubic,
  anim700,
  dark({
    color: colorTokens.slate300,
  }),
  {
    animationDelay: '160ms',
    animationName: heroReveal,
    color: colorTokens.slate800,
    maxWidth: '28rem',
  },
]);

export const heroCopy = style([
  relative,
  z2,
  pb10,
  md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '38rem',
    minWidth: 0,
  },
]);

export const heroInner = style([
  itemsEnd,
  grid,
  mxAuto,
  minH100svh,
  relative,
  minW0,
  px4,
  pt16,
  pb8,
  md({
    paddingBottom: '0',
  }),
  {
    maxWidth: '84rem',
  },
]);

export const heroLead = style([
  relative,
  fontMedium,
  trackingTight,
  mt0,
  mb085,
  animFillBoth,
  animCubic,
  anim700,
  md({
    fontSize: '1.95rem',
  }),
  dark({
    color: colorTokens.slate100,
  }),
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: colorTokens.slate900,
    fontSize: '1.28rem',
    lineHeight: '1.12',
    maxWidth: '15ch',
  },
]);

export const heroMedia = style([
  absolute,
  inset0,
  animAlternate,
  animInfinite,
  animEaseInOut,
  anim18s,
  bgCover,
  bgNoRepeat,
  md({
    backgroundPosition: 'center center',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  dark({
    backgroundImage: 'url("/assets/home-hero-dark.svg")',
    opacity: 1,
  }),
  {
    animationName: artworkDrift,
    backgroundImage: 'url("/assets/home-hero-light.svg")',
    backgroundPosition: '70% center',
    opacity: 0.76,
    transformOrigin: 'center',
  },
]);

export const heroOverlay = style([
  absolute,
  inset0,
  z1,
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
  },
]);

export const page = style([
  relative,
  pb16,
  minW0,
]);

export const routeAction = style([
  trackingTight,
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate600,
    fontSize: '0.95rem',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },
]);

export const routeDescription = style([
  leadingSnug,
  m0,
  relative,
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
    fontSize: '0.98rem',
  },
]);

export const routeLink = style([
  relative,
  itemsStart,
  roundedXl,
  grid,
  noUnderline,
  minW0,
  pb145,
  pt145,
  pl05,
  pr05,
  darkHover({
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  }),
  hover({
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    transform: 'translate3d(0.35rem, 0, 0)',
  }),
  {
    '@media': {
      '(min-width: 960px)': {
        alignItems: 'center',
        gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
      },
    },
    gap: '0.95rem 1rem',
    gridTemplateColumns: '1fr',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
]);

export const routeNumber = style([
  relative,
  fontBold,
  leadingNone,
  md({
    fontSize: '2rem',
  }),
  dark({
    color: '#7dd3fc',
  }),
  {
    color: colorTokens.info,
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
  },
]);

export const routePath = style([
  textUppercase,
  dark({
    color: colorTokens.slate400,
  }),
  {
    color: colorTokens.slate600,
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
  },
]);

export const routeRow = style([
  relative,
  minW0,
  dark({
    borderBottomColor: colorTokens.slate800,
  }),
  {
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
]);

export const routesInner = style([
  mxAuto,
  relative,
  minW0,
  px4,
  pt35,
  {
    maxWidth: '84rem',
  },
]);

export const routesIntro = style([
  leadingRelaxed,
  mb8,
  mt0,
  relative,
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
    fontSize: '1rem',
    maxWidth: '34rem',
  },
]);

export const routesList = style([
  relative,
  minW0,
  dark({
    borderTopColor: colorTokens.slate800,
  }),
  {
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
]);

export const routesSection = style([
  relative,
]);

export const routesTitle = style([
  relative,
  fontBold,
  trackingTighter,
  mt0,
  mb3,
  md({
    fontSize: '2.6rem',
  }),
  dark({
    color: colorTokens.white,
  }),
  {
    color: colorTokens.slate900,
    fontSize: '2rem',
    lineHeight: '0.98',
    maxWidth: '12ch',
  },
]);

export const routeTitle = style([
  relative,
  fontSemibold,
  trackingTighter,
  mt0,
  mb03,
  dark({
    color: colorTokens.white,
  }),
  {
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    lineHeight: '1.1',
  },
]);

export const routeTitleBlock = style([
  relative,
]);

export const title = style([
  relative,
  fontBold,
  trackingTighter,
  mt0,
  mb4,
  animFillBoth,
  animCubic,
  anim700,
  md({
    fontSize: '6.4rem',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  dark({
    color: colorTokens.white,
  }),
  {
    animationName: heroReveal,
    color: colorTokens.slate900,
    fontSize: '3.95rem',
    lineHeight: '0.84',
    maxWidth: '7ch',
  },
]);

export const titleAccent = style([
  block,
  dark({
    color: '#7dd3fc',
  }),
  {
    color: colorTokens.info,
  },
]);
