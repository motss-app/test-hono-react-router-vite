import { keyframes, style } from '@vanilla-extract/css';

import { colorTokens, fontWeightTokens } from '../styles/tokens.css.ts';

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
  ctaPrimary: style({
    alignItems: 'center',
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: colorTokens.info,
    borderRadius: '9999px',
    color: colorTokens.white,
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#bae6fd',
        color: colorTokens.slate900,
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: '#7dd3fc',
      },
      '&:hover': {
        backgroundColor: colorTokens.infoHover,
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  }),
  ctaSecondary: style({
    alignItems: 'center',
    animationDelay: '320ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: colorTokens.slate900,
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        borderColor: 'rgba(226, 232, 240, 0.26)',
        color: colorTokens.slate100,
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
        borderColor: colorTokens.slate400,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: '#bfdbfe',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  }),
  featureBody: style({
    color: colorTokens.slate700,
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  featureIcon: style({
    display: 'inline-grid',
    marginBottom: '0.5rem',
  }),
  featureIconAmber: style({
    color: colorTokens.warning,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fcd34d',
      },
    },
  }),
  featureIconBlue: style({
    color: colorTokens.info,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#7dd3fc',
      },
    },
  }),
  featureIconGreen: style({
    color: colorTokens.success,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#86efac',
      },
    },
  }),
  featureIconSvg: style({
    height: '1.5rem',
    width: '1.5rem',
  }),
  featureNumber: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '2rem',
      },
    },
    color: colorTokens.info,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#7dd3fc',
      },
    },
  }),
  featureRow: style({
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        borderBottomColor: colorTokens.slate800,
      },
    },
  }),
  featureTitle: style({
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  hero: style({
    backgroundColor: '#edf6ff',
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#08101b',
      },
    },
  }),
  heroActions: style({
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  }),
  heroBody: style({
    animationDelay: '160ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: colorTokens.slate800,
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  heroCopy: style({
    '@media': {
      '(min-width: 768px)': {
        paddingBottom: '4rem',
      },
    },
    maxWidth: '38rem',
    minWidth: 0,
    paddingBottom: '2.5rem',
    position: 'relative',
    zIndex: 2,
  }),
  heroInner: style({
    '@media': {
      '(min-width: 768px)': {
        paddingBottom: '0',
      },
    },
    alignItems: 'flex-end',
    display: 'grid',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minHeight: '100svh',
    minWidth: 0,
    paddingBottom: '2rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '4rem',
    position: 'relative',
  }),
  heroLead: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '1.95rem',
      },
    },
    animationDelay: '110ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: colorTokens.slate900,
    fontSize: '1.28rem',
    fontWeight: fontWeightTokens.fontWeightMedium,
    letterSpacing: '-0.025em',
    lineHeight: '1.12',
    marginBottom: '0.85rem',
    marginTop: 0,
    maxWidth: '16ch',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate100,
      },
    },
  }),
  heroMedia: style({
    '@media': {
      '(min-width: 768px)': {
        backgroundPosition: 'center center',
      },
      '(prefers-reduced-motion: reduce)': {
        animationDuration: '1ms',
        animationIterationCount: '1',
      },
    },
    animationDirection: 'alternate',
    animationDuration: '18s',
    animationIterationCount: 'infinite',
    animationName: artworkDrift,
    animationTimingFunction: 'ease-in-out',
    backgroundImage: 'url("/assets/about-hero-light.svg")',
    backgroundPosition: '72% center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: 0.8,
    position: 'absolute',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage: 'url("/assets/about-hero-dark.svg")',
        opacity: 1,
      },
    },
    transformOrigin: 'center',
  }),
  heroOverlay: style({
    backgroundImage:
      'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
    inset: 0,
    position: 'absolute',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage:
          'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
      },
    },
    zIndex: 1,
  }),
  itemBullet: style({
    backgroundColor: colorTokens.info,
    borderRadius: '9999px',
    height: '0.45rem',
    marginTop: '0.5rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#7dd3fc',
      },
    },
    width: '0.45rem',
  }),
  itemText: style({
    minWidth: 0,
  }),
  nextAction: style({
    color: colorTokens.slate600,
    fontSize: '0.95rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
    transition: 'transform 0.2s ease, color 0.2s ease',
  }),
  nextLink: style({
    '@media': {
      '(min-width: 960px)': {
        alignItems: 'center',
        gridTemplateColumns: '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
      },
    },
    alignItems: 'start',
    borderRadius: '1rem',
    display: 'grid',
    gap: '0.95rem 1rem',
    gridTemplateColumns: '1fr',
    minWidth: 0,
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
    selectors: {
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: 'rgba(15, 23, 42, 0.22)',
      },
      '&:hover': {
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
        transform: 'translate3d(0.35rem, 0, 0)',
      },
    },
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  }),
  nextList: style({
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        borderTopColor: colorTokens.slate800,
      },
    },
  }),
  nextPath: style({
    color: colorTokens.slate600,
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate400,
      },
    },
    textTransform: 'uppercase',
  }),
  nextRow: style({
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        borderBottomColor: colorTokens.slate800,
      },
    },
  }),
  nextTitle: style({
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  nextTitleBlock: style({
    minWidth: 0,
  }),
  page: style({
    minWidth: 0,
    paddingBottom: '4rem',
  }),
  routesInner: style({
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '3.5rem',
  }),
  routesIntro: style({
    color: colorTokens.slate700,
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '34rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  routesTitle: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '2.6rem',
      },
    },
    color: colorTokens.slate900,
    fontSize: '2rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '0.98',
    marginBottom: '0.75rem',
    marginTop: 0,
    maxWidth: '12ch',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  rowBody: style({
    color: colorTokens.slate700,
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  rowIcon: style({
    display: 'inline-grid',
    marginBottom: '0.5rem',
    placeItems: 'center',
  }),
  rowIconBlue: style({
    color: colorTokens.info,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#7dd3fc',
      },
    },
  }),
  rowIconGreen: style({
    color: colorTokens.success,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#86efac',
      },
    },
  }),
  rowIconSvg: style({
    height: '1.5rem',
    width: '1.5rem',
  }),
  rowNumber: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '2rem',
      },
    },
    color: colorTokens.info,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#7dd3fc',
      },
    },
  }),
  rowRow: style({
    borderBottomColor: colorTokens.slate200,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        borderBottomColor: colorTokens.slate800,
      },
    },
  }),
  rowTitle: style({
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  rowTitleBlock: style({
    minWidth: 0,
  }),
  stackItems: style({
    display: 'grid',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    minWidth: 0,
    padding: 0,
  }),
  stackList: style({
    borderTopColor: colorTokens.slate200,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
    selectors: {
      ':root[data-theme="dark"] &': {
        borderTopColor: colorTokens.slate800,
      },
    },
  }),
  stackListItem: style({
    alignItems: 'start',
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    minWidth: 0,
  }),
  title: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '6.4rem',
      },
      '(prefers-reduced-motion: reduce)': {
        animationDuration: '1ms',
        animationIterationCount: '1',
      },
    },
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: colorTokens.slate900,
    fontSize: '3.95rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.84',
    marginBottom: '1rem',
    marginTop: 0,
    maxWidth: '7ch',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  titleAccent: style({
    color: colorTokens.info,
    display: 'block',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#7dd3fc',
      },
    },
  }),
};
