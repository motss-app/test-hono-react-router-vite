# CSP and Document-Policy

Companion to [`csp-ssg-ssr-guide.md`](./csp-ssg-ssr-guide.md), which covers the
high-level nonce-vs-hash-vs-`'self'` rule of thumb. This document goes deeper
on the source-expression model, the dev/prod asymmetry, the
`Document-Policy: js-profiling` opt-in for Sentry browser profiling, and the
two recent fixes (`c80400a`, `61aaa75`) that the dev/prod split depends on.

## TL;DR

- CSP separates **inline** content from **external** content. Inline needs a
  nonce or a hash. External needs a source-expression match.
- `'self'` is the **exact origin** of the page (scheme + host + port), not the
  whole domain and not any subdomain. Subdomains need explicit listing.
- This project ships a per-route hash-based `Content-Security-Policy` baked
  into `build/client/_headers` at build time, plus a single
  `Document-Policy: js-profiling` header to opt the document into the
  browser's JS Self-Profiling API (which Sentry's browser-profiling
  integration depends on).
- The dev server **deliberately** does not send any CSP or Document-Policy
  headers. The SSR handler short-circuits in dev so Vite's HMR runtime and
  dev-only modules are not blocked, and Sentry's CSP reporting endpoint
  does not get a flood of false violations. The Sentry browser-profiling
  integration is therefore gated on `!isDevSentryMode` so dev doesn't load
  an integration that would immediately fail to instantiate.

## The source-expression model in detail

### Inline vs external

CSP's `script-src` and `style-src` (and the related `*-attr`, `*-elem`
splits) only restrict two things:

| Form | What unblocks it |
|---|---|
| `<script>…inline code…</script>` / `<style>…inline…</style>` / `style="…"` | matching `'nonce-…'`, matching `'sha256-…'` / `'sha384-…'` / `'sha512-…'`, or `'unsafe-inline'` |
| `<script src="…">` / `<link rel="stylesheet" href="…">` | the URL/origin matches a source expression (`'self'`, scheme, host, wildcard host) |
| `eval()`, `new Function(…)` | `'unsafe-eval'` (orthogonal to the inline-vs-external axis) |

Note: the CSSOM's `adoptedStyleSheets` API and `CSSStyleSheet.insertRule()` are
**not** observed by `style-src`. They are programmatic DOM operations, not
`<style>` elements. This is the trick that lets the `ve-css-text` plugin
bundle vanilla-extract CSS into the JS chunk and have it installed at runtime
without `'unsafe-inline'` or per-route hashes for styles.

### What `'self'` actually matches

`'self'` is the protected page's origin (scheme + host + port). It does
**not** mean "any host I own" and it does **not** automatically include
subdomains. So:

| Page URL | External URL | `'self'` match? |
|---|---|---|
| `https://example.com/page` | `https://example.com/app.js` | yes |
| `https://example.com/page` | `https://api.example.com/app.js` | **no** — different host |
| `https://example.com/page` | `https://example.com:8443/app.js` | **no** — different port |
| `https://example.com/page` | `http://example.com/app.js` | **no** — different scheme |

To include subdomains, list them explicitly or use a wildcard on the host
label:

- `https://cdn.example.com` — that one host
- `https://*.example.com` — any subdomain over HTTPS
- `https:` — any HTTPS origin (rarely what you want; avoid in production)

### External hosts

Each external host has to be listed, either as a specific host, a wildcard,
or a scheme. There is no implicit "anything that is not `'self'` is OK" — the
default if nothing matches is to **block**.

## How this project applies it

### Production build pipeline

The pipeline that produces the per-route CSP is:

1. `reactRouter()` plugin runs the prerender step (`buildApp` hook in
   `react-router@8.1.0`), which emits static HTML for each route.
2. `headersCopyPlugin` (`vite-plugins/copy-headers.ts`) runs in its own
   `buildApp` hook with `order: "post"`. It reads the prerendered HTML,
   collects inline script/style hashes via `collectInlineHashes`, and writes
   `build/client/_headers` with one `Content-Security-Policy` directive per
   route.
3. Cloudflare Pages serves the `_headers` file at the edge.

The `buildApp` ordering matters: in `react-router@8.1.0`, the prerender moved
into a dedicated `prerender` plugin that fires in `config.builder.buildApp`
with `order: "post"`, which executes after every per-environment
`closeBundle`. The previous `closeBundle` hook in `headersCopyPlugin` ran
before the prerender step and saw zero routes on disk. The fix in `c80400a`
moved this plugin to `buildApp` with `order: "post"` so it runs after
React Router's prerender. Now `build/client/_headers` contains a
`Content-Security-Policy` directive per prerendered route (10 routes in
this repo).

### What each route's directive looks like

For a prerendered route, `build/client/_headers` ends up with (paraphrased):

