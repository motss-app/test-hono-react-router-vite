import process from 'node:process';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { endTime, startTime, timing } from 'hono/timing';

import { apiApp } from './apis/mod.ts';
import type { HonoEnv } from './types/hono.types.ts';

const port = Number(process.env.PORT || '3000');
const isProduction = process.env.NODE_ENV === 'production';

// Define the Hono context type with custom variables

const app = new Hono<HonoEnv>()
  // Add Context Storage middleware to enable getContext() outside handlers
  .use('*', contextStorage())
  // Add Server-Timing middleware globally
  .use('*', timing())
  .route('/api', apiApp);

// Production: Serve static files and React Router SSR
if (isProduction) {
  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  );

  const { createRequestHandler } = await import('react-router');
  const build = await import('../build/server/index.js' as never);

  app.use('*', async c => {
    // Example: Fetch/compute data in Hono
    startTime(c, 'hono-compute');

    const honoData = {
      computedValue: crypto.randomUUID(),
      serverRegion: process.env.REGION || 'us-east-1',
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
const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  info => {
    console.info(`Listening on http://${info.address}:${info.port}`);
  }
);

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close(err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

export default {
  fetch: app.fetch,
  port,
};

export type App = typeof app;
