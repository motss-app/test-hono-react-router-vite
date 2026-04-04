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
| React Router SSR branch | `@sentry/react-router/cloudflare` | `app/entry.server.tsx` | Worker-safe request wrapper, handled SSR error capture, and trace meta tags |
| Deno server runtime | `@sentry/deno` | `app/server.ts` | Spotlight in dev, real Sentry outside dev |
| Cloudflare Worker runtime | `@sentry/cloudflare` | `app/worker.ts` | Single initialized server SDK for deployed Worker requests |
| SSG-only pages | `—` at runtime | `react-router.config.ts` prerender and/or client entry | No server/runtime SDK; use the browser SDK only if the prerendered page hydrates |

Build-time source map upload is handled separately by Sentry Vite plugins in the Vite build configs.

Current source-map glob layout:

- `vite.react-router.config.ts` uploads `./build/client/**/*.map` and `./build/server/**/*.map`
- `vite.hono.config.ts` uploads `./build/assets/**/*.map` and `./build/server.js.map`
- `vite.worker.config.ts` uploads `./build/assets/**/*.map` and `./build/worker.js.map`

Each build surface now uses its own explicit glob pattern set instead of a broad `build/**/*.map` sweep.

Shared SSR-included route modules like `app/root.tsx` and `app/routes/hono-rpc.tsx` also use
`@sentry/react-router/cloudflare`. That keeps the Worker/server build on the Worker-safe entrypoint
while still working in the browser bundle, because the cloudflare subpath re-exports the browser
helpers those modules need.

For SSG-only pages, there is no request-time server owner at all. If the prerendered page hydrates,
keep the browser SDK in the client entrypoint; if the page is truly static and never hydrates, you
do not need a runtime Sentry SDK.

## File map

These are the key files involved in the current setup:

- `app/monitoring/sentry.ts`
  - shared Sentry options
  - environment detection
  - source map upload config
  - Cloudflare Worker release lookup
- `vite-utils/get-required-env.ts`
  - generic required env helper
  - deployment-build flag lookup for strict release validation
- `app/entry.client.tsx`
  - browser SDK init
  - React Router tracing
  - manual hydration/bootstrap span
  - idle browser integration span
  - Replay, profiling, logs
  - dev Spotlight browser transport
- `app/root.tsx`
  - shared route root
  - uses `@sentry/react-router/cloudflare` so the Worker build does not resolve the Node entrypoint
- `app/routes/hono-rpc.tsx`
  - shared route module
  - uses `@sentry/react-router/cloudflare` for browser metrics/tracing helpers in the shared SSR graph
- `app/entry.server.tsx`
  - Worker-safe React Router SSR wrapper
  - handled SSR error capture
  - trace meta tag injection
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
  - `themeBuildPlugin()` so `virtual:theme-bootstrap` resolves during local SSR
- `vite.react-router.config.ts`
  - production React Router build config
  - `themeBuildPlugin()` so the hashed theme bootstrap asset is emitted
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

Shared route modules like `app/root.tsx` and `app/routes/hono-rpc.tsx` deliberately use
`@sentry/react-router/cloudflare` instead, because they are included in the Worker/server build as
well as the browser bundle.

Current behavior:

- uses `reactRouterTracingIntegration({ useInstrumentationAPI: true })`
- starts a short-lived `Client bootstrap` span around hydration so browser startup no longer shows up as an unexplained trace gap
- lazy-loads browser profiling after startup
- wraps the idle browser integration loader in a `Lazy browser integrations` span so the deferred setup work is visible in traces
- lazy-loads replay after startup
- reads the session-scoped `app_session_id` cookie and creates a new session cookie in the browser only when one is missing before tagging browser telemetry with `app.session_id`
- stamps `app.session_id` onto emitted browser span data via `beforeSendSpan`
- uses `VITE_SENTRY_DSN` for the browser config
- overrides transport in development so browser envelopes go to Spotlight instead of real Sentry

Important detail:

