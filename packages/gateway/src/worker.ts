import type { GatewayBindings } from '@motss-app/shared';
import { Hono } from 'hono';
import { timing, wrapTime } from 'hono/timing';

const LOCAL_FRONTEND_ORIGIN = 'http://localhost:5173';
const loaderIoTokenSuffix = ['7682', '2513', 'c896', '38ec', '7c92', '071b', 'f675', 'aa93'].join('');
const loaderIoToken = ['loaderio', '-', loaderIoTokenSuffix].join('');
const loaderIoTokenPath = `/${loaderIoToken}.txt`;

const app = new Hono<{
  Bindings: GatewayBindings;
}>();

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

app.all('/api', async c =>
  cloneResponse(await wrapTime(c, 'bff', c.env.BFF.fetch(c.req.raw), 'BFF service binding'))
);

app.all('/api/*', async c =>
  cloneResponse(await wrapTime(c, 'bff', c.env.BFF.fetch(c.req.raw), 'BFF service binding'))
);

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

export default app;
