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

The current setup covers five different runtime/build surfaces:

| Surface | Package | Entry/config | Current destination |
| --- | --- | --- | --- |
| Browser app | `@sentry/react-router` | `app/entry.client.tsx` | Same-origin `/api/tunnel` in every mode |
| React Router SSR branch | `@sentry/react-router/cloudflare` | `app/entry.server.tsx` | Worker-safe request wrapper, handled SSR error capture, and trace meta tags |
| Frontend Worker runtime | `@sentry/cloudflare` | `packages/frontend/worker.ts` | Single initialized server SDK for deployed frontend Worker requests |
| BFF tunnel proxy | `@motss-app/bff` | `packages/bff/src/sentry-tunnel.ts` via `packages/bff/src/api.ts` | Same-origin `/api/tunnel` browser/local-Worker envelope proxy to Spotlight in dev and Sentry ingest outside dev |
| SSG-only pages | `—` at runtime | `react-router.config.ts` prerender and/or client entry | No server/runtime SDK use the browser SDK only if the prerendered page hydrates |

Build-time artifact upload is handled separately by Sentry Vite plugins in the Vite build configs.

In development, the browser sends envelopes to same-origin `/api/tunnel`, and the local BFF worker forwards them to Spotlight on `http://localhost:8969/stream`. Deployed environments keep that same private BFF tunnel pointed at Sentry ingest.

Important Debug ID requirement:

- Debug-ID symbolication needs both the built source artifacts (`.js` chunks/files with injected Debug IDs)
  and the matching source maps (`.map`).
- Uploading only `.map` files is not enough Sentry also needs the corresponding built `.js` artifacts to
  resolve frames by Debug ID.

Current source-map glob layout:

- `packages/frontend/vite.react-router.config.ts` uploads `./build/client/**/*.map` and `./build/server/**/*.map`
- `packages/frontend/vite.worker.config.ts` uploads `./build/assets/**/*.map` and `./build/worker.js.map`

The React Router build keeps the legacy upload path for SRI safety. The frontend Worker build uses modern Debug-ID upload with `useModernDebugIdUpload: true`, and its glob list stays in `filesToDeleteAfterUpload` so the generated maps are cleaned up after upload.

The Worker build also injects Debug IDs into the emitted `worker.js` and hashed worker chunks before deploy, so the deployed artifact carries the same Debug IDs that Sentry sees in the event payload. The browser-facing builds still use the SRI-safe legacy upload path.

The deployment Vite configs (`packages/frontend/vite.react-router.config.ts` and `packages/frontend/vite.worker.config.ts`) minify their outputs, and the frontend Worker deploy keeps `packages/frontend/wrangler.jsonc` on "no_bundle": true plus "preserve_file_names": true so Wrangler does not re-bundle or rename the already-built `worker.js` after the source maps are uploaded. The Worker config also sets `base_dir: "./build"`, `find_additional_modules: true`, and an `ESModule` rule for `assets/**/*.js` so the generated chunk graph is uploaded alongside `worker.js`. That keeps the deployed runtime aligned with the exact bytes Sentry indexed.

Shared SSR-included route modules like `app/root.tsx` and `app/routes/hono-rpc.tsx` also use
`@sentry/react-router/cloudflare`. That keeps the Worker/server build on the Worker-safe entrypoint
while still working in the browser bundle, because the cloudflare subpath re-exports the browser
helpers those modules need.

For SSG-only pages, there is no request-time server owner at all. If the prerendered page hydrates,
keep the browser SDK in the client entrypoint if the page is truly static and never hydrates, you
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
  - Replay, profiling, view hierarchy, logs
  - same-origin `/api/tunnel` in every mode, with dev forwarding to Spotlight and deployed forwarding to Sentry ingest
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
- `packages/gateway/src/worker.ts`
  - browser-facing routing to the frontend and BFF workers
- `packages/frontend/worker.ts`
  - Cloudflare Worker SDK init
  - request metrics/logging
- `packages/bff/src/api.ts`
  - BFF API router that mounts the tunnel endpoint under `/api/tunnel`