```text
/
  Cache-Control: public, max-age=600, s-maxage=3600, …
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://static.cloudflareinsights.com 'sha384-…' 'sha384-…' …; style-src 'self' 'sha384-…' 'sha256-yA3qHWL4K3kukdLY/T+1vlN/z6FrxQQRjp6/L8l7snM='; font-src 'self'; img-src 'self' data:; frame-src 'self'; connect-src 'self' https://cloudflareinsights.com https://o237444.ingest.us.sentry.io; report-uri https://o237444.ingest.us.sentry.io/api/4511078663782400/security/?…; report-to csp-endpoint
  Report-To: {"endpoints":[…], "group":"csp-endpoint", …}
  Reporting-Endpoints: csp-endpoint="https://…"
```

- `script-src 'self' https://static.cloudflareinsights.com 'sha384-…' …` —
  own-origin JS, the Cloudflare analytics script, and hashes for the SSR
  boot script.
- `style-src 'self' 'sha384-…' 'sha256-…'` — own-origin styles and hashes
  for the one Cloudflare analytics inline style.
- `connect-src 'self' https://cloudflareinsights.com https://…ingest.us.sentry.io` —
  own-origin + the two external hosts the browser actually `fetch()`s
  against (analytics beacons and Sentry tunnel).
- The enforced `Content-Security-Policy` appends `report-uri` / `report-to`
  so violations land in Sentry.
- The hashes are stable per route; they're computed at build time from the
  actual content of the SSR boot script and analytics inline style.

### Why lazy chunks are not a problem

A `React.lazy(() => import('./Foo'))` becomes a separate chunk file (e.g.
`Foo-abc123.js`) served from `'self'`. The browser's module loader fetches
it via a dynamic `import()` and runs it as an external script. That's
allowed by `script-src 'self'` — no inline content, no hash, no nonce
required. The CSP has no opinion about chunks loaded this way; it only
cares about the initial HTML's inline content and about cross-origin
external loads.

### Why runtime CSS injection is not a problem in this repo

The `ve-css-text` Vite plugin (registered in
`packages/frontend/vite.react-router.config.ts`) transforms every
`*.css.ts` (vanilla-extract) file so the CSS string is bundled into the JS
chunk. At runtime, the consuming component installs the CSS via
`adoptedStyleSheets` (or via the plugin's wrappers that do the same thing).
Because CSP's `style-src` does not observe `adoptedStyleSheets`, no
inline-style hash or `'unsafe-inline'` is required for these styles.

If you ever switch off `ve-css-text` and let vanilla-extract emit
standalone `.css` files instead, those get loaded via `<link
rel="stylesheet" href="…">` from `'self'` and are likewise covered by
`style-src 'self'`. Either path avoids the only thing that would force you
to add hashes/nonces for styles.

## `Document-Policy: js-profiling` and Sentry browser profiling

### What the header is for

The W3C [`js-self-profiling`][js-self-profiling] spec defines a `js-profiling`
document policy that opts the document into the browser's `Profiler` API.
Sentry's `@sentry/browser` `browserProfilingIntegration` instantiates that
API on the client. Without the opt-in, the browser throws when the
integration tries to construct a `Profiler`, and Sentry prints:

```text
[Profiling] Failed to initialize the Profiling constructor, this is likely due to a missing 'Document-Policy': 'js-profiling' header.
[Profiling] Disabling profiling for current user session.
```

The opt-in is set as a response header:

```http
Document-Policy: js-profiling
```

This is what the SSR handler does in `applySsrResponseHeaders` (via
`csp.buildDocumentPolicy()`), and what `headersCopyPlugin` writes into
`build/client/_headers` for each prerendered route.

### The dev/prod asymmetry

The same SSR handler that sets the `Content-Security-Policy` and the
`Document-Policy: js-profiling` header in production is gated on
`isHtmlResponse`, which requires `import.meta.env.PROD` to be true:

```ts
function isHtmlResponse(responseHeaders: Headers): boolean {
  return Boolean(
    import.meta.env.PROD && responseHeaders.get('Content-Type')?.includes('text/html')
  );
}
```

So in dev, no `Content-Security-Policy` and no `Document-Policy` is sent.
This is deliberate:

- The dev render path is structurally different from prod: Vite injects an
  HMR runtime and dev-only modules that the production `script-src` would
  block.
- The enforced CSP's `report-uri` / `report-to` reporting would otherwise
  send a flood of false-positive violation reports to Sentry for those
  HMR scripts.
- `cspNonce` is `null` in dev (the render path doesn't stamp matching
  nonces onto emitted tags), so a nonce-based CSP would block every
  inline script in dev.
- `SENTRY_RELEASE` is not guaranteed in dev, and the handler throws if
  it isn't defined.

That last one is the reason this gate is more than "skip CSP in dev" — the
whole `applySsrResponseHeaders` body assumes a fully prod-shaped request.

The cost of the gate is that the `Document-Policy: js-profiling` opt-in is
also not sent in dev, which means the browser's `Profiler` API is not
available, which means Sentry's browser-profiling integration would
silently fail to instantiate. The integration is therefore gated on
`!isDevSentryMode` in `packages/frontend/app/entry.client.tsx`:

```ts
{
  // Don't load the browser-profiling integration in development.
  // The browser's `Profiler` API requires the document to opt in via
  // `Document-Policy: js-profiling`, but the SSR handler intentionally
  // short-circuits CSP/Document-Policy headers in dev (see
  // `isHtmlResponse` in `app/ssr-handler.ts`) so HMR and dev-only
  // scripts aren't blocked. Without the opt-in, the browser logs
  // `[Violation] Document policy violation: js-profiling is not
  // allowed in this document` and Sentry silently disables
  // profiling for the session. Skip the integration in dev instead.
  enabled: !isDevSentryMode,
  loader: () =>
    import('./monitoring/lazy-browser-integrations/browser-profiling.ts').then(
      mod => mod.browserProfilingIntegration
    ),
},
```

This matches the pattern the same file already uses for the
(commented-out) Replay integration, and the rest of the
`profileSessionSampleRate = 1.0` / `profileLifecycle: 'trace'` config in
`packages/frontend/app/monitoring/sentry.ts` still applies in canary and
production.

The browser will still log a one-time
`[Violation] Document policy violation: js-profiling is not allowed in this document.`
in dev if the integration is loaded. The fix in `61aaa75` prevents the
integration from being loaded at all in dev, which removes both that
browser warning and the Sentry debug log.

## Recent fixes this depends on

Two commits on the `migrate-to-vanilla-extract` branch are load-bearing
for the CSP / Document-Policy story above:

- `c80400a chore(deps): bump Vite to 8.1.1 and React Router to 8.1.0` —
  also fixed the CSP regression in `vite-plugins/copy-headers.ts`
  (switched from `closeBundle` to `buildApp` with `order: "post"` so it
  runs after React Router's new `prerender` plugin). Before this, all 10
  prerendered routes had **no** `Content-Security-Policy` directive in
  `build/client/_headers`.
- `61aaa75 fix(frontend): skip Sentry browser-profiling integration in dev` —
  gates the lazy integration on `!isDevSentryMode` so dev doesn't log the
  `Document-Policy: js-profiling` violation and Sentry doesn't print the
  matching debug line.

If you `git revert` either, expect either: (a) prerendered HTML files to
ship without CSP / Document-Policy headers, or (b) the dev console to
fill with `[Violation] Document policy violation: js-profiling is not
allowed in this document` and Sentry's `[Profiling] Disabling profiling
for current user session`.

## Common pitfalls

- **Don't add `'unsafe-inline'` to `script-src` or `style-src`.** The whole
  point of the per-route hashes is to keep inline content explicit and
  allowlisted. If you need a new inline script, add its hash instead.
- **Don't remove the `import.meta.env.PROD` gate in
  `applySsrResponseHeaders`.** It's load-bearing for HMR in dev, for the
  Sentry CSP report rate in dev, for the `cspNonce` story, and for
  the `SENTRY_RELEASE` requirement. If you need additional headers in
  dev, add a separate hook or a different gate — don't remove this one.
- **Don't re-enable the browser-profiling integration unconditionally in
  dev.** Either keep the `!isDevSentryMode` guard, or also send
  `Document-Policy: js-profiling` from the dev server (which would
  require either adding the header at the Vite dev-server level or
  removing the `import.meta.env.PROD` gate in
  `applySsrResponseHeaders`, with all the side effects listed above).
- **Don't assume `'self'` covers subdomains.** Add the explicit host
  (`https://cdn.example.com`) or wildcard (`https://*.example.com`) for
  each external service. Common offenders to remember: the analytics
  script host, the Sentry ingest host, any CDN that hosts static assets.
