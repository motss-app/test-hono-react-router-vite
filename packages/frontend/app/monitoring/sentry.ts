import type { CloudflareOptions } from '@sentry/cloudflare';

const sentryGatewayDevTunnelUrl = 'http://127.0.0.1:8787/api/tunnel';
const tracesSampleRate = 1.0;
const profileSessionSampleRate = 1.0;
const replaysSessionSampleRate = 0.1;
const replaysOnErrorSampleRate = 1.0;
// Browser tracing should follow same-origin relative URLs, any localhost/127.0.0.1 dev origin
// regardless of port, and deployed motss.fyi hosts. That covers the current local multi-worker
// topology as well as the public domains used outside local development.
const localhostTracePropagationTarget = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/;
const motssFyiTracePropagationTarget = /^https?:\/\/(?:[a-z0-9-]+\.)*motss\.fyi(?:\/|$)/i;
// The gateway forwards local envelopes to `/api/tunnel`; if we keep transactions for that route,
// the app starts tracing the act of reporting traces, which quickly becomes recursive noise.
const sentryIgnoredDevTunnelTransactions = [
  /^POST \/api\/tunnel$/,
  /^GET \/.*\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|png|svg|ts|tsx|txt|webp|woff2?)(?:\?.*)?$/i,
  /^GET \/(?:@fs|@id|__manifest|node_modules\/|virtual:|~virtual:)/,
];
// `ignoreTransactions` works on the transaction name, but React Router's request handler can emit
// generic catch-all names such as `GET /*` before the concrete request path is reflected in the
// transaction name. We therefore also inspect the request URL in `beforeSendTransaction` so noisy
// Vite asset/module requests are dropped even when the transaction name is generic.
const sentryIgnoredDevTransactionPaths = [
  /^\/.*\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|png|svg|ts|tsx|txt|webp|woff2?)(?:\?.*)?$/i,
  /^\/(?:@fs|@id|__manifest|node_modules\/|virtual:|~virtual:)/,
];

type RuntimeMode = 'canary' | 'development' | 'production' | string;

type SentryMetricAttributes = Record<string, boolean | number | string>;

interface RequestMetricAttributesOptions {
  method: string;
  pathname: string;
  runtime: 'browser' | 'cloudflare' | 'deno';
  statusCode?: number;
}

type SentryTransactionEvent = Parameters<
  NonNullable<CloudflareOptions['beforeSendTransaction']>
>[0];

export function getSentryEnvironment(mode: RuntimeMode): string {
  return mode === 'canary' || mode === 'production' ? mode : 'development';
}

export function isDevelopmentSentryMode(mode: RuntimeMode): boolean {
  return mode === 'development';
}

function getSentryDist(mode: RuntimeMode): string | undefined {
  return mode === 'canary' || mode === 'production' ? mode : undefined;
}

function getRequiredRuntimeRelease(mode: RuntimeMode, release?: string): string | undefined {
  if (isDevelopmentSentryMode(mode)) {
    return;
  }

  if (release) {
    return release;
  }

  throw new Error(`SENTRY_RELEASE must be defined for ${mode} mode.`);
}

function getDsnOrigin(dsn?: string): string | undefined {
  if (!dsn) {
    return;
  }

  try {
    return new URL(dsn).origin;
  } catch {
    return;
  }
}

export function getSentryConnectSrc(dsn?: string): string[] {
  const sentryOrigin = getDsnOrigin(dsn);

  return sentryOrigin
    ? [
        sentryOrigin,
      ]
    : [];
}

/**
 * Normalize request URLs into pathnames so transaction shaping can work with both absolute URLs
 * (for example Worker/runtime request objects) and same-origin relative browser URLs.
 */
function getRequestPathname(url?: string): string | undefined {
  if (!url) {
    return;
  }

  if (url.startsWith('/')) {
    return url.split('?')[0];
  }

  try {
    return new URL(url).pathname;
  } catch {
    return;
  }
}

function isIgnoredDevTransactionPath(pathname: string): boolean {
  return sentryIgnoredDevTransactionPaths.some(pattern => pattern.test(pathname));
}

/**
 * React Router's request handler can emit a generic `METHOD /*` transaction name for catch-all
 * handlers even when the underlying request was something concrete like `/hono-rpc`.
 *
 * For document/API requests we want to keep, rename that catch-all transaction to the actual
 * request pathname so Spotlight shows a meaningful top-level route instead of `GET /*`.
 */
