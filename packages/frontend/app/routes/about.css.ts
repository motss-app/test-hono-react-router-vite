import { keyframes, style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
import { colorTokens } from '../styles/tokens.css.ts';

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
  featureBody: style([
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
  featureIcon: style([
    a.inlineGrid,
    a.mb2,
  ]),
  featureIconAmber: style([
    a.dark({
      color: '#fcd34d',
    }),
    {
      color: colorTokens.warning,
    },
  ]),
  featureIconBlue: style([
    a.dark({
      color: '#7dd3fc',
    }),
    {
      color: colorTokens.info,
    },
  ]),
  featureIconGreen: style([
    a.dark({
      color: '#86efac',
    }),
    {
      color: colorTokens.success,
    },
  ]),
  featureIconSvg: style([
    {
      height: '1.5rem',
      width: '1.5rem',
    },
  ]),
  featureNumber: style([
    a.fontBold,
    a.text145,
    a.leadingNone,
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
  featureRow: style([
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
  featureTitle: style([
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
    a.itemsCenter,
    a.flex,
    a.flexWrap,
    a.gap075,
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
      color: colorTokens.slate800,
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
      maxWidth: '16ch',
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
      backgroundImage: 'url("/assets/about-hero-dark.svg")',
      opacity: 1,
    }),
    {
      animationName: artworkDrift,
      backgroundImage: 'url("/assets/about-hero-light.svg")',
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
  itemBullet: style([
    a.roundedFull,
    a.mt2,
    a.dark({
      backgroundColor: '#7dd3fc',
    }),
    {
      backgroundColor: colorTokens.info,
      height: '0.45rem',
      width: '0.45rem',
    },
  ]),
  itemText: style([
    a.minW0,
  ]),
  nextAction: style([
    a.dark({
      color: colorTokens.slate300,
    }),
    {
      color: colorTokens.slate600,
      fontSize: '0.95rem',
      transition: 'transform 0.2s ease, color 0.2s ease',
    },
  ]),
  nextLink: style([
    a.itemsStart,
    a.roundedXl,
    a.grid,
    a.noUnderline,
    a.minW0,
    a.pb145,
    a.pt145,
    a.pl05,
    a.pr05,
    a.md({
      alignItems: 'center',
      gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
    }),
    a.darkHover({
      backgroundColor: 'rgba(15, 23, 42, 0.22)',
    }),
    a.hover({
      backgroundColor: 'rgba(248, 250, 252, 0.9)',
      transform: 'translate3d(0.35rem, 0, 0)',
    }),
    {
      gap: '0.95rem 1rem',
      gridTemplateColumns: '1fr',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
  ]),
  nextList: style([
    a.minW0,
    a.borderBlockSolid,
    a.borderBlock1,
    a.borderSlate200,
    a.dark({
      borderColor: colorTokens.slate800,
    }),
  ]),
  nextPath: style([
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
  nextRow: style([
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
  nextTitle: style([
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
  nextTitleBlock: style([
    a.minW0,
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
  rowIcon: style([
    a.inlineGrid,
    a.mb2,
  ]),
  rowIconBlue: style([
    a.dark({
      color: '#7dd3fc',
    }),
    {
      color: colorTokens.info,
    },
  ]),
  rowIconGreen: style([
    a.dark({
      color: '#86efac',
    }),
    {
      color: colorTokens.success,
    },
  ]),
  rowIconSvg: style([
    {
      height: '1.5rem',
      width: '1.5rem',
    },
  ]),
  rowNumber: style([
    a.fontBold,
    a.text145,
    a.leadingNone,
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
  rowTitleBlock: style([
    a.minW0,
  ]),
  stackItems: style([
    a.grid,
    a.m0,
    a.p0,
    a.minW0,
    {
      gap: '0.75rem',
      listStyle: 'none',
    },
  ]),
  stackList: style([
    a.minW0,
    a.borderBlockSolid,
    a.borderBlock1,
    a.borderSlate200,
    a.dark({
      borderColor: colorTokens.slate800,
    }),
  ]),
  stackListItem: style([
    a.itemsStart,
    a.grid,
    a.minW0,
    {
      gap: '0.75rem',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
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
