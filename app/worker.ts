import { getIsolationScope, logger, metrics, setTag, withSentry } from '@sentry/cloudflare';

import { logSentryEnvSnapshot } from '../vite-utils/sentry-env-log.ts';
import { createApp } from './app.ts';
import {
  applyAppSessionIdToSpan,
  appSessionIdTagName,
  attachAppSessionCookie,
  createAppSessionId,
  getAppSessionIdFromCookieString,
} from './monitoring/app-session.ts';
import {
  createCloudflareSentryOptions,
  createRequestMetricAttributes,
  isDevelopmentSentryMode,
  sentryMetricNames,
} from './monitoring/sentry.ts';
import { createSsrHandler } from './ssr-handler.ts';
import type { HonoEnv } from './types/hono.types.ts';
import { PromiseFrom } from './utils/promise-from.ts';

const app = createApp();
const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);
let hasLoggedWorkerEnvSnapshot = false;

// Production: Serve React Router SSR
if (import.meta.env.PROD) {
  createSsrHandler(app);
}

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

export default withSentry<HonoEnv['Bindings']>(
  env => {
    if (!hasLoggedWorkerEnvSnapshot) {
      hasLoggedWorkerEnvSnapshot = true;

      console.info(
        '[app/worker.ts] Sentry env snapshot',
        logSentryEnvSnapshot({
          deploymentBuild: import.meta.env.PROD,
          mode: import.meta.env.MODE,
          phase: 'worker',
          source: 'app/worker.ts',
          values: {
            port: undefined,
            sentryAuthToken: undefined,
            sentryDsn: env.SENTRY_DSN,
            sentryRelease: import.meta.env.SENTRY_RELEASE,
            sentrySpotlight: undefined,
            viteSentryDsn: undefined,
            viteSentrySpotlight: undefined,
          },
        })
      );
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

        recordWorkerResponse(request, requestUrl, requestStartedAt, response);

        return response;
      } catch (error) {
        recordWorkerRequestError(request, requestUrl, requestStartedAt);

        throw error;
      }
    },
  }
);
