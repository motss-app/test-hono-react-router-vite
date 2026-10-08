# Sentry v11 Migration: Findings, Breaking Changes, and New Features

For a scannable summary table first, see [sentry-v11-quick-reference.md](./sentry-v11-quick-reference.md). This document is the long-form version.

This document records the upgrade of the Sentry JavaScript SDK from `10.75.2` to `11.5.0` for this
repository. It is based on the official migration guide at
<https://docs.sentry.io/platforms/javascript/guides/cloudflare/migration/v10-to-v11/>, cross-checked
against the actual installed `11.5.0` type definitions and runtime code.

Scope of the upgrade:

- `@sentry/browser` `10.75.2` to `11.5.0`
- `@sentry/cloudflare` `10.75.2` to `11.5.0`
- `@sentry/react-router` `10.75.2` to `11.5.0`
- `@sentry/vite-plugin` `5.4.0` to `5.4.1`

## Version support prerequisites

| Requirement | v11 requirement | This repository | Status |
| --- | --- | --- | --- |
| TypeScript | `5.0.4` or newer | `7.0.2` | Already satisfied |
| Node.js | `20.19.0` or newer | not applicable, Workers runtime | Already satisfied |
| Self-hosted Sentry | `26.4.2` or newer | hosted at `sentry.io` | Already satisfied |

## Breaking changes that applied to this repository

Every item below was found in the codebase and has been migrated. Items marked as not applicable
were checked and confirmed absent.

### 1. The `@sentry/cloudflare/nodejs_compat` subpath was removed

Node.js compatibility is now required for every Cloudflare SDK user, so the separate entry point is
gone. The affected import sites were:

- `packages/gateway/src/worker.ts`
- `packages/frontend/worker.ts`
- `packages/frontend/app/ssr-handler.ts`
- `packages/frontend/app/entry.server.tsx`
- `packages/frontend/app/monitoring/sentry.ts`, for the `CloudflareOptions` type
- `packages/bff/src/worker.ts`

All six now import from `@sentry/cloudflare`. This was the change most likely to be missed, because
the runtime failure only appears when a Worker module graph is resolved. A plain typecheck did not
catch the two React-side files, and the dev server failed with `"./nodejs_compat" is not exported`.
Treat a search for `nodejs_compat` as a required post-upgrade check.

### 2. The `nodejs_als` compatibility flag was replaced by `nodejs_compat`

All three Workers listed both flags. `nodejs_compat` was already present, so the redundant
`nodejs_als` entry was removed from `packages/frontend/wrangler.jsonc`,
`packages/gateway/wrangler.jsonc`, and `packages/bff/wrangler.jsonc`.

The flag must stay explicit here. Workers only enable `nodejs_compat` by default from a
`compatibility_date` of `2026-08-04`, and this repository uses `2026-05-13`.

### 3. Span streaming replaced transactions

This is the largest behavioral change. Transactions no longer exist. The SDK sends spans in small
batches as they finish, and what used to be one transaction event is now a service span.

Consequences that affected this setup:

- `beforeSendTransaction` no longer runs
- `ignoreTransactions` no longer runs
- `beforeSendSpan` now receives a `StreamedSpanJSON` payload and cannot drop a span
- the 1000 span per transaction cap no longer applies
- scope `tags` and `extra` no longer reach spans

Migration applied in `packages/frontend/app/monitoring/sentry.ts`:

- dev asset and tunnel filtering moved from `ignoreTransactions` to `ignoreSpans`
- catch-all name normalization moved from `beforeSendTransaction` to `beforeSendSpan`, keyed on
  `is_segment`
- the load test bail-out, which used to return `null` from `beforeSendTransaction`, now sets
  `tracesSampleRate: 0` in load test mode. This is a closer match to the original intent, because
  spans are then never created rather than created and discarded

Important detail worth remembering: in stream mode `ignoreSpans` is evaluated at span start, and
`beforeSendSpan` can only change a span, never drop it. Dropping therefore has to happen in
`ignoreSpans`, using attributes that are already populated at that point. In this stack `url.path`
is set before the span starts, while the span name is only the HTTP method until a route resolves,
so the filters match on the `url.path` attribute.

### 6. The `beforeSendSpan` payload shape changed

Field renames applied to `applyAppSessionIdToSpan` in
`packages/frontend/app/monitoring/app-session.ts`, which previously wrote to `span.data`:

| v10 field | v11 field |
| --- | --- |
| `description` | `name` |
| `data` | `attributes` |
| `op` | `attributes['sentry.op']` |
| `timestamp` | `end_timestamp` |
| `status` as a string | `status` as `'ok'` or `'error'` |

