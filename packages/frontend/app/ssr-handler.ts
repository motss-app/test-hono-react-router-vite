import { logger } from '@sentry/cloudflare';
import type { Context, Hono } from 'hono';
import { endTime, startTime } from 'hono/timing';
import type { ServerBuild } from 'react-router';
import { createRequestHandler, RouterContextProvider } from 'react-router';

import { logSentryEnvSnapshot } from '../../../vite-utils/sentry-env-log.ts';
import { getSentryConnectSrc, getSentryEnvironment } from './monitoring/sentry.ts';
import { HonoContext } from './router-context.ts';
import type { HonoEnv } from './types/hono.types.ts';
import {
  cloudflareAnalyticsStyleHashes,
  createSentryCspReportingConfig,
  csp,
} from './utils/csp.ts';

let hasLoggedSsrEnvSnapshot = false;
const liveSsrCacheControl = 'no-store';
type RequestHandler = ReturnType<typeof createRequestHandler>;

function loadServerBuild(): Promise<ServerBuild> {
  return import.meta.env.PROD
    ? import('../build/server/index.js' as never)
    : import('virtual:react-router/server-build' as never);
}

async function createRouterRequest(request: Request, nonce: string | null): Promise<Request> {
  const requestHeaders = new Headers(request.headers);
  csp.setNonce(requestHeaders, nonce);

  const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
  const body = isGetOrHead ? null : await request.arrayBuffer();

  return new Request(request.url, {
    body: body && body.byteLength > 0 ? body : null,
    headers: requestHeaders,
    method: request.method,
  });
}

function setHonoData(c: Context<HonoEnv>): void {
  startTime(c, 'hono-compute');
  c.set('honoData', {
    computedValue: crypto.randomUUID(),
    meta: {
      requestId: crypto.randomUUID(),
      requestUrl: c.req.url,
    },
    serverTimestamp: new Date().toISOString(),
  } satisfies HonoEnv['Variables']['honoData']);
  endTime(c, 'hono-compute');
}

function createRouterContext(c: Context<HonoEnv>): RouterContextProvider {
  return new RouterContextProvider(
    new Map([
      [
        HonoContext,
        c.var,
      ],
    ])
  );
}

function applyCommonResponseHeaders(c: Context<HonoEnv>, responseHeaders: Headers): void {
  const honoTiming = c.res.headers.get('Server-Timing');

  if (honoTiming) {
    responseHeaders.append('Server-Timing', honoTiming);
  }

  responseHeaders.set('Cache-Control', liveSsrCacheControl);
}

function logSsrEnvSnapshotOnce(c: Context<HonoEnv>): void {
  if (hasLoggedSsrEnvSnapshot) {
    return;
  }

  hasLoggedSsrEnvSnapshot = true;

  logger.info(
    '[app/ssr-handler.ts] Sentry env snapshot',
    logSentryEnvSnapshot({
      deploymentBuild: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      phase: 'ssr',
      source: 'app/ssr-handler.ts',
      values: {
        port: undefined,
        sentryAuthToken: undefined,
        sentryDsn: c.env.SENTRY_DSN,
        sentryRelease: import.meta.env.SENTRY_RELEASE,
        viteSentryDsn: undefined,
      },
    })
  );
}

function getSentryDsn(c: Context<HonoEnv>): string {
  const sentryDsn = c.env.SENTRY_DSN;

  if (!sentryDsn) {
    throw new Error('app/ssr-handler.ts requires SENTRY_DSN to be defined.');
  }

  return sentryDsn;
}

function isHtmlResponse(responseHeaders: Headers): boolean {
  return Boolean(
    import.meta.env.PROD && responseHeaders.get('Content-Type')?.includes('text/html')
  );
}

function applySsrResponseHeaders(
  c: Context<HonoEnv>,
  response: Response,
  responseHeaders: Headers,
  cspNonce: string | null
): Response {
  applyCommonResponseHeaders(c, responseHeaders);

  if (!isHtmlResponse(responseHeaders)) {
    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  }

  logSsrEnvSnapshotOnce(c);

  const sentryRelease = import.meta.env.SENTRY_RELEASE;

  if (!sentryRelease) {
    throw new Error(
      'app/ssr-handler.ts requires SENTRY_RELEASE to be defined for production HTML responses.'
    );
  }

  const cspPolicy = csp.buildPolicy({
    connectSrc: getSentryConnectSrc(getSentryDsn(c)),
    nonce: cspNonce,
    styleHashes: cloudflareAnalyticsStyleHashes,
  });
  const sentryCspReportingConfig = createSentryCspReportingConfig({
    dsn: getSentryDsn(c),
    environment: getSentryEnvironment(import.meta.env.MODE),
    release: sentryRelease,
  });

  responseHeaders.set('Content-Security-Policy', cspPolicy);
  responseHeaders.set(
    'Content-Security-Policy-Report-Only',
    `${cspPolicy}; report-uri ${sentryCspReportingConfig.reportUri}; report-to csp-endpoint`
  );
  responseHeaders.set('Report-To', sentryCspReportingConfig.reportTo);
  responseHeaders.set('Reporting-Endpoints', sentryCspReportingConfig.reportingEndpoints);
  responseHeaders.set('Document-Policy', csp.buildDocumentPolicy());

  return new Response(response.body, {
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
  });
}

async function handleSsrRequest(c: Context<HonoEnv>, handler: RequestHandler): Promise<Response> {
  setHonoData(c);

  startTime(c, 'react-router-ssr');
  const cspNonce = import.meta.env.PROD ? csp.createNonce() : null;
  const loadContext = createRouterContext(c);
  const response = await handler(await createRouterRequest(c.req.raw, cspNonce), loadContext);
  endTime(c, 'react-router-ssr');

  const responseHeaders = new Headers(response.headers);

  return applySsrResponseHeaders(c, response, responseHeaders, cspNonce);
}

export function createSsrHandler(app: Pick<Hono<HonoEnv>, 'use'>): void {
  const handler = createRequestHandler(loadServerBuild, import.meta.env.MODE);

  app.use('*', (c: Context<HonoEnv>) => {
    return handleSsrRequest(c, handler);
  });
}
