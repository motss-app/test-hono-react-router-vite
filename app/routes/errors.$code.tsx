import { create, keyframes, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { isRouteErrorResponse } from 'react-router';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconCircleInfo, IconHome } from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import {
  type ErrorScenario,
  getErrorScenario,
  getErrorScenarioByStatus,
} from '../utils/error-scenarios.ts';
import type { Route } from './+types/errors.$code.ts';

const serverErrorStatusCode = 500;
const unknownErrorStatusCode = 404;
const unknownErrorStatusText = 'Unknown Error Code';
const noStoreCacheControl = 'no-store';

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

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Error Case Demo',
    },
    {
      content: 'Dynamic error route demonstrating thrown responses and runtime failures.',
      name: 'description',
    },
  ];
}

function throwRouteResponse(
  start: number,
  status: number,
  statusText: string,
  message = statusText
): never {
  throw new Response(message, {
    headers: {
      'X-Route-Timing': (performance.now() - start).toFixed(2),
    },
    status,
    statusText,
  });
}

export function loader({ params }: Route.LoaderArgs) {
  const start = performance.now();
  const scenario = getErrorScenario(params.code);

  if (scenario?.kind === 'response' && scenario.status && scenario.statusText) {
    return throwRouteResponse(start, scenario.status, scenario.statusText);
  }

  if (params.code === 'runtime') {
    throw new Error(`Runtime error for code: ${params.code}`);
  }

  return throwRouteResponse(
    start,
    unknownErrorStatusCode,
    unknownErrorStatusText,
    `Unknown error code: ${params.code}`
  );
}

export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const timing = loaderHeaders.get('X-Route-Timing') || '0';
  const newTiming = `error-code-loader;dur=${timing};desc="Error Code Route Loader"`;

  parentHeaders.set('Cache-Control', noStoreCacheControl);
  parentHeaders.append('Server-Timing', newTiming);

  return parentHeaders;
}

