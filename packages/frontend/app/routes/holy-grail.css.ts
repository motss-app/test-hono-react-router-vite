import { keyframes, style } from '@vanilla-extract/css';

import {
  anim700,
  animCubic,
  animFillBoth,
} from '../styles/atomic/animation/animation/animation.css.ts';
import {
  borderSlate200,
  borderSlate300,
} from '../styles/atomic/appearance/border/border-color.css.ts';
import {
  borderBlock1,
  borderBlockSolid,
} from '../styles/atomic/appearance/border/border-logical.css.ts';
import { roundedFull, roundedXl } from '../styles/atomic/appearance/border/border-radius.css.ts';
import { border1, borderSolid } from '../styles/atomic/appearance/border/border-style.css.ts';
import { itemsCenter, justifyCenter } from '../styles/atomic/flex/flex-container/alignment.css.ts';
import { gap05, gap4, gap5 } from '../styles/atomic/flex/flex-container/gap.css.ts';
import { gridAutoFlowColumn } from '../styles/atomic/grid/grid-container/grid-auto-flow.css.ts';
import { m0, mxAuto } from '../styles/atomic/layout/box-model/margin.css.ts';
import { p0, p4, pt4 } from '../styles/atomic/layout/box-model/padding.css.ts';
import { minH100svh, minW0, wFull } from '../styles/atomic/layout/box-model/sizing.css.ts';
import { grid, inlineGrid } from '../styles/atomic/layout/display-visibility/display.css.ts';
import { sticky } from '../styles/atomic/layout/positioning/position.css.ts';
import { z2 } from '../styles/atomic/layout/positioning/z-index.css.ts';
import { dark, darkHover, hover } from '../styles/atomic/other/selectors.css.ts';
import { textBase } from '../styles/atomic/text/font/font-size.css.ts';
import { fontBold, fontSemibold } from '../styles/atomic/text/font/font-weight.css.ts';
import {
  leading105,
  leading16,
  leading17,
} from '../styles/atomic/text/text-props/line-height.css.ts';
import {
  noUnderline,
  textCenter,
  textUppercase,
  whitespaceNowrap,
} from '../styles/atomic/text/text-props/text-transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { iconStyles } from '../styles/icon.css.ts';

const fadeUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

