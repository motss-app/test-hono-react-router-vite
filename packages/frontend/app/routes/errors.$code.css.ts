import { keyframes, style } from '@vanilla-extract/css';

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

export const s = {
  ctaPrimary: style({
    alignItems: 'center',
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    borderRadius: '9999px',
    color: colorTokens.white,
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  }),
  ctaPrimaryCritical: style({
    backgroundColor: '#b91c1c',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#ef4444',
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: '#fca5a5',
      },
      '&:hover': {
        backgroundColor: '#dc2626',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  ctaPrimaryRuntime: style({
    backgroundColor: '#0891b2',
    color: colorTokens.white,
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#67e8f9',
        color: colorTokens.slate900,
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: '#a5f3fc',
      },
      '&:hover': {
        backgroundColor: '#0284c7',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  ctaPrimaryWarning: style({
    backgroundColor: '#f59e0b',
    color: colorTokens.slate900,
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#fcd34d',
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: '#fde68a',
      },
      '&:hover': {
        backgroundColor: '#d97706',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  ctaSecondary: style({
    alignItems: 'center',
    animationDelay: '320ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: colorTokens.slate900,
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  }),
  ctaSecondaryCritical: style({
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(127, 29, 29, 0.12)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        borderColor: 'rgba(226, 232, 240, 0.26)',
        color: colorTokens.slate100,
      },
      ':root[data-theme="dark"] &:hover': {
        borderColor: colorTokens.slate400,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderColor: '#fecaca',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  ctaSecondaryRuntime: style({
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(8, 145, 178, 0.14)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        borderColor: 'rgba(103, 232, 249, 0.28)',
        color: colorTokens.slate100,
      },
      ':root[data-theme="dark"] &:hover': {
        borderColor: '#67e8f9',
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderColor: '#7dd3fc',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  ctaSecondaryWarning: style({
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(120, 53, 15, 0.12)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        borderColor: 'rgba(226, 232, 240, 0.26)',
        color: colorTokens.slate100,
      },
      ':root[data-theme="dark"] &:hover': {
        borderColor: colorTokens.slate400,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderColor: '#fed7aa',
        transform: 'translate3d(0, -0.125rem, 0)',
      },
    },
  }),
  dataLabel: style({
    color: '#991b1b',
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    marginBottom: '0.3rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate400,
      },
    },
    textTransform: 'uppercase',
  }),
  dataList: style({
    '@media': {
      '(min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    display: 'grid',
    gap: '1rem',
    minWidth: 0,
  }),
  dataValue: style({
    color: colorTokens.slate900,
    fontSize: '1.1rem',
    lineHeight: '1.55',
    margin: 0,
    minWidth: 0,
    overflowWrap: 'anywhere',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate100,
      },
    },
  }),
  hero: style({
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  }),
  heroActions: style({
    display: 'inline-grid',
    gap: '0.75rem',
    gridAutoFlow: 'column',
    justifyContent: 'start',
  }),
  heroBody: style({
    animationDelay: '160ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: '#7f1d1d',
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
  }),
  heroBodyCritical: style({
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  heroBodyRuntime: style({
    color: '#155e75',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  heroBodyWarning: style({
    color: '#7c2d12',
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
    maxWidth: '40rem',
    minWidth: 0,
    paddingBottom: '2.5rem',
    position: 'relative',
    zIndex: 2,
  }),
  heroCritical: style({
    backgroundColor: '#fff5f5',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#12090c',
      },
    },
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
    color: '#991b1b',
    fontSize: '1.28rem',
    fontWeight: fontWeightTokens.fontWeightMedium,
    letterSpacing: '-0.025em',
    lineHeight: '1.12',
    marginBottom: '0.85rem',
    marginTop: 0,
    maxWidth: '17ch',
  }),
  heroLeadCritical: style({
    color: '#991b1b',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fca5a5',
      },
    },
  }),
  heroLeadRuntime: style({
    color: '#0f766e',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#67e8f9',
      },
    },
  }),
  heroLeadWarning: style({
    color: '#9a3412',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fde68a',
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
    backgroundPosition: '74% center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: 0.82,
    position: 'absolute',
    selectors: {
      ':root[data-theme="dark"] &': {
        opacity: 1,
      },
    },
    transformOrigin: 'center',
  }),
  heroMediaCritical: style({
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
      },
    },
  }),
  heroMediaRuntime: style({
    backgroundImage: 'url("/assets/runtime-error-hero-light.svg")',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage: 'url("/assets/runtime-error-hero-dark.svg")',
      },
    },
  }),
  heroMediaWarning: style({
    backgroundImage: 'url("/assets/error-code-hero-light.svg")',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage: 'url("/assets/error-code-hero-dark.svg")',
      },
    },
  }),
  heroOverlay: style({
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  }),
  heroOverlayCritical: style({
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage:
          'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
      },
    },
  }),
  heroOverlayRuntime: style({
    backgroundImage:
      'linear-gradient(90deg, rgba(245, 252, 255, 0.995) 0%, rgba(236, 254, 255, 0.95) 28%, rgba(207, 250, 254, 0.8) 48%, rgba(186, 230, 253, 0.46) 68%, rgba(245, 252, 255, 0.18) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(186, 230, 253, 0.12) 100%)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage:
          'linear-gradient(90deg, rgba(7, 22, 27, 0.94) 0%, rgba(7, 22, 27, 0.72) 28%, rgba(7, 22, 27, 0.28) 56%, rgba(7, 22, 27, 0.1) 100%), linear-gradient(180deg, rgba(7, 22, 27, 0.16) 0%, rgba(7, 22, 27, 0.18) 100%)',
      },
    },
  }),
  heroOverlayWarning: style({
    backgroundImage:
      'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundImage:
          'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
      },
    },
  }),
  heroRuntime: style({
    backgroundColor: '#ecfeff',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#07161b',
      },
    },
  }),
  heroWarning: style({
    backgroundColor: '#fff7ed',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: '#140d07',
      },
    },
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
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '36rem',
  }),
  routesIntroCritical: style({
    color: '#7f1d1d',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  routesIntroRuntime: style({
    color: '#155e75',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  routesIntroWarning: style({
    color: '#7c2d12',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate300,
      },
    },
  }),
  routesList: style({
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  }),
  routesListCritical: style({
    borderTopColor: '#fecaca',
    selectors: {
      ':root[data-theme="dark"] &': {
        borderTopColor: colorTokens.slate800,
      },
    },
  }),
  routesListRuntime: style({
    borderTopColor: '#bae6fd',
    selectors: {
      ':root[data-theme="dark"] &': {
        borderTopColor: colorTokens.slate800,
      },
    },
  }),
  routesListWarning: style({
    borderTopColor: '#fdba74',
    selectors: {
      ':root[data-theme="dark"] &': {
        borderTopColor: colorTokens.slate800,
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
    maxWidth: '13ch',
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
  rowCode: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '2rem',
      },
    },
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  }),
  rowCodeCritical: style({
    color: '#dc2626',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fca5a5',
      },
    },
  }),
  rowCodeRuntime: style({
    color: '#0891b2',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#67e8f9',
      },
    },
  }),
  rowCodeWarning: style({
    color: '#d97706',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fde68a',
      },
    },
  }),
  rowContent: style({
    minWidth: 0,
  }),
  rowPanel: style({
    '@media': {
      '(min-width: 960px)': {
        gridTemplateColumns: '6rem minmax(0, 18rem) minmax(0, 1fr)',
      },
    },
    alignItems: 'start',
    display: 'grid',
    gap: '1rem 1rem',
    gridTemplateColumns: '1fr',
    minWidth: 0,
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
  }),
  rowRow: style({
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  }),
  rowRowCritical: style({
    borderBottomColor: '#fecaca',
    selectors: {
      ':root[data-theme="dark"] &': {
        borderBottomColor: colorTokens.slate800,
      },
    },
  }),
  rowRowRuntime: style({
    borderBottomColor: '#bae6fd',
    selectors: {
      ':root[data-theme="dark"] &': {
        borderBottomColor: colorTokens.slate800,
      },
    },
  }),
  rowRowWarning: style({
    borderBottomColor: '#fdba74',
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
  statusLabel: style({
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  }),
  statusLabelCritical: style({
    color: '#991b1b',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate400,
      },
    },
  }),
  statusLabelRuntime: style({
    color: '#155e75',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate400,
      },
    },
  }),
  statusLabelWarning: style({
    color: '#9a3412',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.slate400,
      },
    },
  }),
  title: style({
    '@media': {
      '(min-width: 768px)': {
        fontSize: '7rem',
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
    fontSize: '4.2rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.84',
    marginBottom: '1rem',
    marginTop: 0,
    maxWidth: '8ch',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: colorTokens.white,
      },
    },
  }),
  titleAccent: style({
    display: 'block',
  }),
  titleAccentCritical: style({
    color: '#b91c1c',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fca5a5',
      },
    },
  }),
  titleAccentRuntime: style({
    color: '#0e7490',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#67e8f9',
      },
    },
  }),
  titleAccentWarning: style({
    color: '#d97706',
    selectors: {
      ':root[data-theme="dark"] &': {
        color: '#fde68a',
      },
    },
  }),
};