const s = create({
  ctaPrimary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#fca5a5',
        default: '#dc2626',
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#ef4444',
      default: '#b91c1c',
    },
    borderRadius: '9999px',
    color: colorTokens.white,
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  ctaPrimaryCritical: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#fca5a5',
        default: '#dc2626',
      },
    },
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#ef4444',
      default: '#b91c1c',
    },
    color: colorTokens.white,
  },
  ctaPrimaryRuntime: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#a5f3fc',
        default: '#0284c7',
      },
    },
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#67e8f9',
      default: '#0891b2',
    },
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
  },
  ctaPrimaryWarning: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#fde68a',
        default: '#d97706',
      },
    },
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#fcd34d',
      default: '#f59e0b',
    },
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
  },
  ctaSecondary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(148, 163, 184, 0.12)',
        default: 'rgba(255, 255, 255, 0.72)',
      },
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#fecaca',
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    alignItems: 'center',
    animationDelay: '320ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.28)',
      default: 'rgba(255, 255, 255, 0.84)',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(127, 29, 29, 0.12)',
    },
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
  ctaSecondaryCritical: {
    ':hover': {
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#fecaca',
      },
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(127, 29, 29, 0.12)',
    },
  },
  ctaSecondaryRuntime: {
    ':hover': {
      borderColor: {
        [themeConditions.dataThemeDark]: '#67e8f9',
        default: '#7dd3fc',
      },
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(103, 232, 249, 0.28)',
      default: 'rgba(8, 145, 178, 0.14)',
    },
  },
  ctaSecondaryWarning: {
    ':hover': {
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#fed7aa',
      },
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(120, 53, 15, 0.12)',
    },
  },
  dataLabel: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#991b1b',
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
  },
  dataList: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: {
      '@media (min-width: 768px)': '1fr 1fr',
      default: '1fr',
    },
    minWidth: 0,
  },
  dataValue: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    fontSize: '1.1rem',
    lineHeight: '1.55',
    margin: 0,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  hero: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#12090c',
      default: '#fff5f5',
    },
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  heroActions: {
    display: 'inline-grid',
    gap: '0.75rem',
    gridAutoFlow: 'column',
    justifyContent: 'start',
  },
  heroBody: {
    animationDelay: '160ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7f1d1d',
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
  },
  heroBodyCritical: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7f1d1d',
    },
  },
  heroBodyRuntime: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#155e75',
    },
  },
  heroBodyWarning: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7c2d12',
    },
  },
  heroCopy: {
    maxWidth: '40rem',
    minWidth: 0,
    paddingBottom: {
      '@media (min-width: 768px)': '4rem',
      default: '2.5rem',
    },
    position: 'relative',
    zIndex: 2,
  },
  heroCritical: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#12090c',
      default: '#fff5f5',
    },
  },
  heroInner: {
    alignItems: 'flex-end',
    display: 'grid',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minHeight: '100svh',
    minWidth: 0,
    paddingBottom: {
      '@media (min-width: 768px)': '0',
      default: '2rem',
    },
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '4rem',
    position: 'relative',
  },
  heroLead: {
    animationDelay: '110ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#991b1b',
    },
    fontSize: {
      '@media (min-width: 768px)': '1.95rem',
      default: '1.28rem',
    },
    fontWeight: fontWeightTokens.fontWeightMedium,
    letterSpacing: '-0.025em',
    lineHeight: '1.12',
    marginBottom: '0.85rem',
    marginTop: 0,
    maxWidth: '17ch',
  },
  heroLeadCritical: {
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#991b1b',
    },
  },
  heroLeadRuntime: {
    color: {
      [themeConditions.dataThemeDark]: '#67e8f9',
      default: '#0f766e',
    },
  },
  heroLeadWarning: {
    color: {
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#9a3412',
    },
  },
  heroMedia: {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: '1',
    },
    animationDirection: 'alternate',
    animationDuration: '18s',
    animationIterationCount: 'infinite',
    animationName: artworkDrift,
    animationTimingFunction: 'ease-in-out',
    backgroundImage: {
      [themeConditions.dataThemeDark]: 'url("/assets/error-code-hero-dark.svg")',
      default: 'url("/assets/error-code-hero-light.svg")',
    },
    backgroundPosition: {
      '@media (min-width: 768px)': 'center center',
      default: '74% center',
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: {
      [themeConditions.dataThemeDark]: 1,
      default: 0.82,
    },
    position: 'absolute',
    transformOrigin: 'center',
  },
  heroMediaCritical: {
    backgroundImage: {
      [themeConditions.dataThemeDark]: 'url("/assets/error-code-hero-dark.svg")',
      default: 'url("/assets/error-code-hero-light.svg")',
    },
  },
  heroMediaRuntime: {
    backgroundImage: {
      [themeConditions.dataThemeDark]: 'url("/assets/runtime-error-hero-dark.svg")',
      default: 'url("/assets/runtime-error-hero-light.svg")',
    },
  },
  heroMediaWarning: {
    backgroundImage: {
      [themeConditions.dataThemeDark]: 'url("/assets/error-code-hero-dark.svg")',
      default: 'url("/assets/error-code-hero-light.svg")',
    },
  },
  heroOverlay: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
    },
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  },
  heroOverlayCritical: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(18, 9, 12, 0.95) 0%, rgba(18, 9, 12, 0.74) 28%, rgba(18, 9, 12, 0.28) 56%, rgba(18, 9, 12, 0.1) 100%), linear-gradient(180deg, rgba(18, 9, 12, 0.16) 0%, rgba(18, 9, 12, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(255, 250, 250, 0.995) 0%, rgba(255, 245, 245, 0.95) 28%, rgba(254, 226, 226, 0.82) 48%, rgba(254, 226, 226, 0.48) 68%, rgba(255, 245, 245, 0.2) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(254, 226, 226, 0.12) 100%)',
    },
  },
  heroOverlayRuntime: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(7, 22, 27, 0.94) 0%, rgba(7, 22, 27, 0.72) 28%, rgba(7, 22, 27, 0.28) 56%, rgba(7, 22, 27, 0.1) 100%), linear-gradient(180deg, rgba(7, 22, 27, 0.16) 0%, rgba(7, 22, 27, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(245, 252, 255, 0.995) 0%, rgba(236, 254, 255, 0.95) 28%, rgba(207, 250, 254, 0.8) 48%, rgba(186, 230, 253, 0.46) 68%, rgba(245, 252, 255, 0.18) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(186, 230, 253, 0.12) 100%)',
    },
  },
  heroOverlayWarning: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
    },
  },
  heroRuntime: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#07161b',
      default: '#ecfeff',
    },
  },
  heroWarning: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#140d07',
      default: '#fff7ed',
    },
  },
  page: {
    minWidth: 0,
    paddingBottom: '4rem',
  },
  routesInner: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '3.5rem',
  },
  routesIntro: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7f1d1d',
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '36rem',
  },
  routesIntroCritical: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7f1d1d',
    },
  },
  routesIntroRuntime: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#155e75',
    },
  },
  routesIntroWarning: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: '#7c2d12',
    },
  },
  routesList: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fecaca',
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  },
  routesListCritical: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fecaca',
    },
  },
  routesListRuntime: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#bae6fd',
    },
  },
  routesListWarning: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fdba74',
    },
  },
  routesTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '2.6rem',
      default: '2rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '0.98',
    marginBottom: '0.75rem',
    marginTop: 0,
    maxWidth: '13ch',
  },
  rowBody: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
  },
  rowCode: {
    fontSize: {
      '@media (min-width: 768px)': '2rem',
      default: '1.45rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  },
  rowCodeCritical: {
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#dc2626',
    },
  },
  rowCodeRuntime: {
    color: {
      [themeConditions.dataThemeDark]: '#67e8f9',
      default: '#0891b2',
    },
  },
  rowCodeWarning: {
    color: {
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#d97706',
    },
  },
  rowContent: {
    minWidth: 0,
  },
  rowPanel: {
    alignItems: 'start',
    display: 'grid',
    gap: '1rem 1rem',
    gridTemplateColumns: {
      '@media (min-width: 960px)': '6rem minmax(0, 18rem) minmax(0, 1fr)',
      default: '1fr',
    },
    minWidth: 0,
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
  },
  rowRow: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fecaca',
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  },
  rowRowCritical: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fecaca',
    },
  },
  rowRowRuntime: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#bae6fd',
    },
  },
  rowRowWarning: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fdba74',
    },
  },
  rowTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
  },
  statusLabel: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#991b1b',
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  statusLabelCritical: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#991b1b',
    },
  },
  statusLabelRuntime: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#155e75',
    },
  },
  statusLabelWarning: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#9a3412',
    },
  },
  title: {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: '1',
    },
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '7rem',
      default: '4.2rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.84',
    marginBottom: '1rem',
    marginTop: 0,
    maxWidth: '8ch',
  },
  titleAccent: {
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#b91c1c',
    },
    display: 'block',
  },
  titleAccentCritical: {
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#b91c1c',
    },
  },
  titleAccentRuntime: {
    color: {
      [themeConditions.dataThemeDark]: '#67e8f9',
      default: '#0e7490',
    },
  },
  titleAccentWarning: {
    color: {
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#d97706',
    },
  },
});

