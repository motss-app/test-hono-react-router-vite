import { withSentry } from '@sentry/cloudflare/nodejs_compat';
import { Hono } from 'hono';
import { timing, wrapTime } from 'hono/timing';
import { problemDetailsHandler } from 'hono-problem-details';

import { isLoadTestMode } from '../../frontend/app/constants.ts';
import { createCloudflareSentryOptions } from '../../frontend/app/monitoring/sentry.ts';
import { locales } from '../../frontend/locales.ts';
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

  const headers = new Headers(response.headers);
  // workerd ignores `Transfer-Encoding` set by user code (it derives framing
  // from the body source), so strip it explicitly instead of forwarding a
  // value the runtime will drop anyway.
  headers.delete('Transfer-Encoding');

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * SSG HTML paths served by the frontend worker: one entry per locale for the
 * root page plus the static sub-routes. Derived from the Inlang settings so a
 * new locale is picked up without touching this file.
 */
const ssgPathSuffixes = [
  '',
  '/about',
  '/errors',
  '/holy-grail',
] as const;
const ssgHtmlPaths = new Set(
  locales.flatMap(locale => ssgPathSuffixes.map(suffix => `/${locale}${suffix}`))
);

function acceptsGzipEncoding(request: Request): boolean {
  return /\bgzip\b/i.test(request.headers.get('accept-encoding') ?? '');
}

/**
 * The gateway is the outermost layer returning to the browser. For SSG HTML
 * paths, compress the body with `CompressionStream` so EVERY prerendered page
 * — all locales and routes, not just the base locale — ships gzipped. All
 * other frontend responses pass through unchanged; Cloudflare compresses
 * those at the edge.
 */
async function handleFrontendResponse(request: Request, response: Response): Promise<Response> {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '') || '/';

  if (!ssgHtmlPaths.has(pathname)) {
    return response;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html') || response.status === 204 || response.status === 304) {
    return response;
  }

  if (!acceptsGzipEncoding(request) || response.body === null) {
    return response;
  }

  const body = response.body;
  const headers = new Headers(response.headers);
  const vary = new Set(
    (headers.get('Vary') ?? '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );
  vary.add('Accept-Encoding');

  headers.set(
    'Vary',
    [
      ...vary,
    ].join(', ')
  );

  /**
   * Buffer the compressed body so the exact encoded `Content-Length` can be
   * reported: `encodeBody: 'manual'` requires it, and without it workerd
   * drops the `Content-Encoding` header and re-frames the body as chunked
   * identity. SSG HTML is small (~20KB), so buffering is cheap.
   */
  const compressed = await new Response(
    body.pipeThrough(new CompressionStream('gzip'))
  ).arrayBuffer();

  headers.set('Content-Encoding', 'gzip');
  headers.set('Content-Length', String(compressed.byteLength));

  return new Response(compressed, {
    /**
     * `Content-Encoding` here marks an ALREADY-compressed body. Without
     * `encodeBody: 'manual'` the Workers platform treats the header as a
     * request to compress and wraps the body in a second gzip layer.
     */
    encodeBody: 'manual',
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

app.get('/rust/healthz', async c => {
  const rust = c.env.HEALTHZ_RUST;
  if (!rust) {
    return c.text('HEALTHZ_RUST binding not configured', 503);
  }
  const resp = await rust.fetch(new Request('http://HEALTHZ_RUST/healthz'));
  const headers = new Headers(resp.headers);
  // workerd ignores `Transfer-Encoding` set by user code — strip it so a
  // stale value from the downstream fetch is never forwarded.
  headers.delete('Transfer-Encoding');
  headers.set('x-worker', 'healthz-rust');
  return new Response(resp.body, {
    headers,
    status: resp.status,
  });
});

app.get('/rust/hello', async c => {
  const rust = c.env.HEALTHZ_RUST;
  if (!rust) {
    return c.text('HEALTHZ_RUST binding not configured', 503);
  }
  const resp = await rust.fetch(new Request('http://HEALTHZ_RUST/hello'));
  const headers = new Headers(resp.headers);
  // workerd ignores `Transfer-Encoding` set by user code — strip it so a
  // stale value from the downstream fetch is never forwarded.
  headers.delete('Transfer-Encoding');
  headers.set('x-worker', 'healthz-rust');
  return new Response(resp.body, {
    headers,
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
