import { create, keyframes, props } from '@stylexjs/stylex';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/Text.tsx';
import { IconArrowLeft, IconCircleInfo, IconHome, IconTriangleExclamation } from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import { errorScenarios } from '../utils/error-scenarios.ts';
import type { Route } from './+types/errors.ts';

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

function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Error Handling Demo',
    },
    {
      content:
        'Explore thrown response errors and runtime failures in the React Router + Hono demo.',
      name: 'description',
    },
  ];
}

const s = create({
  ctaPrimary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#fde68a',
        default: '#d97706',
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#fcd34d',
      default: '#f59e0b',
    },
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  ctaSecondary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(148, 163, 184, 0.12)',
        default: 'rgba(255, 255, 255, 0.72)',
      },
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#fed7aa',
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
      default: 'rgba(255, 255, 255, 0.82)',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(120, 53, 15, 0.12)',
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
    gap: '0.5rem',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
  hero: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#140d07',
      default: '#fff7ed',
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
      default: '#7c2d12',
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
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
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#9a3412',
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
      [themeConditions.dataThemeDark]: 'url("/assets/errors-hero-dark.svg")',
      default: 'url("/assets/errors-hero-light.svg")',
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
  heroOverlay: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(20, 13, 7, 0.94) 0%, rgba(20, 13, 7, 0.74) 28%, rgba(20, 13, 7, 0.28) 56%, rgba(20, 13, 7, 0.1) 100%), linear-gradient(180deg, rgba(20, 13, 7, 0.16) 0%, rgba(20, 13, 7, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(255, 250, 245, 0.995) 0%, rgba(255, 247, 237, 0.95) 28%, rgba(255, 238, 221, 0.8) 48%, rgba(255, 237, 213, 0.48) 68%, rgba(255, 247, 237, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 237, 213, 0.1) 100%)',
    },
    inset: 0,
    position: 'absolute',
    zIndex: 1,
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
      default: '#7c2d12',
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '37rem',
  },
  routesList: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#fdba74',
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
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
  rowDetail: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
  },
  rowDetailText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
  },
  rowLink: {
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    textDecoration: 'none',
    width: 'fit-content',
  },
  rowLinkCritical: {
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#dc2626',
    },
  },
  rowLinkRuntime: {
    color: {
      [themeConditions.dataThemeDark]: '#67e8f9',
      default: '#0891b2',
    },
  },
  rowLinkWarning: {
    color: {
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#d97706',
    },
  },
  rowPanel: {
    alignItems: 'start',
    display: 'grid',
    gap: '1rem 1rem',
    gridTemplateColumns: {
      '@media (min-width: 960px)': '6rem minmax(0, 19rem) minmax(0, 1fr)',
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
      default: '#fed7aa',
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
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
  sectionSpacer: {
    marginTop: '3.5rem',
  },
  statusLabel: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: '#9a3412',
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
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
      '@media (min-width: 768px)': '6.2rem',
      default: '3.8rem',
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
      [themeConditions.dataThemeDark]: '#fde68a',
      default: '#d97706',
    },
    display: 'block',
  },
});

function getToneStyles(tone: 'critical' | 'runtime' | 'warning') {
  switch (tone) {
    case 'critical':
      return {
        code: s.rowCodeCritical,
        link: s.rowLinkCritical,
      };
    case 'runtime':
      return {
        code: s.rowCodeRuntime,
        link: s.rowLinkRuntime,
      };
    default:
      return {
        code: s.rowCodeWarning,
        link: s.rowLinkWarning,
      };
  }
}

