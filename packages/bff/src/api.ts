import { Hono } from 'hono';

import type { BffBindings } from './bindings.ts';
import { sentryTunnelApp } from './sentry-tunnel.ts';

const rpcApp = new Hono<{
  Bindings: BffBindings;
}>().get('/hello', c => {
  const response = {
    message: 'Hello, World!',
    server: 'Hono RPC',
    timestamp: new Date().toISOString(),
  } as const;

  return c.json(response, {
    headers: {
      'cache-control': 'no-store',
    },
  });
});

export const apiApp = new Hono<{
  Bindings: BffBindings;
}>()
  .get('/healthz', c => c.text('bff ok'))
  .route('/rpc', rpcApp)
  // Keep browser and local Worker envelopes same-origin behind a single public path.
  // The tunnel forwards to Spotlight in local development and to Sentry ingest elsewhere.
  .route('/tunnel', sentryTunnelApp);

export type ApiAppType = typeof apiApp;
