# Sentry Setup Guide

This document is the source of truth for the Sentry setup used by this project's stack:

- Hono
- Vite
- React Router v7
- Deno
- Cloudflare Workers
- Spotlight

It covers the current wiring, the required environment variables, and the main gotchas we found while making the setup work reliably.

## What is instrumented today

The current setup covers four different runtime/build surfaces:

| Surface | Package | Entry/config | Current destination |
| --- | --- | --- | --- |
| Browser app | `@sentry/react-router` | `app/entry.client.tsx` | Spotlight in dev, real Sentry outside dev |
| React Router server rendering | `@sentry/react-router` | `app/entry.server.tsx` | Used by SSR/loader/action instrumentation |
| Deno server runtime | `@sentry/deno` | `app/server.ts` | Spotlight in dev, real Sentry outside dev |
| Cloudflare Worker runtime | `@sentry/cloudflare` | `app/worker.ts` | Real Sentry via Wrangler runtime vars |

Build-time source map upload is handled separately by Sentry Vite plugins in the Vite build configs.

## File map

These are the key files involved in the current setup:

- `app/monitoring/sentry.ts`
  - shared Sentry options
  - environment detection
  - source map upload config
  - Cloudflare Worker release lookup
- `app/entry.client.tsx`
  - browser SDK init
  - React Router tracing
  - Replay, profiling, logs
  - dev Spotlight browser transport
- `app/entry.server.tsx`
  - React Router server instrumentation
  - error handling integration
- `app/server.ts`
  - Deno server entry
  - Deno SDK init
  - dev request-scope isolation for exported `fetch`
- `app/worker.ts`
  - Cloudflare Worker SDK init
  - request metrics/logging
- `app/monitoring/sentry-spotlight-browser.ts`
  - custom browser transport to Spotlight sidecar
- `app/monitoring/sentry-spotlight-deno.ts`
  - custom Deno transport to Spotlight sidecar
- `vite.config.ts`
  - the actual development Vite config
  - dev React Router plugin wiring
  - dev Sentry React Router plugin wiring
- `vite.react-router.config.ts`
  - production React Router build config
- `vite.hono.config.ts`
  - production Deno server build config
- `vite.worker.config.ts`
  - production Cloudflare Worker build config
- `wrangler.jsonc`
  - Cloudflare Worker runtime vars/bindings
- `.github/workflows/deploy-cf-worker.yml`
  - CI/CD env wiring for build and deploy

## How the current setup works

### Browser runtime

The browser SDK is initialized in `app/entry.client.tsx` with `@sentry/react-router`.

Current behavior:

- uses `reactRouterTracingIntegration({ useInstrumentationAPI: true })`
- lazy-loads browser profiling after startup
- lazy-loads replay after startup
- enables the Sentry Toolbar outside production via `@sentry/toolbar`
- enables console logging integration in development
- reads the session-scoped `app_session_id` cookie and creates a new session cookie in the browser only when one is missing before tagging browser telemetry with `app.session_id`
- stamps `app.session_id` onto emitted browser span data via `beforeSendSpan`
- uses `VITE_SENTRY_DSN` for the browser config
- overrides transport in development so browser envelopes go to Spotlight instead of real Sentry

Important detail:

- in development, the browser does **not** use the fake Spotlight DSN
- instead, it uses a custom transport in `app/monitoring/sentry-spotlight-browser.ts`
- this avoids browser requests to fake endpoints like `https://local/api/0/envelope/...`
- the React Router tracing integration stays eager because `HydratedRouter` needs its client instrumentation during hydration
- the optional browser integrations (`replayIntegration()` and `browserProfilingIntegration()`) are loaded with `import()` and added later via `addIntegration(...)` to keep the initial browser bundle smaller
- the Sentry Toolbar uses the hardcoded org/project pair `ipohjs` / `hono-react-router-vite`
- production CSP now allows the Toolbar CDN script and Sentry frame origin so canary/staging-style builds can render it

### React Router server rendering

`app/entry.server.tsx` wires the React Router server integration:

- `createSentryHandleError({})`
- `createSentryServerInstrumentation()`

This is the React Router SSR side of the setup. It is separate from the Deno server runtime and the Cloudflare Worker runtime.

### Deno server runtime

`app/server.ts` initializes `@sentry/deno` for the local Deno server entry.

Current behavior:

