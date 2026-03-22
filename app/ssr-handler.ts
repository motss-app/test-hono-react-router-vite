import type { Context } from 'hono';
import { endTime, startTime } from 'hono/timing';
import type { ServerBuild } from 'react-router';
import { createRequestHandler, RouterContextProvider } from 'react-router';

import type { App } from './app.ts';
import { HonoContext } from './router-context.ts';
import type { HonoEnv } from './types/hono.types.ts';
import { csp } from './utils/csp.ts';

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

export function createSsrHandler(app: App): void {
  const handler = createRequestHandler(loadServerBuild, import.meta.env.MODE);

  app.use('*', async (c: Context<HonoEnv>) => {
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

    startTime(c, 'react-router-ssr');
    const cspNonce = import.meta.env.PROD ? csp.createNonce() : null;
    const response = await handler(
      await createRouterRequest(c.req.raw, cspNonce),
      new RouterContextProvider(
        new Map([
          [
            HonoContext,
            c.var,
          ],
        ])
      )
    );
    endTime(c, 'react-router-ssr');

    const responseHeaders = new Headers(response.headers);
    const honoTiming = c.res.headers.get('Server-Timing');

    if (honoTiming) {
      responseHeaders.append('Server-Timing', honoTiming);
    }

    if (import.meta.env.PROD && responseHeaders.get('Content-Type')?.includes('text/html')) {
      responseHeaders.set(
        'Content-Security-Policy',
        csp.buildPolicy({
          nonce: cspNonce,
        })
      );
    }

    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  });
}
