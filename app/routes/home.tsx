import { create, keyframes, props } from '@stylexjs/stylex';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/home.ts';

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

const s = create({
  ctaPrimary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#7dd3fc',
        default: colorTokens.infoHover,
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#bae6fd',
      default: colorTokens.info,
    },
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  ctaSecondary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(148, 163, 184, 0.12)',
        default: 'rgba(255, 255, 255, 0.7)',
      },
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#bfdbfe',
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    animationDelay: '320ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.28)',
      default: 'rgba(255, 255, 255, 0.78)',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(15, 23, 42, 0.12)',
    },
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
  hero: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#08101b',
      default: '#edf6ff',
    },
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  heroActions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  heroBody: {
    animationDelay: '160ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate800,
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '28rem',
  },
  heroCopy: {
    maxWidth: '38rem',
    minWidth: 0,
    paddingBottom: {
      '@media (min-width: 768px)': '4rem',
      default: '2.5rem',
    },
    position: 'relative',
    zIndex: 2,
  },
  heroInner: {
    alignItems: 'flex-end',
    display: 'flex',
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
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
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
    maxWidth: '15ch',
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
      [themeConditions.dataThemeDark]: 'url("/assets/home-hero-dark.svg")',
      default: 'url("/assets/home-hero-light.svg")',
    },
    backgroundPosition: {
      '@media (min-width: 768px)': 'center center',
      default: '70% center',
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: {
      [themeConditions.dataThemeDark]: 1,
      default: 0.76,
    },
    position: 'absolute',
    transformOrigin: 'center',
  },
  heroOverlay: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
    },
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  },
  page: {
    minWidth: 0,
    paddingBottom: '4rem',
  },
  routeAction: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate600,
    },
    fontSize: '0.95rem',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },
  routeDescription: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
  },
  routeLink: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.22)',
        default: 'rgba(248, 250, 252, 0.9)',
      },
      transform: 'translate3d(0.35rem, 0, 0)',
    },
    alignItems: {
      '@media (min-width: 960px)': 'center',
      default: 'start',
    },
    borderRadius: '1rem',
    display: 'grid',
    gap: '0.95rem 1rem',
    gridTemplateColumns: {
      '@media (min-width: 960px)': '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
      default: '1fr',
    },
    minWidth: 0,
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  routeNumber: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontSize: {
      '@media (min-width: 768px)': '2rem',
      default: '1.45rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  },
  routePath: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  routeRow: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
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
      default: colorTokens.slate700,
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '34rem',
  },
  routesList: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  },
  routesSection: {
    minWidth: 0,
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
    maxWidth: '12ch',
  },
  routeTitle: {
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
  routeTitleBlock: {
    minWidth: 0,
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
      '@media (min-width: 768px)': '6.4rem',
      default: '3.95rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.84',
    marginBottom: '1rem',
    marginTop: 0,
    maxWidth: '7ch',
  },
  titleAccent: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    display: 'block',
  },
});

const routes = [
  {
    description: 'Project overview, stack notes, and the migration decisions behind the app.',
    number: '01',
    path: '/about',
    title: 'About',
    to: '/about',
  },
  {
    description: 'Request-time rendering with timing data and server-owned state on the page.',
    number: '02',
    path: '/ssr',
    title: 'SSR Page',
    to: '/ssr',
  },
  {
    description: 'Typed client and server calls flowing through Hono without extra ceremony.',
    number: '03',
    path: '/hono-rpc',
    title: 'Hono RPC Demo',
    to: '/hono-rpc',
  },
  {
    description:
      'Error routes and boundary behavior for failure states, status codes, and recovery.',
    number: '04',
    path: '/errors',
    title: 'Error Handling Demo',
    to: '/errors',
  },
  {
    description:
      'A Turnstile-protected submission flow with server-side validation and CSP-safe loading.',
    number: '05',
    path: '/turnstile',
    title: 'Turnstile Protection',
    to: '/turnstile',
  },
] as const;

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: 'React Router + Hono Demo',
    },
    {
      content: 'A full-stack React Router and Hono demo for SSR, RPC, and error handling.',
      name: 'description',
    },
  ];
}

export default function Home(): JSX.Element {
  return (
    <main {...props(s.page)}>
      <section {...props(s.hero)}>
        <div
          aria-hidden="true"
          {...props(s.heroMedia)}
        />
        <div
          aria-hidden="true"
          {...props(s.heroOverlay)}
        />

        <div {...props(s.heroInner)}>
          <div {...props(s.heroCopy)}>
            <Text
              as="h1"
              {...props(s.title)}
            >
              React Router
              <span {...props(s.titleAccent)}>&amp; Hono</span>
            </Text>

            <Text
              as="p"
              {...props(s.heroLead)}
            >
              Render, route, and recover with a compact full-stack demo.
            </Text>

            <p {...props(s.heroBody)}>
              Four routes keep SSR, RPC, boundaries, and architecture legible without turning the
              homepage into a dashboard.
            </p>

            <div {...props(s.heroActions)}>
              <Link
                to="/about"
                {...props(s.ctaPrimary)}
              >
                Read the overview
              </Link>
              <Link
                to="/hono-rpc"
                {...props(s.ctaSecondary)}
              >
                Open the RPC flow
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section {...props(s.routesSection)}>
        <div {...props(s.routesInner)}>
          <Text
            as="h2"
            {...props(s.routesTitle)}
          >
            Start with one route. The rest stays in view.
          </Text>

          <p {...props(s.routesIntro)}>
            Each entry isolates one concern so you can inspect the stack in pieces instead of
            decoding everything at once.
          </p>

          <div {...props(s.routesList)}>
            {routes.map(route => (
              <div
                key={route.to}
                {...props(s.routeRow)}
              >
                <Link
                  to={route.to}
                  {...props(s.routeLink)}
                >
                  <span {...props(s.routeNumber)}>{route.number}</span>

                  <div {...props(s.routeTitleBlock)}>
                    <Text
                      as="h3"
                      {...props(s.routeTitle)}
                    >
                      {route.title}
                    </Text>
                    <span {...props(s.routePath)}>{route.path}</span>
                  </div>

                  <p {...props(s.routeDescription)}>{route.description}</p>

                  <span {...props(s.routeAction)}>Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
