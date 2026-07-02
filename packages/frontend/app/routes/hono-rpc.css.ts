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
  justifyStart,
} from '../styles/atomic/flex/flex-container/alignment.css.ts';
import { gap05, gap075, gap4 } from '../styles/atomic/flex/flex-container/gap.css.ts';
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
  p4,
  p8,
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
import { maxW2xl, minH100svh, minW0, wFull } from '../styles/atomic/layout/box-model/sizing.css.ts';
import { block, grid, inlineGrid } from '../styles/atomic/layout/display-visibility/display.css.ts';
import { overflowHidden } from '../styles/atomic/layout/display-visibility/overflow.css.ts';
import { absolute, inset0, relative } from '../styles/atomic/layout/positioning/position.css.ts';
import { z1, z2 } from '../styles/atomic/layout/positioning/z-index.css.ts';
import { md, reducedMotion } from '../styles/atomic/other/media.css.ts';
import { dark, darkHover, hover } from '../styles/atomic/other/selectors.css.ts';
import {
  text086,
  text098,
  text11,
  text128,
  text145,
  text20,
  text395,
  textBase,
} from '../styles/atomic/text/font/font-size.css.ts';
import { fontBold, fontMedium, fontSemibold } from '../styles/atomic/text/font/font-weight.css.ts';
import {
  trackingTight,
  trackingTighter,
} from '../styles/atomic/text/text-props/letter-spacing.css.ts';
import {
  leading084,
  leading098,
  leading11,
  leading112,
  leading155,
  leading165,
  leading17,
  leadingNone,
} from '../styles/atomic/text/text-props/line-height.css.ts';
import {
  noUnderline,
  textUppercase,
  whitespaceNowrap,
} from '../styles/atomic/text/text-props/text-transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';

const heroReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1.5rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

