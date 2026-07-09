import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { radiusTokens } from '../styles/radius-tokens.contract.css.ts';

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

export const article = style({
  animationDelay: '180ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: fadeUp,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'grid',
  gap: '1.25rem',
  minInlineSize: 0,
});
export const articleBody = style({
  color: colorTokens.slate700,
  fontSize: '1rem',
  lineHeight: 1.7,
  margin: 0,
  maxInlineSize: '54ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const articleEyebrow = style({
  color: colorTokens.info,
  fontSize: '0.82rem',
  fontWeight: 600,
  letterSpacing: '0.16em',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
  textTransform: 'uppercase',
});
export const articleTitle = style({
  '@container': {
    '(min-width: 48rem)': {
      fontSize: '3.2rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '2.25rem',
  fontWeight: 700,
  letterSpacing: '-0.05em',
  lineHeight: 0.95,
  margin: 0,
  maxInlineSize: '12ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const bodyCopy = style({
  color: colorTokens.slate700,
  fontSize: '1rem',
  lineHeight: 1.7,
  margin: 0,
  maxInlineSize: '62ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const brand = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.9rem',
  gridAutoColumns: 'max-content',
  gridAutoFlow: 'column',
  minInlineSize: 0,
});
export const brandIconVars = style({
  height: '1.25rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate900,
    },
  },
  width: '1.25rem',
});
export const brandMark = style({
  alignItems: 'center',
  backgroundColor: colorTokens.info,
  borderRadius: radiusTokens.radiusMd,
  display: 'inline-grid',
  flexShrink: 0,
  height: '3rem',
  justifyContent: 'center',
  placeItems: 'center',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#7dd3fc',
    },
  },
  width: '3rem',
});
export const footer = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: colorTokens.slate200,
  inlineSize: '100%',
  marginInline: 'auto',
  maxInlineSize: '96rem',
  paddingBlockEnd: '1.25rem',
  paddingBlockStart: '0.75rem',
  paddingInlineEnd: '1.25rem',
  paddingInlineStart: '1.25rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});
export const footerInner = style({
  '@container': {
    '(min-width: 48rem)': {
      gridTemplateColumns: '1fr auto',
    },
  },
  alignItems: 'center',
  animationDelay: '280ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: fadeUp,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: '1fr',
});
export const footerLink = style({
  alignItems: 'center',
  borderRadius: radiusTokens.radiusMd,
  color: colorTokens.slate900,
  display: 'inline-grid',
  gap: '0.45rem',
  gridAutoColumns: 'max-content',
  gridAutoFlow: 'column',
  padding: '0.55rem 0.9rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: 'rgba(125, 211, 252, 0.14)',
    },
    '&:hover': {
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      transform: 'translate3d(0.25rem, 0, 0)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
});
export const footerNote = style({
  color: colorTokens.slate600,
  fontSize: '0.92rem',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});
