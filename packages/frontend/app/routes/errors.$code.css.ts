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
  borderRed100,
  borderSky200,
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
import { gap05, gap075, gap4 } from '../styles/atomic/flex/flex-container/gap.css.ts';
import { gridAutoFlowColumn } from '../styles/atomic/grid/grid-container/grid-auto-flow.css.ts';
import { bgCover, bgNoRepeat } from '../styles/atomic/layout/background.css.ts';
import {
  m0,
  mb03,
  mb085,
  mb4,
  mb8,
  mt0,
  mxAuto,
} from '../styles/atomic/layout/box-model/margin.css.ts';
import { pb16, pb8, pt16, pt35, px4 } from '../styles/atomic/layout/box-model/padding.css.ts';
import { p092_145 } from '../styles/atomic/layout/box-model/padding.custom.css.ts';
import { minH100svh, minW0 } from '../styles/atomic/layout/box-model/sizing.css.ts';
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
  text145,
  textBase,
} from '../styles/atomic/text/font/font-size.css.ts';
import { fontBold, fontMedium, fontSemibold } from '../styles/atomic/text/font/font-weight.css.ts';
import {
  trackingTight,
  trackingTighter,
} from '../styles/atomic/text/text-props/letter-spacing.css.ts';
import {
  leading10,
  leading11,
  leading155,
  leading165,
  leading17,
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

export const ctaPrimary = style([
  itemsCenter,
  animFillBoth,
  animCubic,
  anim700,
  roundedFull,
  inlineGrid,
  fontSemibold,
  gap05,
  gridAutoFlowColumn,
  p092_145,
  noUnderline,
  whitespaceNowrap,
  dark({
    backgroundColor: '#ef4444',
  }),
  darkHover({
    backgroundColor: '#fca5a5',
  }),
  hover({
    backgroundColor: '#dc2626',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    animationDelay: '240ms',
    animationName: heroReveal,
    backgroundColor: '#b91c1c',
    color: colorTokens.white,
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
]);

export const ctaPrimaryRuntime = style([
  dark({
    backgroundColor: '#67e8f9',
    color: colorTokens.slate900,
  }),
  darkHover({
    backgroundColor: '#a5f3fc',
  }),
  hover({
    backgroundColor: '#0284c7',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    backgroundColor: '#0891b2',
    color: colorTokens.white,
  },
]);

export const ctaPrimaryWarning = style([
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
  {
    backgroundColor: '#f59e0b',
    color: colorTokens.slate900,
  },
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
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  darkHover({
    borderColor: colorTokens.slate400,
  }),
  hover({
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#fecaca',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(127, 29, 29, 0.12)',
    color: colorTokens.slate900,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
]);

export const ctaSecondaryRuntime = style([
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(103, 232, 249, 0.28)',
    color: colorTokens.slate100,
  }),
  darkHover({
    borderColor: '#67e8f9',
  }),
  hover({
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#7dd3fc',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(8, 145, 178, 0.14)',
  },
]);

export const ctaSecondaryWarning = style([
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  darkHover({
    borderColor: colorTokens.slate400,
  }),
  hover({
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#fed7aa',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(120, 53, 15, 0.12)',
  },
]);

export const dataLabel = style([
  text086,
  textUppercase,
  mb03,
  dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#991b1b',
    letterSpacing: '0.08em',
  },
]);

export const dataList = style([
  grid,
  gap4,
  minW0,
  md({
    gridTemplateColumns: '1fr 1fr',
  }),
]);

export const dataValue = style([
  text11,
  leading155,
  m0,
  minW0,
  dark({
    color: colorTokens.slate100,
  }),
  {
    color: colorTokens.slate900,
    overflowWrap: 'anywhere',
  },
]);

export const hero = style([
  relative,
  overflowHidden,
  minW0,
]);

export const heroActions = style([
  inlineGrid,
  gap075,
  gridAutoFlowColumn,
  justifyStart,
]);

export const heroBody = style([
  textBase,
  leading17,
  mb8,
  mt0,
  animFillBoth,
  animCubic,
  anim700,
  {
    animationDelay: '160ms',
    animationName: heroReveal,
    color: '#7f1d1d',
    maxWidth: '31rem',
  },
]);

export const heroBodyCritical = style([
  dark({
    color: colorTokens.slate300,
  }),
]);

export const heroBodyRuntime = style([
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#155e75',
  },
]);

export const heroBodyWarning = style([
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7c2d12',
  },
]);

export const heroCopy = style([
  relative,
  z2,
  minW0,
  md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '40rem',
    paddingBottom: '2.5rem',
  },
]);

export const heroCritical = style([
  dark({
    backgroundColor: '#12090c',
  }),
  {
    backgroundColor: '#fff5f5',
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
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: '#991b1b',
    fontSize: '1.28rem',
    lineHeight: '1.12',
    maxWidth: '17ch',
  },
]);

export const heroLeadCritical = style([
  dark({
    color: '#fca5a5',
  }),
  {
    color: '#991b1b',
  },
]);

export const heroLeadRuntime = style([
  dark({
    color: '#67e8f9',
  }),
  {
    color: '#0f766e',
  },
]);

export const heroLeadWarning = style([
  dark({
    color: '#fde68a',
  }),
  {
    color: '#9a3412',
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
    opacity: 1,
  }),
  {
    animationName: artworkDrift,
    backgroundPosition: '74% center',
    opacity: 0.82,
    transformOrigin: 'center',
  },
]);

export const heroMediaCritical = style([
  dark({
    backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  },
]);

export const heroMediaRuntime = style([
  dark({
    backgroundImage: 'url("/assets/runtime-error-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/runtime-error-hero-light.svg")',
  },
]);

export const heroMediaWarning = style([
  dark({
    backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  },
]);

export const heroOverlay = style([
  absolute,
  inset0,
  z1,
]);

export const heroOverlayCritical = style([
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
  },
]);

export const heroOverlayRuntime = style([
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(7, 22, 27, 0.94) 0%, rgba(7, 22, 27, 0.72) 28%, rgba(7, 22, 27, 0.28) 56%, rgba(7, 22, 27, 0.1) 100%), linear-gradient(180deg, rgba(7, 22, 27, 0.16) 0%, rgba(7, 22, 27, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(245, 252, 255, 0.995) 0%, rgba(236, 254, 255, 0.95) 28%, rgba(207, 250, 254, 0.8) 48%, rgba(186, 230, 253, 0.46) 68%, rgba(245, 252, 255, 0.18) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(186, 230, 253, 0.12) 100%)',
  },
]);

export const heroOverlayWarning = style([
  dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  },
]);

export const heroRuntime = style([
  dark({
    backgroundColor: '#07161b',
  }),
  {
    backgroundColor: '#ecfeff',
  },
]);

export const heroWarning = style([
  dark({
    backgroundColor: '#140d07',
  }),
  {
    backgroundColor: '#fff7ed',
  },
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
    maxWidth: '36rem',
  },
]);