export default function ErrorsDemo(): JSX.Element {
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
            <p {...props(s.statusLabel)}>Error handling</p>

            <Text
              as="h1"
              {...props(s.title)}
            >
              Error routes
              <span {...props(s.titleAccent)}>Responses and runtime failures</span>
            </Text>

            <Text
              as="p"
              {...props(s.heroLead)}
            >
              A static index for the failure paths the app can intentionally trigger.
            </Text>

            <p {...props(s.heroBody)}>
              Use this page to jump into thrown response errors, runtime exceptions, and the route
              boundaries that present them. The hub itself is prerendered; each case underneath is a
              live server-rendered incident surface.
            </p>

            <div {...props(s.heroActions)}>
              <Link
                to="/errors/404"
                {...props(s.ctaPrimary)}
              >
                <IconTriangleExclamation {...props(iconStyles.base)} />
                <span>Trigger a 404</span>
              </Link>

              <Link
                to="/"
                {...props(s.ctaSecondary)}
              >
                <IconHome {...props(iconStyles.base)} />
                <span>Back home</span>
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
            Choose a failure path.
          </Text>

          <p {...props(s.routesIntro)}>
            Every route below demonstrates a different way the app can fail and how the route-level
            boundary reshapes that failure into something inspectable.
          </p>

          <div {...props(s.routesList)}>
            {errorScenarios.map(scenario => {
              const toneStyles = getToneStyles(scenario.tone);

              return (
                <div
                  key={scenario.code}
                  {...props(s.rowRow)}
                >
                  <div {...props(s.rowPanel)}>
                    <span {...props(s.rowCode, toneStyles.code)}>
                      {scenario.code === 'runtime' ? 'ERR' : scenario.code}
                    </span>

                    <div {...props(s.rowContent)}>
                      <Text
                        as="h3"
                        {...props(s.rowTitle)}
                      >
                        {scenario.label}
                      </Text>
                      <p {...props(s.rowBody)}>{scenario.summary}</p>
                    </div>

                    <div {...props(s.rowDetail)}>
                      <p {...props(s.rowDetailText)}>{scenario.detail}</p>
                      <Link
                        to={`/errors/${scenario.code}`}
                        {...props(s.rowLink, toneStyles.link)}
                      >
                        <span>Open case</span>
                        <IconArrowLeft
                          style={{
                            transform: 'rotate(180deg)',
                          }}
                          {...props(iconStyles.base)}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div {...props(s.sectionSpacer)}>
            <Text
              as="h2"
              {...props(s.routesTitle)}
            >
              What to notice.
            </Text>

            <p {...props(s.routesIntro)}>
              The interesting split is between the static entry page, the dynamic route loader, and
              the boundary that formats both response errors and thrown exceptions.
            </p>

            <div {...props(s.routesList)}>
              <div {...props(s.rowRow)}>
                <div {...props(s.rowPanel)}>
                  <span {...props(s.rowCode, s.rowCodeWarning)}>01</span>

                  <div {...props(s.rowContent)}>
                    <Text
                      as="h3"
                      {...props(s.rowTitle)}
                    >
                      Static hub
                    </Text>
                    <p {...props(s.rowBody)}>
                      <code>/errors</code> is safe to prerender because it never throws.
                    </p>
                  </div>

                  <div {...props(s.rowDetail)}>
                    <p {...props(s.rowDetailText)}>
                      It works as a navigational map into the error cases rather than an error
                      screen itself.
                    </p>
                  </div>
                </div>
              </div>

              <div {...props(s.rowRow)}>
                <div {...props(s.rowPanel)}>
                  <span {...props(s.rowCode, s.rowCodeCritical)}>02</span>

                  <div {...props(s.rowContent)}>
                    <Text
                      as="h3"
                      {...props(s.rowTitle)}
                    >
                      Dynamic incident routes
                    </Text>
                    <p {...props(s.rowBody)}>
                      <code>/errors/:code</code> throws from the loader to simulate real failures.
                    </p>
                  </div>

                  <div {...props(s.rowDetail)}>
                    <p {...props(s.rowDetailText)}>
                      That makes the page useful for seeing how SSR, status codes, and response
                      headers behave when a route does not resolve normally.
                    </p>
                  </div>
                </div>
              </div>

              <div {...props(s.rowRow)}>
                <div {...props(s.rowPanel)}>
                  <span {...props(s.rowCode, s.rowCodeRuntime)}>03</span>

                  <div {...props(s.rowContent)}>
                    <Text
                      as="h3"
                      {...props(s.rowTitle)}
                    >
                      Boundary formatting
                    </Text>
                    <p {...props(s.rowBody)}>
                      The route boundary catches the failure and turns it into the final visual
                      surface.
                    </p>
                  </div>

                  <div {...props(s.rowDetail)}>
                    <p {...props(s.rowDetailText)}>
                      That means the page you see for <code>404</code>, <code>500</code>, or{' '}
                      <code>runtime</code> is intentionally designed by the route, not by a browser
                      fallback.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p {...props(s.routesIntro, s.sectionSpacer)}>
              <IconCircleInfo {...props(iconStyles.base)} /> Start with <code>/errors/404</code> or{' '}
              <code>/errors/runtime</code> to compare a thrown response with a thrown JavaScript
              error.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export { meta };
