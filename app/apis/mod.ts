import { Hono } from 'hono';

import { turnstileApiApp } from './turnstile.ts';

const rpcApp = new Hono().get('/hello', c => {
  const response = {
    message: 'Hello, World!',
    server: 'Hono RPC',
    timestamp: new Date().toISOString(),
  } as const;

  return c.json(response);
});

const testApp = new Hono().get('/', c => {
  return c.json({
    message: 'Hello from /api/test endpoint!',
  } as const);
});

export const apiApp = new Hono()
  .route('/rpc', rpcApp)
  .route('/test', testApp)
  .route('/turnstile', turnstileApiApp);

export type ApiAppType = typeof apiApp;
