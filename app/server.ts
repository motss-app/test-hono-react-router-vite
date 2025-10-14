// import { serve } from '@hono/node-server';
// import { serveStatic } from '@hono/node-server/serve-static';

import { Hono } from 'npm:hono@4.9.12';
import { contextStorage } from 'npm:hono@4.9.12/context-storage';
import { serveStatic } from 'npm:hono@4.9.12/deno';
import { endTime, startTime, timing } from 'npm:hono@4.9.12/timing';

import { apiApp } from './apis/mod.ts';
import type { HonoEnv } from './types/hono.types.ts';

const port = Number(import.meta.env.PORT || '3000');

const app = new Hono<HonoEnv>()
  // Add Context Storage middleware to enable getContext() outside handlers
  .use('*', contextStorage())
  // Add Server-Timing middleware globally
  .use('*', timing())
  .route('/api', apiApp);

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
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

// const server = serve(
//   {
//     fetch: app.fetch,
//     port,
//   },
//   info => {
//     console.info(`Listening on http://${info.address}:${info.port}`);
//   }
// );

// process.on('SIGINT', () => {
//   server.close();
//   process.exit(0);
// });
// process.on('SIGTERM', () => {
//   server.close(err => {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     process.exit(0);
//   });
// });

const exports = import.meta.env.DEV
  ? {
      fetch: app.fetch,
      port,
    }
  : app.fetch;

if (import.meta.env.PROD && !import.meta.env.VITE_DENO_DEPLOYMENT_ID) {
  Deno.serve(
    {
      port,
    },
    app.fetch
  );
}

export default exports;

export type App = typeof app;