The local constraint type was widened to `Record<string, unknown>` because
`StreamedSpanJSON['attributes']` is `RawAttributes<Record<string, unknown>>`, whose index signature
is `unknown`. A narrower constraint silently downgraded the return type and broke the
`withSentry` options contract.

### 7. `sendDefaultPii` was removed in favor of `dataCollection`

`packages/frontend/app/monitoring/sentry.ts` set `sendDefaultPii: true`. The guide states that the
v11 default already matches that behavior, so the option was simply removed. See the privacy
section below before changing this.

### 8. `enableLogs` was removed

Logs and metrics are now captured whenever their APIs are used, such as the existing `logger.info`
calls, or when a logging integration is added. `enableLogs: true` was removed.

### 9. `enableRpcTracePropagation` was removed

Callers now propagate only to bindings named in `rpcTracePropagationBindings`, and instrumented
receivers read incoming trace context automatically. The gateway already passed an explicit
`['FRONTEND', 'BFF']` allow list, so the receiver-side flag was dropped from the shared options
factory and the stale comments in all three Workers were updated.

### 10. The Cloudflare Vite plugin `_experimental` block was removed

All three Vite configs passed `_experimental.autoInstrumentation` and
`_experimental.useDiagnosticsChannelInjection`. Both became top-level options that default to
`true`, so the explicit block was dropped and the configs now call `sentryCloudflareVitePlugin()`
with no options.

Two things are therefore enabled by default rather than opted out:

- `buildTimeInstrumentation` injects `diagnostics_channel.tracingChannel` calls into bundled
  dependencies so the SDK can trace them without monkey-patching. This repository has no database
  client or other instrumented dependency, so it currently has no effect.
- The plugin wraps the Worker entry with `Sentry.withSentry()` and adds this worker's own Durable
  Objects and self service bindings to `rpcTracePropagationBindings`. Already-wrapped entries are
  left alone, so the manual `withSentry` wrapping in the three Workers is not double-wrapped.

The plugin only adds self bindings and this worker's own Durable Objects. Bindings to other workers
stay opt-in, so the gateway's hand-written `['FRONTEND', 'BFF']` allow list is not widened by the
plugin.

### 11. `sentryReactRouter` and the build options moved to the `/vite` subpath

`sentryReactRouter` is no longer exported from the package root, and `SentryReactRouterBuildOptions`
moved with it. Updated in `packages/frontend/vite.config.ts` and `vite-utils/sentry-build.ts`.

### 12. `unstable_sentryVitePluginOptions` was removed

`release` is now a top-level build option. The wrapper was dropped in `vite-utils/sentry-build.ts`
while keeping the same `dist` value, so source map upload release naming is unchanged.

### 13. `captureMessage` events now attach a stack trace

This was the most subtle change. `captureMessage` events and non-`Error` values passed to
`captureException` now attach a synthetic stack trace pointing at the call site. Events with a stack
trace count as errors, so the informational `captureMessage('entry.client initialized')` in
`packages/frontend/app/entry.client.tsx` would have marked every development session as errored and
skewed the crash-free session rate.

It was removed. An equivalent `logger.info` call already runs on the line above, and the guide
recommends Sentry Logs for purely informational output.

## Changes checked and found not applicable

- `honoIntegration`, `instrumentD1WithSentry`, `instrumentPrototypeMethods`, `wrapRequestHandler`,
  `Scope.clear()`, `createSpanEnvelope`, `spanToStreamedSpanJSON`, `withStreamedSpan`,
  `disableInstrumentationWarnings`, and `inboundFiltersIntegration` are not used here
- `enableMetrics` was not used
- `otlpIntegration` and the OpenTelemetry setup path are not used, so the removal of automatic
  OpenTelemetry setup has no effect
- `sentry-chunking.ts` matches Sentry internal module paths such as
  `/integrations/extraerrordata.js`. These paths are unchanged in v11, confirmed by checking that all
  six code-splitting groups still produce their own chunks in a production build
- AI integrations and profiling are not used

## Behavior changes to be aware of in deployed environments

These are not compile errors. They change what production data looks like.

### Span names are now low cardinality

Client-supplied values were removed from span names, which affects any saved views, dashboards,
alerts, or filters built on the old names. Observed in this stack:

| Span op | v10 style | v11 style |
| --- | --- | --- |
| `http.server` with a resolved route | `GET /en-US/hono-rpc` | `GET /:locale?/hono-rpc` |
| `http.server` without a resolved route | `GET /en-US` | `GET` or `GET /en-US` after local renaming |
| `http.client` | `POST https://us.i.posthog.com/...` | `POST us.i.posthog.com` |
| `pageload` | `/en-US/about` | `/:locale?/about` |

The details that names dropped stay available as attributes, for example `url.full`, `url.domain`,
`http.route`, and `db.query.text`.

