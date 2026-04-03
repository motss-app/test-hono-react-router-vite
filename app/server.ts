import {
  continueTrace,
  getIsolationScope,
  init,
  setHttpStatus,
  setTag,
  startNewTrace,
  startSpan,
  withIsolationScope,
} from '@sentry/deno';

import { logSentryEnvSnapshot } from '../vite-utils/sentry-env-log.ts';
import {
  applyAppSessionIdToSpan,
  appSessionIdTagName,
  attachAppSessionCookie,
  createAppSessionId,
  getAppSessionIdFromCookieString,
} from './monitoring/app-session.ts';
import {
  createDenoSentryOptions,
  getSpotlightSidecarUrl,
  isDevelopmentSentryMode,
} from './monitoring/sentry.ts';
import {
  createSpotlightDenoTransport,
  type SpotlightDenoTransportOptions,
} from './monitoring/sentry-spotlight-deno.ts';
import { PromiseFrom } from './utils/promise-from.ts';

const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);
const sentryDsn = Deno.env.get('SENTRY_DSN') ?? undefined;

console.info(
  '[app/server.ts] Sentry env snapshot',
  logSentryEnvSnapshot({
    deploymentBuild: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    phase: 'deno',
    source: 'app/server.ts',
    values: {
      port: import.meta.env.PORT,
      sentryAuthToken: undefined,
      sentryDsn,
      sentryRelease: Deno.env.get('SENTRY_RELEASE') ?? undefined,
      sentrySpotlight: Deno.env.get('SENTRY_SPOTLIGHT') ?? undefined,
      viteSentryDsn: undefined,
      viteSentrySpotlight: Deno.env.get('VITE_SENTRY_SPOTLIGHT') ?? undefined,
    },
  })
);

if (sentryDsn) {
  const spotlightSidecarUrl = getSpotlightSidecarUrl(
    Deno.env.get('VITE_SENTRY_SPOTLIGHT') ?? undefined
  );

  init({
    ...createDenoSentryOptions(import.meta.env.MODE, sentryDsn),
    beforeSendSpan: span =>
      applyAppSessionIdToSpan(
        span,
        getIsolationScope().getScopeData().tags[appSessionIdTagName] as string | undefined
      ),
    ...(isDevSentryMode
      ? {
          transport: (options: SpotlightDenoTransportOptions) =>
            createSpotlightDenoTransport(options, spotlightSidecarUrl),
        }
      : {}),
  });
}

const [{ createApp }, { createSsrHandler }] = await Promise.all([
  import('./app.ts'),
  import('./ssr-handler.ts'),
]);

const isServerSentryEnabled = Boolean(sentryDsn);
const port = Number(import.meta.env.PORT || '3000');
const app = createApp();

function handleAppRequest(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/assets/') || pathname.includes('.');

  if (!isServerSentryEnabled || isStaticAsset) {
    return PromiseFrom(app.fetch(request));
  }

  const spanName = isApiRoute ? `${request.method} ${pathname}` : `page load`;
  const spanOp = isApiRoute ? 'http.server' : 'pageload';

  return startSpan(
    {
      attributes: {
        'http.request.method': request.method,
        'http.route': pathname,
        'url.path': pathname,
      },
      forceTransaction: true,
      name: spanName,
      op: spanOp,
    },
    async span => {
      const response = await PromiseFrom(app.fetch(request));

      setHttpStatus(span, response.status);

      return response;
    }
  );
}

function handleFetch(request: Request): Promise<Response> {
  const existingAppSessionId = getAppSessionIdFromCookieString(
    request.headers.get('cookie') ?? undefined
  );
  const appSessionId = existingAppSessionId ?? createAppSessionId();
  const shouldSetAppSessionCookie = !existingAppSessionId;
  const handleRequest = async () =>
    attachAppSessionCookie(
      request,
      await handleAppRequest(request),
      appSessionId,
      shouldSetAppSessionCookie
    );

  if (!isServerSentryEnabled) {
    return handleRequest();
  }

  const sentryTrace = request.headers.get('sentry-trace') ?? undefined;
  const baggage = request.headers.get('baggage') ?? undefined;

  return withIsolationScope(() => {
    if (isServerSentryEnabled) {
      setTag(appSessionIdTagName, appSessionId);
    }

    return sentryTrace || baggage
      ? continueTrace(
          {
            baggage,
            sentryTrace,
          },
          handleRequest
        )
      : startNewTrace(handleRequest);
  });
}

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
  const { serveStatic } = await import('hono/deno');
  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  );
}

// Always attach SSR handler (Dev & Prod)
createSsrHandler(app);

if (import.meta.env.DEV) {
  // Ignore Broken Pipe errors in Deno when a WebSocket disconnects during Vite HMR
  globalThis.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    if (
      e.reason?.message?.includes('Broken pipe') ||
      e.reason?.message?.includes('Connection reset by peer')
    ) {
      e.preventDefault();
    }
  });
}

const exports = import.meta.env.DEV
  ? {
      fetch: handleFetch,
      port,
    }
  : handleFetch;

if (import.meta.env.PROD) {
  Deno.serve(
    {
      port,
    },
    handleFetch
  );
}

export default exports;

export type App = typeof app;