function getTone(
  errorType: string,
  scenario: ErrorScenario | undefined,
  statusCode: number
): 'critical' | 'runtime' | 'warning' {
  if (scenario) {
    return scenario.tone;
  }

  if (errorType === 'Runtime Error') {
    return 'runtime';
  }

  return statusCode >= serverErrorStatusCode ? 'critical' : 'warning';
}

function getToneStyles(tone: 'critical' | 'runtime' | 'warning') {
  function style(styleName: string) {
    return s[styleName as keyof typeof s];
  }

  switch (tone) {
    case 'critical':
      return {
        ctaPrimary: style('ctaPrimaryCritical'),
        ctaSecondary: style('ctaSecondaryCritical'),
        hero: style('heroCritical'),
        heroBody: style('heroBodyCritical'),
        heroLead: style('heroLeadCritical'),
        heroMedia: style('heroMediaCritical'),
        heroOverlay: style('heroOverlayCritical'),
        routesIntro: style('routesIntroCritical'),
        routesList: style('routesListCritical'),
        rowCode: style('rowCodeCritical'),
        rowRow: style('rowRowCritical'),
        statusLabel: style('statusLabelCritical'),
        titleAccent: style('titleAccentCritical'),
      };
    case 'runtime':
      return {
        ctaPrimary: style('ctaPrimaryRuntime'),
        ctaSecondary: style('ctaSecondaryRuntime'),
        hero: style('heroRuntime'),
        heroBody: style('heroBodyRuntime'),
        heroLead: style('heroLeadRuntime'),
        heroMedia: style('heroMediaRuntime'),
        heroOverlay: style('heroOverlayRuntime'),
        routesIntro: style('routesIntroRuntime'),
        routesList: style('routesListRuntime'),
        rowCode: style('rowCodeRuntime'),
        rowRow: style('rowRowRuntime'),
        statusLabel: style('statusLabelRuntime'),
        titleAccent: style('titleAccentRuntime'),
      };
    default:
      return {
        ctaPrimary: style('ctaPrimaryWarning'),
        ctaSecondary: style('ctaSecondaryWarning'),
        hero: style('heroWarning'),
        heroBody: style('heroBodyWarning'),
        heroLead: style('heroLeadWarning'),
        heroMedia: style('heroMediaWarning'),
        heroOverlay: style('heroOverlayWarning'),
        routesIntro: style('routesIntroWarning'),
        routesList: style('routesListWarning'),
        rowCode: style('rowCodeWarning'),
        rowRow: style('rowRowWarning'),
        statusLabel: style('statusLabelWarning'),
        titleAccent: style('titleAccentWarning'),
      };
  }
}

