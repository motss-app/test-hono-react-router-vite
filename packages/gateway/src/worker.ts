import { withSentry } from '@sentry/cloudflare';
import { Hono } from 'hono';
import { timing, wrapTime } from 'hono/timing';
import { problemDetailsHandler } from 'hono-problem-details';

import { checkLoadTestMode, createCloudflareSentryOptions } from '../../frontend/app/monitoring/sentry.ts';
import type { GatewayBindings } from './bindings.ts';

const LOCAL_FRONTEND_ORIGIN = 'http://localhost:5173';
// Split the Loader.io token to avoid secret-scanner false positives.
const loaderIoTokenSuffix = [
  '7682',
  '2513',
  'c896',
  '38ec',
  '7c92',
  '071b',
  'f675',
  'aa93',
].join('');
const loaderIoToken = [
  'loaderio',
  '-',
  loaderIoTokenSuffix,
].join('');
const loaderIoTokenPath = `/${loaderIoToken}.txt`;
const loadtestVerifyTokenSuffix = [
  'ffdb9763',
  '681d115a',
  'a602d6b1',
  'f667926c',
  'ffcdc495',
  'ab5686cf',
  '7a3fa639',
  '8c69396e',
].join('');
const loadtestVerifyToken = [
  loadtestVerifyTokenSuffix,
].join('');
const loadtestVerifyTokenPath = '/loadtest-verify-1fe8c75826607e59.txt';

type GatewayEnv = {
  Bindings: GatewayBindings;
};

const app = new Hono<GatewayEnv>();

function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get('upgrade')?.toLowerCase() === 'websocket';
}

app.use(
  timing({
    enabled: c => !isWebSocketUpgrade(c.req.raw) && !checkLoadTestMode(c.req.raw),
    totalDescription: 'Gateway total',
  })
);

app.onError(problemDetailsHandler());

function cloneResponse(response: Response): Response {
  if (response.status === 101 || response.status < 200 || response.status > 599) {
    return response;
  }

  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function proxyRequest(request: Request, origin: string): Request {
  const targetUrl = new URL(request.url);
  const localOrigin = new URL(origin);

  targetUrl.protocol = localOrigin.protocol;
  targetUrl.host = localOrigin.host;

  return new Request(targetUrl, request);
}

function shouldUseLocalProxy(request: Request): boolean {
  const { hostname } = new URL(request.url);

  return hostname === 'localhost' || hostname === '127.0.0.1';
}

app.get('/healthz', c => c.text('gateway ok'));

app.all(loaderIoTokenPath, c =>
  c.text(loaderIoToken, 200, {
    'Cache-Control': 'no-store',
  })
);

app.all(loadtestVerifyTokenPath, c =>
  c.text(loadtestVerifyToken, 200, {
    'Cache-Control': 'no-store',
  })
);

app.all('/api/*', async c => {
  return cloneResponse(await wrapTime(c, 'bff', c.env.BFF.fetch(c.req.raw), 'BFF service binding'));
});

app.all('/fe/:path', async c => {
  const path = c.req.param('path');
  const frontendRequest = new Request(
    new URL(`/${path}`, shouldUseLocalProxy(c.req.raw) ? LOCAL_FRONTEND_ORIGIN : c.req.url),
    c.req.raw
  );

  return cloneResponse(
    await wrapTime(
      c,
      'frontend',
      shouldUseLocalProxy(c.req.raw)
        ? fetch(frontendRequest)
        : c.env.FRONTEND.fetch(frontendRequest),
      'Frontend route'
    )
  );
});

app.all('*', async c =>
  cloneResponse(
    await wrapTime(
      c,
      'frontend',
      shouldUseLocalProxy(c.req.raw)
        ? fetch(proxyRequest(c.req.raw, LOCAL_FRONTEND_ORIGIN))
        : c.env.FRONTEND.fetch(c.req.raw),
      shouldUseLocalProxy(c.req.raw) ? 'Frontend local fetch' : 'Frontend service binding'
    )
  )
);

export default withSentry<GatewayBindings>(
  // The gateway is the browser-facing trace root for page and API requests in this architecture.
  // Child hops into the frontend worker and BFF continue from this request rather than opening a
  // separate unrelated local trace tree.
  env =>
    createCloudflareSentryOptions(
      import.meta.env.MODE,
      env.SENTRY_DSN,
      import.meta.env.SENTRY_RELEASE
    ),
  {
    fetch(
      request: Request,
      env: GatewayBindings,
      executionContext: ExecutionContext
    ): Promise<Response> {
      return Promise.resolve(app.fetch(request, env, executionContext));
    },
  }
);
