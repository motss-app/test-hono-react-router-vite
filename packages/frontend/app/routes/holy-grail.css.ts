import { keyframes, style } from '@vanilla-extract/css';

import * as a from '../styles/atomic/index.css.ts';
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
  a.grid,
  a.gap5,
  a.minW0,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  {
    animationDelay: '180ms',
    animationName: fadeUp,
  },
]);
export const articleBody = style([
  a.textBase,
  a.leading17,
  a.m0,
  {
    color: colorTokens.slate700,
    maxInlineSize: '54ch',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const articleEyebrow = style([
  a.m0,
  a.fontSemibold,
  a.textUppercase,
  {
    color: colorTokens.info,
    fontSize: '0.82rem',
    letterSpacing: '0.16em',
  },
  a.dark({
    color: '#7dd3fc',
  }),
]);
export const articleTitle = style([
  a.m0,
  a.fontBold,
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
  a.dark({
    color: colorTokens.white,
  }),
]);
export const bodyCopy = style([
  a.textBase,
  a.leading17,
  a.m0,
  {
    color: colorTokens.slate700,
    maxInlineSize: '62ch',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const brand = style([
  a.grid,
  a.gridAutoFlowColumn,
  a.minW0,
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
  a.dark({
    color: colorTokens.slate900,
  }),
]);
export const brandMark = style([
  a.grid,
  a.inlineGrid,
  a.justifyCenter,
  a.roundedXl,
  {
    alignItems: 'center',
    backgroundColor: colorTokens.info,
    flexShrink: 0,
    height: '3rem',
    placeItems: 'center',
    width: '3rem',
  },
  a.dark({
    backgroundColor: '#7dd3fc',
  }),
]);
export const footer = style([
  a.borderBlockSolid,
  a.borderBlock1,
  a.borderSlate200,
  a.mxAuto,
  a.wFull,
  {
    maxInlineSize: '96rem',
    paddingBlockEnd: '1.25rem',
    paddingBlockStart: '0.75rem',
    paddingInlineEnd: '1.25rem',
    paddingInlineStart: '1.25rem',
  },
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const footerInner = style([
  a.grid,
  a.itemsCenter,
  a.gap4,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
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
  a.grid,
  a.inlineGrid,
  a.gridAutoFlowColumn,
  a.roundedFull,
  a.noUnderline,
  {
    alignItems: 'center',
    color: colorTokens.slate900,
    gap: '0.45rem',
    gridAutoColumns: 'max-content',
    padding: '0.55rem 0.9rem',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  a.dark({
    color: colorTokens.slate100,
  }),
  a.darkHover({
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
  }),
  a.hover({
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    transform: 'translate3d(0.25rem, 0, 0)',
  }),
]);
export const footerNote = style([
  a.m0,
  {
    color: colorTokens.slate600,
    fontSize: '0.92rem',
  },
  a.dark({
    color: colorTokens.slate400,
  }),
]);
export const header = style([
  a.sticky,
  a.z2,
  {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(250, 250, 250, 0.82)',
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    top: 0,
  },
  a.dark({
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    borderBottomColor: colorTokens.slate800,
  }),
]);
export const headerInner = style([
  a.grid,
  a.itemsCenter,
  a.gap4,
  a.mxAuto,
  a.wFull,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  a.pt4,
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
  a.borderSolid,
  a.border1,
  a.borderSlate300,
  a.roundedXl,
  a.p4,
  {
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  a.dark({
    borderColor: colorTokens.slate700,
  }),
]);
export const layoutBlockCenter = style([
  {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minBlockSize: '15rem',
  },
  a.dark({
    backgroundColor: 'rgba(8, 15, 31, 0.92)',
  }),
]);
export const layoutBlockLeft = style([
  {
    backgroundColor: 'rgba(239, 246, 255, 0.92)',
  },
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.54)',
  }),
]);
export const layoutBlockRight = style([
  {
    backgroundColor: 'rgba(249, 250, 251, 0.92)',
  },
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  }),
]);
export const layoutDiagram = style([
  a.grid,
  {
    containerType: 'inline-size',
    gap: '0.85rem',
  },
]);
export const layoutDiagramBody = style([
  a.grid,
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
  a.textCenter,
  {
    backgroundColor: 'rgba(241, 245, 249, 0.92)',
  },
  a.dark({
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  }),
]);
export const layoutDiagramHeader = style([
  a.textCenter,
  {
    backgroundColor: '#dbeafe',
  },
  a.dark({
    backgroundColor: '#0f172a',
  }),
]);
export const layoutDiagramMain = style([
  a.grid,
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
  a.dark({
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
  }),
]);
export const layoutLabel = style([
  a.m0,
  a.fontSemibold,
  a.textUppercase,
  {
    color: colorTokens.info,
    fontSize: '0.78rem',
    letterSpacing: '0.18em',
  },
  a.dark({
    color: '#7dd3fc',
  }),
]);
export const layoutTitle = style([
  a.m0,
  a.fontBold,
  a.whitespaceNowrap,
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
  a.dark({
    color: colorTokens.white,
  }),
]);
export const nav = style([
  a.grid,
  a.gridAutoFlowColumn,
  {
    alignItems: 'center',
    gap: '0.5rem',
    gridAutoColumns: 'max-content',
  },
]);
export const navLink = style([
  a.roundedFull,
  a.noUnderline,
  {
    color: colorTokens.slate900,
    fontSize: '0.92rem',
    padding: '0.55rem 0.8rem',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  a.dark({
    color: colorTokens.slate100,
  }),
  a.darkHover({
    backgroundColor: 'rgba(125, 211, 252, 0.12)',
  }),
  a.hover({
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
  }),
]);
export const page = style([
  a.grid,
  a.minH100svh,
  {
    color: colorTokens.slate900,
    containerType: 'inline-size',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
  },
  a.dark({
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
  a.dark({
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
  a.grid,
  a.gap4,
  a.minW0,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
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
  a.m0,
  a.leading17,
  {
    color: colorTokens.slate700,
    fontSize: '0.96rem',
  },
  a.dark({
    color: colorTokens.slate300,
  }),
]);
export const railHeading = style([
  a.m0,
  a.fontSemibold,
  a.leading105,
  {
    color: colorTokens.slate900,
    fontSize: '1.15rem',
    letterSpacing: '-0.03em',
  },
  a.dark({
    color: colorTokens.white,
  }),
]);
export const railIconVars = style([
  {
    color: colorTokens.info,
    height: '1rem',
    width: '1rem',
  },
  a.dark({
    color: '#7dd3fc',
  }),
]);
export const railIconWrap = style([
  a.grid,
  a.inlineGrid,
  {
    alignItems: 'center',
    placeItems: 'center',
  },
]);
export const railList = style([
  a.grid,
  a.m0,
  a.p0,
  {
    gap: '0.75rem',
    listStyle: 'none',
  },
]);
export const railListItem = style([
  a.borderBlockSolid,
  a.borderBlock1,
  a.borderSlate300,
  {
    paddingBlockStart: '0.75rem',
  },
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const railSection = style([
  a.grid,
  a.borderSolid,
  a.border1,
  a.borderSlate200,
  a.p4,
  {
    borderRadius: '1.25rem',
    gap: '0.95rem',
  },
  a.dark({
    borderColor: colorTokens.slate800,
  }),
]);
export const railSectionAccent = style([
  {
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
  },
  a.dark({
    backgroundColor: 'rgba(125, 211, 252, 0.08)',
  }),
]);
export const shell = style([
  a.grid,
  a.gap5,
  a.mxAuto,
  a.wFull,
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
  a.m0,
  a.textUppercase,
  {
    color: colorTokens.slate600,
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
  },
  a.dark({
    color: colorTokens.slate400,
  }),
]);
export const shellRightGrid = style({
  gridArea: 'right',
});
export const shellTitle = style([
  a.m0,
  a.fontBold,
  a.leading105,
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
  a.dark({
    color: colorTokens.white,
  }),
]);
export const shellTopline = style([
  a.grid,
  a.gap05,
  a.animFillBoth,
  a.animCubic,
  a.anim700,
  {
    animationDelay: '120ms',
    animationName: fadeUp,
  },
]);
export const topLine = style([
  a.m0,
  a.leading16,
  {
    color: colorTokens.slate600,
    fontSize: '0.92rem',
    maxInlineSize: '32ch',
  },
  a.dark({
    color: colorTokens.slate400,
  }),
]);
export const topLineAccent = style([
  a.fontSemibold,
  {
    color: colorTokens.info,
  },
  a.dark({
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