- serves the app in Deno-based local and built-server flows
- uses `SENTRY_DSN` for the server runtime
- sends Deno server envelopes to Spotlight in development
- sends Deno server envelopes to Sentry outside development
- keeps the old duplicate-root fix by creating a fresh isolation scope per request in the dev exported-`fetch` path
- adds a dev-only `/api/*` server transaction in `app/server.ts` so Hono API routes like `/api/rpc/hello` show up as server traces in Spotlight
- reads or creates an `app_session_id` cookie before request handling so the first SSR request, later browser telemetry, and later API requests share the same `app.session_id`
- receives the same cookie automatically on same-origin browser requests once the browser or server has set it
- stamps `app.session_id` onto emitted Deno span data via `beforeSendSpan`
- does not use a manual `http.server` request span wrapper
- does not reintroduce the removed Deno-side request logging

### Cloudflare Worker runtime

The Worker runtime is initialized in `app/worker.ts` with `withSentry` from `@sentry/cloudflare`.

Current behavior:

- runtime DSN comes from `env.SENTRY_DSN`
- release comes from the Worker build-time `SENTRY_RELEASE` value so runtime events match uploaded source maps
- reads or creates an `app_session_id` session cookie before request handling so deployed Worker SSR/API requests share the same `app.session_id` as the browser
- tags Worker telemetry with `app.session_id`
- stamps `app.session_id` onto emitted Worker span data via `beforeSendSpan`
- request metrics and logs are recorded for Worker requests

Important detail:

- Worker runtime config comes from Wrangler bindings/vars
- it does **not** rely on `.env` for deployed Worker runtime values

### Build-time source maps

Build-time Sentry plugin options are created in `app/monitoring/sentry.ts`:

- `createSentryBuildOptions()` for React Router builds
- `createSentryVitePluginOptions()` for server/worker builds

These are used by:

- `vite.config.ts`
- `vite.react-router.config.ts`
- `vite.hono.config.ts`
- `vite.worker.config.ts`

Source map upload only happens when the required Sentry build credentials are present.

## Environment variables

### Browser local development

Recommended local `.env` values:

```bash
VITE_SENTRY_DSN=your-public-dsn
SENTRY_DSN=your-public-dsn
VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_RELEASE=your-release-name
```

