import { withSentry } from '@sentry/cloudflare/nodejs_compat';
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

app.post('/__purge-cache', async c => {
  const secret = c.env.CACHE_PURGE_SECRET;
  const provided = c.req.header('x-purge-secret');

  if (!secret || provided !== secret) {
    return c.json(
      {
        error: 'unauthorized',
      },
      401
    );
  }

  const ctx = c.executionCtx as unknown as ExecutionContext;

  if (!ctx.cache) {
    return c.json(
      {
        error: 'workers cache not enabled',
      },
      400
    );
  }

  const result = await ctx.cache.purge({
    purgeEverything: true,
  });

  if (!result.success) {
    return c.json(
      {
        error: 'purge failed',
        errors: result.errors,
      },
      500
    );
  }

  return c.json({
    purged: true,
  });
});

app.route('/api', apiApp);

export default withSentry<BffBindings>(
  // Continue the gateway trace inside the private BFF worker so `/api/*` shows up as a real
  // downstream Worker transaction instead of only as a gateway-side service-binding span.
  env =>
    createCloudflareSentryOptions(
      import.meta.env.MODE,
      env.SENTRY_DSN,
      import.meta.env.SENTRY_RELEASE,
      // The BFF is an RPC receiver (continuing traces via `enableRpcTracePropagation`) but has no
      // Sentry-instrumented bindings of its own, so it propagates to nothing.
      []
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
