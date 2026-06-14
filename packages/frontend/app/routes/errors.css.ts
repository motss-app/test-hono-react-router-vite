import { keyframes, style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
import { colorTokens, fontWeightTokens } from '../styles/tokens.css.ts';

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
  a.itemsCenter,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.inlineGrid,
  a.gap05,
  a.gridAutoFlowColumn,
  a.p092_145,
  a.noUnderline,
  a.whitespaceNowrap,
  a.roundedFull,
  {
    animationDelay: '240ms',
    animationName: heroReveal,
    backgroundColor: '#f59e0b',
    color: colorTokens.slate900,
    fontWeight: fontWeightTokens.fontWeightSemibold,
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  a.dark({
    backgroundColor: '#fcd34d',
  }),
  a.darkHover({
    backgroundColor: '#fde68a',
  }),
  a.hover({
    backgroundColor: '#d97706',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
]);
export const ctaSecondary = style([
  a.itemsCenter,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.borderSolid,
  a.border1,
  a.inlineGrid,
  a.gap05,
  a.gridAutoFlowColumn,
  a.p092_145,
  a.noUnderline,
  a.whitespaceNowrap,
  a.roundedFull,
  {
    animationDelay: '320ms',
    animationName: heroReveal,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(120, 53, 15, 0.12)',
    color: colorTokens.slate900,
    fontWeight: fontWeightTokens.fontWeightSemibold,
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#fed7aa',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
]);
export const hero = style([
  a.relative,
  a.overflowHidden,
  a.minW0,
  {
    backgroundColor: '#fff7ed',
  },
  a.dark({
    backgroundColor: '#140d07',
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
    color: '#7c2d12',
    maxWidth: '31rem',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const heroCopy = style([
  a.relative,
  a.z2,
  a.minW0,
  a.pb10,
  {
    maxWidth: '40rem',
  },
  a.md({
    paddingBottom: '4rem',
  }),
]);
export const heroInner = style([
  a.itemsEnd,
  a.grid,
  a.mxAuto,
  a.minH100svh,
  a.minW0,
  a.relative,
  a.pb8,
  a.px4,
  a.pt16,
  {
    maxWidth: '84rem',
  },
  a.md({
    paddingBottom: '0',
  }),
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
  {
    animationDelay: '110ms',
    animationName: heroReveal,
    color: '#9a3412',
    maxWidth: '17ch',
  },
  a.dark({
    color: '#fde68a',
  }),
  a.md({
    fontSize: '1.95rem',
  }),
]);
export const heroMedia = style([
  a.animAlternate,
  a.animInfinite,
  a.animEaseInOut,
  a.anim18s,
  a.bgNoRepeat,
  a.bgCover,
  a.inset0,
  a.absolute,
  {
    animationName: artworkDrift,
    backgroundImage: 'url("/assets/errors-hero-light.svg")',
    backgroundPosition: '74% center',
    opacity: 0.82,
    transformOrigin: 'center',
  },
  a.dark({
    backgroundImage: 'url("/assets/errors-hero-dark.svg")',
    opacity: 1,
  }),
  a.md({
    backgroundPosition: 'center center',
  }),
  a.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
]);
export const heroOverlay = style([
  a.absolute,
  a.inset0,
  a.z1,
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  },
  a.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
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
    color: '#7c2d12',
    maxWidth: '37rem',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const routesList = style([
  a.borderBlockSolid,
  a.borderBlock1,
  a.borderOrange100,
  a.minW0,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const routesTitle = style([
  a.text20,
  a.fontBold,
  a.leading098,
  a.mb3,
  a.mt0,
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.04em',
    maxWidth: '13ch',
  },
  a.dark({
    color: colorTokens.white,
  }),
  a.md({
    fontSize: '2.6rem',
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
export const rowCode = style([
  a.text145,
  a.fontBold,
  a.leading10,
  {
    letterSpacing: '-0.04em',
  },
  a.md({
    fontSize: '2rem',
  }),
]);
export const rowCodeCriticalBase = style([
  {
    color: '#dc2626',
  },
  a.dark({
    color: '#fca5a5',
  }),
]);
export const rowCodeRuntimeBase = style([
  {
    color: '#0891b2',
  },
  a.dark({
    color: '#67e8f9',
  }),
]);
export const rowCodeWarningBase = style([
  {
    color: '#d97706',
  },
  a.dark({
    color: '#fde68a',
  }),
]);
export const rowContent = style([
  a.minW0,
]);
export const rowDetail = style([
  a.grid,
  a.gap075,
  a.minW0,
  {
    color: colorTokens.slate700,
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const rowDetailText = style([
  a.text098,
  a.leading165,
  a.m0,
  {
    color: colorTokens.slate700,
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const rowLink = style([
  a.inlineGrid,
  a.fontSemibold,
  a.gap05,
  a.gridAutoFlowColumn,
  a.noUnderline,
  a.wFit,
  {
    gridAutoColumns: 'max-content',
  },
]);
export const rowLinkCritical = style([
  {
    color: '#dc2626',
  },
  a.dark({
    color: '#fca5a5',
  }),
]);
export const rowLinkRuntime = style([
  {
    color: '#0891b2',
  },
  a.dark({
    color: '#67e8f9',
  }),
]);
export const rowLinkWarning = style([
  {
    color: '#d97706',
  },
  a.dark({
    color: '#fde68a',
  }),
]);
export const rowPanel = style([
  a.itemsStart,
  a.grid,
  a.minW0,
  a.pb145,
  a.pt145,
  a.pl05,
  a.pr05,
  {
    gap: '1rem 1rem',
    gridTemplateColumns: '1fr',
  },
  a.md({
    gridTemplateColumns: '6rem minmax(0, 19rem) minmax(0, 1fr)',
  }),
]);
export const rowRow = style([
  a.borderBlockSolid,
  a.borderBlock1,
  a.borderOrange200,
  a.minW0,
  a.dark({
    borderColor: colorTokens.slate800,
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
export const sectionSpacer = style({
  marginTop: '3.5rem',
});
export const statusLabel = style([
  a.text086,
  a.m0,
  a.textUppercase,
  {
    color: '#9a3412',
    letterSpacing: '0.08em',
  },
  a.dark({
    color: colorTokens.slate400,
  }),
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
  {
    animationName: heroReveal,
    color: colorTokens.slate900,
    letterSpacing: '-0.07em',
    maxWidth: '7ch',
  },
  a.dark({
    color: colorTokens.white,
  }),
  a.md({
    fontSize: '6.2rem',
  }),
  a.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
]);
export const titleAccent = style([
  a.block,
  {
    color: '#d97706',
  },
  a.dark({
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
