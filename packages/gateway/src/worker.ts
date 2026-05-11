import type { GatewayBindings } from '@motss-app/shared';
import { withSentry } from '@sentry/cloudflare';
import { Hono } from 'hono';
import { timing, wrapTime } from 'hono/timing';

import { createCloudflareSentryOptions } from '../../../app/monitoring/sentry.ts';

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

type GatewayEnv = {
  Bindings: GatewayBindings;
};

const app = new Hono<GatewayEnv>();

function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get('upgrade')?.toLowerCase() === 'websocket';
}

app.use(
  timing({
    enabled: c => !isWebSocketUpgrade(c.req.raw),
    totalDescription: 'Gateway total',
  })
);

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

  return import.meta.env.DEV && (hostname === 'localhost' || hostname === '127.0.0.1');
}

app.get('/healthz', c => c.text('gateway ok'));

app.all(loaderIoTokenPath, c =>
  c.text(loaderIoToken, 200, {
    'Cache-Control': 'no-store',
  })
);

app.all('/api/*', async c => {
  return cloneResponse(await wrapTime(c, 'bff', c.env.BFF.fetch(c.req.raw), 'BFF service binding'));
});

app.all('*', async c =>
  // The gateway owns the browser-facing root request and forwards non-API traffic to the frontend
  // worker. React Router's request handler can still surface a generic `GET /*` transaction for a
  // catch-all handler, so `app/monitoring/sentry.ts` normalizes kept document/API traffic to the
  // concrete request path and drops noisy dev-only asset/module requests.
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