export const toneStyles = {
  critical: {
    ctaPrimary: s.ctaPrimaryCritical,
    ctaSecondary: s.ctaSecondaryCritical,
    hero: s.heroCritical,
    heroBody: s.heroBodyCritical,
    heroLead: s.heroLeadCritical,
    heroMedia: s.heroMediaCritical,
    heroOverlay: s.heroOverlayCritical,
    routesIntro: s.routesIntroCritical,
    routesList: s.routesListCritical,
    rowCode: s.rowCodeCritical,
    rowRow: s.rowRowCritical,
    statusLabel: s.statusLabelCritical,
    titleAccent: s.titleAccentCritical,
  },
  runtime: {
    ctaPrimary: s.ctaPrimaryRuntime,
    ctaSecondary: s.ctaSecondaryRuntime,
    hero: s.heroRuntime,
    heroBody: s.heroBodyRuntime,
    heroLead: s.heroLeadRuntime,
    heroMedia: s.heroMediaRuntime,
    heroOverlay: s.heroOverlayRuntime,
    routesIntro: s.routesIntroRuntime,
    routesList: s.routesListRuntime,
    rowCode: s.rowCodeRuntime,
    rowRow: s.rowRowRuntime,
    statusLabel: s.statusLabelRuntime,
    titleAccent: s.titleAccentRuntime,
  },
  warning: {
    ctaPrimary: s.ctaPrimaryWarning,
    ctaSecondary: s.ctaSecondaryWarning,
    hero: s.heroWarning,
    heroBody: s.heroBodyWarning,
    heroLead: s.heroLeadWarning,
    heroMedia: s.heroMediaWarning,
    heroOverlay: s.heroOverlayWarning,
    routesIntro: s.routesIntroWarning,
    routesList: s.routesListWarning,
    rowCode: s.rowCodeWarning,
    rowRow: s.rowRowWarning,
    statusLabel: s.statusLabelWarning,
    titleAccent: s.titleAccentWarning,
  },
};