function normalizeTransactionName(event: SentryTransactionEvent): SentryTransactionEvent {
  const requestMethod = event.request?.method;
  const requestPathname = getRequestPathname(event.request?.url);

  if (!requestMethod) {
    return event;
  }

  if (!requestPathname) {
    return event;
  }

  if (event.transaction !== `${requestMethod} /*`) {
    return event;
  }

  return {
    ...event,
    transaction: `${requestMethod} ${requestPathname}`,
  };
}

/**
 * Local development uses a Vite + gateway + frontend-worker topology that can generate a huge
 * amount of asset/module traffic. We intentionally shape those transactions before send so:
 *
 * 1. noisy Vite asset/module requests are dropped as standalone top-level transactions, and
 * 2. legitimate catch-all document/API requests are renamed from `METHOD /*` to the real path.
 *
 * That keeps Spotlight focused on the page/API traces we actually care about and avoids confusing
 * orphan `GET /*` traces whose parents were filtered out earlier in the pipeline.
 */
function createBeforeSendTransaction(mode: RuntimeMode) {
  return function beforeSendTransaction(event: SentryTransactionEvent) {
    const requestPathname = getRequestPathname(event.request?.url);

    if (
      isDevelopmentSentryMode(mode) &&
      requestPathname &&
      isIgnoredDevTransactionPath(requestPathname)
    ) {
      // Returning `null` drops the transaction entirely, so this stays development-only on purpose.
      // The ignored path patterns are tuned for Vite/local-worker noise (`/@fs`, `node_modules`,
      // source maps, CSS, etc.). In production/canary those broad patterns could hide legitimate
      // observability data, so outside local development we prefer to keep the transaction and only
      // normalize generic catch-all names like `GET /*`.
      return null;
    }

    return normalizeTransactionName(event);
  };
}

function createBaseOptions(mode: RuntimeMode, dsn?: string) {
  return {
    ...(dsn
      ? {
          dsn,
        }
      : {}),
    beforeSendTransaction: createBeforeSendTransaction(mode),
    debug: isDevelopmentSentryMode(mode),
    dist: getSentryDist(mode),
    enableLogs: true,
    environment: getSentryEnvironment(mode),
    sendDefaultPii: true,
    tracesSampleRate,
  };
}

export function createBrowserSentryOptions(mode: RuntimeMode, dsn?: string, release?: string) {
  const runtimeRelease = getRequiredRuntimeRelease(mode, release);

  return {
    ...createBaseOptions(mode, dsn),
    ...(runtimeRelease
      ? {
          release: runtimeRelease,
        }
      : {}),
    enableRpcTracePropagation: true,
    profileLifecycle: 'trace' as const,
    profileSessionSampleRate,
    replaysOnErrorSampleRate,
    replaysSessionSampleRate,
    tracePropagationTargets: sentryTracePropagationTargets,
  };
}

export function createCloudflareSentryOptions(
  mode: RuntimeMode,
  dsn?: string,
  release?: string
): CloudflareOptions {
  const runtimeRelease = getRequiredRuntimeRelease(mode, release);

  return {
    ...createBaseOptions(mode, dsn),
    enableRpcTracePropagation: true,
    ...(runtimeRelease
      ? {
          release: runtimeRelease,
        }
      : {}),
    ...(isDevelopmentSentryMode(mode)
      ? {
          ignoreTransactions: sentryIgnoredDevTunnelTransactions,
          tunnel: sentryGatewayDevTunnelUrl,
        }
      : {}),
  };
}

export function createRequestMetricAttributes({
  method,
  pathname,
  runtime,
  statusCode,
}: RequestMetricAttributesOptions): SentryMetricAttributes {
  return {
    httpMethod: method,
    httpRoute: pathname,
    runtime,
    ...(statusCode === undefined
      ? {}
      : {
          httpStatusCode: statusCode,
        }),
  };
}

export const sentryMetricNames = {
  browserRequestCount: 'app.browser.request',
  browserRequestDuration: 'app.browser.request.duration',
  browserRequestError: 'app.browser.request.error',
  requestCount: 'app.server.request',
  requestDuration: 'app.server.request.duration',
  requestError: 'app.server.request.error',
} as const;

// Relative URLs still matter because the browser SDK sees same-origin fetches as `/api/...`, but
// we also explicitly allow localhost/127.0.0.1 on any port and all motss.fyi subdomains so trace
// propagation stays intact across the local multi-worker stack and deployed public domains.
const sentryTracePropagationTargets = [
  /^\//,
  localhostTracePropagationTarget,
  motssFyiTracePropagationTarget,
];
