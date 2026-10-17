import type { ApiAppType } from '@motss-app/bff';
import { flush, logger, metrics, startNewTrace, startSpan } from '@sentry/react-router/cloudflare';
import type { InferResponseType } from 'hono';
import { hc } from 'hono/client';
import posthog from 'posthog-js';
import { type JSX, type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import { Link } from '../components/Link.tsx';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import {
  PagePreferences,
  SiteBrand,
  SiteNavigation,
  SkipToContent,
} from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import {
  createRequestMetricAttributes,
  isDevelopmentSentryMode,
  sentryMetricNames,
} from '../monitoring/sentry.ts';
import * as m from '../paraglide/messages.js';
import { getRpcFetchTime } from '../utils/rpc-fetch-time.ts';
import type { Route } from './+types/hono-rpc.ts';
import { s } from './hono-rpc.css.ts';
import {
  IconChevronDown,
  IconCode,
  IconRotateRight,
  IconTriangleExclamation,
} from './hono-rpc.icons.ts';

type HelloResponse = InferResponseType<typeof client.rpc.hello.$get>;
type RpcResult = {
  response: HelloResponse;
  fetchTime: number | null;
};

const client = hc<ApiAppType>('/api');
const honoRpcHelloPath = '/api/rpc/hello';
const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_hono_rpc_title(),
    },
    {
      content: m.meta_hono_rpc_desc(),
      name: 'description',
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/hono-rpc-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

export function loader(): RpcResult {
  return {
    fetchTime: null,
    response: {
      message: 'Hello, World!',
      server: 'Hono RPC',
      timestamp: new Date().toISOString(),
    },
  };
}

async function fetchHelloResponse(): Promise<RpcResult> {
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

  const data = await response.json();
  return {
    fetchTime: getRpcFetchTime(response.headers, performance.now() - requestStartedAt),
    response: data,
  };
}

export async function clientLoader(): Promise<RpcResult> {
  return await fetchHelloResponse();
}

function HonoRpcView({
  fetchTime,
  isLoading,
  isReady,
  response,
  refresh,
}: {
  fetchTime: number | null;
  isLoading: boolean;
  isReady: boolean;
  response: HelloResponse;
  refresh: () => Promise<void>;
}): JSX.Element {
  const mainId = useId();
  const responseId = useId();
  const contractId = useId();
  const workflowId = useId();
  const responseRows = [
    {
      label: m.hono_rpc_label_server(),
      value: response.server,
    },
    {
      label: m.hono_rpc_label_timestamp(),
      value: <time dateTime={response.timestamp}>{response.timestamp}</time>,
      volatile: true,
    },
    {
      description: fetchTime === null ? m.ssr_fetch_time_not_measured() : undefined,
      label: m.ssr_label_fetch_time(),
      value: fetchTime === null ? '-' : `${fetchTime} ms`,
      volatile: fetchTime !== null,
    },
    {
      fullWidth: true,
      label: m.hono_rpc_label_message(),
      value: response.message,
    },
  ];
  const contractRows = [
    {
      label: m.hono_rpc_label_endpoint(),
      prefix: 'GET ',
      value: honoRpcHelloPath,
    },
    {
      label: m.hono_rpc_label_implementation(),
      value: m.hono_rpc_label_implementation_value(),
    },
    {
      label: m.hono_rpc_label_initial_source(),
      value: m.hono_rpc_label_initial_source_value(),
    },
    {
      label: m.hono_rpc_label_refresh_path(),
      value: m.hono_rpc_label_refresh_path_value(),
    },
  ];
  const workflowRows = [
    {
      label: m.hono_rpc_label_server_rendered(),
      value: m.hono_rpc_value_server_rendered(),
    },
    {
      label: m.hono_rpc_label_hydrated_data(),
      value: m.hono_rpc_value_hydrated_data(),
    },
    {
      label: m.hono_rpc_label_client_refresh(),
      value: m.hono_rpc_value_client_refresh(),
    },
    {
      label: m.hono_rpc_label_typed_boundary(),
      value: m.hono_rpc_value_typed_boundary(),
    },
  ];

  return (
    <RpcLayout mainId={mainId}>
      <header className={s.intro}>
        <h1 className={s.title}>{m.hono_rpc_title_accent()}</h1>
        <p className={s.lead}>{m.hono_rpc_hero_lead()}</p>
        <p className={s.body}>{m.hono_rpc_hero_body()}</p>
      </header>

      <section
        aria-labelledby={responseId}
        className={s.section}
      >
        <div className={s.responseHeading}>
          <h2
            className={s.sectionTitle}
            id={responseId}
          >
            {m.hono_rpc_row_1_title()}
          </h2>
          <span
            className={s.status}
            role="status"
          >
            <IconCode aria-hidden="true" />
            {isLoading ? m.hono_rpc_button_refreshing() : m.hono_rpc_response_ready()}
          </span>
        </div>
        <p className={s.body}>
          <InlineCodeText>{m.hono_rpc_row_1_body()}</InlineCodeText>
        </p>
        <div className={s.responsePanel}>
          <dl
            aria-busy={isLoading}
            className={s.responseData}
          >
            {responseRows.map(row => (
              <div
                className={`${s.dataRow} ${row.fullWidth ? s.fullWidth : ''}`}
                key={row.label}
              >
                <dt className={s.dataLabel}>{row.label}</dt>
                <dd className={s.dataValue}>
                  <pre className={s.codeBlock}>
                    <code
                      data-vrt-volatile={row.volatile ? '' : undefined}
                      title={row.description}
                    >
                      {row.value}
                    </code>
                  </pre>
                </dd>
              </div>
            ))}
          </dl>
          <div className={s.responseActions}>
            <button
              aria-disabled={isLoading || !isReady}
              className={s.actionButton}
              onClick={refresh}
              type="button"
            >
              <IconRotateRight
                aria-hidden="true"
                className={isLoading ? s.loadingIcon : undefined}
              />
              {m.hono_rpc_button_refresh()}
            </button>
          </div>
          <details className={s.jsonDisclosure}>
            <summary className={s.jsonSummary}>
              <IconCode aria-hidden="true" />
              {m.hono_rpc_view_json()}
              <IconChevronDown aria-hidden="true" />
            </summary>
            <pre className={s.codeBlock}>
              <code>{JSON.stringify(response, null, 2)}</code>
            </pre>
          </details>
        </div>
      </section>

      <section
        aria-labelledby={contractId}
        className={s.section}
      >
        <h2
          className={s.sectionTitle}
          id={contractId}
        >
          {m.hono_rpc_row_2_title()}
        </h2>
        <p className={s.body}>{m.hono_rpc_row_2_body()}</p>
        <dl className={s.contractData}>
          {contractRows.map(row => (
            <div
              className={s.dataRow}
              key={row.label}
            >
              <dt className={s.dataLabel}>{row.label}</dt>
              <dd className={s.dataValue}>
                <pre className={s.codeBlock}>
                  <code>
                    {row.prefix}
                    {row.value}
                  </code>
                </pre>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby={workflowId}
        className={s.section}
      >
        <h2
          className={s.sectionTitle}
          id={workflowId}
        >
          {m.hono_rpc_row_3_title()}
        </h2>
        <p className={s.body}>{m.hono_rpc_row_3_body()}</p>
        <ol className={s.steps}>
          {workflowRows.map(row => (
            <li
              className={s.step}
              key={row.label}
            >
              <h3 className={s.stepTitle}>{row.label}</h3>
              <p className={s.body}>
                <InlineCodeText>{row.value}</InlineCodeText>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </RpcLayout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  const mainId = useId();
  return (
    <RpcLayout mainId={mainId}>
      <section className={s.errorSection}>
        <h1 className={s.title}>{m.hono_rpc_error_heading()}</h1>
        <div
          className={s.errorBox}
          role="alert"
        >
          <IconTriangleExclamation aria-hidden="true" />
          <div>
            <p className={s.errorLabel}>{m.hono_rpc_error_title()}</p>
            <p className={s.body}>
              {error instanceof Error ? error.message : m.hono_rpc_error_unknown()}
            </p>
          </div>
        </div>
        <Link
          className={s.retryLink}
          reloadDocument
          to="/hono-rpc"
        >
          <IconRotateRight aria-hidden="true" />
          {m.hono_rpc_error_retry()}
        </Link>
      </section>
    </RpcLayout>
  );
}

export default function HonoRpcPage({ loaderData }: Route.ComponentProps): JSX.Element {
  const [result, setResult] = useState(loaderData);
  const [refreshError, setRefreshError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    setResult(loaderData);
    setIsReady(true);
  }, [
    loaderData,
  ]);

  const refresh = useCallback(async () => {
    if (pending.current || !isReady) return;
    pending.current = true;
    setIsLoading(true);
    setRefreshError(null);
    posthog.capture('rpc_refresh_data');

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
      setResult(nextResponse);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error : new Error('Failed to refresh the Hono RPC response.')
      );
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }, [
    isReady,
  ]);

  if (refreshError) throw refreshError;

  return (
    <HonoRpcView
      fetchTime={result.fetchTime}
      isLoading={isLoading}
      isReady={isReady}
      refresh={refresh}
      response={result.response}
    />
  );
}

function InlineCodeText({ children }: { children: string }): JSX.Element {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of children.matchAll(/`([^`]+)`/g)) {
    parts.push(children.slice(cursor, match.index));
    parts.push(
      <code
        className={s.inlineCode}
        key={match.index}
      >
        {match[1]}
      </code>
    );
    cursor = match.index + match[0].length;
  }
  parts.push(children.slice(cursor));
  return <>{parts}</>;
}

function RpcLayout({ children, mainId }: { children: ReactNode; mainId: string }): JSX.Element {
  return (
    <div className={`${s.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/hono-rpc" />
      </aside>
      <div className={s.workspace}>
        <RpcHeader />
        <main
          className={s.page}
          id={mainId}
          tabIndex={-1}
        >
          <div
            aria-hidden="true"
            className={s.artwork}
          />
          <div className={s.content}>{children}</div>
        </main>
        <RpcFooter />
      </div>
    </div>
  );
}

function RpcFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function RpcHeader() {
  return (
    <header className={chrome.header}>
      <div className={chrome.mobileBrand}>
        <SiteBrand />
      </div>
      <div className={chrome.breadcrumbSlot}>
        <Breadcrumbs
          items={[
            {
              label: m.holy_grail_nav_home(),
              to: '/',
            },
            {
              label: m.route_hono_rpc_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/hono-rpc" />
    </header>
  );
}
