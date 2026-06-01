import { withSentry } from '@sentry/cloudflare';
import { Hono } from 'hono';
import { problemDetailsHandler } from 'hono-problem-details';

import { createCloudflareSentryOptions } from '../../frontend/app/monitoring/sentry.ts';
import { apiApp } from './api.ts';
import type { BffBindings } from './bindings.ts';

type BffEnv = {
  Bindings: BffBindings;
};

const app = new Hono<BffEnv>();

app.onError(problemDetailsHandler());

app.route('/api', apiApp);

export default withSentry<BffBindings>(
  // Continue the gateway trace inside the private BFF worker so `/api/*` shows up as a real
  // downstream Worker transaction instead of only as a gateway-side service-binding span.
  env =>
    createCloudflareSentryOptions(
      import.meta.env.MODE,
      env.SENTRY_DSN,
      import.meta.env.SENTRY_RELEASE
    ),
  {
    fetch(
      request: Request,
      env: BffBindings,
      executionContext: ExecutionContext
    ): Promise<Response> {
      return Promise.resolve(app.fetch(request, env, executionContext));
    },
  }
);