What each one is used for:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_SENTRY_DSN` | browser build/runtime | browser SDK config |
| `SENTRY_DSN` | Deno server runtime / Worker runtime | server SDK config |
| `VITE_SENTRY_SPOTLIGHT` | browser and Deno dev runtime | Spotlight sidecar URL for dev transports |
| `SENTRY_AUTH_TOKEN` | Vite Sentry plugins | source map upload |
| `SENTRY_RELEASE` | build/runtime | release name for source map upload, Deno runtime, and embedded Worker runtime release |

### Cloudflare Worker runtime

`wrangler.jsonc` currently provides:

- `vars.SENTRY_DSN`
- `env.canary.vars.SENTRY_DSN`
- `env.production.vars.SENTRY_DSN`

These are the important Worker runtime values:

| Wrangler value | Used by | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | `app/worker.ts` | Worker runtime DSN |

### GitHub Actions deploy workflow

`.github/workflows/deploy-cf-worker.yml` currently sets:

```yaml
SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
SENTRY_DSN: ${{ vars.SENTRY_DSN }}
SENTRY_RELEASE: ${{ github.sha }}
VITE_SENTRY_DSN: ${{ vars.VITE_SENTRY_DSN }}
```

This covers the current build/deploy requirements for:

- React Router build-time Sentry plugin usage
- Worker build-time source map upload
- browser DSN injection at build time

## Commands

Useful commands for the current setup:

```bash
deno task dev
```

Starts the normal local dev stack. This uses:

- browser -> Spotlight
- Deno server runtime -> Spotlight
- `/api/*` Hono requests -> explicit dev server transactions in Spotlight

```bash
deno task spotlight
```

Starts Spotlight by itself (MCP mode).

For local native Spotlight or blocked npm registry environments:

```bash
SPOTLIGHT_BINARY=spotlight SPOTLIGHT_MCP=1 deno task spotlight
```

```bash
deno task preview:worker
```

Builds the Worker and runs local Wrangler dev. This is the closest local Worker parity workflow.

```bash
deno task build
deno task build:worker
```

Build the Deno server or Worker targets with Sentry source map upload enabled when the build credentials are present.

## What the setup should look like for this stack

For this project, the intended setup is:

1. Browser app uses `@sentry/react-router`.
2. React Router server entry uses React Router's Sentry server instrumentation.
3. Deno server runtime uses `@sentry/deno`.
4. Cloudflare Worker runtime uses `@sentry/cloudflare`.
5. Dev browser and Deno server telemetry go to Spotlight with custom transports.
6. Worker runtime uses Wrangler runtime vars and sends to real Sentry.
7. Build-time source maps are uploaded by Sentry Vite plugins when credentials exist.

## Learnings and findings

### 1. `vite.config.ts` is the real dev source of truth

This repo's development setup actually runs through `vite.config.ts`.

That means:

- `reactRouter()` being present in `vite.config.ts` matters
- `sentryReactRouter(...)` also needs to be wired into `vite.config.ts`

It is not enough to configure Sentry only in production-only build configs if you want dev browser instrumentation to work correctly.

### 2. Browser dev should use a transport, not a fake Spotlight DSN

Using the fake Spotlight DSN in the browser caused requests like:

- `https://local/api/0/envelope/...`

That produced browser-side CORS/network noise.

The correct approach for this setup is:

- keep a real browser DSN in config
- override transport in development
- send browser envelopes directly to `http://localhost:8969/stream`

### 3. Deno server tracing needs both the SDK and request isolation

The React Router server instrumentation in `app/entry.server.tsx` is only half of the server story.

For local Deno server traces to appear correctly, this repo also needs:

- a live `@sentry/deno` SDK in `app/server.ts`
- a fresh isolation scope per request in the dev exported-`fetch` path
- `continueTrace()` / `startNewTrace()` so React Router server instrumentation gets clean per-request trace context

Without that runtime ownership, local server traces either disappear entirely or can regress into stale/multi-root request context behavior.

### 4. Worker-side Spotlight routing is not wired today

The current Worker path is:

- local/prod Worker runtime -> `env.SENTRY_DSN`

There is no dedicated Worker Spotlight transport yet. If local Worker runtime parity with Spotlight is needed later, that should be implemented as a dedicated follow-up.

### 5. `document.hidden` cancellation is expected browser behavior

Sentry browser tracing may mark a transaction as:

- `cancelled`
- `sentry.cancellation_reason = document.hidden`

when the tab goes to the background.

This is expected behavior from Sentry's browser tracing logic, not proof that the request failed.

### 6. Do not patch away `document.hidden` cancellation in app code

We tried a dev-only filter that dropped those cancelled transactions.

That caused worse artifacts in Spotlight, including:

- `(missing root transaction)`

Current recommendation for this repo:

- leave Sentry's default cancellation behavior alone
- treat those cancellations as expected dev noise

### 7. Hono dev interception can break Sentry in surprising ways

One of the major dev failures was not Sentry-specific at all:

- `/app/critical/app.css?raw` was being intercepted by Hono instead of Vite
- that returned HTML instead of the expected CSS asset
- the broken asset flow destabilized client behavior, including Sentry-related debugging

The fix lives in `vite.config.ts` by excluding raw app CSS asset requests from Hono dev interception.

### 8. Dev dependency prebundling matters

Explicit `optimizeDeps.include` entries in `vite.config.ts` were needed to stabilize development, especially for Safari/Vite optimized dependency failures involving:

- `@sentry/react-router`
- React Router
- React
- StyleX
- `hono/client`

## Verification checklist

Use this checklist when changing the setup:

- `deno task check`
- targeted Biome checks for touched files
- `deno task dev` starts with Spotlight
- browser events appear in Spotlight without fake `https://local/...` requests
- SSR, browser, Deno API, and Worker traces can be filtered by the same `app.session_id` value
- child spans like browser `http.client` also carry `app.session_id` in sent span data
- `/ssr` still emits a clean server transaction
- `/api/rpc/hello` emits a Deno server transaction in Spotlight
- `deno task build` works when build env vars are configured
- `deno task build:worker` works when build env vars are configured
- Cloudflare Worker runtime has `SENTRY_DSN`

## Current status summary

As of the current setup:

- browser dev -> Spotlight
- browser non-dev -> real Sentry
- Deno dev `/api/*` routes -> explicit server transactions in Spotlight
- Worker runtime -> real Sentry with `app_session_id` correlation
- build-time source maps -> uploaded when Sentry build credentials are present
- Worker-specific Spotlight routing -> not implemented yet