- in development, the browser does **not** use the fake Spotlight DSN
- instead, it uses a custom transport in `app/monitoring/sentry-spotlight-browser.ts`
- this avoids browser requests to fake endpoints like `https://local/api/0/envelope/...`
- the React Router tracing integration stays eager because `HydratedRouter` needs its client instrumentation during hydration
- we intentionally keep the Framework Mode client instrumentation wiring in `app/entry.client.tsx` for future React Router support, even though Sentry currently says those client hooks are not invoked yet
- the optional browser integrations (`replayIntegration()` and `browserProfilingIntegration()`) are loaded with `import()` and added later via `addIntegration(...)` to keep the initial browser bundle smaller
- browser-side Sentry tracing is still owned by `@sentry/react-router`; the cloudflare subpath only applies to shared route modules and Worker-side helper code

### React Router server rendering

`app/entry.server.tsx` uses the Worker-safe React Router helper layer from `@sentry/react-router/cloudflare`:

- `wrapSentryHandleRequest(...)`
- `injectTraceMetaTags(...)`
- `captureException(...)` from the exported `handleError`

This layer enriches the React Router SSR branch inside the active request that was already opened by
`@sentry/cloudflare` in `app/worker.ts`.

Shared route modules that are part of the SSR graph, such as `app/root.tsx` and
`app/routes/hono-rpc.tsx`, also import from `@sentry/react-router/cloudflare` so the Worker build
does not resolve the Node-only package root. That still works in the browser bundle because the
cloudflare subpath re-exports the browser-facing helpers needed by those modules.

Important details:

- for Cloudflare Worker deploys, do not use the Node-only React Router server helpers such as
  `createSentryHandleError({})` or `createSentryServerInstrumentation()`
- `/api/*`, `/ssr`, document/data requests, and `__manifest` all still enter the Worker first
- server/runtime ownership on the deployed Worker stays with `@sentry/cloudflare`

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

### Environment snapshot logging

To make SSR/build failures easier to diagnose, the repo now logs a sanitized Sentry env snapshot in the places that actually consume those values:

- build configs: `vite.config.ts`, `vite.hono.config.ts`, `vite.react-router.config.ts`, `vite.worker.config.ts`
- browser runtime: `app/entry.client.tsx`
- Deno runtime: `app/server.ts`
- Cloudflare Worker runtime: `app/worker.ts`
- SSR response header path: `app/ssr-handler.ts`
- build-time header copying: `vite-plugins/copy-headers.ts`

Secrets such as `SENTRY_AUTH_TOKEN` are redacted. DSNs are summarized so we can confirm the host and path without dumping the full token value into logs.

### Cloudflare Worker runtime

The Worker runtime is initialized in `app/worker.ts` with `withSentry` from `@sentry/cloudflare`.

Current behavior:

- runtime DSN comes from `env.SENTRY_DSN`
- release comes from the Worker build-time `SENTRY_RELEASE` value so runtime events match uploaded source maps
- all deployed requests enter `withSentry(...)` in `app/worker.ts` before Hono dispatches `/api/*` or the React Router catch-all
- non-API routes like `/ssr`, document/data requests, and `__manifest` are therefore still captured as Worker runtime traces
- reads or creates an `app_session_id` session cookie before request handling so deployed Worker SSR/API requests share the same `app.session_id` as the browser
- tags Worker telemetry with `app.session_id`
- stamps `app.session_id` onto emitted Worker span data via `beforeSendSpan`
- request metrics and logs are recorded for Worker requests
- the React Router SSR branch uses `wrapSentryHandleRequest(...)` inside that same request path rather than initializing a second server SDK

Important detail:

- Worker runtime config comes from Wrangler bindings/vars
- it does **not** rely on `.env` for deployed Worker runtime values
- `@sentry/react-router/cloudflare` should only be used as a helper layer inside the Worker path;
  `@sentry/cloudflare` remains the single initialized server/runtime SDK

### Build-time source maps

Build-time Sentry plugin options are created in `vite-utils/sentry-build.ts`:

- `createSentryBuildOptions()` for React Router builds
- `createSentryVitePluginOptions()` for server/worker builds

These are used by:

- `vite.config.ts`
- `vite.react-router.config.ts`
- `vite.hono.config.ts`
- `vite.worker.config.ts`