export const header = style({
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(250, 250, 250, 0.82)',
  borderBottomColor: colorTokens.slate200,
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  position: 'sticky',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(2, 6, 23, 0.7)',
      borderBottomColor: colorTokens.slate800,
    },
  },
  top: 0,
  zIndex: 2,
});
export const headerInner = style({
  '@container': {
    '(min-width: 48rem)': {
      gridTemplateColumns: 'auto 1fr',
    },
  },
  alignItems: 'center',
  animationDelay: '60ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: fadeUp,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: '1fr',
  inlineSize: '100%',
  marginInline: 'auto',
  maxInlineSize: '96rem',
  paddingBlockEnd: '1rem',
  paddingBlockStart: '1rem',
  paddingInlineEnd: '1.25rem',
  paddingInlineStart: '1.25rem',
});
export const layoutBlock = style({
  borderColor: colorTokens.slate300,
  borderRadius: radiusTokens.radiusMd,
  borderStyle: 'solid',
  borderWidth: '1px',
  padding: '1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate700,
    },
  },
  transition: 'transform 0.2s ease, border-color 0.2s ease',
});
export const layoutBlockCenter = style({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  minBlockSize: '15rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(8, 15, 31, 0.92)',
    },
  },
});
export const layoutBlockLeft = style({
  backgroundColor: 'rgba(239, 246, 255, 0.92)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.54)',
    },
  },
});
export const layoutBlockRight = style({
  backgroundColor: 'rgba(249, 250, 251, 0.92)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.38)',
    },
  },
});
export const layoutDiagram = style({
  containerType: 'inline-size',
  display: 'grid',
  gap: '0.85rem',
});
export const layoutDiagramBody = style({
  '@container': {
    '(min-width: 40rem)': {
      gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
    },
  },
  display: 'grid',
  gap: '0.85rem',
  gridTemplateColumns: '1fr',
});
export const layoutDiagramFooter = style({
  backgroundColor: 'rgba(241, 245, 249, 0.92)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
  },
  textAlign: 'center',
});
export const layoutDiagramHeader = style({
  backgroundColor: '#dbeafe',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: '#0f172a',
    },
  },
  textAlign: 'center',
});
export const layoutDiagramMain = style({
  '@container': {
    '(min-width: 40rem)': {
      gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
    },
  },
  backgroundColor: 'rgba(14, 165, 233, 0.08)',
  containerType: 'inline-size',
  display: 'grid',
  gap: '0.85rem',
  gridTemplateColumns: '1fr',
  minBlockSize: '15rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(125, 211, 252, 0.14)',
    },
  },
});
export const layoutLabel = style({
  color: colorTokens.info,
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
  textTransform: 'uppercase',
});
export const layoutTitle = style({
  '@container': {
    '(min-width: 48rem)': {
      fontSize: '3.6rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '2.4rem',
  fontWeight: 700,
  letterSpacing: '-0.06em',
  lineHeight: 0.94,
  margin: 0,
  maxInlineSize: 'none',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
  whiteSpace: 'nowrap',
});
export const nav = style({
  alignItems: 'center',
  display: 'grid',
  gap: '0.5rem',
  gridAutoColumns: 'max-content',
  gridAutoFlow: 'column',
});
export const navLink = style({
  borderRadius: radiusTokens.radiusMd,
  color: colorTokens.slate900,
  fontSize: '0.92rem',
  padding: '0.55rem 0.8rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
    ':root[data-theme="dark"] &:hover': {
      backgroundColor: 'rgba(125, 211, 252, 0.12)',
    },
    '&:hover': {
      backgroundColor: 'rgba(14, 165, 233, 0.08)',
    },
  },
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, color 0.2s ease',
});
export const page = style({
  color: colorTokens.slate900,
  containerType: 'inline-size',
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  minBlockSize: '100svh',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate100,
    },
  },
});
export const pageBg = style({
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundImage:
        'radial-gradient(circle at top, rgba(14, 165, 233, 0.12), transparent 40%), linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 1) 55%)',
    },
    '&': {
      backgroundImage:
        'radial-gradient(circle at top, rgba(14, 165, 233, 0.1), transparent 40%), linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(241, 245, 249, 1) 55%)',
    },
  },
});
export const pageVars = style({
  vars: {
    '--holy-grail-header-height': '0px',
    '--holy-grail-sticky-gap': '1rem',
  },
});
export const rail = style({
  '@container': {
    '(min-width: 60rem)': {
      position: 'sticky',
      top: 'calc(var(--holy-grail-header-height) + var(--holy-grail-sticky-gap))',
    },
  },
  alignSelf: 'start',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: fadeUp,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'grid',
  gap: '1rem',
  minInlineSize: 0,
  position: 'static',
  top: 'auto',
});
export const railBody = style({
  color: colorTokens.slate700,
  fontSize: '0.96rem',
  lineHeight: 1.7,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate300,
    },
  },
});
export const railHeading = style({
  color: colorTokens.slate900,
  fontSize: '1.15rem',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const railIconVars = style({
  color: colorTokens.info,
  height: '1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
  width: '1rem',
});
export const railIconWrap = style({
  alignItems: 'center',
  display: 'inline-grid',
  placeItems: 'center',
});
export const railList = style({
  display: 'grid',
  gap: '0.75rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const railListItem = style({
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: colorTokens.slate300,
  paddingBlockStart: '0.75rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});
export const railSection = style({
  borderColor: colorTokens.slate200,
  borderRadius: '1.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  display: 'grid',
  gap: '0.95rem',
  padding: '1rem',
  selectors: {
    ':root[data-theme="dark"] &': {
      borderColor: colorTokens.slate800,
    },
  },
});
export const railSectionAccent = style({
  backgroundColor: 'rgba(14, 165, 233, 0.06)',
  selectors: {
    ':root[data-theme="dark"] &': {
      backgroundColor: 'rgba(125, 211, 252, 0.08)',
    },
  },
});
export const shell = style({
  '@container': {
    '(min-width: 60rem)': {
      gridTemplateAreas: '"left main right"',
      gridTemplateColumns: 'minmax(12rem, 1fr) minmax(0, 2.6fr) minmax(12rem, 1fr)',
    },
  },
  display: 'grid',
  gap: '1.25rem',
  gridTemplateAreas: '"left" "main" "right"',
  gridTemplateColumns: '1fr',
  inlineSize: '100%',
  marginInline: 'auto',
  maxInlineSize: '96rem',
  paddingBlockEnd: '1.5rem',
  paddingBlockStart: '1.25rem',
  paddingInlineEnd: '1.25rem',
  paddingInlineStart: '1.25rem',
});
export const shellLeftGrid = style({
  gridArea: 'left',
});
export const shellMain = style({
  gridArea: 'main',
});
export const shellNote = style({
  color: colorTokens.slate600,
  fontSize: '0.9rem',
  letterSpacing: '0.08em',
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
  textTransform: 'uppercase',
});
export const shellRightGrid = style({
  gridArea: 'right',
});
export const shellTitle = style({
  '@container': {
    '(min-width: 48rem)': {
      fontSize: '1.45rem',
    },
  },
  color: colorTokens.slate900,
  fontSize: '1.2rem',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  margin: 0,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.white,
    },
  },
});
export const shellTopline = style({
  animationDelay: '120ms',
  animationDuration: '700ms',
  animationFillMode: 'both',
  animationName: fadeUp,
  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'grid',
  gap: '0.5rem',
});
export const topLine = style({
  color: colorTokens.slate600,
  fontSize: '0.92rem',
  lineHeight: 1.6,
  margin: 0,
  maxInlineSize: '32ch',
  selectors: {
    ':root[data-theme="dark"] &': {
      color: colorTokens.slate400,
    },
  },
});
export const topLineAccent = style({
  color: colorTokens.info,
  fontWeight: 600,
  selectors: {
    ':root[data-theme="dark"] &': {
      color: '#7dd3fc',
    },
  },
});
export const articleShell = style({});
export const brandIcon = style({});
export const layoutCenter = style({});
export const layoutFooter = style({});
export const layoutHeader = style({});
export const layoutLeft = style({});
export const layoutRight = style({});
export const pageShell = style({});
export const railIcon = style({});
export const shellLeft = style({});
export const shellRight = style({});