function ErrorIncidentView({
  errorType,
  message,
  routeCode,
  scenario,
  statusCode,
  statusText,
}: {
  errorType: string;
  message: string;
  routeCode: string | undefined;
  scenario: ErrorScenario | undefined;
  statusCode: number;
  statusText: string;
}): JSX.Element {
  const tone = getTone(errorType, scenario, statusCode);
  const toneStyles = getToneStyles(tone);

  return (
    <main {...props(s.page)}>
      <section {...props(s.hero, toneStyles.hero)}>
        <div
          aria-hidden="true"
          {...props(s.heroMedia, toneStyles.heroMedia)}
        />
        <div
          aria-hidden="true"
          {...props(s.heroOverlay, toneStyles.heroOverlay)}
        />

        <div {...props(s.heroInner)}>
          <div {...props(s.heroCopy)}>
            <p {...props(s.statusLabel, toneStyles.statusLabel)}>Incident surface</p>

            <Text
              as="h1"
              {...props(s.title)}
            >
              Error {statusCode}
              <span {...props(s.titleAccent, toneStyles.titleAccent)}>{statusText}</span>
            </Text>

            <Text
              as="p"
              {...props(s.heroLead, toneStyles.heroLead)}
            >
              {scenario?.summary ??
                'The loader intentionally failed so the route boundary could take over.'}
            </Text>

            <p {...props(s.heroBody, toneStyles.heroBody)}>
              {message}.{' '}
              {scenario?.detail ??
                'This route formats both thrown responses and runtime exceptions into a consistent SSR error view.'}
            </p>

            <div {...props(s.heroActions)}>
              <Link
                to="/errors"
                {...props(s.ctaPrimary, toneStyles.ctaPrimary)}
              >
                <IconArrowLeft {...props(iconStyles.base)} />
                <span>Back to error index</span>
              </Link>

              <Link
                to="/"
                {...props(s.ctaSecondary, toneStyles.ctaSecondary)}
              >
                <IconHome {...props(iconStyles.base)} />
                <span>Go home</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div {...props(s.routesInner)}>
          <Text
            as="h2"
            {...props(s.routesTitle)}
          >
            Incident details.
          </Text>

          <p {...props(s.routesIntro, toneStyles.routesIntro)}>
            This route throws in the loader, then the route-level boundary renders the final page
            you are seeing now.
          </p>

          <div {...props(s.routesList, toneStyles.routesList)}>
            <div {...props(s.rowRow, toneStyles.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowCode, toneStyles.rowCode)}>01</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    Failure signal
                  </Text>
                  <p {...props(s.rowBody)}>
                    The boundary normalized the thrown value into a readable status surface.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <div>
                    <dt {...props(s.dataLabel)}>Status</dt>
                    <dd {...props(s.dataValue)}>{statusCode}</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Status text</dt>
                    <dd {...props(s.dataValue)}>{statusText}</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Error type</dt>
                    <dd {...props(s.dataValue)}>{errorType}</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Route param</dt>
                    <dd {...props(s.dataValue)}>{routeCode ?? scenario?.code ?? '<missing>'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div {...props(s.rowRow, toneStyles.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowCode, toneStyles.rowCode)}>02</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    Capture path
                  </Text>
                  <p {...props(s.rowBody)}>
                    The error starts in the route loader and finishes in the route boundary.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <div>
                    <dt {...props(s.dataLabel)}>Thrown from</dt>
                    <dd {...props(s.dataValue)}>loader() in `errors.$code.tsx`</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Rendered by</dt>
                    <dd {...props(s.dataValue)}>ErrorBoundary in the same route file</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Delivery</dt>
                    <dd {...props(s.dataValue)}>Server-rendered error response</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Server timing</dt>
                    <dd {...props(s.dataValue)}>Appended through `headers()` after the throw</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div {...props(s.rowRow, toneStyles.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowCode, toneStyles.rowCode)}>03</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    Guidance
                  </Text>
                  <p {...props(s.rowBody)}>
                    Compare different routes to see how the boundary behaves across status families.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <div>
                    <dt {...props(s.dataLabel)}>Try next</dt>
                    <dd {...props(s.dataValue)}>
                      {(routeCode ?? scenario?.code) === 'runtime'
                        ? '/errors/404'
                        : '/errors/runtime'}
                    </dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Reference route</dt>
                    <dd {...props(s.dataValue)}>/errors</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Scenario note</dt>
                    <dd {...props(s.dataValue)}>
                      {scenario?.summary ?? 'This code path is not part of the curated examples.'}
                    </dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Message</dt>
                    <dd {...props(s.dataValue)}>{message}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <p {...props(s.routesIntro, toneStyles.routesIntro)}>
            <IconCircleInfo {...props(iconStyles.base)} /> Thrown responses preserve their HTTP
            semantics; thrown runtime errors are still caught here, but the boundary presents them
            as an application failure.
          </p>
        </div>
      </section>
    </main>
  );
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps): JSX.Element {
  const routeCode = params.code;
  let statusCode = serverErrorStatusCode;
  let statusText = 'Internal Server Error';
  let message = 'An unexpected error occurred';
  let errorType = 'Runtime Error';
  let scenario = getErrorScenario(routeCode);

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText;
    errorType = 'HTTP Response Error';
    scenario ??= getErrorScenarioByStatus(error.status);

    if (typeof error.data === 'string' && error.data.length > 0) {
      message = error.data;
    } else {
      message = statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
    statusText = 'Runtime Error';
  }

  return (
    <ErrorIncidentView
      errorType={errorType}
      message={message}
      routeCode={routeCode}
      scenario={scenario}
      statusCode={statusCode}
      statusText={statusText}
    />
  );
}

export default function ErrorCode({ params }: Route.ComponentProps): JSX.Element {
  const routeCode = params.code;
  const scenario = getErrorScenario(routeCode);

  return (
    <ErrorIncidentView
      errorType="Pending Error"
      message="This route is designed to throw before the normal component renders"
      routeCode={routeCode}
      scenario={scenario}
      statusCode={500}
      statusText="Intentional Error Route"
    />
  );
}