Source map upload only happens when the required Sentry build credentials are present.

Current deployment-build behavior:

- `vite.react-router.config.ts`, `vite.hono.config.ts`, and `vite.worker.config.ts` each upload only the source maps they own using explicit glob patterns
- canary and production Worker builds derive Sentry `dist` from the Vite mode (`canary` or `production`) so the same release SHA stays separated by deployment lane

### Why the canary build log looks noisy

The `deno run build:worker:canary` output mixes several different kinds of messages:

- **Sentry plugin info logs**: upload progress, bundle summaries, and telemetry notices from `sentry-vite-plugin`
- **build-tool warnings**: deprecation notices from React Router/Vite and plugin timing warnings from the bundler

The repo currently avoids React Router preview-server prerendering, which is what previously produced the `vite.react-router.config.ts.timestamp-*.mjs` watcher race in GitHub Actions.
The root cause was `unstable_previewServerPrerendering: true` in `react-router.config.ts`, which makes React Router prerender through a Vite preview server; that server creates a temporary config module and the watcher can race with its cleanup.

The important distinction is:

- Sentry upload logs and most warnings are informational
- the real build problem is the one that changes final asset bytes or stops the build with a non-preview-server error

If the `timestamp-*.mjs` `NotFound` ever reappears, first check whether preview-server prerendering was re-enabled or whether the React Router preview-server watcher regressed. It is still not a source-map upload problem.

### Why this repo uses legacy sourcemap upload

This repo keeps `unstable_subResourceIntegrity: true`, so emitted browser assets must stay byte-for-byte stable after hashing.

SRI only applies to **external** assets that React Router/Vite can manage in the generated HTML. Inline `<style>` and `<script>` blocks in `root.tsx` are not covered by SRI; they should use CSP nonces instead.

The modern Sentry React Router build-end flow can inject debug IDs and rewrite generated JavaScript during upload. That is fine for some projects, but here it can invalidate the integrity hashes that the browser uses to load chunks.

Legacy sourcemap upload avoids that by:

- uploading the already-built `.js` and `.map` files
- leaving the emitted JavaScript bytes unchanged
- preserving the integrity values generated by React Router/Vite

In other words: modern upload is convenient, but legacy upload is the SRI-safe choice for this repo.

## Environment variables

### Browser local development

Recommended local `.env` values:

```bash
VITE_SENTRY_DSN=your-public-dsn
SENTRY_DSN=your-public-dsn
VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream
```

If you are only running development, you can omit `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE`.

What each one is used for:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_SENTRY_DSN` | browser build/runtime | browser SDK config |
| `SENTRY_DSN` | Deno server runtime / Worker runtime | server SDK config |
| `VITE_SENTRY_SPOTLIGHT` | browser and Deno dev runtime | Spotlight sidecar URL for dev transports |
| `SENTRY_AUTH_TOKEN` | Vite Sentry plugins | source map upload during builds |
| `SENTRY_RELEASE` | build/runtime | release name for source map upload and runtime release tagging outside development |

Notes:

- `SENTRY_RELEASE` is **not a secret**, so do not store it in Wrangler secrets.
- This repo normally gets it from the build/deploy environment, for example `github.sha` in GitHub Actions.
- The deploy workflow sets `DEPLOYMENT_BUILD=true`, and the release define helper throws if `SENTRY_RELEASE` is missing or empty.
- If you ever want a fixed per-environment value in Wrangler, `vars` is the right place, not `secrets`, but that is not how this repo currently models release values.

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
DEPLOYMENT_BUILD: 'true'
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
2. React Router SSR on Workers uses `@sentry/react-router/cloudflare` helpers only.
3. Deno server runtime uses `@sentry/deno`.
4. Cloudflare Worker runtime uses `@sentry/cloudflare` as the single initialized server SDK.
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
- Worker SSR branch -> `@sentry/react-router/cloudflare` helper wrapping inside the same Worker request
- build-time source maps -> uploaded when Sentry build credentials are present
- Worker-specific Spotlight routing -> not implemented yet
