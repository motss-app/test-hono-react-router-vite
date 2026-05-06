import { Hono } from 'hono';

import { apiApp } from './api.ts';
import type { BffBindings } from './bindings.ts';

const app = new Hono<{
  Bindings: BffBindings;
}>().route('/api', apiApp);

export default app;
