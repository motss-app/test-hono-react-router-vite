// import { serve } from '@hono/node-server';
// import { serveStatic } from '@hono/node-server/serve-static';

import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { serveStatic } from 'hono/deno';
import { endTime, startTime, timing } from 'hono/timing';

import { apiApp } from './apis/mod.ts';
import type { HonoEnv } from './types/hono.types.ts';

const port = Number(import.meta.env.PORT || '3000');

const app = new Hono<HonoEnv>()
  // Add Context Storage middleware to enable getContext() outside handlers
  .use('*', contextStorage())
  // Add Server-Timing middleware globally
  .use('*', timing())
  .route('/api', apiApp);

const STATIC_ASSET_REGEX =
  /image|font|text\/(plain|css|javascript)|application\/(json|ld\+json|pdf|zip|manifest\+json)/;

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
  // 1. Assets: Cache for 1 day in Browser, 1 year in CDN, with SWR
  app.use('/assets/*', async (c, next) => {
    await next();
    if (c.res.ok) {
      c.header(
        'Cache-Control',
        'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=3600, immutable'
      );
    }
  });

  // 2. HTML & Other Static Files (Non-Immutable): Cache for 1 hour in Browser, 1 year in CDN
  app.use('*', async (c, next) => {
    await next();

    // Skip if handled by /assets/ middleware or not successful
    if (c.req.path.startsWith('/assets/') || !c.res.ok) {
      return;
    }

    const contentType = c.res.headers.get('Content-Type');

    if (contentType?.includes('text/html')) {
      // HTML: 10 min browser, 1 hour CDN, SWR 1 min
      c.header(
        'Cache-Control',
        'public, max-age=600, s-maxage=3600, stale-while-revalidate=60, must-revalidate'
      );
    } else if (contentType?.match(STATIC_ASSET_REGEX)) {
      // Other Static files: 10 min browser, 1 hour CDN, SWR 1 min
      c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=60');
    }
  });

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