export const article = style([
  grid,
  gap5,
  minW0,
  animFillBoth,
  animCubic,
  anim700,
  {
    animationDelay: '180ms',
    animationName: fadeUp,
  },
]);
export const articleBody = style([
  textBase,
  leading17,
  m0,
  {
    color: colorTokens.slate700,
    maxInlineSize: '54ch',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const articleEyebrow = style([
  m0,
  fontSemibold,
  textUppercase,
  {
    color: colorTokens.info,
    fontSize: '0.82rem',
    letterSpacing: '0.16em',
  },
  dark({
    color: '#7dd3fc',
  }),
]);
export const articleTitle = style([
  m0,
  fontBold,
  {
    '@container': {
      '(min-width: 48rem)': {
        fontSize: '3.2rem',
      },
    },
    color: colorTokens.slate900,
    fontSize: '2.25rem',
    letterSpacing: '-0.05em',
    lineHeight: '0.95',
    maxInlineSize: '12ch',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const bodyCopy = style([
  textBase,
  leading17,
  m0,
  {
    color: colorTokens.slate700,
    maxInlineSize: '62ch',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const brand = style([
  grid,
  gridAutoFlowColumn,
  minW0,
  {
    alignItems: 'center',
    gap: '0.9rem',
    gridAutoColumns: 'max-content',
  },
]);
export const brandIconVars = style([
  {
    height: '1.25rem',
    width: '1.25rem',
  },
  dark({
    color: colorTokens.slate900,
  }),
]);
export const brandMark = style([
  grid,
  inlineGrid,
  justifyCenter,
  roundedXl,
  {
    alignItems: 'center',
    backgroundColor: colorTokens.info,
    flexShrink: 0,
    height: '3rem',
    placeItems: 'center',
    width: '3rem',
  },
  dark({
    backgroundColor: '#7dd3fc',
  }),
]);
export const footer = style([
  borderBlockSolid,
  borderBlock1,
  borderSlate200,
  mxAuto,
  wFull,
  {
    maxInlineSize: '96rem',
    paddingBlockEnd: '1.25rem',
    paddingBlockStart: '0.75rem',
    paddingInlineEnd: '1.25rem',
    paddingInlineStart: '1.25rem',
  },
  dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const footerInner = style([
  grid,
  itemsCenter,
  gap4,
  animFillBoth,
  animCubic,
  anim700,
  {
    '@container': {
      '(min-width: 48rem)': {
        gridTemplateColumns: '1fr auto',
      },
    },
    animationDelay: '280ms',
    animationName: fadeUp,
    gridTemplateColumns: '1fr',
  },
]);
export const footerLink = style([
  grid,
  inlineGrid,
  gridAutoFlowColumn,
  roundedFull,
  noUnderline,
  {
    alignItems: 'center',
    color: colorTokens.slate900,
    gap: '0.45rem',
    gridAutoColumns: 'max-content',
    padding: '0.55rem 0.9rem',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  dark({
    color: colorTokens.slate100,
  }),
  darkHover({
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
  }),
  hover({
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    transform: 'translate3d(0.25rem, 0, 0)',
  }),
]);
export const footerNote = style([
  m0,
  {
    color: colorTokens.slate600,
    fontSize: '0.92rem',
  },
  dark({
    color: colorTokens.slate400,
  }),
]);
export const header = style([
  sticky,
  z2,
  {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(250, 250, 250, 0.82)',
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    top: 0,
  },
  dark({
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    borderBottomColor: colorTokens.slate800,
  }),
]);
export const headerInner = style([
  grid,
  itemsCenter,
  gap4,
  mxAuto,
  wFull,
  animFillBoth,
  animCubic,
  anim700,
  pt4,
  {
    '@container': {
      '(min-width: 48rem)': {
        gridTemplateColumns: 'auto 1fr',
      },
    },
    animationDelay: '60ms',
    animationName: fadeUp,
    gridTemplateColumns: '1fr',
    maxInlineSize: '96rem',
    paddingBlockEnd: '1rem',
    paddingInlineEnd: '1.25rem',
    paddingInlineStart: '1.25rem',
  },
]);
export const layoutBlock = style([
  borderSolid,
  border1,
  borderSlate300,
  roundedXl,
  p4,
  {
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  dark({
    borderColor: colorTokens.slate700,
  }),
]);
export const layoutBlockCenter = style([
  {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minBlockSize: '15rem',
  },
  dark({
    backgroundColor: 'rgba(8, 15, 31, 0.92)',
  }),
]);
export const layoutBlockLeft = style([
  {
    backgroundColor: 'rgba(239, 246, 255, 0.92)',
  },
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.54)',
  }),
]);
export const layoutBlockRight = style([
  {
    backgroundColor: 'rgba(249, 250, 251, 0.92)',
  },
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  }),
]);
export const layoutDiagram = style([
  grid,
  {
    containerType: 'inline-size',
    gap: '0.85rem',
  },
]);
export const layoutDiagramBody = style([
  grid,
  {
    '@container': {
      '(min-width: 40rem)': {
        gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
      },
    },
    gap: '0.85rem',
    gridTemplateColumns: '1fr',
  },
]);
export const layoutDiagramFooter = style([
  textCenter,
  {
    backgroundColor: 'rgba(241, 245, 249, 0.92)',
  },
  dark({
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  }),
]);
export const layoutDiagramHeader = style([
  textCenter,
  {
    backgroundColor: '#dbeafe',
  },
  dark({
    backgroundColor: '#0f172a',
  }),
]);
export const layoutDiagramMain = style([
  grid,
  {
    '@container': {
      '(min-width: 40rem)': {
        gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
      },
    },
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    containerType: 'inline-size',
    gap: '0.85rem',
    gridTemplateColumns: '1fr',
    minBlockSize: '15rem',
  },
  dark({
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
  }),
]);
export const layoutLabel = style([
  m0,
  fontSemibold,
  textUppercase,
  {
    color: colorTokens.info,
    fontSize: '0.78rem',
    letterSpacing: '0.18em',
  },
  dark({
    color: '#7dd3fc',
  }),
]);
export const layoutTitle = style([
  m0,
  fontBold,
  whitespaceNowrap,
  {
    '@container': {
      '(min-width: 48rem)': {
        fontSize: '3.6rem',
      },
    },
    color: colorTokens.slate900,
    fontSize: '2.4rem',
    letterSpacing: '-0.06em',
    lineHeight: '0.94',
    maxInlineSize: 'none',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const nav = style([
  grid,
  gridAutoFlowColumn,
  {
    alignItems: 'center',
    gap: '0.5rem',
    gridAutoColumns: 'max-content',
  },
]);
export const navLink = style([
  roundedFull,
  noUnderline,
  {
    color: colorTokens.slate900,
    fontSize: '0.92rem',
    padding: '0.55rem 0.8rem',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  dark({
    color: colorTokens.slate100,
  }),
  darkHover({
    backgroundColor: 'rgba(125, 211, 252, 0.12)',
  }),
  hover({
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
  }),
]);
export const page = style([
  grid,
  minH100svh,
  {
    color: colorTokens.slate900,
    containerType: 'inline-size',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
  },
  dark({
    color: colorTokens.slate100,
  }),
]);
export const pageBg = style([
  {
    selectors: {
      '&': {
        backgroundImage:
          'radial-gradient(circle at top, rgba(14, 165, 233, 0.1), transparent 40%), linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(241, 245, 249, 1) 55%)',
      },
    },
  },
  dark({
    backgroundImage:
      'radial-gradient(circle at top, rgba(14, 165, 233, 0.12), transparent 40%), linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 1) 55%)',
  }),
]);
export const pageVars = style({
  vars: {
    '--holy-grail-header-height': '0px',
    '--holy-grail-sticky-gap': '1rem',
  },
});
export const rail = style([
  grid,
  gap4,
  minW0,
  animFillBoth,
  animCubic,
  anim700,
  {
    '@container': {
      '(min-width: 60rem)': {
        position: 'sticky',
        top: 'calc(var(--holy-grail-header-height) + var(--holy-grail-sticky-gap))',
      },
    },
    alignSelf: 'start',
    animationName: fadeUp,
    position: 'static',
    top: 'auto',
  },
]);
export const railBody = style([
  m0,
  leading17,
  {
    color: colorTokens.slate700,
    fontSize: '0.96rem',
  },
  dark({
    color: colorTokens.slate300,
  }),
]);
export const railHeading = style([
  m0,
  fontSemibold,
  leading105,
  {
    color: colorTokens.slate900,
    fontSize: '1.15rem',
    letterSpacing: '-0.03em',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const railIconVars = style([
  {
    color: colorTokens.info,
    height: '1rem',
    width: '1rem',
  },
  dark({
    color: '#7dd3fc',
  }),
]);
export const railIconWrap = style([
  grid,
  inlineGrid,
  {
    alignItems: 'center',
    placeItems: 'center',
  },
]);
export const railList = style([
  grid,
  m0,
  p0,
  {
    gap: '0.75rem',
    listStyle: 'none',
  },
]);
export const railListItem = style([
  borderBlockSolid,
  borderBlock1,
  borderSlate300,
  {
    paddingBlockStart: '0.75rem',
  },
  dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const railSection = style([
  grid,
  borderSolid,
  border1,
  borderSlate200,
  p4,
  {
    borderRadius: '1.25rem',
    gap: '0.95rem',
  },
  dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const railSectionAccent = style([
  {
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
  },
  dark({
    backgroundColor: 'rgba(125, 211, 252, 0.08)',
  }),
]);
export const shell = style([
  grid,
  gap5,
  mxAuto,
  wFull,
  {
    '@container': {
      '(min-width: 60rem)': {
        gridTemplateAreas: '"left main right"',
        gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2.6fr) minmax(12rem, 1fr)',
      },
    },
    gridTemplateAreas: '"left" "main" "right"',
    gridTemplateColumns: '1fr',
    maxInlineSize: '96rem',
    paddingBlockEnd: '1.5rem',
    paddingBlockStart: '1.25rem',
    paddingInlineEnd: '1.25rem',
    paddingInlineStart: '1.25rem',
  },
]);
export const shellLeftGrid = style({
  gridArea: 'left',
});
export const shellMain = style({
  gridArea: 'main',
});
export const shellNote = style([
  m0,
  textUppercase,
  {
    color: colorTokens.slate600,
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
  },
  dark({
    color: colorTokens.slate400,
  }),
]);
export const shellRightGrid = style({
  gridArea: 'right',
});
export const shellTitle = style([
  m0,
  fontBold,
  leading105,
  {
    '@container': {
      '(min-width: 48rem)': {
        fontSize: '1.45rem',
      },
    },
    color: colorTokens.slate900,
    fontSize: '1.2rem',
    letterSpacing: '-0.03em',
  },
  dark({
    color: colorTokens.white,
  }),
]);
export const shellTopline = style([
  grid,
  gap05,
  animFillBoth,
  animCubic,
  anim700,
  {
    animationDelay: '120ms',
    animationName: fadeUp,
  },
]);
export const topLine = style([
  m0,
  leading16,
  {
    color: colorTokens.slate600,
    fontSize: '0.92rem',
    maxInlineSize: '32ch',
  },
  dark({
    color: colorTokens.slate400,
  }),
]);
export const topLineAccent = style([
  fontSemibold,
  {
    color: colorTokens.info,
  },
  dark({
    color: '#7dd3fc',
  }),
]);
export const articleShell = style([
  article,
  shellMain,
]);
export const brandIcon = style([
  iconStyles.base,
  brandIconVars,
]);
export const layoutCenter = style([
  layoutBlock,
  layoutBlockCenter,
]);
export const layoutFooter = style([
  layoutBlock,
  layoutDiagramFooter,
]);
export const layoutHeader = style([
  layoutBlock,
  layoutDiagramHeader,
]);
export const layoutLeft = style([
  layoutBlock,
  layoutBlockLeft,
]);
export const layoutRight = style([
  layoutBlock,
  layoutBlockRight,
]);
export const pageShell = style([
  page,
  pageBg,
  pageVars,
]);
export const railIcon = style([
  iconStyles.base,
  railIconVars,
]);
export const shellLeft = style([
  rail,
  shellLeftGrid,
  railSection,
  railSectionAccent,
]);
export const shellRight = style([
  rail,
  shellRightGrid,
  railSection,
]);