- **After modifying the CSP builder, regenerate `_headers`.** Run
  `deno task build:frontend` and verify `build/client/_headers` still
  contains a `Content-Security-Policy:` line per prerendered route, plus
  the `Document-Policy: js-profiling` line.

## Cross-references

- [`csp-ssg-ssr-guide.md`](./csp-ssg-ssr-guide.md) — high-level nonce vs
  hash vs `'self'` rule of thumb, React Router integration, third-party
  resource patterns.
- `packages/frontend/app/utils/csp.ts` — `csp.buildPolicy`,
  `csp.buildDocumentPolicy`, `collectInlineHashes`, `cloudflareAnalyticsStyleHashes`.
- `packages/frontend/app/ssr-handler.ts` — `applySsrResponseHeaders`, the
  `isHtmlResponse` gate, the `cspNonce` flow.
- `vite-plugins/copy-headers.ts` — `headersCopyPlugin`, the
  `buildApp`/`order: 'post'` hook that runs after React Router's
  prerender, `buildStaticRouteHeaders` per-route template.
- `packages/frontend/app/entry.client.tsx` — Sentry init,
  `lazyLoadBrowserIntegration` list, `!isDevSentryMode` guard for
  browser-profiling.
- `packages/frontend/app/monitoring/sentry.ts` —
  `profileSessionSampleRate = 1.0`, `profileLifecycle: 'trace'`.
- `packages/frontend/vite.react-router.config.ts` — where
  `ve-css-text`, `reactRouter`, and `headersCopyPlugin` are registered.
- `packages/frontend/vite-plugins/ve-css-text/` — the `ve-css-text`
  plugin source.

[js-self-profiling]: https://wicg.github.io/js-self-profiling/
