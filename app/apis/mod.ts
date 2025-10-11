import { Hono } from 'hono';

const rpcApp = new Hono().get('/hello', (c) => {
  const timestamp = new Date().toISOString();
  return c.json({
    message: 'Hello, World!',
    timestamp,
    server: 'Hono RPC'
  });
});

const testApp = new Hono().get('/', c => {
  return c.json({ message: 'Hello from /api/test endpoint!' });
});

export const apiApp = new Hono()
  .route('/rpc', rpcApp)
  .route('/test', testApp);

export type ApiAppType = typeof apiApp;
