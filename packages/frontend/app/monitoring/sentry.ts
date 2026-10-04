import type { CloudflareOptions } from '@sentry/cloudflare';

import { isLoadTestMode } from '../constants.ts';

const sentryGatewayDevTunnelUrl = 'http://127.0.0.1:8787/api/tunnel';
const tracesSampleRate = 1.0;
const profileSessionSampleRate = 1.0;
const replaysSessionSampleRate = 0.1;
const replaysOnErrorSampleRate = 1.0;
// Browser tracing should follow same-origin relative URLs, any localhost/127.0.0.1 dev origin
// topology as well as the public domains used outside local development.
const localhostTracePropagationTarget = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/;
const motssFyiTracePropagationTarget = /^https?:\/\/(?:[a-z0-9-]+\.)*motss\.fyi(?:\/|$)/i;
// The gateway forwards local envelopes to `/api/tunnel`; if we keep spans for that route, the app
// starts tracing the act of reporting traces, which quickly becomes recursive noise. Span filtering
// runs at span start in stream mode, and `url.path` is already populated then, so we match on the
// attribute instead of the span name (which is method-only until a route is resolved).
const sentryIgnoredDevTunnelSpanPaths: NonNullable<CloudflareOptions['ignoreSpans']> = [
  {
    attributes: {
      'url.path': /^\/api\/tunnel$/,
    },
    op: 'http.server',
  },
  {
    attributes: {
      'url.path':
        /^\/.*\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|png|svg|ts|tsx|txt|webp|woff2?)(?:\/.*)?$/i,
    },
    op: 'http.server',
  },
  {
    attributes: {
      'url.path': /^\/(?:@fs|@id|__manifest|node_modules\/|virtual:|~virtual:)/,
    },
    op: 'http.server',
  },
];

type RuntimeMode = 'canary' | 'development' | 'production' | string;

type SentryMetricAttributes = Record<string, boolean | number | string>;

interface RequestMetricAttributesOptions {
  method: string;
  pathname: string;
  runtime: 'browser' | 'cloudflare' | 'deno';
  statusCode?: number;
}

type SentryStreamedSpan = Parameters<NonNullable<CloudflareOptions['beforeSendSpan']>>[0];

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
    return undefined;
  }

  try {
    return new URL(dsn).origin;
  } catch {
    return undefined;
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
 * React Router's request handler can emit a generic method-only name such as `GET` (previously a
 * `GET /*` transaction) for catch-all handlers even when the underlying request was something
 * concrete like `/hono-rpc`.
 *
 * For document/API requests we want to keep, name that service span with the actual request
 * pathname so Spotlight shows a meaningful top-level route instead of a bare `GET`.
 */
function normalizeServiceSpanName(span: SentryStreamedSpan): SentryStreamedSpan {
  if (!span.is_segment) {
    return span;
  }

  const requestMethod = span.attributes['http.request.method'];
  const requestPathname = span.attributes['url.path'];

  if (typeof requestMethod !== 'string' || typeof requestPathname !== 'string') {
    return span;
  }

  if (span.name !== requestMethod.toUpperCase()) {
    return span;
  }

  return {
    ...span,
    name: `${requestMethod.toUpperCase()} ${requestPathname}`,
  };
}

/**
 * Local development uses a Vite + gateway + frontend-worker topology that can generate a huge
 * amount of asset/module traffic. Span shaping before send keeps Spotlight focused on the page and
 * API traces we actually care about: legitimate catch-all document/API service spans are renamed
 * from a bare method to the real path so top-level routes stay readable.
 *
 * Noisy Vite asset/module requests are dropped separately through `ignoreSpans`, because v11 stream
 * mode only allows dropping a span at span start and `beforeSendSpan` must return the span.
 */
function createBeforeSendSpan() {
  return function beforeSendSpan(span: SentryStreamedSpan) {
    return normalizeServiceSpanName(span);
  };
}

function createBaseOptions(mode: RuntimeMode, dsn?: string) {
  return {
    ...(dsn
      ? {
          dsn,
        }
      : {}),
    beforeSendSpan: createBeforeSendSpan(),
    // v11 removed `sendDefaultPii` and replaced it with `dataCollection`. Leaving `dataCollection`
    // unset now collects *more* than the old `sendDefaultPii: true` did, because cookies and full
    // request/response bodies become the default. This app issues an `app_session_id` cookie and
    // accepts POST bodies on `/api/*`, so those two categories are pinned off deliberately.
    //
    // Scrubbing in v11 is best effort and matches on key name only, so a credential stored under an
    // innocuous field name would still be transmitted. Everything disabled here is a category this
    // repo does not use for debugging, so nothing is lost.
    dataCollection: {
      cookies: false,
      databaseQueryData: false,
      // v10 defaulted to 7 context lines. v11 dropped the default to 5, so restore it for parity.
      frameContextLines: 7,
      // No AI or database integrations in this repo, so these cost nothing to disable.
      genAI: {
        inputs: false,
        outputs: false,
      },
      graphQL: {
        document: false,
        variables: false,
      },
      // An empty array disables body collection. Sizes are still recorded on spans.
      httpBodies: [],
      // Headers stay on because upstream correlation headers are useful, but values whose key looks
      // sensitive are still filtered by the SDK.
      httpHeaders: {
        request: true,
        response: true,
      },
      queues: false,
      stackFrameVariables: true,
      urlQueryParams: true,
      userInfo: true,
    },
    debug: isDevelopmentSentryMode(mode),
    dist: getSentryDist(mode),
    environment: getSentryEnvironment(mode),
    // Stream mode is already the v11 default. Pinning it documents the intent and guards against a
    // future default change. The alternative, `static`, restores transaction mode but is documented
    // as backwards compatibility only and scheduled for removal.
    traceLifecycle: 'stream' as const,
    // Load tests disable tracing entirely to keep instrumentation overhead near zero. In v11 this
    // replaces the old `beforeSendTransaction` bail-out, which no longer receives transactions.
    tracesSampleRate: isLoadTestMode ? 0 : tracesSampleRate,
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
  release?: string,
  rpcTracePropagationBindings?: CloudflareOptions['rpcTracePropagationBindings']
): CloudflareOptions {
  const runtimeRelease = getRequiredRuntimeRelease(mode, release);

  return {
    ...createBaseOptions(mode, dsn),
    // v11 removed `enableRpcTracePropagation`. Callers now propagate only to the bindings listed in
    // `rpcTracePropagationBindings`, and instrumented receivers pick up incoming trace context
    // automatically, so the old receiver-side opt-in flag is simply dropped.
    ...(rpcTracePropagationBindings
      ? {
          rpcTracePropagationBindings,
        }
      : {}),
    ...(runtimeRelease
      ? {
          release: runtimeRelease,
        }
      : {}),
    ...(isDevelopmentSentryMode(mode)
      ? {
          ignoreSpans: sentryIgnoredDevTunnelSpanPaths,
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
