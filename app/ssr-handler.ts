import { endTime, startTime } from 'hono/timing';
import type { ServerBuild } from 'react-router';
import { createRequestHandler, RouterContextProvider } from 'react-router';

import type { App } from './app.ts';
import { HonoContext } from './router-context.ts';
import type { HonoEnv } from './types/hono.types.ts';

export function createSsrHandler(app: App): void {
  /**
   * Dynamic import so dev uses virtual module and prod uses the built server
   */
  const build = (): Promise<ServerBuild> =>
    import.meta.env.PROD
      ? import('../build/server/index.js' as never)
      : import('virtual:react-router/server-build' as never);
  const handler = createRequestHandler(build, import.meta.env.MODE);

  app.use('*', async c => {
    /**
     * Example: Fetch/compute data in Hono
     */
    startTime(c, 'hono-compute');
    const honoData = {
      computedValue: crypto.randomUUID(),
      meta: {
        requestId: crypto.randomUUID(),
        requestUrl: c.req.url,
      },
      serverTimestamp: new Date().toISOString(),
    } satisfies HonoEnv['Variables']['honoData'];

    /** Another method: store some metadata in Hono's context as well */
    /**
     * Store data in Hono context (accessible via getContext() in React Router)
     */
    c.set('honoData', honoData);
    endTime(c, 'hono-compute');

    /**
     * Use Hono's contextStorage - the context will be accessible via getContext()
     */
    startTime(c, 'react-router-ssr');
    const context = new RouterContextProvider(
      new Map([
        [
          HonoContext,
          c.var,
        ],
      ])
    );
    const response = await handler(c.req.raw, context);
    endTime(c, 'react-router-ssr');

    /**
     * Merge Server-Timing headers from React Router with Hono's
     */
    const responseHeaders = new Headers(response.headers);
    const honoTiming = c.res.headers.get('Server-Timing');

    if (honoTiming) {
      responseHeaders.append('Server-Timing', honoTiming);
    }

    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  });
}
