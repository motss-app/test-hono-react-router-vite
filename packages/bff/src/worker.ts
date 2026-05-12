import { Hono } from 'hono';
import { problemDetailsHandler } from 'hono-problem-details';

import { apiApp } from './api.ts';
import type { BffBindings } from './bindings.ts';

const app = new Hono<{
  Bindings: BffBindings;
}>();

app.onError(problemDetailsHandler());

app.route('/api', apiApp);

export default app;
