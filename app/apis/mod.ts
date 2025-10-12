import { Hono } from 'hono';

const rpcApp = new Hono().get('/hello', c => {
  const timestamp = new Date().toISOString();
  return c.json({
    message: 'Hello, World!',
    server: 'Hono RPC',
    timestamp,
  });
});

const testApp = new Hono().get('/', c =>
  c.json({
    message: 'Hello from /api/test endpoint!',
  })
);

export const apiApp = new Hono().route('/rpc', rpcApp).route('/test', testApp);

export type ApiAppType = typeof apiApp;
