import { createApp } from './app.ts';
import { createSsrHandler } from './ssr-handler.ts';

const port = Number(import.meta.env.PORT || '3000');
const app = createApp();

// Production: Serve static files and React Router SSR
if (import.meta.env.PROD) {
  const { serveStatic } = await import('hono/deno');
  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  );
}

// Always attach SSR handler (Dev & Prod)
createSsrHandler(app);

if (import.meta.env.DEV) {
  // Ignore Broken Pipe errors in Deno when a WebSocket disconnects during Vite HMR
  globalThis.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    if (
      e.reason?.message?.includes('Broken pipe') ||
      e.reason?.message?.includes('Connection reset by peer')
    ) {
      e.preventDefault();
      console.warn('Ignored unhandled rejection:', e.reason);
    }
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
