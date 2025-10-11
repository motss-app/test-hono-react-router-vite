import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { timing, startTime, endTime } from 'hono/timing';
import { contextStorage } from 'hono/context-storage';

import { apiApp } from './apis/mod';

const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

// Define the Hono context type with custom variables
type Env = {
  Variables: {
    honoData: {
      serverTimestamp: string;
      serverRegion: string;
      computedValue: string;
    };
  };
};

const app = new Hono<Env>()
  // Add Context Storage middleware to enable getContext() outside handlers
  .use('*', contextStorage())
  // Add Server-Timing middleware globally
  .use('*', timing())
  .route('/api', apiApp);

// Production: Serve static files and React Router SSR
if (isProduction) {
  app.use('*', serveStatic({
    root: './build/client',
  }));

  const { createRequestHandler } = await import('react-router');
  const build = await import('../build/server/index.js');

  app.use('*', async (c) => {
    // Example: Fetch/compute data in Hono
    startTime(c, 'hono-compute');

    const honoData = {
      serverTimestamp: new Date().toISOString(),
      serverRegion: process.env.REGION || 'us-east-1',
      computedValue: Math.random().toString(36).substring(7),
    };

    // Store data in Hono context (accessible via getContext() in React Router)
    c.set('honoData', honoData);

    endTime(c, 'hono-compute');

    // Use Hono's contextStorage - the context will be accessible via getContext()
    startTime(c, 'react-router-ssr');
    const handler = createRequestHandler(build as any);
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
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  });
} const server = serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Listening on http://${info.address}:${info.port}`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
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
