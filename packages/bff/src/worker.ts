import { sentry } from '@sentry/hono/cloudflare';
import { Hono } from 'hono';

import { apiApp } from './api.ts';
import type { BffBindings } from './bindings.ts';
import { createCloudflareSentryOptions } from '../../../app/monitoring/sentry.ts';

const app = new Hono<{
  Bindings: BffBindings;
}>();

app.use(sentry(app, (env: BffBindings) =>
  createCloudflareSentryOptions(import.meta.env.MODE, env.SENTRY_DSN, import.meta.env.SENTRY_RELEASE)
));

app.route('/api', apiApp);

export default app;