- `packages/bff/src/sentry-tunnel.ts`
  - raw envelope parser and forwarder for the private BFF tunnel proxy
- `packages/bff/src/bindings.ts`
  - Cloudflare Worker bindings used by the BFF tunnel validation path
- `packages/bff/wrangler.jsonc`
  - private BFF runtime vars/bindings for the tunnel DSN allowlist
- `packages/frontend/vite.config.ts`
  - the actual development Vite config
  - dev React Router plugin wiring
  - dev Sentry React Router plugin wiring
  - `themeBuildPlugin()` so `virtual:theme-bootstrap` resolves during local SSR
- `packages/frontend/vite.react-router.config.ts`
  - production React Router build config
  - `themeBuildPlugin()` so the hashed theme bootstrap asset is emitted
- `packages/frontend/vite.worker.config.ts`
  - production Cloudflare Worker build config
- `packages/frontend/wrangler.jsonc`
  - frontend Worker runtime vars/bindings
- `packages/gateway/wrangler.jsonc`
  - gateway service bindings for the frontend and BFF workers

## How the current setup works

### Browser runtime

The browser SDK is initialized in `app/entry.client.tsx` with `@sentry/react-router`.

Shared route modules like `app/root.tsx` and `app/routes/hono-rpc.tsx` deliberately use
`@sentry/react-router/cloudflare` instead, because they are included in the Worker/server build as
well as the browser bundle.

Current behavior:

- uses `reactRouterTracingIntegration({ useInstrumentationAPI: true })`
- lazy-loads `viewHierarchyIntegration()` after startup so captured frontend errors can include a DOM snapshot without delaying hydration
- starts a short-lived `Client bootstrap` span around hydration so browser startup no longer shows up as an unexplained trace gap
- lazy-loads browser profiling, HTTP client enrichment, extra error data, and HTML context lines after startup
- browser profiling is session-scoped with `profileSessionSampleRate: 1.0` and `profileLifecycle: 'trace'`
- wraps the idle browser integration loader in a `Lazy browser integrations` span so the deferred setup work is visible in traces
- `replayIntegration()` remains commented out for now, because the local Spotlight sidecar can choke on replay envelopes during development
- reads the session-scoped `app_session_id` cookie and creates a new session cookie in the browser only when one is missing before tagging browser telemetry with `app.session_id`
- stamps `app.session_id` onto emitted browser span data via `beforeSendSpan`
- uses the shared `VITE_SENTRY_DSN` env name for the browser config, keeping the production DSN in development
- sets `tunnel: '/api/tunnel'` in every mode so browser envelopes stay same-origin before the BFF forwards them to Spotlight in development or Sentry ingest outside development
- lets `packages/gateway/src/worker.ts` relay browser tunnel traffic to the BFF in every mode

Important detail:

- in development, the browser keeps the configured DSN but sends envelopes to `/api/tunnel`
- the BFF forwards those dev envelopes from `/api/tunnel` to `http://localhost:8969/stream`
- the local Spotlight sidecar is started by `scripts/dev-spotlight.ts` no placeholder DSN is needed in the browser bundle
- the React Router tracing integration stays eager because `HydratedRouter` needs its client instrumentation during hydration
- the view hierarchy integration is deferred to the idle browser integrations path, so very early errors may not include a DOM snapshot
- we intentionally keep the Framework Mode client instrumentation wiring in `app/entry.client.tsx` for future React Router support, even though Sentry currently says those client hooks are not invoked yet
- `elementTimingIntegration()` is initialized eagerly in `app/entry.client.tsx` so Chromium browsers can report the earliest render/load metrics
- the optional browser integrations (`viewHierarchyIntegration()`, `browserProfilingIntegration()`, `httpClientIntegration()`, `extraErrorDataIntegration()`, and `contextLinesIntegration()`) are loaded with `import()` and added later via `addIntegration(...)` to keep the initial browser bundle smaller
- browser-side Sentry tracing is still owned by `@sentry/react-router` the cloudflare subpath only applies to shared route modules and Worker-side helper code

### BFF tunnel proxy

The private BFF worker owns the browser envelope proxy in both local development and deployed modes.

