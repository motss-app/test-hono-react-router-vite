import { app } from './app.ts';
import { createSsrHandler } from './ssr-handler.ts';

const port = Number(import.meta.env.PORT || '3000');

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
  const { serveStatic } = await import('hono/deno');
  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  );

  await createSsrHandler(app);
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
