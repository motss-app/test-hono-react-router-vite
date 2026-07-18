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
import { locales } from './locales.ts';
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
import { PromiseFrom } from './app/utils/promise-from.ts';

const app = new Hono<HonoEnv>()
  .use(
    '*',
    timing({
      enabled: () => !isLoadTestMode,
    })
  )
  .get('/assets/*', async c => {
    const response = await c.env.ASSETS.fetch(c.req.raw);

    return new Response(response.body, {
      headers: new Headers(response.headers),
      status: response.status,
      statusText: response.statusText,
    });
  })
  .get('/healthz', c => c.text('frontend ok'));

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

app.get('/', c => {
  const response = c.redirect(`/${BASE_LOCALE}`, 302);
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=300, stale-if-error=86400'
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
        import.meta.env.SENTRY_RELEASE
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

      try {
        const { appSessionId, shouldSetAppSessionCookie } = getWorkerAppSessionState(request);

        const response = await handleWorkerAppRequest({
          appSessionId,
          env,
          executionContext,
          request,
          shouldSetAppSessionCookie,
        });

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
