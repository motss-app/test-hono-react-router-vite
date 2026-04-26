import { Hono } from 'hono';

import { apiApp } from './api.ts';

const app = new Hono().route('/api', apiApp);

export default app;