Current behavior:

- exposes `POST /api/tunnel` from `packages/bff/src/api.ts`
- reads only the first envelope header line from the raw request body
- validates the envelope DSN host and project id against `packages/bff/wrangler.jsonc`'s `SENTRY_DSN`
- forwards the original envelope bytes to Spotlight on `http://localhost:8969/stream` in local development
- forwards the original envelope bytes to `https://<dsn-host>/api/<project-id>/envelope/` outside local development
- keeps browser telemetry same-origin so ad blockers are less likely to block it
- keeps the dev Spotlight stream same-origin as well, so the browser and local Worker runtimes never have to post directly to `http://localhost:8969/stream`

Important detail:

- CSP reporting still goes direct to Sentry the tunnel only proxies browser SDK envelopes
- the BFF uses the public `SENTRY_DSN` value as the tunnel validation source, so the Wrangler binding must stay in sync with the browser DSN

### Browser integration gzip snapshot

The following gzip sizes were measured from the current browser integration experiment and are a handy reference when deciding whether an integration should stay deferred or move earlier.

| Integration | gzip size | Loading note |
| --- | ---: | --- |
| `browserTracingIntegration()` | 27.3 kB | Eager tracing path keep it active before hydration rather than deferring it with the idle loader. |
| `browserProfilingIntegration()` | 9.61 kB | Lazy-loaded today keep deferred unless you need profiling earlier in startup. |
| `replayIntegration()` | 53.1 kB | Commented out today only enable when you want replay and can afford the extra bundle cost. |
| `viewHierarchyIntegration()` | 727 B | Lazy-loaded today lightweight DOM snapshot enrichment. |
| `httpClientIntegration()` | 6.59 kB | Lazy-loaded today browser-only request/response enrichment. |
| `extraErrorDataIntegration()` | 2.7 kB | Lazy-loaded today enriches custom error objects. |
| `elementTimingIntegration()` | 7.6 kB | Browser-only and Chromium-only loaded eagerly in `app/entry.client.tsx` so the earliest render/load metrics are available. |
| `contextLinesIntegration()` | 653 B | Lazy-loaded today useful mainly when the page contains inline JavaScript. |

### React Router server rendering

`app/entry.server.tsx` uses the Worker-safe React Router helper layer from `@sentry/react-router/cloudflare`:

- `wrapSentryHandleRequest(...)`
- `injectTraceMetaTags(...)`
- `captureException(...)` from the exported `handleError`

This layer enriches the React Router SSR branch inside the active request that was already opened by
`@sentry/cloudflare` in `packages/frontend/worker.ts`.

Recent change note:

- `c2c30333769ea7c3161765ca1b30edb2dc4a487e` switched `app/entry.client.tsx` to the
  `@sentry/react-router/cloudflare` re-export surface and made `app/entry.server.tsx`
  `handleError` request-aware so aborted requests are skipped before `captureException(...)`.
- We kept the runtime demo logging in `handleError` so the intentional error still has a stable
  `app.session_id` breadcrumb when it is useful.

Shared route modules that are part of the SSR graph, such as `app/root.tsx` and
`app/routes/hono-rpc.tsx`, also import from `@sentry/react-router/cloudflare` so the Worker build
does not resolve the Node-only package root. That still works in the browser bundle because the
cloudflare subpath re-exports the browser-facing helpers needed by those modules.

Important details:

- for Cloudflare Worker deploys, do not use the Node-only React Router server helpers such as
  `createSentryHandleError({})` or `createSentryServerInstrumentation()`
- do not create a separate Node preload file like `instrument.server.mjs` for the Worker path
- `/api/*`, `/ssr`, document/data requests, and `__manifest` all still enter the Worker first
- server/runtime ownership on the deployed Worker stays with `@sentry/cloudflare`

Future-watch:

- we tried a route-level `unstable_instrumentations` experiment in `app/entry.server.tsx`, but it
  added noise and did not improve the current Cloudflare Worker setup enough to keep
- keep an eye on React Router's Cloudflare Worker instrumentation story if a Worker-safe server
  instrumentation export lands later and actually reduces noise, we can revisit it then