const artworkDrift = keyframes({
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

export const actionButton = style([
  roundedFull,
  fontSemibold,
  wFull,
  p092_145,
  {
    backgroundColor: colorTokens.info,
    border: 'none',
    color: colorTokens.white,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
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
]);
export const actionButtonLoadingStyle = style([
  {
    backgroundColor: colorTokens.slate400,
    color: colorTokens.slate100,
    cursor: 'not-allowed',
  },
  dark({
    backgroundColor: colorTokens.slate500,
  }),
]);
export const actionShell = style([
  itemsCenter,
  grid,
  minW0,
]);
export const ctaSecondary = style([
  itemsCenter,
  animFillBoth,
  animCubic,
  anim700,
  roundedFull,
  borderSolid,
  border1,
  inlineGrid,
  fontSemibold,
  gap05,
  gridAutoFlowColumn,
  p092_145,
  noUnderline,
  whitespaceNowrap,
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    color: colorTokens.slate900,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
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
]);
export const dataLabel = style([
  text086,
  mb03,
  textUppercase,
  {
    color: colorTokens.slate600,
    letterSpacing: '0.08em',
  },
  dark({
    color: colorTokens.slate400,
  }),
]);
export const dataList = style([
  grid,
  gap4,
  minW0,
  md({
    gridTemplateColumns: '1fr 1fr',
  }),
  {
    gridTemplateColumns: '1fr',
  },
]);
export const dataValue = style([
  text11,
  leading155,
  m0,
  minW0,
  {
    color: colorTokens.slate900,
    overflowWrap: 'anywhere',
  },
  dark({
    color: colorTokens.slate100,
  }),
]);
export const errorBox = style([
  roundedXl,
  borderSolid,
  border1,
  mxAuto,
  maxW2xl,
  p4,
  {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    color: '#b91c1c',
  },
  dark({
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626',
    color: '#fca5a5',
  }),
]);
export const errorPage = style([
  minW0,
  p8,
]);
export const hero = style([
  minW0,
  overflowHidden,
  relative,
  {
    backgroundColor: '#edf6ff',
  },
  dark({
    backgroundColor: '#08101b',
  }),
]);
export const heroActions = style([
  inlineGrid,
  gap075,
  gridAutoFlowColumn,
  justifyStart,
]);
export const heroBody = style([
  animFillBoth,
  animCubic,
  anim700,
  textBase,
  leading17,
  mb8,
  mt0,
  {
    animationDelay: '160ms',
    animationName: heroReveal,
    color: colorTokens.slate800,
    maxWidth: '31rem',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const heroCopy = style([
  minW0,
  relative,
  z2,
  pb10,
  md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '38rem',
  },
]);
export const heroInner = style([
  itemsEnd,
  grid,
  mxAuto,
  minH100svh,
  minW0,
  pb8,
  px4,
  pt16,
  relative,
  md({
    paddingBottom: '0',
  }),
  {
    maxWidth: '84rem',
  },
]);
export const heroLead = style([
  animFillBoth,
  animCubic,
  anim700,
  text128,
  fontMedium,
  trackingTight,
  leading112,
  mb085,
  mt0,
  md({
    fontSize: '1.95rem',
  }),
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: colorTokens.slate900,
    maxWidth: '15ch',
  },
  dark({
    color: colorTokens.slate100,
  }),
]);
export const heroMedia = style([
  animAlternate,
  anim18s,
  animInfinite,
  animEaseInOut,
  bgNoRepeat,
  bgCover,
  absolute,
  inset0,
  md({
    backgroundPosition: 'center center',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  {
    animationName: artworkDrift,
    backgroundImage: 'url("/assets/hono-rpc-hero-light.svg")',
    backgroundPosition: '72% center',
    opacity: 0.8,
    transformOrigin: 'center',
  },
  dark({
    backgroundImage: 'url("/assets/hono-rpc-hero-dark.svg")',
    opacity: 1,
  }),
]);
export const heroOverlay = style([
  absolute,
  inset0,
  z1,
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
  },
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
  }),
]);
export const page = style([
  minW0,
  pb16,
]);
export const routesInner = style([
  mxAuto,
  minW0,
  px4,
  pt35,
  {
    maxWidth: '84rem',
  },
]);
export const routesIntro = style([
  textBase,
  leading17,
  mb8,
  mt0,
  {
    color: colorTokens.slate700,
    maxWidth: '34rem',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const routesList = style([
  minW0,
  {
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  dark({
    borderTopColor: colorTokens.slate800,
  }),
]);
export const routesTitle = style([
  text20,
  fontBold,
  trackingTighter,
  leading098,
  mb3,
  mt0,
  md({
    fontSize: '2.6rem',
  }),
  {
    color: colorTokens.slate900,
    maxWidth: '12ch',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const rowBody = style([
  text098,
  leading165,
  m0,
  minW0,
  {
    color: colorTokens.slate700,
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const rowContent = style([
  minW0,
]);
export const rowNumber = style([
  text145,
  fontBold,
  trackingTighter,
  leadingNone,
  md({
    fontSize: '2rem',
  }),
  {
    color: colorTokens.info,
  },
  dark({
    color: '#7dd3fc',
  }),
]);
export const rowPanel = style([
  itemsStart,
  grid,
  gap4,
  minW0,
  pb145,
  pl05,
  pr05,
  pt145,
  {
    '@media': {
      '(min-width: 960px)': {
        gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr)',
      },
    },
    gridTemplateColumns: '1fr',
  },
]);
export const rowRow = style([
  minW0,
  {
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  dark({
    borderBottomColor: colorTokens.slate800,
  }),
]);
export const rowTitle = style([
  text145,
  fontSemibold,
  leading11,
  mb03,
  mt0,
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.03em',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const skeletonAction = style([
  roundedFull,
  wFull,
  {
    height: '3rem',
  },
]);
export const skeletonMessage = style([
  {
    width: '10ch',
  },
]);
export const skeletonServer = style([
  {
    width: '12ch',
  },
]);
export const skeletonTimestamp = style([
  {
    width: '24ch',
  },
]);
export const title = style([
  animFillBoth,
  animCubic,
  anim700,
  text395,
  fontBold,
  leading084,
  mb4,
  mt0,
  md({
    fontSize: '6.4rem',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  {
    animationName: heroReveal,
    color: colorTokens.slate900,
    letterSpacing: '-0.07em',
    maxWidth: '7ch',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const titleAccent = style([
  block,
  {
    color: colorTokens.info,
  },
  dark({
    color: '#7dd3fc',
  }),
]);

export const actionButtonLoading = style([
  actionButton,
  actionButtonLoadingStyle,
]);
