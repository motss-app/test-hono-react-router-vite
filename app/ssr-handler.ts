import { endTime, startTime } from 'hono/timing';

import type { App } from './app.ts';

export async function createSsrHandler(app: App): Promise<void> {
  const { createRequestHandler } = await import('react-router');
  const build = await import('../build/server/index.js' as never);

  app.use('*', async c => {
    // Example: Fetch/compute data in Hono
    startTime(c, 'hono-compute');

    const honoData = {
      computedValue: crypto.randomUUID(),
      serverTimestamp: new Date().toISOString(),
    };

    // Store data in Hono context (accessible via getContext() in React Router)
    c.set('honoData', honoData);

    endTime(c, 'hono-compute');

    // Use Hono's contextStorage - the context will be accessible via getContext()
    startTime(c, 'react-router-ssr');
    const handler = createRequestHandler(build);
    const response = await handler(c.req.raw);
    endTime(c, 'react-router-ssr');

    // Merge Server-Timing headers from React Router with Hono's
    const responseHeaders = new Headers(response.headers);
    const honoTiming = c.res.headers.get('Server-Timing');
    const rrTiming = responseHeaders.get('Server-Timing');

    if (honoTiming && rrTiming) {
      responseHeaders.set('Server-Timing', `${rrTiming}, ${honoTiming}`);
    } else if (honoTiming) {
      responseHeaders.set('Server-Timing', honoTiming);
    }

    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  });
}