One deliberate exception: `normalizeServiceSpanName` in `app/monitoring/sentry.ts` rewrites a
method-only service span name into `METHOD /path` so that Spotlight shows a readable top-level
route instead of a bare `GET`. This trades a small amount of cardinality for readability in local
development. Consider removing it if high-cardinality route names ever become a problem in Sentry.

### 4. Server loaders and actions need the instrumentation API

`@sentry/react-router` is out of beta in v11 and fully relies on React Router's instrumentation API.
The deprecated `wrapServerLoader` and `wrapServerAction` wrappers were removed, so loader and action
spans are only emitted when `entry.server.tsx` exports an `instrumentations` array built with
`createSentryServerInstrumentation()`. `wrapSentryHandleRequest` still covers rendering, but it does
not add the route hooks.

`packages/frontend/app/entry.server.tsx` now exports:

```ts
export const instrumentations: ServerInstrumentation[] = [createSentryServerInstrumentation()];
```

Without it, loader and action work in routes such as `root.tsx`, `ssr.tsx`, and `errors.$code.tsx`
would silently disappear from server traces.

The export is imported from `@sentry/react-router/cloudflare`, which only re-exports
`createSentryServerInstrumentation` from `11.5.0` onward. On `11.4.0` the symbol exists only on the
root and `/server` entries, and neither resolves under the conditions this repository's builds use,
so the version bump to `11.5.0` is a hard prerequisite for this fix. Verified by building: on
`11.4.0` the prerender step fails with `The requested module '@sentry/react-router/cloudflare' does
not provide an export named 'createSentryServerInstrumentation'`.

### 5. Browser sessions default to one session per page load

The default `lifecycle` of `browserSessionIntegration` changed from `'route'` to `'page'`. In `'page'`
mode a session is created once when the page loads and is not renewed on navigation. In `'route'`
mode a new session is also started on every history change where the URL actually changed.

The new default is the better definition, and this repository accepts it rather than pinning the old
one. A session is meant to approximate one app usage, and for a client-side routed app one page load
is one usage. Navigating between routes is continued use of the same app instance, not a new usage.
Under `'route'` the session count becomes a navigation counter, so a user who clicks through twenty
routes contributes twenty sessions and session volume stops meaning "how many people used the app".

`'route'` also dilutes the crash signal. A user who hits an error on the third of twenty routes marks
one of twenty sessions errored, which reads as 95% crash-free even though that user had a broken
experience. Under `'page'` the single session is errored, which reads as 0% for that user.

The old behavior was also an artifact of the transaction model. v10 created a new pageload
transaction per client-side navigation and coupled sessions to transactions, so one session per
navigation fell out for free. v11 replaced transactions with span streaming and soft navigations,
which broke that coupling, so `'route'` is now legacy residue rather than a deliberate design.

`browserSessionIntegration` remains auto-registered as a default integration, so sessions are still
collected with no explicit configuration. The only change is the lifecycle. The consequence is that
session counts and the crash-free denominator will drop relative to v10, so any dashboard, alert, or
saved search that reads absolute session counts needs rebaselining after this upgrade.

### 6. Data collection is broader by default

An unset `dataCollection` in v11 collects more than v10 did with `sendDefaultPii: true`, most
notably cookies and full request and response bodies. Sensitive value scrubbing matches on key name
and is best effort, so a credential stored under an innocuous key would still be transmitted.

This repository removed `sendDefaultPii` and pinned an explicit `dataCollection` baseline in
`createBaseOptions`, so the broader v11 default does not apply here. Cookies and HTTP bodies are off,
which matters because this app issues an `app_session_id` cookie and accepts POST bodies on `/api/*`.
Headers, user info, query params, and stack frame variables stay on because they are used for
debugging. Every category disabled is one this repo has no integration for, so nothing is lost.
`frameContextLines` is set to 7 to restore the v10 default.

### Dedupe now compares errors across requests

v10 created a new client per request, so Dedupe never compared errors from different requests. v11
reuses one client per isolate, so a repeated error can produce a lower event count than before.
Repeated errors from many requests in a row may look "fixed" in event volume without being fixed.

### Trace propagation matching is case-insensitive

String and regular expression targets no longer depend on casing, and the `g` and `y` flags are
ignored. The existing targets in this repository use anchored regular expressions without those
flags, so behavior is unchanged. Worth noting for any future target added as a plain host string.

## New features worth enabling

These are opportunities, not changes applied by this migration.

### 1. Add `@sentry/hono` middleware

`honoIntegration` was removed from `@sentry/cloudflare`, and the replacement is a separate
`@sentry/hono` package, which is also published at `11.5.0`. This repository runs Hono in all three
Workers. The middleware would add Hono-specific span naming and request context that the generic
`http.server` integration cannot provide, and it would be the natural way to get meaningful route
names in place of the local `normalizeServiceSpanName` workaround.

