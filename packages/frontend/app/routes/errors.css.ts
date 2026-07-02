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
import {
  borderOrange100,
  borderOrange200,
} from '../styles/atomic/appearance/border/border-color.custom.css.ts';
import {
  borderBlock1,
  borderBlockSolid,
} from '../styles/atomic/appearance/border/border-logical.css.ts';
import { roundedFull } from '../styles/atomic/appearance/border/border-radius.css.ts';
import { border1, borderSolid } from '../styles/atomic/appearance/border/border-style.css.ts';
import {
  itemsCenter,
  itemsEnd,
  itemsStart,
  justifyStart,
} from '../styles/atomic/flex/flex-container/alignment.css.ts';
import { gap05, gap075 } from '../styles/atomic/flex/flex-container/gap.css.ts';
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
import { minH100svh, minW0, wFit } from '../styles/atomic/layout/box-model/sizing.css.ts';
import { block, grid, inlineGrid } from '../styles/atomic/layout/display-visibility/display.css.ts';
import { overflowHidden } from '../styles/atomic/layout/display-visibility/overflow.css.ts';
import { absolute, inset0, relative } from '../styles/atomic/layout/positioning/position.css.ts';
import { z1, z2 } from '../styles/atomic/layout/positioning/z-index.css.ts';
import { md, reducedMotion } from '../styles/atomic/other/media.css.ts';
import { dark, darkHover, hover } from '../styles/atomic/other/selectors.css.ts';
import {
  text086,
  text098,
  text128,
  text145,
  text20,
  text395,
  textBase,
} from '../styles/atomic/text/font/font-size.css.ts';
import { fontBold, fontMedium, fontSemibold } from '../styles/atomic/text/font/font-weight.css.ts';
import { trackingTight } from '../styles/atomic/text/text-props/letter-spacing.css.ts';
import {
  leading084,
  leading098,
  leading10,
  leading11,
  leading112,
  leading165,
  leading17,
} from '../styles/atomic/text/text-props/line-height.css.ts';
import {
  noUnderline,
  textUppercase,
  whitespaceNowrap,
} from '../styles/atomic/text/text-props/text-transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { fontWeightTokens } from '../styles/font-weight-tokens.contract.css.ts';

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

