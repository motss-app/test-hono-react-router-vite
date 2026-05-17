import { type CompiledStyles, create, keyframes, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { data } from 'react-router';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconServer } from '../icons.ts';
import { HonoContext } from '../router-context.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/ssr.ts';

const SIMULATION_DELAY_MS = 5;
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

const s = create({
  ctaPrimary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#7dd3fc',
        default: colorTokens.infoHover,
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    alignItems: 'center',
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
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
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
    alignItems: 'center',
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
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
  dataLabel: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
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
      [themeConditions.dataThemeDark]: '#08101b',
      default: '#edf6ff',
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
      default: colorTokens.slate900,
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
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
      [themeConditions.dataThemeDark]: 'url("/assets/ssr-hero-dark.svg")',
      default: 'url("/assets/ssr-hero-light.svg")',
    },
    backgroundPosition: {
      '@media (min-width: 768px)': 'center center',
      default: '72% center',
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: {
      [themeConditions.dataThemeDark]: 1,
      default: 0.8,
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
  rowContent: {
    minWidth: 0,
  },
  rowNumber: {
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
  rowPanel: {
    alignItems: {
      '@media (min-width: 960px)': 'start',
      default: 'start',
    },
    display: 'grid',
    gap: '1rem 1rem',
    gridTemplateColumns: {
      '@media (min-width: 960px)': '5.5rem minmax(0, 18rem) minmax(0, 1fr)',
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
      default: colorTokens.slate200,
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

type SsrStyle = CompiledStyles;

type SsrStyles = {
  ctaPrimary: SsrStyle;
  ctaSecondary: SsrStyle;
  dataLabel: SsrStyle;
  dataList: SsrStyle;
  dataValue: SsrStyle;
  hero: SsrStyle;
  heroBody: SsrStyle;
  heroCopy: SsrStyle;
  heroInner: SsrStyle;
  heroLead: SsrStyle;
  heroMedia: SsrStyle;
  heroOverlay: SsrStyle;
  heroActions: SsrStyle;
  page: SsrStyle;
  rowBody: SsrStyle;
  rowContent: SsrStyle;
  rowNumber: SsrStyle;
  rowPanel: SsrStyle;
  rowRow: SsrStyle;
  rowTitle: SsrStyle;
  routesInner: SsrStyle;
  routesIntro: SsrStyle;
  routesList: SsrStyle;
  routesTitle: SsrStyle;
  title: SsrStyle;
  titleAccent: SsrStyle;
};

const styles = s as SsrStyles;

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/ssr-hero-dark.svg',
    '/assets/ssr-hero-light.svg',
  ]);

/** This loader makes this page SSR - it runs on EVERY request */
export async function loader({ context, request }: Route.LoaderArgs) {
  const startTime = performance.now();

  await new Promise(resolve => setTimeout(resolve, SIMULATION_DELAY_MS));

  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  const honoVars = context.get(HonoContext) as HonoEnv['Variables'] | undefined;
  const requestId = honoVars?.honoData?.meta?.requestId;

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  return data(
    {
      honoVars: honoVars?.honoData,
      message: 'This page is rendered on the server on EVERY request!',
      renderTime: duration,
      timestamp,
      userAgent,
    },
    {
      headers: {
        'X-Render-Time': duration,
        ...(requestId
          ? {
              'X-Request-Id': requestId,
            }
          : {}),
      },
    }
  );
}

export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const renderTime = loaderHeaders.get('X-Render-Time') ?? '-1';

  parentHeaders.set('Cache-Control', noStoreCacheControl);
  parentHeaders.append('Server-Timing', `ssr-loader;dur=${renderTime}`);

  const requestId = loaderHeaders.get('X-Request-Id');
  if (requestId) {
    parentHeaders.set('X-Request-Id', requestId);
  }

  return parentHeaders;
}

export default function SsrPage({ loaderData }: Route.ComponentProps): JSX.Element {
  const responseRows = [
    {
      label: 'Timestamp',
      value: loaderData.timestamp,
    },
    {
      label: 'Render time',
      value: `${loaderData.renderTime}ms`,
    },
    {
      label: 'User agent',
      value: loaderData.userAgent,
    },
    {
      label: 'Message',
      value: loaderData.message,
    },
  ] as const;

  const verificationRows = [
    {
      label: 'Refresh the route',
      value:
        'The timestamp changes on every request because the loader runs server-side each time.',
    },
    {
      label: 'Inspect response headers',
      value: 'Open the Network tab and check `Server-Timing` to verify the loader duration.',
    },
    {
      label: 'Compare rendering modes',
      value:
        'Unlike `/` or `/about`, this route is not SSG. Unlike CSR-only UI, its first HTML already contains the server response.',
    },
  ] as const;

  return (
    <main {...props(styles.page)}>
      <section {...props(styles.hero)}>
        <div
          aria-hidden="true"
          {...props(styles.heroMedia)}
        />
        <div
          aria-hidden="true"
          {...props(styles.heroOverlay)}
        />

        <div {...props(styles.heroInner)}>
          <div {...props(styles.heroCopy)}>
            <Text
              as="h1"
              {...props(styles.title)}
            >
              SSR
              <span {...props(styles.titleAccent)}>Live on request</span>
            </Text>

            <Text
              as="p"
              {...props(styles.heroLead)}
            >
              This route renders on the server for every visit.
            </Text>

            <p {...props(styles.heroBody)}>
              The loader runs on each request, forwards timing metadata, and can read Hono context
              before the page reaches the browser.
            </p>

            <div {...props(styles.heroActions)}>
              <Link
                to="/"
                {...props(styles.ctaSecondary)}
              >
                <IconArrowLeft {...props(iconStyles.base)} />
                <span>Back home</span>
              </Link>
              <Link
                to="/hono-rpc"
                {...props(styles.ctaPrimary)}
              >
                <IconServer {...props(iconStyles.base)} />
                <span>Compare with RPC</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div {...props(styles.routesInner)}>
          <Text
            as="h2"
            {...props(styles.routesTitle)}
          >
            The current response came from the server.
          </Text>

          <p {...props(styles.routesIntro)}>
            These values are generated during the request, then serialized into the rendered HTML
            and response headers.
          </p>

          <div {...props(styles.routesList)}>
            <div {...props(styles.rowRow)}>
              <div {...props(styles.rowPanel)}>
                <span {...props(styles.rowNumber)}>01</span>

                <div {...props(styles.rowContent)}>
                  <Text
                    as="h3"
                    {...props(styles.rowTitle)}
                  >
                    Live response
                  </Text>
                  <p {...props(styles.rowBody)}>
                    Request-specific data produced by the SSR loader before the page is delivered.
                  </p>
                </div>

                <dl {...props(styles.dataList)}>
                  {responseRows.map(row => (
                    <div key={row.label}>
                      <dt {...props(styles.dataLabel)}>{row.label}</dt>
                      <dd {...props(styles.dataValue)}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {loaderData.honoVars ? (
              <div {...props(styles.rowRow)}>
                <div {...props(styles.rowPanel)}>
                  <span {...props(styles.rowNumber)}>02</span>

                  <div {...props(styles.rowContent)}>
                    <Text
                      as="h3"
                      {...props(styles.rowTitle)}
                    >
                      Hono context
                    </Text>
                    <p {...props(styles.rowBody)}>
                      Data forwarded from the Hono request context into the React Router loader
                      through `RouterContextProvider`.
                    </p>
                  </div>

                  <dl {...props(styles.dataList)}>
                    <div>
                      <dt {...props(styles.dataLabel)}>Request URL</dt>
                      <dd {...props(styles.dataValue)}>{loaderData.honoVars.meta.requestUrl}</dd>
                    </div>
                    {loaderData.honoVars.meta.requestId ? (
                      <div>
                        <dt {...props(styles.dataLabel)}>Request ID</dt>
                        <dd {...props(styles.dataValue)}>{loaderData.honoVars.meta.requestId}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <div {...props(styles.routesInner)}>
          <Text
            as="h2"
            {...props(styles.routesTitle)}
          >
            How to verify the page is really SSR.
          </Text>

          <p {...props(styles.routesIntro)}>
            The route is meant to be inspected, not just viewed. These checks make the rendering
            mode obvious.
          </p>

          <div {...props(styles.routesList)}>
            <div {...props(styles.rowRow)}>
              <div {...props(styles.rowPanel)}>
                <span {...props(styles.rowNumber)}>03</span>

                <div {...props(styles.rowContent)}>
                  <Text
                    as="h3"
                    {...props(styles.rowTitle)}
                  >
                    Verification steps
                  </Text>
                  <p {...props(styles.rowBody)}>
                    Use the browser and network tooling to confirm the response is generated at
                    request time.
                  </p>
                </div>

                <dl {...props(styles.dataList)}>
                  {verificationRows.map(row => (
                    <div key={row.label}>
                      <dt {...props(styles.dataLabel)}>{row.label}</dt>
                      <dd {...props(styles.dataValue)}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