### 2. Pin `traceLifecycle: 'stream'` explicitly

Stream mode is already the default, but setting it explicitly documents the intent and protects
against a future default change. If a rollback ever needs transaction semantics, the guide
documents `traceLifecycle: 'static'` along with `Sentry.withStaticSpan` for the callback wrapper.
Transaction mode is compatibility only and is scheduled for removal.

### 3. Move from `ignoreSpans` name matching to attribute matching

Currently the filters match `url.path`, which works. Once the route templates are resolved, matching
on `http.route` would be both lower cardinality and independent of URL shape.

### 4. Add session replay or profiling to the Workers

`profileLifecycle: 'trace'` and replay sample rates are already configured for the browser.
`@sentry/cloudflare` v11 supports continuous profiling on Workers through the Vite plugin, which is
not currently enabled.

### 5. Review `dataCollection` categories individually

v11 exposes per-category control. Tying `httpBodies` to an allow list for known API routes, and
setting `frameContextLines` explicitly, would make the privacy posture readable in config instead of
implicit.

### 6. Re-evaluate the manual Vite plugin instrumentation choice

With `autoInstrumentation` enabled, the plugin can wrap Worker entries and instrument database
clients at build time, which is the approach that works on workerd. This repository keeps manual
`withSentry` wrappers, which is still fully supported. Worth revisiting if Durable Objects are
introduced, since they would then need their own explicit instrumentation.

## Verification performed

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `deno task check` | pass, exit 0 |
| Lint | `deno run -P=lint npm:@biomejs/biome check .` | pass, 167 files, no findings |
| Format | `deno run -P=format npm:@biomejs/biome format --write .` | applied, no remaining changes |
| Unit tests | `deno task test` | pass, 2 files, 4 tests |
| Production build | `deno task build` | pass, exit 0, all six Sentry chunks emitted |

Runtime verification against the local dev stack:

- the gateway, frontend worker, BFF, and browser all reported SDK version `11.5.0`
- the `SpanStreaming` integration installed, confirming stream mode is active
- a page load produced a 155 span trace with no transaction cap
- the captured span payload used the v11 shape, with `name`, `attributes`, `is_segment`,
  `end_timestamp`, and `status`
- `app.session_id` appeared on both the browser `pageload` span and the frontend worker service
  span with the same value, confirming the scope tag to attribute migration works end to end
- RPC trace propagation still links gateway, frontend worker, and browser into a single trace after
  removing `enableRpcTracePropagation`
- dev asset noise was dropped. The browser requested `/@fs/...`, `/~virtual:theme-bootstrap.js`,
  and font assets, and only `/en-US*` requests produced server spans
- the browser posted envelopes through `/api/tunnel` with HTTP 200 and no Sentry console errors
- SSR rendering and client navigation were checked in a real browser on `/en-US/about` and
  `/en-US/hono-rpc`

### Known blocker: the local Spotlight UI is broken independently of this migration

`@spotlightjs/spotlight@4.11.8` returns HTTP 500 on every route in this environment, including the
`/stream` ingest endpoint. The cause is inside Spotlight's own published package graph, which mixes
its vendored `hono@4.12.25` CORS middleware with `hono@4.13.12` as the app runtime, producing
`TypeError: ctx.req.query(...).toString is not a function`.

This is unrelated to the Sentry SDK upgrade, it is not caused by any change in this repository, and
pinning Hono in an isolated install did not resolve it. Because Spotlight could not be used to
inspect traces, runtime verification was performed by binding a minimal envelope sink on port 8969,
the same port and path the BFF tunnels to, and asserting on the real envelopes the SDK emitted. That
is stronger evidence than reading the Spotlight UI, but it does mean the Spotlight UI itself remains
unverified and blocked until the upstream packaging bug is fixed.

## Residual risks and follow-ups

The `dataCollection` baseline is implemented. `createBaseOptions` in
`packages/frontend/app/monitoring/sentry.ts` sets `cookies: false` and `httpBodies: []`, so this
app does not transmit cookies or request and response bodies. The remaining items are:

1. Update any Sentry dashboards, alerts, or saved searches that reference old transaction names or
   the `GET /*` naming described above.
2. Check whether any external tooling, such as the Sentry CLI upload step in CI, depends on
   `unstable_sentryVitePluginOptions` semantics that moved.
3. Re-enable the benchmark task if performance needs re-baselining. Stream mode removes per
   transaction batching, so overhead characteristics differ from v10.
4. Revisit the local Spotlight packaging bug so `deno task dev` gives a working UI again.
5. Scrubbing remains best effort and matches on key name only, so review
   [`dataCollection`](https://docs.sentry.io/platforms/javascript/guides/cloudflare/configuration/options/#dataCollection)
   if a new category is ever enabled.