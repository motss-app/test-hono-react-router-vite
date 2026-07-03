import { keyframes, style } from '@vanilla-extract/css';

import * as s from '../styles/atomic/index.css.ts';
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
  s.inlineGrid,
  s.itemsCenter,
  s.roundedFull,
  s.p092_145,
  s.fontSemibold,
  s.whitespaceNowrap,
  s.noUnderline,
  s.animFillBoth,
  s.animCubic,
  s.anim700,
  s.gridAutoFlowColumn,
  s.dark({
    backgroundColor: '#bae6fd',
    color: colorTokens.slate900,
  }),
  s.darkHover({
    backgroundColor: '#7dd3fc',
  }),
  s.hover({
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
  s.inlineGrid,
  s.itemsCenter,
  s.roundedFull,
  s.borderSolid,
  s.border1,
  s.p092_145,
  s.fontSemibold,
  s.whitespaceNowrap,
  s.noUnderline,
  s.animFillBoth,
  s.animCubic,
  s.anim700,
  s.gridAutoFlowColumn,
  s.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  s.darkHover({
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: colorTokens.slate400,
  }),
  s.hover({
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
  s.relative,
  s.overflowHidden,
  s.minW0,
  s.dark({
    backgroundColor: '#08101b',
  }),
  {
    backgroundColor: '#edf6ff',
  },
]);

export const heroActions = style([
  s.flex,
  s.itemsCenter,
  s.flexWrap,
  s.gap075,
]);

export const heroBody = style([
  s.relative,
  s.textBase,
  s.leadingRelaxed,
  s.mb8,
  s.mt0,
  s.animFillBoth,
  s.animCubic,
  s.anim700,
  s.dark({
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
  s.relative,
  s.z2,
  s.pb10,
  s.md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '38rem',
    minWidth: 0,
  },
]);

export const heroInner = style([
  s.itemsEnd,
  s.grid,
  s.mxAuto,
  s.minH100svh,
  s.relative,
  s.minW0,
  s.px4,
  s.pt16,
  s.pb8,
  s.md({
    paddingBottom: '0',
  }),
  {
    maxWidth: '84rem',
  },
]);

export const heroLead = style([
  s.relative,
  s.fontMedium,
  s.trackingTight,
  s.mt0,
  s.mb085,
  s.animFillBoth,
  s.animCubic,
  s.anim700,
  s.md({
    fontSize: '1.95rem',
  }),
  s.dark({
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
  s.absolute,
  s.inset0,
  s.animAlternate,
  s.animInfinite,
  s.animEaseInOut,
  s.anim18s,
  s.bgCover,
  s.bgNoRepeat,
  s.md({
    backgroundPosition: 'center center',
  }),
  s.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  s.dark({
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
  s.absolute,
  s.inset0,
  s.z1,
  s.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
  },
]);

export const page = style([
  s.relative,
  s.pb16,
  s.minW0,
]);

export const routeAction = style([
  s.trackingTight,
  s.dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate600,
    fontSize: '0.95rem',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },
]);

export const routeDescription = style([
  s.leadingSnug,
  s.m0,
  s.relative,
  s.dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
    fontSize: '0.98rem',
  },
]);

export const routeLink = style([
  s.relative,
  s.itemsStart,
  s.roundedXl,
  s.grid,
  s.noUnderline,
  s.minW0,
  s.pb145,
  s.pt145,
  s.pl05,
  s.pr05,
  s.darkHover({
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  }),
  s.hover({
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
  s.relative,
  s.fontBold,
  s.leadingNone,
  s.md({
    fontSize: '2rem',
  }),
  s.dark({
    color: '#7dd3fc',
  }),
  {
    color: colorTokens.info,
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
  },
]);

export const routePath = style([
  s.textUppercase,
  s.dark({
    color: colorTokens.slate400,
  }),
  {
    color: colorTokens.slate600,
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
  },
]);

export const routeRow = style([
  s.relative,
  s.minW0,
  s.dark({
    borderBottomColor: colorTokens.slate800,
  }),
  {
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
]);

export const routesInner = style([
  s.mxAuto,
  s.relative,
  s.minW0,
  s.px4,
  s.pt35,
  {
    maxWidth: '84rem',
  },
]);

export const routesIntro = style([
  s.leadingRelaxed,
  s.mb8,
  s.mt0,
  s.relative,
  s.dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
    fontSize: '1rem',
    maxWidth: '34rem',
  },
]);

export const routesList = style([
  s.relative,
  s.minW0,
  s.dark({
    borderTopColor: colorTokens.slate800,
  }),
  {
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
]);

export const routesSection = style([
  s.relative,
]);

export const routesTitle = style([
  s.relative,
  s.fontBold,
  s.trackingTighter,
  s.mt0,
  s.mb3,
  s.md({
    fontSize: '2.6rem',
  }),
  s.dark({
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
  s.relative,
  s.fontSemibold,
  s.trackingTighter,
  s.mt0,
  s.mb03,
  s.dark({
    color: colorTokens.white,
  }),
  {
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    lineHeight: '1.1',
  },
]);

export const routeTitleBlock = style([
  s.relative,
]);

export const title = style([
  s.relative,
  s.fontBold,
  s.trackingTighter,
  s.mt0,
  s.mb4,
  s.animFillBoth,
  s.animCubic,
  s.anim700,
  s.md({
    fontSize: '6.4rem',
  }),
  s.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  s.dark({
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
  s.block,
  s.dark({
    color: '#7dd3fc',
  }),
  {
    color: colorTokens.info,
  },
]);