export const ctaPrimary = style([
  itemsCenter,
  animFillBoth,
  animCubic,
  anim700,
  inlineGrid,
  gap05,
  gridAutoFlowColumn,
  p092_145,
  noUnderline,
  whitespaceNowrap,
  roundedFull,
  {
    animationDelay: '240ms',
    animationName: heroReveal,
    backgroundColor: '#f59e0b',
    color: colorTokens.slate900,
    fontWeight: fontWeightTokens.fontWeightSemibold,
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  dark({
    backgroundColor: '#fcd34d',
  }),
  darkHover({
    backgroundColor: '#fde68a',
  }),
  hover({
    backgroundColor: '#d97706',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
]);
export const ctaSecondary = style([
  itemsCenter,
  animFillBoth,
  animCubic,
  anim700,
  borderSolid,
  border1,
  inlineGrid,
  gap05,
  gridAutoFlowColumn,
  p092_145,
  noUnderline,
  whitespaceNowrap,
  roundedFull,
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(120, 53, 15, 0.12)',
    color: colorTokens.slate900,
    fontWeight: fontWeightTokens.fontWeightSemibold,
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#fed7aa',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
]);
export const hero = style([
  relative,
  overflowHidden,
  minW0,
  {
    backgroundColor: '#fff7ed',
  },
  dark({
    backgroundColor: '#140d07',
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
    color: '#7c2d12',
    maxWidth: '31rem',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const heroCopy = style([
  relative,
  z2,
  minW0,
  pb10,
  {
    maxWidth: '40rem',
  },
  md({
    paddingBottom: '4rem',
  }),
]);
export const heroInner = style([
  itemsEnd,
  grid,
  mxAuto,
  minH100svh,
  minW0,
  relative,
  pb8,
  px4,
  pt16,
  {
    maxWidth: '84rem',
  },
  md({
    paddingBottom: '0',
  }),
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
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: '#9a3412',
    maxWidth: '17ch',
  },
  dark({
    color: '#fde68a',
  }),
  md({
    fontSize: '1.95rem',
  }),
]);
export const heroMedia = style([
  animAlternate,
  animInfinite,
  animEaseInOut,
  anim18s,
  bgNoRepeat,
  bgCover,
  inset0,
  absolute,
  {
    animationName: artworkDrift,
    backgroundImage: 'url("/assets/errors-hero-light.svg")',
    backgroundPosition: '74% center',
    opacity: 0.82,
    transformOrigin: 'center',
  },
  dark({
    backgroundImage: 'url("/assets/errors-hero-dark.svg")',
    opacity: 1,
  }),
  md({
    backgroundPosition: 'center center',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
]);
export const heroOverlay = style([
  absolute,
  inset0,
  z1,
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  },
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
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
    color: '#7c2d12',
    maxWidth: '37rem',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const routesList = style([
  borderBlockSolid,
  borderBlock1,
  borderOrange100,
  minW0,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const routesTitle = style([
  text20,
  fontBold,
  leading098,
  mb3,
  mt0,
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.04em',
    maxWidth: '13ch',
  },
  dark({
    color: colorTokens.white,
  }),
  md({
    fontSize: '2.6rem',
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
export const rowCode = style([
  text145,
  fontBold,
  leading10,
  {
    letterSpacing: '-0.04em',
  },
  md({
    fontSize: '2rem',
  }),
]);
export const rowCodeCriticalBase = style([
  {
    color: '#dc2626',
  },
  dark({
    color: '#fca5a5',
  }),
]);
export const rowCodeRuntimeBase = style([
  {
    color: '#0891b2',
  },
  dark({
    color: '#67e8f9',
  }),
]);
export const rowCodeWarningBase = style([
  {
    color: '#d97706',
  },
  dark({
    color: '#fde68a',
  }),
]);
export const rowContent = style([
  minW0,
]);
export const rowDetail = style([
  grid,
  gap075,
  minW0,
  {
    color: colorTokens.slate700,
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const rowDetailText = style([
  text098,
  leading165,
  m0,
  {
    color: colorTokens.slate700,
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const rowLink = style([
  inlineGrid,
  fontSemibold,
  gap05,
  gridAutoFlowColumn,
  noUnderline,
  wFit,
  {
    gridAutoColumns: 'max-content',
  },
]);
export const rowLinkCritical = style([
  {
    color: '#dc2626',
  },
  dark({
    color: '#fca5a5',
  }),
]);
export const rowLinkRuntime = style([
  {
    color: '#0891b2',
  },
  dark({
    color: '#67e8f9',
  }),
]);
export const rowLinkWarning = style([
  {
    color: '#d97706',
  },
  dark({
    color: '#fde68a',
  }),
]);
export const rowPanel = style([
  itemsStart,
  grid,
  minW0,
  pb145,
  pt145,
  pl05,
  pr05,
  {
    gap: '1rem 1rem',
    gridTemplateColumns: '1fr',
  },
  md({
    gridTemplateColumns: '6rem minmax(0, 19rem) minmax(0, 1fr)',
  }),
]);
export const rowRow = style([
  borderBlockSolid,
  borderBlock1,
  borderOrange200,
  minW0,
  dark({
    borderColor: colorTokens.slate800,
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
export const sectionSpacer = style({
  marginTop: '3.5rem',
});
export const statusLabel = style([
  text086,
  m0,
  textUppercase,
  {
    color: '#9a3412',
    letterSpacing: '0.08em',
  },
  dark({
    color: colorTokens.slate400,
  }),
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
  {
    animationName: heroReveal,
    color: colorTokens.slate900,
    letterSpacing: '-0.07em',
    maxWidth: '7ch',
  },
  dark({
    color: colorTokens.white,
  }),
  md({
    fontSize: '6.2rem',
  }),
  reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
]);
export const titleAccent = style([
  block,
  {
    color: '#d97706',
  },
  dark({
    color: '#fde68a',
  }),
]);

export const toneStyles = {
  critical: {
    code: rowCodeCriticalBase,
    link: rowLinkCritical,
  },
  runtime: {
    code: rowCodeRuntimeBase,
    link: rowLinkRuntime,
  },
  warning: {
    code: rowCodeWarningBase,
    link: rowLinkWarning,
  },
};

export const routesIntroSpacer = style([
  routesIntro,
  sectionSpacer,
]);

export const rowCodeCritical = style([
  rowCode,
  rowCodeCriticalBase,
]);
export const rowCodeRuntime = style([
  rowCode,
  rowCodeRuntimeBase,
]);
export const rowCodeWarning = style([
  rowCode,
  rowCodeWarningBase,
]);
