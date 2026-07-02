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

export const s = {
  ctaPrimary: style([
    a.itemsCenter,
    a.animFillBoth,
    a.animCubic,
    a.anim700,
    a.inlineGrid,
    a.roundedFull,
    a.gridAutoFlowColumn,
    a.p092_145,
    a.fontSemibold,
    a.whitespaceNowrap,
    a.noUnderline,
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
    {
      animationDelay: '240ms',
      animationName: heroReveal,
      backgroundColor: colorTokens.info,
      color: colorTokens.white,
      gap: '0.5rem',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
  ]),
  ctaSecondary: style([
    a.itemsCenter,
    a.animFillBoth,
    a.animCubic,
    a.anim700,
    a.inlineGrid,
    a.roundedFull,
    a.borderSolid,
    a.border1,
    a.gridAutoFlowColumn,
    a.p092_145,
    a.fontSemibold,
    a.whitespaceNowrap,
    a.noUnderline,
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
    {
      animationDelay: '320ms',
      animationName: heroReveal,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(15, 23, 42, 0.12)',
      color: colorTokens.slate900,
      gap: '0.5rem',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    },
  ]),
  dataLabel: style([
    a.text086,
    a.textUppercase,
    a.dark({
      color: colorTokens.slate400,
    }),
    {
      color: colorTokens.slate600,
      letterSpacing: '0.08em',
    },
  ]),
  dataList: style([
    a.grid,
    a.minW0,
    a.md({
      gridTemplateColumns: '1fr 1fr',
    }),
    {
      gap: '1rem',
    },
  ]),
  dataValue: style([
    a.m0,
    a.minW0,
    a.text11,
    a.leading155,
    a.dark({
      color: colorTokens.slate100,
    }),
    {
      color: colorTokens.slate900,
      overflowWrap: 'anywhere',
    },
  ]),
  hero: style([
    a.relative,
    a.overflowHidden,
    a.minW0,
    a.dark({
      backgroundColor: '#08101b',
    }),
    {
      backgroundColor: '#edf6ff',
    },
  ]),
  heroActions: style([
    a.inlineGrid,
    a.gridAutoFlowColumn,
    a.justifyStart,
    {
      gap: '0.75rem',
    },
  ]),
  heroBody: style([
    a.mt0,
    a.mb8,
    a.textBase,
    a.leading17,
    a.animFillBoth,
    a.animCubic,
    a.anim700,
    a.dark({
      color: colorTokens.slate300,
    }),
    {
      animationDelay: '160ms',
      animationName: heroReveal,
      color: colorTokens.slate900,
      maxWidth: '31rem',
    },
  ]),
  heroCopy: style([
    a.relative,
    a.z2,
    a.pb10,
    a.minW0,
    a.md({
      paddingBottom: '4rem',
    }),
    {
      maxWidth: '38rem',
    },
  ]),
  heroInner: style([
    a.itemsEnd,
    a.grid,
    a.mxAuto,
    a.minH100svh,
    a.minW0,
    a.relative,
    a.px4,
    a.pt16,
    a.pb8,
    a.md({
      paddingBottom: '0',
    }),
    {
      maxWidth: '84rem',
    },
  ]),
  heroLead: style([
    a.mt0,
    a.mb085,
    a.relative,
    a.fontMedium,
    a.text128,
    a.leading112,
    a.animFillBoth,
    a.animCubic,
    a.anim700,
    a.md({
      fontSize: '1.95rem',
    }),
    a.dark({
      color: colorTokens.slate100,
    }),
    {
      animationDelay: '110ms',
      animationName: heroReveal,
      color: colorTokens.slate900,
      letterSpacing: '-0.025em',
      maxWidth: '15ch',
    },
  ]),
  heroMedia: style([
    a.absolute,
    a.inset0,
    a.animAlternate,
    a.animInfinite,
    a.animEaseInOut,
    a.anim18s,
    a.bgCover,
    a.bgNoRepeat,
    a.md({
      backgroundPosition: 'center center',
    }),
    a.reducedMotion({
      animationDuration: '1ms',
      animationIterationCount: '1',
    }),
    a.dark({
      backgroundImage: 'url("/assets/ssr-hero-dark.svg")',
      opacity: 1,
    }),
    {
      animationName: artworkDrift,
      backgroundImage: 'url("/assets/ssr-hero-light.svg")',
      backgroundPosition: '72% center',
      opacity: 0.8,
      transformOrigin: 'center',
    },
  ]),
  heroOverlay: style([
    a.absolute,
    a.inset0,
    a.z1,
    a.dark({
      backgroundImage:
        'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
    }),
    {
      backgroundImage:
        'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
    },
  ]),
  page: style([
    a.minW0,
    a.pb16,
  ]),
  routesInner: style([
    a.mxAuto,
    a.minW0,
    a.px4,
    a.pt35,
    {
      maxWidth: '84rem',
    },
  ]),
  routesIntro: style([
    a.mt0,
    a.mb8,
    a.textBase,
    a.leading17,
    a.dark({
      color: colorTokens.slate300,
    }),
    {
      color: colorTokens.slate700,
      maxWidth: '34rem',
    },
  ]),
  routesList: style([
    a.minW0,
    a.borderBlockSolid,
    a.borderBlock1,
    a.borderSlate200,
    a.dark({
      borderColor: colorTokens.slate800,
    }),
  ]),
  routesTitle: style([
    a.mt0,
    a.mb3,
    a.fontBold,
    a.text20,
    a.leading098,
    a.md({
      fontSize: '2.6rem',
    }),
    a.dark({
      color: colorTokens.white,
    }),
    {
      color: colorTokens.slate900,
      letterSpacing: '-0.04em',
      maxWidth: '12ch',
    },
  ]),
  rowBody: style([
    a.m0,
    a.minW0,
    a.text098,
    a.leading165,
    a.dark({
      color: colorTokens.slate300,
    }),
    {
      color: colorTokens.slate700,
    },
  ]),
  rowContent: style([
    a.minW0,
  ]),
  rowNumber: style([
    a.relative,
    a.fontBold,
    a.leadingNone,
    a.text145,
    a.md({
      fontSize: '2rem',
    }),
    a.dark({
      color: '#7dd3fc',
    }),
    {
      color: colorTokens.info,
      letterSpacing: '-0.04em',
    },
  ]),
  rowPanel: style([
    a.itemsStart,
    a.grid,
    a.minW0,
    a.pb145,
    a.pt145,
    a.pl05,
    a.pr05,
    a.md({
      gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr)',
    }),
    {
      gap: '1rem 1rem',
      gridTemplateColumns: '1fr',
    },
  ]),
  rowRow: style([
    a.minW0,
    {
      borderBottomColor: colorTokens.slate200,
      borderBottomStyle: 'solid',
      borderBottomWidth: '1px',
    },
    a.dark({
      borderBottomColor: colorTokens.slate800,
    }),
  ]),
  rowTitle: style([
    a.mt0,
    a.mb03,
    a.text145,
    a.fontSemibold,
    a.leading11,
    a.dark({
      color: colorTokens.white,
    }),
    {
      color: colorTokens.slate900,
      letterSpacing: '-0.03em',
    },
  ]),
  title: style([
    a.mt0,
    a.mb4,
    a.animFillBoth,
    a.animCubic,
    a.anim700,
    a.reducedMotion({
      animationDuration: '1ms',
      animationIterationCount: '1',
    }),
    a.md({
      fontSize: '6.4rem',
    }),
    a.dark({
      color: colorTokens.white,
    }),
    {
      animationName: heroReveal,
      color: colorTokens.slate900,
      fontSize: '3.95rem',
      letterSpacing: '-0.07em',
      lineHeight: '0.84',
      maxWidth: '7ch',
    },
  ]),
  titleAccent: style([
    a.block,
    a.dark({
      color: '#7dd3fc',
    }),
    {
      color: colorTokens.info,
    },
  ]),
};
