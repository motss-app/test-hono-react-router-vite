# Sentry + React Router Framework Mode on Cloudflare Workers

## Overview

This document explains the Sentry package split used by this repo when React Router Framework Mode
runs behind Hono on Cloudflare Workers.

Use this document when you need to answer any of these questions:

- which SDK owns server-side request tracing on the Worker
- whether React Router Framework Mode should initialize a second server SDK
- which React Router Sentry package is safe to use in `entry.server.tsx`

For the broader build, environment-variable, and Spotlight setup, see
[`docs/sentry-setup.md`](docs/sentry-setup.md).

## Recommended package split

| Surface | Package | Role |
| --- | --- | --- |
| Browser app | `@sentry/react-router` | Browser errors, tracing, replay, profiling, logs |
| Shared SSR-included route modules | `@sentry/react-router/cloudflare` | `app/root.tsx`, `app/routes/hono-rpc.tsx`, and any other modules shared by the browser and Worker builds |
| Deno local/runtime server | `@sentry/deno` | Local server/runtime ownership in Deno flows |
| Cloudflare Worker runtime | `@sentry/cloudflare` | Single initialized server SDK for deployed Worker requests |
| React Router SSR branch on Worker | `@sentry/react-router/cloudflare` | Worker-safe helper layer around `handleRequest`, trace meta tags, handled SSR error capture |

Important nuance:

- keep `@sentry/react-router` in browser-only client entrypoints like `app/entry.client.tsx`
- use `@sentry/react-router/cloudflare` in route modules that are part of the SSR graph
- this keeps the Worker build on the Worker-safe entrypoint while still working in the browser bundle

## What about SSG-only pages?

If a route is only prerendered at build time and never handles requests at runtime, there is no
server/runtime Sentry SDK to initialize for that route.

Use this rule of thumb:

- if the SSG page hydrates on the client, keep the browser SDK in the client entrypoint
- if the SSG page is truly static and never hydrates, you do not need a runtime Sentry package at all
- build-time source map upload, if needed, still comes from the Vite Sentry plugins

## Request flow on the Worker

In production, request ownership looks like this:

1. `@sentry/cloudflare` wraps the exported Worker handler in `app/worker.ts`.
2. Hono dispatches `/api/*` routes first.
3. Non-API requests fall through to the React Router catch-all in `app/ssr-handler.ts`.
4. `app/entry.server.tsx` wraps the React Router SSR branch with `wrapSentryHandleRequest(...)`.

That means:

- `/api/*` is handled by Hono route handlers
- `/ssr`, `__manifest`, document requests, and data requests are handled by React Router
- all of those requests still belong to the same Worker runtime request that started in `app/worker.ts`

The important distinction is route ownership versus runtime ownership:

- React Router owns the non-API branch
- `@sentry/cloudflare` still owns the deployed server/runtime request

## What this means for the instrumentation API

The generic React Router instrumentation API docs do not map 1:1 to the Worker server build.

Current repo guidance:

- browser-side React Router tracing can keep the client instrumentation wiring in `app/entry.client.tsx`
- Worker deploys should not use the Node-only React Router server helpers
- React Router SSR on the Worker should use `@sentry/react-router/cloudflare` helper exports only

Do not use these Node-oriented helpers in the Worker build:

- `createSentryHandleError(...)`
- `createSentryServerInstrumentation()`

Use these Worker-safe helpers instead:

- `wrapSentryHandleRequest(...)`
- `injectTraceMetaTags(...)`
- `captureException(...)` for handled SSR errors

## Current repo pattern

`app/worker.ts` remains the single initialized server SDK boundary:

```ts
import { withSentry } from '@sentry/cloudflare';

export default withSentry(
  env => ({
    dsn: env.SENTRY_DSN,
  }),
  {
    async fetch(request, env, ctx) {
      return app.fetch(request, env, ctx);
    },
  }
);
```

`app/entry.server.tsx` uses the Worker-safe React Router helper layer instead of a second server
SDK init:

```ts
import {
  captureException,
  injectTraceMetaTags,
  wrapSentryHandleRequest,
} from '@sentry/react-router/cloudflare';

export const handleError = error => {
  if (error instanceof Error) {
    captureException(error);
  }
};

export default wrapSentryHandleRequest(async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
  loadContext
) {
  const body = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(injectTraceMetaTags(body), {
    headers: responseHeaders,
    status: responseStatusCode,
  });
});
```

## Expected trace ownership

On deployed Cloudflare Workers:

- `/api/*` -> Worker runtime traces from `@sentry/cloudflare`
- `/ssr`, `__manifest`, document requests, and data requests -> Worker runtime traces from `@sentry/cloudflare`, enriched by the React Router Worker helper layer
- browser navigations and UI actions -> browser traces from `@sentry/react-router`

So it is expected to see Worker runtime traces for both:

- Hono API routes
- React Router SSR/document/data requests

That does not mean the setup is conflicting. It means the server/runtime owner is the Worker.

## Common mistakes

### 1. Initializing a second server SDK in `entry.server.tsx`

Do not call `Sentry.init(...)`, `withSentry(...)`, or any equivalent runtime initialization inside
`app/entry.server.tsx` or `app/ssr-handler.ts`.

On the Worker path, the runtime client is already initialized in `app/worker.ts`.

### 2. Importing Node-only React Router server helpers in the Worker build

Do not use:

- `createSentryHandleError(...)`
- `createSentryServerInstrumentation()`

Those belong to the Node/server export path, not the Worker-safe helper export.

### 3. Assuming React Router route ownership equals runtime ownership

Even though React Router handles the non-API branch, those requests still arrive through the same
Worker `fetch` boundary first.

That is why `/ssr` and `__manifest` still appear as Worker runtime traces.

### 4. Importing the package root from shared route modules

Do not import `@sentry/react-router` from modules that are included in both the browser bundle and
the Worker/SSR build, such as `app/root.tsx` and `app/routes/hono-rpc.tsx`.

Use `@sentry/react-router/cloudflare` there instead so the Worker build does not resolve the Node
entrypoint and its build-time dependencies.

## Verification checklist

When changing the Worker-side React Router Sentry setup, verify locally:

- `deno task build:worker`
- `app/worker.ts` remains the only place that initializes the Worker runtime SDK
- `app/entry.server.tsx` only uses Worker-safe React Router helper imports
- no Node-only React Router server helpers remain in the Worker path

## Follow-up TODOs

These are not urgent blockers, but revisit them if SSR observability starts to drift or if we decide
to enforce a stricter "Cloudflare SDK only on the server" rule:

- restore the old `handleError` behavior if we start missing SSR errors again: skip aborted
  requests, capture non-`Error` throwables, and flush in serverless contexts

## References

- [`docs/sentry-setup.md`](docs/sentry-setup.md)
- [Sentry for Cloudflare](https://docs.sentry.dev/platforms/javascript/guides/cloudflare/)
- [Sentry for React Router](https://docs.sentry.io/platforms/javascript/guides/react-router/)
