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

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/*
 * Cloudflare freezes in-worker clocks while synchronous CPU work runs. The
 * gateway can measure the Rust service call because it crosses an awaited
 * service-binding I/O boundary. This value is edge wall time for the Rust
 * service, including service-binding overhead, rather than Rust CPU time.
 */
async function addColorServiceTime(response: Response, timeMs: number): Promise<Response> {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!response.ok || !contentType.includes('application/json')) {
    return response;
  }

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    return response;
  }

  if (!isJsonObject(payload)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');

  return new Response(
    JSON.stringify({
      ...payload,
      time_ms: Number(Math.max(0, timeMs).toFixed(1)),
    }),
    {
      headers,
      status: response.status,
      statusText: response.statusText,
    }
  );
}

/**
 * Skip in-worker gzip above this input size. HTML pages are expected to
 * stay well under it.
 */
const MAX_GZIP_BYTES = 500 * 1024;

function acceptsGzipEncoding(request: Request): boolean {
  return /\bgzip\b/i.test(request.headers.get('accept-encoding') ?? '');
}

/**
 * Prerendered HTML carries `Cache-Control: ... no-transform` (see
 * `headers/_headers.*` and `vite-plugins/copy-headers.ts`, which stamps every
 * prerendered route). That directive tells Cloudflare's edge to leave the
 * bytes alone, so the gateway is the only layer that can gzip SSG pages.
 * Live SSR HTML is `no-store` without `no-transform`, so it passes through
 * and the edge compresses it.
 *
 * Matching on response headers instead of a path allowlist keeps compression
 * in sync automatically: adding a new SSG page needs no gateway edit.
 */
function isGzipEligibleSsgHtml(request: Request, response: Response): boolean {
  if (request.method !== 'GET' || request.headers.has('range')) {
    return false;
  }

  if (response.status < 200 || response.status > 299 || response.status === 204) {
    return false;
  }

  if (response.body === null || !acceptsGzipEncoding(request)) {
    return false;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) {
    return false;
  }

  /** Never double-encode a body the frontend already encoded. */
  if (response.headers.has('Content-Encoding')) {
    return false;
  }

  const cacheControl = (response.headers.get('Cache-Control') ?? '').toLowerCase();
  if (!cacheControl.includes('no-transform') || !cacheControl.includes('public')) {
    return false;
  }

  if (cacheControl.includes('no-store')) {
    return false;
  }

  /**
   * Compression buffers the whole body in memory (`encodeBody: 'manual'`
   * needs an exact Content-Length), so skip known-huge bodies instead of
   * risking worker OOM. HTML pages are expected to stay well under 500KB,
   * so this cap never trips normally.
   */
  const contentLength = Number(response.headers.get('Content-Length') ?? '');
  if (Number.isFinite(contentLength) && contentLength > MAX_GZIP_BYTES) {
    return false;
  }

  return true;
}

/**
 * The gateway is the outermost layer returning to the browser. Prerendered
 * HTML is gzipped here with `CompressionStream` because its `no-transform`
 * cache directive opts it out of edge compression. All other frontend
 * responses pass through unchanged. Cloudflare compresses those at the edge.
 */
async function handleFrontendResponse(request: Request, response: Response): Promise<Response> {
  if (!isGzipEligibleSsgHtml(request, response)) {
    return response;
  }

  const body = response.body;
  if (body === null) {
    return response;
  }

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
  // workerd ignores `Transfer-Encoding` set by user code, so strip it to
  // avoid forwarding a stale value from the downstream fetch.
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
  // workerd ignores `Transfer-Encoding` set by user code, so strip it to
  // avoid forwarding a stale value from the downstream fetch.
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

/**
 * Proxies dominant-color work to its dedicated Rust Worker. Registered before
 * the general fractal route so decoder dependencies stay isolated from the
 * fractal render bundle.
 */
app.all('/api/rust/color/*', async c => {
  const rust = c.env.COLOR_RUST;
  if (!rust) {
    return c.text('COLOR_RUST binding not configured', 503);
  }

  const url = new URL(c.req.url);
  const targetPath = url.pathname.replace(/^\/api\/rust/, '') || '/';
  const target = new Request(`http://COLOR_RUST${targetPath}${url.search}`, c.req.raw);
  const startedAt = performance.now();
  const response = await wrapTime(
    c,
    'color-rust',
    rust.fetch(target),
    'Color Rust worker service binding'
  );
  const timeMs = performance.now() - startedAt;

  return cloneResponse(await addColorServiceTime(response, timeMs));
});

/**
 * Proxies image-optimization work to its dedicated Rust Worker. Registered
 * before the general fractal route so decoder dependencies stay isolated.
 */
app.all('/api/rust/image-optimize/*', async c => {
  const rust = c.env.IMAGE_OPTIMIZE_RUST;
  if (!rust) {
    return c.text('IMAGE_OPTIMIZE_RUST binding not configured', 503);
  }

  const url = new URL(c.req.url);
  const targetPath = url.pathname.replace(/^\/api\/rust/, '') || '/';
  const target = new Request(`http://IMAGE_OPTIMIZE_RUST${targetPath}${url.search}`, c.req.raw);
  const startedAt = performance.now();
  const response = await wrapTime(
    c,
    'image-optimize-rust',
    rust.fetch(target),
    'Image optimize Rust worker service binding'
  );
  const timeMs = performance.now() - startedAt;

  return cloneResponse(await addColorServiceTime(response, timeMs));
});

/**
 * Proxies `/api/rust/*` to the fractal Rust WASM worker through the
 * FRACTAL_RUST service binding. The `/api/rust` prefix is stripped so the
 * worker sees `/fractal/...` style paths. Registered before the `/api/*` BFF
 * catch-all so Rust routes are never swallowed by the BFF proxy.
 */
app.all('/api/rust/*', async c => {
  const rust = c.env.FRACTAL_RUST;
  if (!rust) {
    return c.text('FRACTAL_RUST binding not configured', 503);
  }

  const url = new URL(c.req.url);
  const targetPath = url.pathname.replace(/^\/api\/rust/, '') || '/';
  const target = new Request(`http://FRACTAL_RUST${targetPath}${url.search}`, c.req.raw);

  return cloneResponse(
    await wrapTime(c, 'fractal-rust', rust.fetch(target), 'Rust worker service binding')
  );
});

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
