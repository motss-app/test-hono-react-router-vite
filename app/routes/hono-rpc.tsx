import { flush, logger, metrics, startSpan } from '@sentry/react-router';
import { create, keyframes, props } from '@stylexjs/stylex';
import type { InferResponseType } from 'hono';
import { hc } from 'hono/client';
import {
  type ComponentProps,
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import type { ApiAppType } from '../apis/mod.ts';
import { Link } from '../components/Link.tsx';
import { Skeleton } from '../components/skeleton.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft } from '../icons.ts';
import {
  createRequestMetricAttributes,
  isDevelopmentSentryMode,
  sentryMetricNames,
} from '../monitoring/sentry.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/hono-rpc.ts';

type HelloResponse = InferResponseType<typeof client.rpc.hello.$get>;

const client = hc<ApiAppType>('/api');
const honoRpcHelloPath = '/api/rpc/hello';
const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);

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
      title: 'Hono RPC Demo',
    },
    {
      content: 'Typed Hono RPC demo with client refresh',
      name: 'description',
    },
  ];
}

export function loader(): HelloResponse {
  return {
    message: 'Hello, World!',
    server: 'Hono RPC',
    timestamp: new Date().toISOString(),
  };
}

async function fetchHelloResponse(): Promise<HelloResponse> {
  const requestStartedAt = performance.now();
  let response: Awaited<ReturnType<typeof client.rpc.hello.$get>>;

  try {
    response = await client.rpc.hello.$get();
  } catch (error) {
    const duration = performance.now() - requestStartedAt;
    const metricAttributes = createRequestMetricAttributes({
      method: 'GET',
      pathname: honoRpcHelloPath,
      runtime: 'browser',
    });

    logger.error('Unhandled browser RPC request error', {
      method: 'GET',
      pathname: honoRpcHelloPath,
    });
    metrics.count(sentryMetricNames.browserRequestError, 1, {
      attributes: metricAttributes,
    });
    metrics.distribution(sentryMetricNames.browserRequestDuration, duration, {
      attributes: metricAttributes,
      unit: 'millisecond',
    });

    if (isDevSentryMode) {
      flush(2000);
    }

    throw error;
  }

  const duration = performance.now() - requestStartedAt;
  const metricAttributes = createRequestMetricAttributes({
    method: 'GET',
    pathname: honoRpcHelloPath,
    runtime: 'browser',
    statusCode: response.status,
  });

  metrics.count(sentryMetricNames.browserRequestCount, 1, {
    attributes: metricAttributes,
  });
  metrics.distribution(sentryMetricNames.browserRequestDuration, duration, {
    attributes: metricAttributes,
    unit: 'millisecond',
  });

  if (!response.ok) {
    logger.error('Browser RPC request failed', {
      durationMs: Math.round(duration),
      method: 'GET',
      pathname: honoRpcHelloPath,
      statusCode: response.status,
    });
    metrics.count(sentryMetricNames.browserRequestError, 1, {
      attributes: metricAttributes,
    });

    if (isDevSentryMode) {
      flush(2000);
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  logger.info('Handled browser RPC request', {
    durationMs: Math.round(duration),
    method: 'GET',
    pathname: honoRpcHelloPath,
    statusCode: response.status,
  });

  if (isDevSentryMode) {
    flush(2000);
  }

  return await response.json();
}

export async function clientLoader(): Promise<HelloResponse> {
  return await fetchHelloResponse();
}

const s = create({
  actionButton: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#7dd3fc',
        default: colorTokens.infoHover,
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#bae6fd',
      default: colorTokens.info,
    },
    border: 'none',
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
    cursor: 'pointer',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    padding: '0.92rem 1.45rem',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    width: '100%',
  },
  actionButtonLoading: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate500,
      default: colorTokens.slate400,
    },
    color: colorTokens.slate100,
    cursor: 'not-allowed',
  },
  actionShell: {
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
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
    gap: '0.5rem',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  },
  dataLabel: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
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
  errorBox: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#7f1d1d',
      default: '#fef2f2',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.error,
      default: '#ef4444',
    },
    borderRadius: '1rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#b91c1c',
    },
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
    padding: '1rem',
  },
  errorPage: {
    minWidth: 0,
    padding: '2rem',
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
      [themeConditions.dataThemeDark]: 'url("/assets/hono-rpc-hero-dark.svg")',
      default: 'url("/assets/hono-rpc-hero-light.svg")',
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
  skeletonAction: {
    borderRadius: '9999px',
    height: '3rem',
    width: '100%',
  },
  skeletonMessage: {
    width: '10ch',
  },
  skeletonServer: {
    width: '12ch',
  },
  skeletonTimestamp: {
    width: '24ch',
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

interface RpcResponseRowProps {
  className?: ComponentProps<typeof Skeleton>['className'];
  isLoading: boolean;
  label: string;
  style?: ComponentProps<typeof Skeleton>['style'];
  value: string;
}

function RpcResponseRow({
  className,
  isLoading,
  label,
  style,
  value,
}: RpcResponseRowProps): JSX.Element {
  return (
    <div>
      <dt {...props(s.dataLabel)}>{label}</dt>
      <dd {...props(s.dataValue)}>
        <Skeleton
          className={className}
          isLoading={isLoading}
          style={style}
        >
          {value}
        </Skeleton>
      </dd>
    </div>
  );
}

interface HonoRpcViewProps {
  action: ReactNode;
  isLoading: boolean;
  response: HelloResponse;
}

function HonoRpcView({ action, isLoading, response }: HonoRpcViewProps): JSX.Element {
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
              Hono RPC
              <span {...props(s.titleAccent)}>Typed on both sides</span>
            </Text>

            <Text
              as="p"
              {...props(s.heroLead)}
            >
              A typed request surface that refreshes without leaving the route.
            </Text>

            <p {...props(s.heroBody)}>
              The initial response comes through the route loader, then the same endpoint can be
              revalidated on the client through the Hono RPC client.
            </p>

            <div {...props(s.heroActions)}>
              <Link
                to="/"
                {...props(s.ctaSecondary)}
              >
                <IconArrowLeft {...props(iconStyles.base)} />
                <span>Back home</span>
              </Link>

              <div {...props(s.actionShell)}>{action}</div>
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
            The response is live and re-fetchable.
          </Text>

          <p {...props(s.routesIntro)}>
            The same typed endpoint powers the initial route load and the in-page refresh action.
          </p>

          <div {...props(s.routesList)}>
            <div {...props(s.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowNumber)}>01</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    RPC response
                  </Text>
                  <p {...props(s.rowBody)}>
                    Values returned from `GET /api/rpc/hello`, rendered first by the loader and then
                    refreshed on demand.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <RpcResponseRow
                    isLoading={isLoading}
                    label="Message"
                    {...props(s.skeletonMessage)}
                    value={response.message}
                  />
                  <RpcResponseRow
                    isLoading={isLoading}
                    label="Server"
                    {...props(s.skeletonServer)}
                    value={response.server}
                  />
                  <RpcResponseRow
                    isLoading={isLoading}
                    label="Timestamp"
                    {...props(s.skeletonTimestamp)}
                    value={response.timestamp}
                  />
                </dl>
              </div>
            </div>

            <div {...props(s.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowNumber)}>02</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    Endpoint contract
                  </Text>
                  <p {...props(s.rowBody)}>
                    The route and API stay connected through the generated Hono client instead of
                    manual fetch strings.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <div>
                    <dt {...props(s.dataLabel)}>Endpoint</dt>
                    <dd {...props(s.dataValue)}>GET /api/rpc/hello</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Implementation</dt>
                    <dd {...props(s.dataValue)}>app/apis/mod.ts</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Initial source</dt>
                    <dd {...props(s.dataValue)}>Route loader / shared API response factory</dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Refresh path</dt>
                    <dd {...props(s.dataValue)}>Action button → Hono RPC client</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div {...props(s.rowRow)}>
              <div {...props(s.rowPanel)}>
                <span {...props(s.rowNumber)}>03</span>

                <div {...props(s.rowContent)}>
                  <Text
                    as="h3"
                    {...props(s.rowTitle)}
                  >
                    What this demonstrates
                  </Text>
                  <p {...props(s.rowBody)}>
                    The page is built to show where SSG, hydration, revalidation, and typed API
                    calls intersect.
                  </p>
                </div>

                <dl {...props(s.dataList)}>
                  <div>
                    <dt {...props(s.dataLabel)}>Prerendered shell</dt>
                    <dd {...props(s.dataValue)}>
                      The route can ship static structure at build time.
                    </dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Hydrated data</dt>
                    <dd {...props(s.dataValue)}>
                      The initial server-rendered response stays visible while the client can fetch
                      fresh data on demand.
                    </dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Client refresh</dt>
                    <dd {...props(s.dataValue)}>
                      The button fetches fresh RPC data without reloading the page.
                    </dd>
                  </div>
                  <div>
                    <dt {...props(s.dataLabel)}>Typed boundary</dt>
                    <dd {...props(s.dataValue)}>
                      The `hc()` client keeps route code aligned with the API contract.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  return (
    <div {...props(s.errorPage)}>
      <div {...props(s.errorBox)}>
        <strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
      </div>
      <Text {...props(s.routesIntro)}>
        <a href="/hono-rpc">Try reloading the Hono RPC page</a>
      </Text>
    </div>
  );
}

export default function HonoRpcDemo({ loaderData }: Route.ComponentProps): JSX.Element {
  const [response, setResponse] = useState(loaderData);
  const [refreshError, setRefreshError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonText = isLoading ? 'Refreshing…' : 'Refresh RPC data';

  useEffect(() => {
    setResponse(loaderData);
  }, [
    loaderData,
  ]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setRefreshError(null);

    try {
      const nextResponse = await startSpan(
        {
          attributes: {
            'http.request.method': 'GET',
            'http.route': honoRpcHelloPath,
            'ui.action.target': 'refresh-rpc-data',
            'url.path': honoRpcHelloPath,
          },
          forceTransaction: true,
          name: 'Refresh Hono RPC data',
          op: 'ui.action.click',
        },
        fetchHelloResponse
      );

      setResponse(nextResponse);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error : new Error('Failed to refresh the Hono RPC response.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (refreshError) {
    throw refreshError;
  }

  return (
    <HonoRpcView
      action={
        <button
          disabled={isLoading}
          onClick={refresh}
          type="button"
          {...props(s.actionButton, isLoading && s.actionButtonLoading)}
        >
          {buttonText}
        </button>
      }
      isLoading={isLoading}
      response={response}
    />
  );
}