- for now, the current lean Worker-safe helper path is enough and avoids extra span noise

### Gateway routing

`packages/gateway/src/worker.ts` is the browser-facing entrypoint for local and deployed traffic.

Current behavior:

- forwards `/api/*` requests to the BFF worker
- proxies page/document requests to the frontend worker in local development
- uses the `FRONTEND` service binding outside local development

### Local Spotlight trace shaping

The current local development stack is intentionally opinionated about which transactions should be
visible in Spotlight.

Why this exists:

- the gateway is the browser-facing request root
- the frontend worker handles the actual React Router SSR request
- Vite dev serves many module, source-map, virtual-module, and asset requests as individual HTTP requests

Without any shaping, Spotlight becomes noisy in two ways:

- every Vite-served asset/module request can appear as its own top-level server transaction
- React Router catch-all handlers can show up as generic `GET /*` transaction names even when the
  real request was something concrete like `/hono-rpc`

The shared rules in `app/monitoring/sentry.ts` now do three things in local development:

1. drop standalone top-level dev transactions for noisy asset/module requests such as:
  - `@fs/...`
  - `@id/...`
  - `node_modules/...`
  - `__manifest`
  - `.js`, `.ts`, `.tsx`, `.css`, `.map`, `.woff2`, and similar asset URLs
2. rename kept catch-all transactions from `GET /*` to the actual request path by reading the
  request URL before the transaction is sent
3. keep the envelope-reporting route itself (`POST /api/tunnel`) out of the trace list so the app
  does not trace the act of tracing itself

Important nuance:

- the `beforeSendTransaction` path returns `null` only in development
- that is intentional because `return null` means “discard this transaction entirely”
- the ignored-path patterns are broad and optimized for local Vite/worker noise, not for deployed traffic
- outside development we would rather keep the transaction and only normalize catch-all names such as `GET /*`
  than risk hiding legitimate canary/production requests that happen to match a broad asset/path rule

That means the Spotlight trace list stays focused on meaningful browser-facing requests such as:

- `GET /hono-rpc`
- `GET /ssr`
- `GET /api/rpc/hello`

instead of showing one top-level server trace for every dev asset fetch.

This shaping also prevents confusing orphan `GET /*` traces. Those happened when a generic
catch-all transaction survived, but the real parent asset/module transaction had already been
filtered out.

### Trace propagation targets

The browser `tracePropagationTargets` config in `app/monitoring/sentry.ts` currently allows:

- relative same-origin paths such as `/api/rpc/hello`
- `localhost` and `127.0.0.1` on any port, for example `http://localhost:5173/...` and `http://127.0.0.1:8787/...`
- all `motss.fyi` subdomains, for example `https://hono-react-router-vite.motss.fyi/...`

That is deliberate. It keeps trace headers flowing across the local gateway/frontend/BFF split and
across the deployed public domains without propagating headers to unrelated third-party origins.

### Environment snapshot logging

To make SSR/build failures easier to diagnose, the repo now logs a sanitized Sentry env snapshot in the places that actually consume those values:

- build configs: `vite.config.ts`, `packages/frontend/vite.react-router.config.ts`, `packages/frontend/vite.worker.config.ts`, `packages/gateway/vite.config.ts`
- browser runtime: `app/entry.client.tsx`
- gateway tunnel relay: `packages/gateway/src/worker.ts`
- Cloudflare Worker runtime: `packages/frontend/worker.ts`
- SSR response header path: `app/ssr-handler.ts`
- build-time header copying: `vite-plugins/copy-headers.ts`

Secrets such as `SENTRY_AUTH_TOKEN` are redacted. DSNs are summarized so we can confirm the host and path without dumping the full token value into logs.

### Frontend Worker runtime

The Worker runtime is initialized in `packages/frontend/worker.ts` with `withSentry` from `@sentry/cloudflare`.

Current behavior:

- runtime DSN comes from `env.SENTRY_DSN`
- release comes from the Worker build-time `SENTRY_RELEASE` value so runtime events match uploaded source maps
- all deployed frontend requests enter `withSentry(...)` in `packages/frontend/worker.ts` before asset routing or the React Router catch-all
- non-API routes like `/ssr`, document/data requests, and `__manifest` are therefore still captured as Worker runtime traces
- reads or creates an `app_session_id` session cookie before request handling so deployed frontend SSR requests share the same `app.session_id` as the browser
- tags Worker telemetry with `app.session_id`
- stamps `app.session_id` onto emitted Worker span data via `beforeSendSpan`
- request metrics and logs are recorded for Worker requests
- enables `enableRpcTracePropagation` so RPC calls made through Cloudflare service bindings inherit the active trace context
- the React Router SSR branch uses `wrapSentryHandleRequest(...)` inside that same request path rather than initializing a second server SDK
- Vite minifies the Worker bundle in `vite.worker.config.ts`, and `wrangler.jsonc` keeps `"no_bundle": true`, `"preserve_file_names": true`, `"find_additional_modules": true`, `base_dir: "./build"`, and an `ESModule` rule for `assets/**/*.js` so Wrangler deploys the already-built Worker as-is. That keeps the runtime file name and line numbers aligned with the Vite output that was uploaded to Sentry if Wrangler re-bundles, renames, or omits the generated Worker chunks, the deployed `worker.js` no longer matches the uploaded `worker.js.map`, and Sentry will keep showing unmapped stack frames even though the artifact exists.

Important detail:

- Worker runtime config comes from Wrangler bindings/vars
- it does **not** rely on `.env` for deployed Worker runtime values
- `@sentry/react-router/cloudflare` should only be used as a helper layer inside the Worker path
  `@sentry/cloudflare` remains the single initialized server/runtime SDK

### Build-time source maps

Build-time Sentry plugin options are created in `vite-utils/sentry-build.ts`:

- `createSentryBuildOptions(mode, dist)` for React Router builds
- `createSentryVitePluginOptions(mode, { dist, ... })` for server/worker builds

Each build config passes its own explicit Sentry dist into those helpers:

- `vite.config.ts` uses `react-router-dev`
- `packages/frontend/vite.react-router.config.ts` uses `react-router`
- `packages/frontend/vite.worker.config.ts` uses `worker`

These are used by:

- `vite.config.ts`
- `packages/frontend/vite.react-router.config.ts`
- `packages/frontend/vite.worker.config.ts`

Build helper split:

- `packages/frontend/vite.react-router.config.ts` keeps legacy sourcemap upload with explicit glob patterns
- `packages/frontend/vite.worker.config.ts` opts into modern Debug-ID upload with `useModernDebugIdUpload: true` and keeps its map globs only in `filesToDeleteAfterUpload`

Artifact and source-map upload only happens when the required Sentry build credentials are present.

Current deployment-build behavior:

- `packages/frontend/vite.react-router.config.ts` keeps legacy upload with explicit glob patterns
- `packages/frontend/vite.worker.config.ts` uses modern Debug-ID upload its explicit map glob list is retained only for post-upload cleanup
- the build configs pass explicit Sentry `dist` values at the call site, so release attribution stays stable even when the build mode changes
- for Debug-ID mode (Worker build), keep the emitted built `.js` artifacts and `.map` files together for
  the same build output if the `.js` artifact with matching Debug ID is missing, Sentry will report
  `No Source File With Matching Debug ID`

### Why the canary build log looks noisy

The `deno run build:worker:canary` output mixes several different kinds of messages:

- **Sentry plugin info logs**: upload progress, bundle summaries, and telemetry notices from `sentry-vite-plugin`
- **build-tool warnings**: deprecation notices from React Router/Vite and plugin timing warnings from the bundler

The repo currently avoids React Router preview-server prerendering, which is what previously produced the `vite.react-router.config.ts.timestamp-*.mjs` watcher race in GitHub Actions.
The root cause was `unstable_previewServerPrerendering: true` in `react-router.config.ts`, which makes React Router prerender through a Vite preview server that server creates a temporary config module and the watcher can race with its cleanup.

The important distinction is:

