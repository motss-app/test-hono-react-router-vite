import { app } from './app.ts';
import { createSsrHandler } from './ssr-handler.ts';

const HTTP_STATUS_BAD_REQUEST = 400;
const CACHE_CONTROL_ASSETS =
  'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=3600, immutable';
const CACHE_CONTROL_HTML =
  'public, max-age=600, s-maxage=3600, stale-while-revalidate=60, must-revalidate';
const CACHE_CONTROL_STATIC = 'public, max-age=600, s-maxage=3600, stale-while-revalidate=60';
const STATIC_ASSETS_REGEX = /\.(ico|txt|json|png|jpg|jpeg|svg|css|js)$/;

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
  // Cloudflare Workers: Serve static assets via ASSETS binding
  app.use('*', async (c, next) => {
    // Only attempt to serve assets if the request method is GET or HEAD
    if (c.env?.ASSETS && (c.req.method === 'GET' || c.req.method === 'HEAD')) {
      const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
      if (assetResponse.status < HTTP_STATUS_BAD_REQUEST) {
        const newHeaders = new Headers(assetResponse.headers);
        const path = new URL(c.req.url).pathname;

        // Only apply Cache-Control to static assets
        if (path.includes('/assets/')) {
          newHeaders.set('Cache-Control', CACHE_CONTROL_ASSETS);
        } else if (path.endsWith('.html')) {
          newHeaders.set('Cache-Control', CACHE_CONTROL_HTML);
        } else if (path.match(STATIC_ASSETS_REGEX)) {
          newHeaders.set('Cache-Control', CACHE_CONTROL_STATIC);
        }

        return new Response(assetResponse.body, {
          headers: newHeaders,
          status: assetResponse.status,
          statusText: assetResponse.statusText,
        });
      }
    }
    return next();
  });

  await createSsrHandler(app);
}

export default {
  fetch: app.fetch,
};
