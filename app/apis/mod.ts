import { Hono } from 'hono';

const testApp = new Hono().get('/', c => {
  return c.json({ message: 'Hello from /api/test endpoint!' });
});

export const apiApp = new Hono()
  .route('/test', testApp);