- Sentry upload logs and most warnings are informational
- the real build problem is the one that changes final asset bytes or stops the build with a non-preview-server error

If the `timestamp-*.mjs` `NotFound` ever reappears, first check whether preview-server prerendering was re-enabled or whether the React Router preview-server watcher regressed. It is still not a source-map upload problem.

### Why the browser build still uses legacy sourcemap upload

This repo keeps `unstable_subResourceIntegrity: true`, so emitted browser assets must stay byte-for-byte stable after hashing.

SRI only applies to **external** assets that React Router/Vite can manage in the generated HTML. Inline `<style>` and `<script>` blocks in `root.tsx` are not covered by SRI see [CSP for SSG and SSR](csp-ssg-ssr-guide.md) for the nonce/hash split.

The modern Sentry React Router build-end flow can inject debug IDs and rewrite generated JavaScript during upload. That is fine for some projects, but here it can invalidate the integrity hashes that the browser uses to load chunks.

Legacy sourcemap upload avoids that by:

- uploading the already-built `.js` and `.map` files
- leaving the emitted JavaScript bytes unchanged
- preserving the integrity values generated by React Router/Vite

In other words: modern upload is convenient, but legacy upload is the SRI-safe choice for the browser bundle.
The Worker build is the exception: it uses the Debug ID upload path so the deployed Worker bundle
itself carries Debug IDs, and Wrangler deploys the exact Vite-built artifact.

## Environment variables

### Browser local development

Recommended local `.env.local` values:

```bash
SENTRY_DSN=your-public-dsn
```

If you are only running development, you can omit `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE`.

What each one is used for:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | browser build/runtime / Deno server runtime / Worker runtime / BFF tunnel proxy | shared browser + server SDK config and tunnel allowlist |
| `SENTRY_AUTH_TOKEN` | Vite Sentry plugins | source map upload during builds |
| `SENTRY_RELEASE` | build/runtime | release name for source map upload, runtime release tagging outside development, and CSP security-report attribution |

Notes:

- `SENTRY_RELEASE` is **not a secret**, so do not store it in Wrangler secrets.
- This repo normally gets it from the build/deploy environment, for example `github.sha` in GitHub Actions.

### Browser integration gzip snapshot

The following gzip sizes were measured from the current browser integration experiment and are a handy reference when deciding whether an integration should stay deferred or move earlier.

| Integration | gzip size | Loading note |
| --- | ---: | --- |
| `browserProfilingIntegration()` | 9.61 kB | Lazy-loaded today keep deferred unless you need profiling earlier in startup. |
| `replayIntegration()` | 53.1 kB | Commented out today only enable when you want replay and can afford the extra bundle cost. |
| `viewHierarchyIntegration()` | 727 B | Lazy-loaded today lightweight DOM snapshot enrichment. |
| `httpClientIntegration()` | 6.59 kB | Lazy-loaded today browser-only request/response enrichment. |
| `extraErrorDataIntegration()` | 2.7 kB | Lazy-loaded today enriches custom error objects. |
| `elementTimingIntegration()` | 7.6 kB | Browser-only and Chromium-only loaded eagerly in `app/entry.client.tsx` so the earliest render/load metrics are available. |
| `contextLinesIntegration()` | 653 B | Lazy-loaded today useful mainly when the page contains inline JavaScript. |

- The deploy workflow sets `DEPLOYMENT_BUILD=true`, and the release define helper throws if `SENTRY_RELEASE` is missing or empty.
- If you ever want a fixed per-environment value in Wrangler, `vars` is the right place, not `secrets`, but that is not how this repo currently models release values.

### Cloudflare Worker runtime

`packages/frontend/wrangler.jsonc` currently provides:

- `vars.SENTRY_DSN`
- `env.canary.vars.SENTRY_DSN`
- `env.production.vars.SENTRY_DSN`

These are the important Worker runtime values:

| Wrangler value | Used by | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | browser build/runtime and `packages/frontend/worker.ts` | shared browser + Worker runtime DSN |

### GitHub Actions deploy workflow

`.github/workflows/deploy-cf-worker.yml` currently sets:

