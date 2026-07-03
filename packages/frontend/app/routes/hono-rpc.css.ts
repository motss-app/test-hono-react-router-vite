import { keyframes, style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
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
  a.roundedFull,
  a.fontSemibold,
  a.wFull,
  a.p092_145,
  {
    backgroundColor: colorTokens.info,
    border: 'none',
    color: colorTokens.white,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  a.dark({
    backgroundColor: '#bae6fd',
    color: colorTokens.slate900,
  }),
  a.darkHover({
    backgroundColor: '#7dd3fc',
  }),
  a.hover({
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
  a.dark({
    backgroundColor: colorTokens.slate500,
  }),
]);
export const actionShell = style([
  a.itemsCenter,
  a.grid,
  a.minW0,
]);
export const ctaSecondary = style([
  a.itemsCenter,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.roundedFull,
  a.borderSolid,
  a.border1,
  a.inlineGrid,
  a.fontSemibold,
  a.gap05,
  a.gridAutoFlowColumn,
  a.p092_145,
  a.noUnderline,
  a.whitespaceNowrap,
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    color: colorTokens.slate900,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  a.darkHover({
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: colorTokens.slate400,
  }),
  a.hover({
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: '#bfdbfe',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
]);
export const dataLabel = style([
  a.text086,
  a.mb03,
  a.textUppercase,
  {
    color: colorTokens.slate600,
    letterSpacing: '0.08em',
  },
  a.dark({
    color: colorTokens.slate400,
  }),
]);
export const dataList = style([
  a.grid,
  a.gap4,
  a.minW0,
  a.md({
    gridTemplateColumns: '1fr 1fr',
  }),
  {
    gridTemplateColumns: '1fr',
  },
]);
export const dataValue = style([
  a.text11,
  a.leading155,
  a.m0,
  a.minW0,
  {
    color: colorTokens.slate900,
    overflowWrap: 'anywhere',
  },
  a.dark({
    color: colorTokens.slate100,
  }),
]);
export const errorBox = style([
  a.roundedXl,
  a.borderSolid,
  a.border1,
  a.mxAuto,
  a.maxW2xl,
  a.p4,
  {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    color: '#b91c1c',
  },
  a.dark({
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626',
    color: '#fca5a5',
  }),
]);
export const errorPage = style([
  a.minW0,
  a.p8,
]);
export const hero = style([
  a.minW0,
  a.overflowHidden,
  a.relative,
  {
    backgroundColor: '#edf6ff',
  },
  a.dark({
    backgroundColor: '#08101b',
  }),
]);
export const heroActions = style([
  a.inlineGrid,
  a.gap075,
  a.gridAutoFlowColumn,
  a.justifyStart,
]);
export const heroBody = style([
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.textBase,
  a.leading17,
  a.mb8,
  a.mt0,
  {
    animationDelay: '160ms',
    animationName: heroReveal,
    color: colorTokens.slate800,
    maxWidth: '31rem',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const heroCopy = style([
  a.minW0,
  a.relative,
  a.z2,
  a.pb10,
  a.md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '38rem',
  },
]);
export const heroInner = style([
  a.itemsEnd,
  a.grid,
  a.mxAuto,
  a.minH100svh,
  a.minW0,
  a.pb8,
  a.px4,
  a.pt16,
  a.relative,
  a.md({
    paddingBottom: '0',
  }),
  {
    maxWidth: '84rem',
  },
]);
export const heroLead = style([
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.text128,
  a.fontMedium,
  a.trackingTight,
  a.leading112,
  a.mb085,
  a.mt0,
  a.md({
    fontSize: '1.95rem',
  }),
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: colorTokens.slate900,
    maxWidth: '15ch',
  },
  a.dark({
    color: colorTokens.slate100,
  }),
]);
export const heroMedia = style([
  a.animAlternate,
  a.anim18s,
  a.animInfinite,
  a.animEaseInOut,
  a.bgNoRepeat,
  a.bgCover,
  a.absolute,
  a.inset0,
  a.md({
    backgroundPosition: 'center center',
  }),
  a.reducedMotion({
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
  a.dark({
    backgroundImage: 'url("/assets/hono-rpc-hero-dark.svg")',
    opacity: 1,
  }),
]);
export const heroOverlay = style([
  a.absolute,
  a.inset0,
  a.z1,
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
  },
  a.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
  }),
]);
export const page = style([
  a.minW0,
  a.pb16,
]);
export const routesInner = style([
  a.mxAuto,
  a.minW0,
  a.px4,
  a.pt35,
  {
    maxWidth: '84rem',
  },
]);
export const routesIntro = style([
  a.textBase,
  a.leading17,
  a.mb8,
  a.mt0,
  {
    color: colorTokens.slate700,
    maxWidth: '34rem',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const routesList = style([
  a.minW0,
  {
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  a.dark({
    borderTopColor: colorTokens.slate800,
  }),
]);
export const routesTitle = style([
  a.text20,
  a.fontBold,
  a.trackingTighter,
  a.leading098,
  a.mb3,
  a.mt0,
  a.md({
    fontSize: '2.6rem',
  }),
  {
    color: colorTokens.slate900,
    maxWidth: '12ch',
  },
  a.dark({
    color: colorTokens.white,
  }),
]);
export const rowBody = style([
  a.text098,
  a.leading165,
  a.m0,
  a.minW0,
  {
    color: colorTokens.slate700,
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const rowContent = style([
  a.minW0,
]);
export const rowNumber = style([
  a.text145,
  a.fontBold,
  a.trackingTighter,
  a.leadingNone,
  a.md({
    fontSize: '2rem',
  }),
  {
    color: colorTokens.info,
  },
  a.dark({
    color: '#7dd3fc',
  }),
]);
export const rowPanel = style([
  a.itemsStart,
  a.grid,
  a.gap4,
  a.minW0,
  a.pb145,
  a.pl05,
  a.pr05,
  a.pt145,
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
  a.minW0,
  {
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  a.dark({
    borderBottomColor: colorTokens.slate800,
  }),
]);
export const rowTitle = style([
  a.text145,
  a.fontSemibold,
  a.leading11,
  a.mb03,
  a.mt0,
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.03em',
  },
  a.dark({
    color: colorTokens.white,
  }),
]);
export const skeletonAction = style([
  a.roundedFull,
  a.wFull,
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
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.text395,
  a.fontBold,
  a.leading084,
  a.mb4,
  a.mt0,
  a.md({
    fontSize: '6.4rem',
  }),
  a.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  {
    animationName: heroReveal,
    color: colorTokens.slate900,
    letterSpacing: '-0.07em',
    maxWidth: '7ch',
  },
  a.dark({
    color: colorTokens.white,
  }),
]);
export const titleAccent = style([
  a.block,
  {
    color: colorTokens.info,
  },
  a.dark({
    color: '#7dd3fc',
  }),
]);

export const actionButtonLoading = style([
  actionButton,
  actionButtonLoadingStyle,
]);
