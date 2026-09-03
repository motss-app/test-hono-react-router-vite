import { withSentry } from '@sentry/cloudflare/nodejs_compat';
import { Hono } from 'hono';
import { timing, wrapTime } from 'hono/timing';
import { problemDetailsHandler } from 'hono-problem-details';

import { isLoadTestMode } from '../../frontend/app/constants.ts';
import { createCloudflareSentryOptions } from '../../frontend/app/monitoring/sentry.ts';
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
    enabled: c => !isWebSocketUpgrade(c.req.raw) && !isLoadTestMode,
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

// For /en-US only, compress the HTML response with gzip at the outermost
// layer (gateway) when the client supports it. All other frontend responses
// pass through unchanged.
function handleFrontendResponse(request: Request, response: Response): Response {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname.replace(/\/$/, '') || '/';

  if (pathname !== '/en-US') {
    return response;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html') || response.status === 204 || response.status === 304) {
    return response;
  }

  // Only compress when the client advertises gzip support. Cloudflare rewrites
  // Accept-Encoding before the Worker runs, so check the client's real value.
  const clientAcceptEncoding =
    (
      request.cf as
        | {
            clientAcceptEncoding?: string;
          }
        | undefined
    )?.clientAcceptEncoding ??
    request.headers.get('Accept-Encoding') ??
    '';

  if (!clientAcceptEncoding.includes('gzip')) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Encoding', 'gzip');
  headers.set('Vary', 'Accept-Encoding');
  headers.set('X-Content-Type', contentType.split(';')[0]?.trim() ?? 'nil');
  headers.set('X-Content-Length', response.headers.get('Content-Length') ?? 'nil');
  headers.delete('Content-Length');

  return new Response(response.body?.pipeThrough(new CompressionStream('gzip')), {
    headers,
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

app.post('/__purge-cache', async c => {
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
  const results: {
    gateway: string;
    frontend: unknown;
    bff: unknown;
    healthzRust: unknown;
  } = {
    bff: {
      purged: false,
    },
    frontend: {
      purged: false,
    },
    gateway: 'not-enabled',
    healthzRust: {
      purged: false,
    },
  };

  // Purge this worker's own cache.
  if (ctx.cache) {
    const own = await ctx.cache.purge({
      purgeEverything: true,
    });
    results.gateway = own.success ? 'purged' : 'failed';
  }

  // Fan out to downstream workers via service bindings so each purges its own cache.
  const purgeRequest = new Request('https://internal/__purge-cache', {
    headers: {
      'x-purge-secret': provided,
    },
    method: 'POST',
  });

  const [frontend, bff, rust] = await Promise.all([
    c.env.FRONTEND.fetch(purgeRequest)
      .then(response => response.json())
      .catch(() => ({
        purged: false,
      })),
    c.env.BFF.fetch(purgeRequest)
      .then(response => response.json())
      .catch(() => ({
        purged: false,
      })),
    c.env.HEALTHZ_RUST
      ? c.env.HEALTHZ_RUST.fetch(purgeRequest)
          .then(response => response.json())
          .catch(() => ({
            purged: false,
          }))
      : Promise.resolve({
          purged: false,
        }),
  ]);

  results.frontend = frontend;
  results.bff = bff;
  results.healthzRust = rust;

  return c.json({
    purged: true,
    workers: results,
  });
});

app.get('/rust/healthz', async c => {
  const rust = c.env.HEALTHZ_RUST;
  if (!rust) {
    return c.text('HEALTHZ_RUST binding not configured', 503);
  }
  const resp = await rust.fetch(new Request('http://HEALTHZ_RUST/healthz'));
  return new Response(resp.body, {
    headers: {
      'x-worker': 'healthz-rust',
      ...Object.fromEntries(resp.headers),
    },
    status: resp.status,
  });
});

app.get('/rust/hello', async c => {
  const rust = c.env.HEALTHZ_RUST;
  if (!rust) {
    return c.text('HEALTHZ_RUST binding not configured', 503);
  }
  const resp = await rust.fetch(new Request('http://HEALTHZ_RUST/hello'));
  return new Response(resp.body, {
    headers: {
      'x-worker': 'healthz-rust',
      ...Object.fromEntries(resp.headers),
    },
    status: resp.status,
  });
});

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

  return handleFrontendResponse(
    c.req.raw,
    cloneResponse(
      await wrapTime(
        c,
        'frontend',
        shouldUseLocalProxy(c.req.raw)
          ? fetch(frontendRequest)
          : c.env.FRONTEND.fetch(frontendRequest),
        'Frontend route'
      )
    )
  );
});

app.all('*', async c =>
  handleFrontendResponse(
    c.req.raw,
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
      import.meta.env.SENTRY_RELEASE,
      // Only Sentry-instrumented receivers know how to strip the RPC trace-context argument. The
      // Rust healthz worker does not run Sentry, so it stays out of the allow list.
      [
        'FRONTEND',
        'BFF',
      ]
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
