import {
  getIsolationScope,
  logger,
  metrics,
  setTag,
  withSentry,
} from '@sentry/cloudflare/nodejs_compat';
import { Hono } from 'hono';
import { timing } from 'hono/timing';

import { logSentryEnvSnapshot } from '../../vite-utils/sentry-env-log.ts';
import { isLoadTestMode } from './app/constants.ts';
import {
  applyAppSessionIdToSpan,
  appSessionIdTagName,
  attachAppSessionCookie,
  createAppSessionId,
  getAppSessionIdFromCookieString,
} from './app/monitoring/app-session.ts';
import {
  createCloudflareSentryOptions,
  createRequestMetricAttributes,
  isDevelopmentSentryMode,
  sentryMetricNames,
} from './app/monitoring/sentry.ts';
import { createSsrHandler } from './app/ssr-handler.ts';
import type { HonoEnv } from './app/types/hono.types.ts';
import { createServerPostHog } from './app/utils/posthog.ts';
import { PromiseFrom } from './app/utils/promise-from.ts';
import { locales } from './locales.ts';

const app = new Hono<HonoEnv>()
  .use(
    '*',
    timing({
      enabled: () => !isLoadTestMode,
    })
  )
  .use('*', async (c, next) => {
    await next();
    c.res.headers.delete('Server');
  })
  .get('/assets/*', async c => {
    const response = await c.env.ASSETS.fetch(c.req.raw);

    return new Response(response.body, {
      headers: new Headers(response.headers),
      status: response.status,
      statusText: response.statusText,
    });
  })
  .get('/healthz', c => c.text('frontend ok'))
  .post('/__purge-cache', async c => {
    const secret = c.env.CACHE_PURGE_SECRET;
    const provided = c.req.header('x-purge-secret');

    if (!secret || provided !== secret) {
      return c.json(
        {
          error: 'unauthorized',
        },
        401
      );
    }

    const ctx = c.executionCtx as unknown as ExecutionContext;

    if (!ctx.cache) {
      return c.json(
        {
          error: 'workers cache not enabled',
        },
        400
      );
    }

    const result = await ctx.cache.purge({
      purgeEverything: true,
    });

    if (!result.success) {
      return c.json(
        {
          error: 'purge failed',
          errors: result.errors,
        },
        500
      );
    }

    return c.json({
      purged: true,
    });
  });

const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);
let hasLoggedWorkerEnvSnapshot = false;

function getWorkerAppSessionState(request: Request) {
  const existingAppSessionId = getAppSessionIdFromCookieString(
    request.headers.get('cookie') ?? undefined
  );

  return {
    appSessionId: existingAppSessionId ?? createAppSessionId(),
    shouldSetAppSessionCookie: !existingAppSessionId,
  };
}

function handleWorkerAppRequest({
  appSessionId,
  env,
  executionContext,
  request,
  shouldSetAppSessionCookie,
}: {
  appSessionId: string;
  env: HonoEnv['Bindings'];
  executionContext: ExecutionContext;
  request: Request;
  shouldSetAppSessionCookie: boolean;
}): Promise<Response> {
  setTag(appSessionIdTagName, appSessionId);

  return PromiseFrom(app.fetch(request, env, executionContext)).then(response =>
    attachAppSessionCookie(request, response, appSessionId, shouldSetAppSessionCookie)
  );
}

function recordWorkerResponse(
  request: Request,
  requestUrl: URL,
  requestStartedAt: number,
  response: Response
): void {
  const duration = performance.now() - requestStartedAt;
  const metricAttributes = createRequestMetricAttributes({
    method: request.method,
    pathname: requestUrl.pathname,
    runtime: 'cloudflare',
    statusCode: response.status,
  });

  metrics.count(sentryMetricNames.requestCount, 1, {
    attributes: metricAttributes,
  });
  metrics.distribution(sentryMetricNames.requestDuration, duration, {
    attributes: metricAttributes,
    unit: 'millisecond',
  });

  if (isDevSentryMode) {
    logger.info('Handled Cloudflare request', {
      durationMs: Math.round(duration),
      method: request.method,
      pathname: requestUrl.pathname,
      statusCode: response.status,
    });
  }
}

function recordWorkerRequestError(
  request: Request,
  requestUrl: URL,
  requestStartedAt: number
): void {
  const duration = performance.now() - requestStartedAt;
  const metricAttributes = createRequestMetricAttributes({
    method: request.method,
    pathname: requestUrl.pathname,
    runtime: 'cloudflare',
  });

  logger.error('Unhandled Cloudflare request error', {
    method: request.method,
    pathname: requestUrl.pathname,
  });
  metrics.count(sentryMetricNames.requestError, 1, {
    attributes: metricAttributes,
  });
  metrics.distribution(sentryMetricNames.requestDuration, duration, {
    attributes: metricAttributes,
    unit: 'millisecond',
  });
}

// Redirect `/` to base locale `/en-US`.  URL is the source of truth;
// cookie-based locale detection is not used for the root redirect.
const [BASE_LOCALE] = locales;
const staticSsgPaths = new Set(
  locales.flatMap(locale => [
    `/${locale}`,
    `/${locale}/about`,
    `/${locale}/holy-grail`,
    `/${locale}/errors`,
  ])
);

