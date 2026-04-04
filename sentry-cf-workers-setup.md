# Sentry Cloudflare Workers Setup Guide

This is different from the Sentry setup for React Router framework mode. In production mode, I deploy React Router framework mode to Cloudflare Workers and all requests will be handled by the Hono server sitting in front of the React Router server.

Repo note: this workspace's current Worker deploy flow builds `app/worker.ts` with Vite, minifies there, and deploys the result with `wrangler.jsonc` set to `"no_bundle": true` so the uploaded source maps continue to match the running `worker.js`. For the repo's current source of truth, see [`docs/sentry-setup.md`](docs/sentry-setup.md).

## Install

Add the Sentry Cloudflare SDK as a dependency:

```bash
pnpm add @sentry/cloudflare
```

## Configure SDK

Configuration should happen as early as possible in your application's lifecycle.

To use the SDK, you'll need to set either the `nodejs_compat` or `nodejs_als` compatibility flags in your `wrangler.json`/`wrangler.toml`. This is because the SDK needs access to the `AsyncLocalStorage` API to work correctly.

```json
// wrangler.json

{
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "compatibility_date": "2024-09-23"
}
```

In order to initialize the SDK, wrap your handler with the `withSentry` function. Note that you can turn off almost all side effects using the respective options.

```typescript

import * as Sentry from "@sentry/cloudflare";

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: "https://7c064540d4765bd4a0d025ab12bd7356@o237444.ingest.us.sentry.io/4511078665420800",
    // Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,

    // Send structured logs to Sentry
    enableLogs: true,

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  }),
  {
    async fetch(request, env, ctx) {
      return new Response('Hello World!');
    },
  } satisfies ExportedHandler<Env>,
);
```

## Upload Source Maps (Optional)

Automatically upload your source maps to enable readable stack traces for Errors. If you prefer to manually set up source maps, please follow [this guide](https://docs.sentry.io/platforms/javascript/guides/cloudflare/sourcemaps/).

npx @sentry/wizard@latest -i sourcemaps --saas --org ipohjs --project node-cloudflare-workers

## Verify

This snippet contains an intentional error and can be used as a test to make sure that everything's working as expected.

```javascript

// Send a log before throwing the error
Sentry.logger.info('User triggered test error', {
  action: 'test_error_worker',
});
// Send a test metric before throwing the error
Sentry.metrics.count('test_counter', 1);

setTimeout(() => {
  throw new Error();
});
``
