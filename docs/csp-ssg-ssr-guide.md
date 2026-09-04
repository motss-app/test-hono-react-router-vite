# CSP for SSG and SSR

Use this rule of thumb:

- **SSR + inline code** → use a **nonce**
- **SSG + inline code** → use a **CSP hash**
- **External same-origin assets** → usually just allow `'self'`
- **External third-party assets** → allow the host, and optionally add `integrity`

## Nonce vs hash vs integrity

### Nonce

Allows specific inline `<script>` and `<style>` tags for one response.

Use it for **SSR**, where the server can generate a fresh value per request.

### CSP hash

Allows a specific inline script or style by hashing its exact contents.

Use it for **SSG**, where the HTML is fixed at build time.

### Integrity

Verifies the bytes of an **external** fetched resource such as:

- `<script src="...">`
- `<link rel="stylesheet" href="...">`

It does **not** apply to inline code and it does **not** replace CSP.

## Same-origin vs external resources

### Same-origin external resources

Usually this is enough:

```http
script-src 'self';
style-src 'self';
font-src 'self';
img-src 'self' data:;
```

For same-origin JS and CSS, `integrity` is optional. In this repo we do **not** use it for our own-domain bootstrap script anymore.

### Third-party resources

For each third-party service, identify the directive(s) it needs, add the host, and verify both SSR and SSG output. Two examples in this repo are:

- Turnstile uses `https://challenges.cloudflare.com/turnstile/v0/api.js`, so `script-src` should allow `https://challenges.cloudflare.com` and `frame-src` should allow the same origin for the widget frame.
- Cloudflare Analytics shares its style hashes through `cloudflareAnalyticsStyleHashes`, and `app/ssr-handler.ts` plus `vite-plugins/copy-headers.ts` both feed that list into `csp.buildPolicy()` so SSR and SSG stay aligned.

If the third-party URL is stable, `integrity` can be worth adding.

## Current repo behavior

### SSR pages

For request-time HTML, React Router needs a request-specific nonce so inline styles and streamed document scripts stay CSP-compliant.

- `app/ssr-handler.ts` creates a fresh nonce in production and stores it on the request with `csp.setNonce()`.
- `app/entry.server.tsx` reads the nonce with `csp.getNonce(request)` and passes it to `ServerRouter` and `renderToReadableStream`.
- `app/root.tsx` reads the nonce from the loader and passes it to `RootDocumentHead` and `RootDocumentScripts`.
- `app/components/root-document-head.tsx` applies the nonce to inline critical CSS.
- `app/components/root-document-scripts.tsx` applies the nonce to `ScrollRestoration` and `Scripts`.
- `app/ssr-handler.ts` uses the nonce when building the runtime `Content-Security-Policy` header.

This is needed because React Router emits inline document scripts during SSR.

### SSG pages

For prerendered HTML:

- `discoverPrerenderRoutes()` defines which routes are SSG
- `vite-plugins/copy-headers.ts` reads each prerendered HTML file
- it hashes inline `<script>` and `<style>` blocks
- it appends route-specific `Cache-Control` and CSP entries to `build/client/_headers`
- the build emits deterministic `index.html.gz` files with `gzip -n -9` for each SSG page,
  but the Worker does not serve them: the ASSETS service binding auto-decompresses `.gz`
  bodies even with `Content-Type: application/gzip`, which would double-encode the response
- the Worker fetches the plain `/_ssg/<route>/index.html` asset before the SSR fallback and
  compresses it at request time with `CompressionStream('gzip')`, then sets
  `Content-Encoding: gzip`, the compressed `Content-Length`, and `Vary: Accept-Encoding`
- the compressed response is constructed with `encodeBody: 'manual'`. This is required: the
  Workers platform treats a response with `Content-Encoding` as a request to compress, and
  without `encodeBody: 'manual'` it wraps the already-compressed body in a second gzip layer
  (verified on canary — browsers decoded one layer and rendered raw gzip bytes).
  `Cache-Control: no-transform` does not suppress this; only `encodeBody: 'manual'` does.
  See the Workers `Response` docs ("The `encodeBody` option") and the accepted Cloudflare
  staff answer in community topic 117536
