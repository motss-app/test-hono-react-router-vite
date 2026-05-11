import { Hono } from 'hono';

import type { BffBindings } from './bindings.ts';
import { sentrySpotlightStreamApp, sentryTunnelApp } from './sentry-tunnel.ts';

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

const testApp = new Hono<{
  Bindings: BffBindings;
}>().get('/', c => {
  return c.json({
    message: 'Hello from /api/test endpoint!',
  } as const);
});

export const apiApp = new Hono<{
  Bindings: BffBindings;
}>()
  .route('/rpc', rpcApp)
  // Keep the browser same-origin in both cases:
  // - `/api/stream` forwards development envelopes to the local Spotlight sidecar
  // - `/api/tunnel` forwards deployed envelopes to Sentry ingest
  .route('/stream', sentrySpotlightStreamApp)
  .route('/test', testApp)
  .route('/tunnel', sentryTunnelApp);

export type ApiAppType = typeof apiApp;
