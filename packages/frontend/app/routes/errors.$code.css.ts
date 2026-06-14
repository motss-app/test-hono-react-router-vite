import { keyframes, style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
import { colorTokens } from '../styles/tokens.css.ts';

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
  a.roundedFull,
  a.inlineGrid,
  a.fontSemibold,
  a.gap05,
  a.gridAutoFlowColumn,
  a.p092_145,
  a.noUnderline,
  a.whitespaceNowrap,
  a.dark({
    backgroundColor: '#ef4444',
  }),
  a.darkHover({
    backgroundColor: '#fca5a5',
  }),
  a.hover({
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
  a.dark({
    backgroundColor: '#67e8f9',
    color: colorTokens.slate900,
  }),
  a.darkHover({
    backgroundColor: '#a5f3fc',
  }),
  a.hover({
    backgroundColor: '#0284c7',
    transform: 'translate3d(0, -0.125rem, 0)',
  }),
  {
    backgroundColor: '#0891b2',
    color: colorTokens.white,
  },
]);

export const ctaPrimaryWarning = style([
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
  {
    backgroundColor: '#f59e0b',
    color: colorTokens.slate900,
  },
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
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  a.darkHover({
    borderColor: colorTokens.slate400,
  }),
  a.hover({
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
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(103, 232, 249, 0.28)',
    color: colorTokens.slate100,
  }),
  a.darkHover({
    borderColor: '#67e8f9',
  }),
  a.hover({
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
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderColor: 'rgba(226, 232, 240, 0.26)',
    color: colorTokens.slate100,
  }),
  a.darkHover({
    borderColor: colorTokens.slate400,
  }),
  a.hover({
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
  a.text086,
  a.textUppercase,
  a.mb03,
  a.dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#991b1b',
    letterSpacing: '0.08em',
  },
]);

export const dataList = style([
  a.grid,
  a.gap4,
  a.minW0,
  a.md({
    gridTemplateColumns: '1fr 1fr',
  }),
]);

export const dataValue = style([
  a.text11,
  a.leading155,
  a.m0,
  a.minW0,
  a.dark({
    color: colorTokens.slate100,
  }),
  {
    color: colorTokens.slate900,
    overflowWrap: 'anywhere',
  },
]);

export const hero = style([
  a.relative,
  a.overflowHidden,
  a.minW0,
]);

export const heroActions = style([
  a.inlineGrid,
  a.gap075,
  a.gridAutoFlowColumn,
  a.justifyStart,
]);

export const heroBody = style([
  a.textBase,
  a.leading17,
  a.mb8,
  a.mt0,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  {
    animationDelay: '160ms',
    animationName: heroReveal,
    color: '#7f1d1d',
    maxWidth: '31rem',
  },
]);

export const heroBodyCritical = style([
  a.dark({
    color: colorTokens.slate300,
  }),
]);

export const heroBodyRuntime = style([
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#155e75',
  },
]);

export const heroBodyWarning = style([
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7c2d12',
  },
]);

export const heroCopy = style([
  a.relative,
  a.z2,
  a.minW0,
  a.md({
    paddingBottom: '4rem',
  }),
  {
    maxWidth: '40rem',
    paddingBottom: '2.5rem',
  },
]);

export const heroCritical = style([
  a.dark({
    backgroundColor: '#12090c',
  }),
  {
    backgroundColor: '#fff5f5',
  },
]);

export const heroInner = style([
  a.itemsEnd,
  a.grid,
  a.mxAuto,
  a.minH100svh,
  a.relative,
  a.minW0,
  a.px4,
  a.pt16,
  a.pb8,
  a.md({
    paddingBottom: '0',
  }),
  {
    maxWidth: '84rem',
  },
]);