function createStaticAssetRequest(request: Request, url: URL): Request {
  const headers = new Headers();
  // Prevent the ASSETS binding from transforming/compressing the fetched file.
  headers.set('Cache-Control', 'no-transform');

  return new Request(url, {
    headers,
    method: request.method,
  });
}

const ssgCacheControl =
  'public, max-age=0, s-maxage=900, stale-while-revalidate=180, stale-if-error=86400, no-transform';

function buildSsgHeaders(baseHeaders: Headers): Headers {
  const headers = new Headers(baseHeaders);
  const vary = new Set(
    (headers.get('Vary') ?? '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );
  vary.add('Accept-Encoding');

  headers.set('Content-Type', 'text/html; charset=UTF-8');
  headers.set('Cache-Control', ssgCacheControl);
  headers.set(
    'Vary',
    [
      ...vary,
    ].join(', ')
  );

  return headers;
}

async function serveStaticSsgPage({
  env,
  request,
}: {
  env: HonoEnv['Bindings'];
  request: Request;
}): Promise<Response | null> {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '') || '/';

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return null;
  }

  if (!staticSsgPaths.has(pathname)) {
    return null;
  }

  // Serve uncompressed HTML. The gateway (outermost layer) compresses it.
  // Do NOT serve the .gz file here — the service binding auto-decompresses
  // the body even with Content-Type: application/gzip, causing double-encoding.
  const originalUrl = new URL(request.url);
  originalUrl.pathname = `/_ssg${pathname}/index.html`;
  const originalResponse = await env.ASSETS.fetch(createStaticAssetRequest(request, originalUrl));

  if (!originalResponse.ok) {
    return null;
  }

  const headers = buildSsgHeaders(originalResponse.headers);
  headers.set('X-Asset-Encoding', originalResponse.headers.get('Content-Encoding') ?? 'nil');
  headers.set('X-Asset-Length', originalResponse.headers.get('Content-Length') ?? 'nil');
  headers.set('X-Asset-Type', originalResponse.headers.get('Content-Type') ?? 'nil');

  return new Response(request.method === 'HEAD' ? null : originalResponse.body, {
    headers,
    status: originalResponse.status,
    statusText: originalResponse.statusText,
  });
}

app.get('/', c => {
  const response = c.redirect(`/${BASE_LOCALE}`, 302);
  response.headers.set(
    'Cache-Control',
    'public, max-age=0, s-maxage=900, stale-while-revalidate=300, stale-if-error=86400'
  );
  return response;
});

// Serve React Router SSR in both dev and production.
createSsrHandler(app);

export default withSentry<HonoEnv['Bindings']>(
  env => {
    if (!hasLoggedWorkerEnvSnapshot) {
      hasLoggedWorkerEnvSnapshot = true;

      const workerEnvSnapshot = logSentryEnvSnapshot({
        deploymentBuild: import.meta.env.PROD,
        mode: import.meta.env.MODE,
        phase: 'worker',
        source: 'packages/frontend/worker.ts',
        values: {
          port: undefined,
          sentryAuthToken: undefined,
          sentryDsn: env.SENTRY_DSN,
          sentryRelease: import.meta.env.SENTRY_RELEASE,
          viteSentryDsn: undefined,
        },
      });

      logger.info('[packages/frontend/worker.ts] Sentry env snapshot', workerEnvSnapshot);
    }

    return {
      ...createCloudflareSentryOptions(
        import.meta.env.MODE,
        env.SENTRY_DSN,
        import.meta.env.SENTRY_RELEASE,
        // The frontend worker is an RPC receiver (continuing traces via `enableRpcTracePropagation`)
        // but only has the static ASSETS binding, so it propagates to nothing.
        []
      ),
      beforeSendSpan: span =>
        applyAppSessionIdToSpan(
          span,
          getIsolationScope().getScopeData().tags[appSessionIdTagName] as string | undefined
        ),
    };
  },
  {
    async fetch(
      request: Request,
      env: HonoEnv['Bindings'],
      executionContext: ExecutionContext
    ): Promise<Response> {
      const requestUrl = new URL(request.url);
      const requestStartedAt = performance.now();
      const { appSessionId, shouldSetAppSessionCookie } = getWorkerAppSessionState(request);
      const posthog = createServerPostHog(env);

      if (posthog) {
        executionContext.waitUntil(
          posthog.captureImmediate({
            distinctId: 'server',
            event: 'worker_request',
            properties: {
              $current_url: request.url,
              app_session_id: appSessionId,
            },
          })
        );
        executionContext.waitUntil(posthog.shutdown());
      }

      try {
        const staticSsgResponse = await serveStaticSsgPage({
          env,
          request,
        });
        const response =
          staticSsgResponse ??
          (await handleWorkerAppRequest({
            appSessionId,
            env,
            executionContext,
            request,
            shouldSetAppSessionCookie,
          }));

        // Skip metrics recording during load tests to reduce overhead
        if (!isLoadTestMode) {
          recordWorkerResponse(request, requestUrl, requestStartedAt, response);
        }

        return response;
      } catch (error) {
        if (!isLoadTestMode) {
          recordWorkerRequestError(request, requestUrl, requestStartedAt);
        }

        throw error;
      }
    },
  }
);