- generated SSG HTML uses `Cache-Control: no-transform`, so intermediaries must not inject
  or rewrite HTML after CSP hashes are computed
- Cloudflare Analytics reuses `cloudflareAnalyticsStyleHashes`, so the generated SSG policy matches the runtime SSR policy.
- it also adds `report-uri` / `report-to csp-endpoint` to the enforced `Content-Security-Policy`
  and emits `Report-To` and `Reporting-Endpoints` so Sentry can receive CSP security reports from prerendered pages
- the Sentry report URI is built from `SENTRY_DSN` and carries `sentry_environment` and `sentry_release`, so canary and production reports stay attributable to the right build

This is used for both production and canary builds:

- `headers/_headers.production`
- `headers/_headers.canary`

Those files act as base templates. The build then appends the generated per-route SSG headers.

Runtime gzip is applied only to the allowlisted prerendered page routes. SSR routes remain
request-time responses and are not compressed by the Worker; their compression remains
Cloudflare's responsibility.

If a Cloudflare feature injects a resource that is not allowed by the page's CSP, the browser
blocks that resource and continues enforcing the rest of the policy. The affected Cloudflare
feature may not run, but the violation does not disable CSP protection for the page.

### Theme bootstrap script

The theme bootstrap is an **external same-origin script**:

```tsx
<script src={themeBootstrapSrc} />
```

So:

- it does **not** need a nonce
- it does **not** need `integrity` just because it is same-origin
- CSP only needs `'self'` in `script-src`

### CSP reporting

The enforced policy itself carries the reporting directives so Sentry can collect browser-side CSP violations from the same policy that blocks them:

- `Content-Security-Policy` is the enforced policy for the page and appends `report-uri` / `report-to csp-endpoint`
- `Report-To` and `Reporting-Endpoints` both point at the Sentry security endpoint

There is no separate `Content-Security-Policy-Report-Only` header: it would only mirror the enforced policy, duplicating the same directives (and header bytes) on every response without adding coverage.

The reporting URI is derived from the Sentry DSN and includes the current build environment and release in the query string.

## Practical decisions

| Situation | Use |
| --- | --- |
| SSR page with inline script/style | Nonce |
| SSG page with inline script/style | CSP hash |
| Same-origin external script/style | `'self'` |
| Third-party external script/style | Host allowlist, optional `integrity` |

## Common mistakes

- Using `integrity` for inline code
- Using a nonce for static SSG HTML
- Assuming same-origin inline code is allowed without a nonce or hash
- Expecting build-time CSP hashes to cover CDN-injected inline scripts
- Assuming Cloudflare Assets automatically negotiates arbitrary `.gz` sibling files without a
  Worker mapping
- Serving a Worker-compressed body with `Content-Encoding` set but without
  `encodeBody: 'manual'` — the platform adds a second gzip layer (double compression)
- Treating `integrity` as a replacement for CSP
- Forgetting to thread the nonce through React Router's component tree, causing hydration failures on SSR pages

## Baseline policy shape

```http
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' ...nonce-or-hash-sources...;
style-src 'self' ...nonce-or-hash-sources...;
font-src 'self';
img-src 'self' data:;
connect-src 'self';
```

Then add external hosts only where needed.

## Related files

- `app/utils/csp.ts`
- `app/root.tsx`
- `app/entry.server.tsx`
- `app/ssr-handler.ts`
- `app/components/root-document-head.tsx`
- `app/components/root-document-scripts.tsx`
- `app/components/cloudflare-analytics.tsx`
- `vite-utils/route-discovery.ts`
- `vite-plugins/copy-headers.ts`
- `headers/_headers.production`
- `headers/_headers.canary`