export const heroLead = style([
  a.fontMedium,
  a.trackingTight,
  a.mt0,
  a.mb085,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.md({
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
  a.dark({
    color: '#fca5a5',
  }),
  {
    color: '#991b1b',
  },
]);

export const heroLeadRuntime = style([
  a.dark({
    color: '#67e8f9',
  }),
  {
    color: '#0f766e',
  },
]);

export const heroLeadWarning = style([
  a.dark({
    color: '#fde68a',
  }),
  {
    color: '#9a3412',
  },
]);

export const heroMedia = style([
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
  a.dark({
    backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  },
]);

export const heroMediaRuntime = style([
  a.dark({
    backgroundImage: 'url("/assets/runtime-error-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/runtime-error-hero-light.svg")',
  },
]);

export const heroMediaWarning = style([
  a.dark({
    backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
  }),
  {
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
  },
]);

export const heroOverlay = style([
  a.absolute,
  a.inset0,
  a.z1,
]);

export const heroOverlayCritical = style([
  a.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
  },
]);

export const heroOverlayRuntime = style([
  a.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(7, 22, 27, 0.94) 0%, rgba(7, 22, 27, 0.72) 28%, rgba(7, 22, 27, 0.28) 56%, rgba(7, 22, 27, 0.1) 100%), linear-gradient(180deg, rgba(7, 22, 27, 0.16) 0%, rgba(7, 22, 27, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(245, 252, 255, 0.995) 0%, rgba(236, 254, 255, 0.95) 28%, rgba(207, 250, 254, 0.8) 48%, rgba(186, 230, 253, 0.46) 68%, rgba(245, 252, 255, 0.18) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(186, 230, 253, 0.12) 100%)',
  },
]);

export const heroOverlayWarning = style([
  a.dark({
    backgroundImage:
      'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
  }),
  {
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
  },
]);

export const heroRuntime = style([
  a.dark({
    backgroundColor: '#07161b',
  }),
  {
    backgroundColor: '#ecfeff',
  },
]);

export const heroWarning = style([
  a.dark({
    backgroundColor: '#140d07',
  }),
  {
    backgroundColor: '#fff7ed',
  },
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
    maxWidth: '36rem',
  },
]);

export const routesIntroCritical = style([
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7f1d1d',
  },
]);

export const routesIntroRuntime = style([
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#155e75',
  },
]);

export const routesIntroWarning = style([
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: '#7c2d12',
  },
]);

export const routesList = style([
  a.borderBlockSolid,
  a.borderBlock1,
  a.minW0,
]);

export const routesListCritical = style([
  a.borderRed100,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesListRuntime = style([
  a.borderSky200,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesListWarning = style([
  a.borderOrange100,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const routesTitle = style([
  a.fontBold,
  a.trackingTighter,
  a.mt0,
  a.mb03,
  a.md({
    fontSize: '2.6rem',
  }),
  a.dark({
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
  a.text098,
  a.leading165,
  a.m0,
  a.minW0,
  a.dark({
    color: colorTokens.slate300,
  }),
  {
    color: colorTokens.slate700,
  },
]);

export const rowCode = style([
  a.fontBold,
  a.leading10,
  a.md({
    fontSize: '2rem',
  }),
  {
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
  },
]);

export const rowCodeCritical = style([
  a.dark({
    color: '#fca5a5',
  }),
  {
    color: '#dc2626',
  },
]);

export const rowCodeRuntime = style([
  a.dark({
    color: '#67e8f9',
  }),
  {
    color: '#0891b2',
  },
]);

export const rowCodeWarning = style([
  a.dark({
    color: '#fde68a',
  }),
  {
    color: '#d97706',
  },
]);

export const rowContent = style([
  a.minW0,
]);

export const rowPanel = style([
  a.itemsStart,
  a.grid,
  a.gap4,
  a.minW0,
  a.md({
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
  a.borderBlockSolid,
  a.borderBlock1,
  a.minW0,
]);

export const rowRowCritical = style([
  a.borderRed100,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowRowRuntime = style([
  a.borderSky200,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowRowWarning = style([
  a.borderOrange100,
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);

export const rowTitle = style([
  a.text145,
  a.fontSemibold,
  a.leading11,
  a.mt0,
  a.mb03,
  a.dark({
    color: colorTokens.white,
  }),
  {
    color: colorTokens.slate900,
    letterSpacing: '-0.03em',
  },
]);

export const statusLabel = style([
  a.text086,
  a.m0,
  a.textUppercase,
  {
    letterSpacing: '0.08em',
  },
]);

export const statusLabelCritical = style([
  a.dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#991b1b',
  },
]);

export const statusLabelRuntime = style([
  a.dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#155e75',
  },
]);

export const statusLabelWarning = style([
  a.dark({
    color: colorTokens.slate400,
  }),
  {
    color: '#9a3412',
  },
]);

export const title = style([
  a.fontBold,
  a.trackingTighter,
  a.mt0,
  a.mb4,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.md({
    fontSize: '7rem',
  }),
  a.reducedMotion({
    animationDuration: '1ms',
    animationIterationCount: '1',
  }),
  a.dark({
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
  a.block,
  a.dark({
    color: '#fca5a5',
  }),
  {
    color: '#b91c1c',
  },
]);

export const titleAccentRuntime = style([
  a.dark({
    color: '#67e8f9',
  }),
  {
    color: '#0e7490',
  },
]);

export const titleAccentWarning = style([
  a.dark({
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