```yaml
SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
SENTRY_DSN: ${{ vars.SENTRY_DSN }}
SENTRY_RELEASE: ${{ github.sha }}
DEPLOYMENT_BUILD: 'true'
```

This covers the current build/deploy requirements for:

- React Router build-time Sentry plugin usage
- Worker build-time source map upload
- shared DSN injection at build time

## Commands

Useful commands for the current setup:

```bash
deno task dev
```

Starts the normal local dev stack. This uses:

- browser -> same-origin `/api/tunnel` in development
- local Worker runtime -> gateway `http://127.0.0.1:8787/api/tunnel` in development
- BFF `/api/tunnel` -> Spotlight sidecar on `8969` in development
- deployed environments -> same-origin `/api/tunnel` relay to Sentry ingest

```bash
deno task spotlight
```

Starts Spotlight by itself (MCP mode) if you want the sidecar on its own.

For local native Spotlight or blocked npm registry environments:

```bash
SPOTLIGHT_BINARY=spotlight SPOTLIGHT_MCP=1 deno task spotlight
```

```bash
deno task preview:worker
```

Builds the Worker and runs local Wrangler dev using a bundled Wrangler `preview` env so the generated chunk graph can resolve locally. Production deploys still keep `wrangler.jsonc` on `no_bundle: true`, plus explicit module rules for the generated Worker chunks.

```bash
deno task build
deno task build:worker
```

Build the Deno server or Worker targets with Sentry source map upload enabled when the build credentials are present.

## What the setup should look like for this stack

For this project, the intended setup is:

1. Browser app uses `@sentry/react-router`.
2. React Router SSR on Workers uses `@sentry/react-router/cloudflare` helpers only.
3. Cloudflare Worker runtime uses `@sentry/cloudflare` as the single initialized server SDK for the frontend worker.
4. Browser and local Worker dev telemetry both use same-origin/public `/api/tunnel`, and the BFF forwards that tunnel traffic to the Spotlight sidecar that `deno task dev` starts before launching the frontend and gateway dev tasks.
5. Worker runtime uses Wrangler runtime vars and sends to real Sentry.
6. Build-time source maps are uploaded by Sentry Vite plugins when credentials exist.

## Learnings and findings

### 1. `vite.config.ts` is the real dev source of truth

This repo's development setup actually runs through `vite.config.ts`.

That means:

- `reactRouter()` being present in `vite.config.ts` matters
- `sentryReactRouter(...)` also needs to be wired into `vite.config.ts`

It is not enough to configure Sentry only in production-only build configs if you want dev browser instrumentation to work correctly.

### 2. Browser dev should stay same-origin through the BFF

Official Spotlight docs use `spotlight: process.env.NODE_ENV === "development"` (or an explicit Spotlight URL) in the browser and wire the sidecar with `spotlight run`.

The correct approach for this setup is:

- use the shared `VITE_SENTRY_DSN` env name in browser config
- keep the production DSN in development
- send browser envelopes to same-origin `/api/tunnel`
- let the BFF forward those envelopes to the local Spotlight sidecar on `/stream` in development and to Sentry ingest outside development

### 3. The local worker split keeps responsibilities clear

The React Router server instrumentation in `app/entry.server.tsx` is only part of the overall request story.

For local development to stay close to production, this repo keeps the responsibilities split:

- the gateway owns browser-facing routing
- the frontend worker owns page shell, asset, and SSR handling
- the BFF owns the `/api/tunnel` proxy in every mode and the `/api/*` surface

That split keeps the local multi-process Cloudflare setup aligned with the deployed worker topology.

### 4. Worker-side Spotlight routing is not wired today

The current Worker path is still:

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

- browser dev -> Spotlight through `/api/tunnel`
- browser non-dev -> real Sentry
- Deno dev `/api/*` routes -> explicit server transactions in Spotlight
- Worker runtime -> real Sentry with `app_session_id` correlation
- Worker SSR branch -> `@sentry/react-router/cloudflare` helper wrapping inside the same Worker request
- build-time source maps -> uploaded when Sentry build credentials are present
- Worker-specific Spotlight routing -> not implemented yet
