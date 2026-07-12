import type { ApiAppType } from '@motss-app/bff';
import { flush, logger, metrics, startNewTrace, startSpan } from '@sentry/react-router/cloudflare';
import type { InferResponseType } from 'hono';
import { hc } from 'hono/client';
import { Fragment, type JSX, type ReactNode, useCallback, useEffect, useState } from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Skeleton } from '../components/skeleton.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft } from '../icons.ts';
import {
  createRequestMetricAttributes,
  isDevelopmentSentryMode,
  sentryMetricNames,
} from '../monitoring/sentry.ts';
import { iconStyles } from '../styles/icon.css.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/hono-rpc.ts';
import {
  actionButton,
  actionButtonLoading,
  actionShell,
  ctaSecondary,
  dataLabel,
  dataList,
  dataValue,
  errorBox,
  errorPage,
  hero,
  heroActions,
  heroBody,
  heroCopy,
  heroInner,
  heroLead,
  heroMedia,
  heroOverlay,
  page,
  routesInner,
  routesIntro,
  routesList,
  routesTitle,
  rowBody,
  rowContent,
  rowNumber,
  rowPanel,
  rowRow,
  rowTitle,
  skeletonMessage,
  skeletonServer,
  skeletonTimestamp,
  title,
  titleAccent,
} from './hono-rpc.css.ts';

type HelloResponse = InferResponseType<typeof client.rpc.hello.$get>;

const client = hc<ApiAppType>('/api');
const honoRpcHelloPath = '/api/rpc/hello';
const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Hono RPC Demo · React Router + Hono Demo',
    },
    {
      content: 'Typed Hono RPC demo with client refresh',
      name: 'description',
    },
  ];
}

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/hono-rpc-hero-dark.svg',
    '/assets/hono-rpc-hero-light.svg',
  ]);

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
    response = await client.rpc.hello.$get(undefined, {
      headers: {
        'cache-control': 'no-cache',
      },
    });
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

interface HonoRpcViewProps {
  action: ReactNode;
  isLoading: boolean;
  response: HelloResponse;
}

function HonoRpcView({ action, isLoading, response }: HonoRpcViewProps): JSX.Element {
  return (
    <main className={page}>
      <section className={hero}>
        <div
          aria-hidden="true"
          className={heroMedia}
        />
        <div
          aria-hidden="true"
          className={heroOverlay}
        />

        <div className={heroInner}>
          <div className={heroCopy}>
            <Text
              as="h1"
              className={title}
            >
              Hono RPC
              <span className={titleAccent}>Typed on both sides</span>
            </Text>

            <Text
              as="p"
              className={heroLead}
            >
              A typed request surface that refreshes without leaving the route.
            </Text>

            <p className={heroBody}>
              The initial response comes through the route loader, then the same endpoint can be
              revalidated on the client through the Hono RPC client.
            </p>

            <div className={heroActions}>
              <Link
                className={ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>Back home</span>
              </Link>

              <div className={actionShell}>{action}</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={routesInner}>
          <Text
            as="h2"
            className={routesTitle}
          >
            The response is live and re-fetchable.
          </Text>

          <p className={routesIntro}>
            The same typed endpoint powers the initial route load and the in-page refresh action.
          </p>

          <div className={routesList}>
            <div className={rowRow}>
              <div className={rowPanel}>
                <span className={rowNumber}>01</span>

                <div className={rowContent}>
                  <Text
                    as="h3"
                    className={rowTitle}
                  >
                    RPC response
                  </Text>
                  <p className={rowBody}>
                    Values returned from `GET /api/rpc/hello`, rendered first by the loader and then
                    refreshed on demand.
                  </p>
                </div>

                <dl className={dataList}>
                  <Fragment key="message">
                    <dt className={dataLabel}>Message</dt>
                    <dd className={dataValue}>
                      <Skeleton
                        className={skeletonMessage}
                        isLoading={isLoading}
                      >
                        {response.message}
                      </Skeleton>
                    </dd>
                  </Fragment>

                  <Fragment key="server">
                    <dt className={dataLabel}>Server</dt>
                    <dd className={dataValue}>
                      <Skeleton
                        className={skeletonServer}
                        isLoading={isLoading}
                      >
                        {response.server}
                      </Skeleton>
                    </dd>
                  </Fragment>

                  <Fragment key="timestamp">
                    <dt className={dataLabel}>Timestamp</dt>
                    <dd className={dataValue}>
                      <Skeleton
                        className={skeletonTimestamp}
                        isLoading={isLoading}
                      >
                        {response.timestamp}
                      </Skeleton>
                    </dd>
                  </Fragment>
                </dl>
              </div>
            </div>

            <div className={rowRow}>
              <div className={rowPanel}>
                <span className={rowNumber}>02</span>

                <div className={rowContent}>
                  <Text
                    as="h3"
                    className={rowTitle}
                  >
                    Endpoint contract
                  </Text>
                  <p className={rowBody}>
                    The route and API stay connected through the generated Hono client instead of
                    manual fetch strings.
                  </p>
                </div>

                <dl className={dataList}>
                  <div>
                    <dt className={dataLabel}>Endpoint</dt>
                    <dd className={dataValue}>GET /api/rpc/hello</dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Implementation</dt>
                    <dd className={dataValue}>packages/bff/src/api.ts</dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Initial source</dt>
                    <dd className={dataValue}>Route loader / shared API response factory</dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Refresh path</dt>
                    <dd className={dataValue}>Action button → Hono RPC client</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={rowRow}>
              <div className={rowPanel}>
                <span className={rowNumber}>03</span>

                <div className={rowContent}>
                  <Text
                    as="h3"
                    className={rowTitle}
                  >
                    What this demonstrates
                  </Text>
                  <p className={rowBody}>
                    The page is built to show where SSG, hydration, revalidation, and typed API
                    calls intersect.
                  </p>
                </div>

                <dl className={dataList}>
                  <div>
                    <dt className={dataLabel}>Prerendered shell</dt>
                    <dd className={dataValue}>
                      The route can ship static structure at build time.
                    </dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Hydrated data</dt>
                    <dd className={dataValue}>
                      The initial server-rendered response stays visible while the client can fetch
                      fresh data on demand.
                    </dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Client refresh</dt>
                    <dd className={dataValue}>
                      The button fetches fresh RPC data without reloading the page.
                    </dd>
                  </div>
                  <div>
                    <dt className={dataLabel}>Typed boundary</dt>
                    <dd className={dataValue}>
                      The `hc()` client keeps route code aligned with the API contract.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  return (
    <div className={errorPage}>
      <div className={errorBox}>
        <strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
      </div>
      <Text className={routesIntro}>
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
      const nextResponse = await startNewTrace(() =>
        startSpan(
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
        )
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
          className={isLoading ? actionButtonLoading : actionButton}
          disabled={isLoading}
          onClick={refresh}
          type="button"
        >
          {buttonText}
        </button>
      }
      isLoading={isLoading}
      response={response}
    />
  );
}