export const routesIntroCritical = style([
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7f1d1d',
  },
]);

export const routesIntroRuntime = style([
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#155e75',
  },
]);

export const routesIntroWarning = style([
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7c2d12',
  },
]);

export const routesList = style([
  borderBlockSolid,
  borderBlock1,
  minW0,
]);

export const routesListCritical = style([
  borderRed100,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesListRuntime = style([
  borderSky200,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesListWarning = style([
  borderOrange100,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesTitle = style([
  fontBold,
  trackingTighter,
  mt0,
  mb03,
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
    maxWidth: '13ch',
  },
]);

export const rowBody = style([
  text098,
  leading165,
  m0,
  minW0,
  dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
  },
]);

export const rowCode = style([
  fontBold,
  leading10,
  md({
    fontSize: '2rem',
  }),
  {
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
  },
]);

export const rowCodeCritical = style([
  dark({
    color: '#fca5a5',
  }),
  {
    color: '#dc2626',
  },
]);

export const rowCodeRuntime = style([
  dark({
    color: '#67e8f9',
  }),
  {
    color: '#0891b2',
  },
]);

export const rowCodeWarning = style([
  dark({
    color: '#fde68a',
  }),
  {
    color: '#d97706',
  },
]);

export const rowContent = style([
  minW0,
]);

export const rowPanel = style([
  itemsStart,
  grid,
  gap4,
  minW0,
  md({
    gridTemplateColumns: '6rem minmax(0, 18rem) minmax(0, 1fr)',
  }),
  {
    gridTemplateColumns: '1fr',
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
  },
]);

export const rowRow = style([
  borderBlockSolid,
  borderBlock1,
  minW0,
]);

export const rowRowCritical = style([
  borderRed100,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowRowRuntime = style([
  borderSky200,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowRowWarning = style([
  borderOrange100,
  dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowTitle = style([
  text145,
  fontSemibold,
  leading11,
  mt0,
  mb03,
  dark({
    color: colorTokens.white,
  }),
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.03em',
  },
]);

export const statusLabel = style([
  text086,
  m0,
  textUppercase,
  {
    letterSpacing: '0.08em',
  },
]);

export const statusLabelCritical = style([
  dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#991b1b',
  },
]);

export const statusLabelRuntime = style([
  dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#155e75',
  },
]);

export const statusLabelWarning = style([
  dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#9a3412',
  },
]);

export const title = style([
  fontBold,
  trackingTighter,
  mt0,
  mb4,
  animFillBoth,
  animCubic,
  anim700,
  md({
    fontSize: '7rem',
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
    fontSize: '4.2rem',
    lineHeight: '0.84',
    maxWidth: '8ch',
  },
]);

export const titleAccent = style([
  block,
  dark({
    color: '#fca5a5',
  }),
  {
    color: '#b91c1c',
  },
]);

export const titleAccentRuntime = style([
  dark({
    color: '#67e8f9',
  }),
  {
    color: '#0e7490',
  },
]);

export const titleAccentWarning = style([
  dark({
    color: '#fde68a',
  }),
  {
    color: '#d97706',
  },
]);

export const s = {
  ctaPrimary,
  ctaSecondary,
  dataLabel,
  dataList,
  dataValue,
  hero,
  heroActions,
  heroBody,
  heroCopy,
  heroInner,
  heroLead,
  heroMedia,
  heroOverlay,
  page,
  routesInner,
  routesIntro,
  routesList,
  routesTitle,
  rowBody,
  rowCode,
  rowContent,
  rowPanel,
  rowRow,
  rowTitle,
  statusLabel,
  title,
  titleAccent,
};

export const toneStyles = {
  critical: {
    ctaPrimary,
    ctaSecondary,
    hero: heroCritical,
    heroBody: heroBodyCritical,
    heroLead: heroLeadCritical,
    heroMedia: heroMediaCritical,
    heroOverlay: heroOverlayCritical,
    routesIntro: routesIntroCritical,
    routesList: routesListCritical,
    rowCode: rowCodeCritical,
    rowRow: rowRowCritical,
    statusLabel: statusLabelCritical,
    titleAccent,
  },
  runtime: {
    ctaPrimary: ctaPrimaryRuntime,
    ctaSecondary: ctaSecondaryRuntime,
    hero: heroRuntime,
    heroBody: heroBodyRuntime,
    heroLead: heroLeadRuntime,
    heroMedia: heroMediaRuntime,
    heroOverlay: heroOverlayRuntime,
    routesIntro: routesIntroRuntime,
    routesList: routesListRuntime,
    rowCode: rowCodeRuntime,
    rowRow: rowRowRuntime,
    statusLabel: statusLabelRuntime,
    titleAccent: titleAccentRuntime,
  },
  warning: {
    ctaPrimary: ctaPrimaryWarning,
    ctaSecondary: ctaSecondaryWarning,
    hero: heroWarning,
    heroBody: heroBodyWarning,
    heroLead: heroLeadWarning,
    heroMedia: heroMediaWarning,
    heroOverlay: heroOverlayWarning,
    routesIntro: routesIntroWarning,
    routesList: routesListWarning,
    rowCode: rowCodeWarning,
    rowRow: rowRowWarning,
    statusLabel: statusLabelWarning,
    titleAccent: titleAccentWarning,
  },
};
