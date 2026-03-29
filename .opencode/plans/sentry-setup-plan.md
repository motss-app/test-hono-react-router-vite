# Sentry Manual Setup Plan — React Router v7 + Hono + Cloudflare Workers

## Features
- **Tracing** (synchronous init — page load spans)
- **Profiling** (client-side only, lazy-loaded)
- **Logs** (via `enableLogs: true` + `consoleLoggingIntegration`)
- **Spotlight** (local debugging sidecar)

---

## Architecture

| Layer | SDK | Package |
|-------|-----|---------|
| Client (browser) | `@sentry/react-router` | React Router v7 client entry |
| Server (CF Workers) | `@sentry/cloudflare` | Hono app wrapper |
| Local dev (Deno) | Spotlight sidecar | `npx @spotlightjs/spotlight` |

**Profiling availability:**
- Client (browser): ✅ `browserProfilingIntegration()` — lazy-loadable
- Server (Cloudflare): ❌ Not supported (Cloudflare Workers runtime limitation)

**SSG vs SSR:**
- Most pages are prerendered (SSG) — served directly from Cloudflare CDN, worker never runs
- Only `/ssr` and `/home` are SSR — served via worker with full trace propagation
- SSG pages get standalone client traces (no server span to connect to — correct behavior)

---

## Release Management — Vite `define` Approach

### The Problem
Sentry needs a **release identifier** that matches between:
1. **Build time**: Source maps uploaded to Sentry tagged with release `X`
2. **Runtime**: Worker reports errors/traces tagged with release `X`
3. **Sentry dashboard**: Correlates minified stack traces → readable source via release `X`

If these don't match, stack traces stay minified.

### The Solution: Vite [`define`](https://vite.dev/config/shared-options#define)

Use Vite's `define` option to inject the release as a **compile-time constant** across all bundles.
The value from `SENTRY_RELEASE` env var is string-replaced at build time — no runtime env reading needed.

```ts
// vite.define.ts
define: {
  __SENTRY_RELEASE__: JSON.stringify('abc1234'),
}
// Compiled code: const release = "abc1234" (hardcoded string literal)
```

### Why `define` instead of runtime env vars

| Approach | Consistency | CF Secrets needed | Client access |
|----------|------------|-------------------|---------------|
| Runtime env (`env.SENTRY_RELEASE`) | Risk of mismatch between bundles | Yes (wrangler secret) | Needs `VITE_` prefix |
| **Vite `define` (build-time)** | **Guaranteed identical** | **No** | **Automatic** |

### Flow
```
GitHub Actions                               Build Output                    Runtime
─────────────                               ───────────                    ───────
SENTRY_RELEASE=abc1234
  ↓
loadEnv() reads env var
  ↓
define: { __SENTRY_RELEASE__: "abc1234" }    client.js: release = "abc1234"
  ↓                                           worker.js: release = "abc1234"
sentryReactRouter plugin uploads             server.js: release = "abc1234"
source maps (release: "abc1234")
                                            ── deploy ──
                                                                   Worker runs
                                                                   release = "abc1234" (baked in)
                                                                   No env var needed
```

### Release Identifier
Use `git rev-parse --short HEAD` (e.g., `a1b2c3d`). Set as `SENTRY_RELEASE` env var in GitHub Actions.

---

## Trace Propagation

### SSR pages (`/ssr`, `/home`)
```
Browser requests page → CF Worker (withSentry creates server span)
  → SSR renders HTML
  → getTraceMetaTags() injected into <head>
  → Browser SDK reads meta tags → connected trace
  → ONE trace: [Server SSR span] → [Browser page load span]
```

### API / Hono RPC calls
```
Browser fetch('/api/...') → SDK attaches sentry-trace + baggage headers
  → CF Worker (withSentry auto-reads headers) → child span
  → ONE trace: [Browser click] → [Worker API span]
```

### SSG pages (prerendered)
- Served from CDN — worker never runs
- Client SDK creates standalone trace (no server connection — correct behavior)

### CORS note
Same-origin requests don't need CORS headers.
For cross-origin API on different subdomain:
```
Access-Control-Allow-Headers: sentry-trace, baggage
```

---

## Prerequisites & Context

### Existing tools (already set up)
- **Sentry MCP server** — configured in `opencode.jsonc`, provides `sentry_*` tools in OpenCode sessions
- **Sentry agent skills** — installed in `.opencode/skill/` (sentry-react-sdk, sentry-cloudflare-sdk, sentry-fix-issues, etc.)
- These tools help debug issues during integration: ask "check Sentry for errors in `file.ts`" or "diagnose issue PROJECT-123"

### Why `withSentry()` and not `sentryPagesPlugin()`
- `withSentry()` wraps the Hono app for **Cloudflare Workers** (this project)
- `sentryPagesPlugin()` is for **Cloudflare Pages** (different deployment model) — not used here

### `loadEnv` prefix filtering
- `loadEnv(mode, process.cwd(), '')` uses empty prefix `''` to load ALL env vars
- This is intentional: `SENTRY_RELEASE` has no `VITE_` prefix (it's not a Vite client env var)
- Vite client env vars (`VITE_*`) are automatically available via `import.meta.env`
- `loadEnv` is only used in Node.js config files (Vite configs), not in client code

### `deno install` convention
- Per `.github/AGENTS.md`: use `deno install` for dependency installation, never `npm install`
- `deno add @sentry/react-router @sentry/cloudflare` adds to `deno.json` imports
- `deno install` resolves and caches the packages

---

## Common Issues to Avoid

These are well-known Sentry integration pitfalls. The plan addresses each one — verify during integration.

---

### Issue 1: Missing Root Transactions (page load not captured)

**What happens**: Page load in the browser doesn't create a Sentry transaction. The Sentry Performance tab shows no transactions for initial page visits.

**Root cause**: `Sentry.init()` runs AFTER `hydrateRoot()` or is deferred (e.g., inside a `useEffect`). The browser SDK needs to be initialized synchronously before hydration to capture the page load span.

**How this plan prevents it**:
- `entry.client.tsx` calls `Sentry.init()` at **module top-level** (synchronous)
- `reactRouterTracingIntegration()` is in `integrations[]` (synchronous init)
- `hydrateRoot()` is called inside `startTransition()` AFTER init completes

```tsx
// ✅ Correct order — init BEFORE hydration
Sentry.init({ ... });           // synchronous, captures page load
startTransition(() => {
  hydrateRoot(document, ...);   // hydration starts AFTER init
});
```

**How to verify**:
1. Open Sentry → Performance → Transactions
2. Filter by `transaction.op:pageload`
3. You should see transactions for every page load (both SSG and SSR pages)
4. Each transaction should have a `pageload` span with browser vitals (LCP, FCP, CLS)

**If it's broken**:
| Symptom | Cause | Fix |
|---------|-------|-----|
| No pageload transactions | Init runs after hydration | Move `Sentry.init()` to module top-level, before `startTransition` |
| Transactions only after navigation | SDK loaded lazily | Make `entry.client.tsx` the first module evaluated (no dynamic imports before init) |
| Missing browser vitals (LCP/FCP) | `reactRouterTracingIntegration()` not in integrations | Verify integrations array includes it |

---

### Issue 2: Unnamed Transactions (generic "unknown" names)

**What happens**: Sentry transactions show as `GET /unknown`, `POST /unknown`, or have URL-based names instead of route patterns. This makes it impossible to aggregate performance data by route.

**Root cause**: Neither the browser SDK nor the server SDK can determine the matched route pattern. This happens when:
- Browser: The routing integration can't detect the current route
- Server: Hono's router doesn't expose the matched route pattern

**How this plan prevents it**:

| Layer | Integration | How it names transactions |
|-------|------------|--------------------------|
| Client (browser) | `reactRouterTracingIntegration()` | Reads React Router's matched route pattern (e.g., `/about`, `/users/:id`) |
| Server (CF Workers) | `honoIntegration()` (auto-included) | Reads Hono's matched route pattern (e.g., `GET /api/rpc/*`) |

Both integrations are included automatically — no extra config needed.

**How to verify**:
1. Open Sentry → Performance → Transactions
2. Transactions should have route-pattern names like:
   - Client: `/about`, `/ssr`, `/` (browser transactions)
   - Server: `GET /api/rpc/*`, `GET /ssr` (server transactions)
3. NOT: `GET /unknown`, `GET http://localhost:8787/api/rpc/getUsers`

**If it's broken**:
| Symptom | Cause | Fix |
|---------|-------|-----|
| All server transactions named `GET /unknown` | Hono route pattern not available | Add `beforeSendTransaction` to rename based on URL pattern |
| Browser transactions named by URL | `reactRouterTracingIntegration()` not loaded | Verify it's in `integrations[]` in `entry.client.tsx` |
| Too many unique transactions (URL-based) | Dynamic route params in name | Add `beforeSendTransaction` to normalize |

**Optional fallback** — add `beforeSendTransaction` to `entry.client.tsx`:
```tsx
Sentry.init({
  // ...
  beforeSendTransaction(event) {
    // Normalize dynamic segments if React Router integration fails
    if (event.transaction) {
      event.transaction = event.transaction.replace(/\/\d+/g, '/:id');
    }
    return event;
  },
});
```

---

### Issue 3: Separate Traces for Hono RPC (API calls not connected)

**What happens**: When the browser triggers a Hono RPC call (e.g., `rpc.api.users.$get()`), the Sentry trace view shows TWO separate traces instead of ONE: a browser trace for the page and a server trace for the API call. The span waterfall is broken.

**Root cause**: The browser SDK must attach `sentry-trace` + `baggage` headers to the fetch request, AND the server SDK must read those headers and create a child span. If either side fails, traces are disconnected.

**How this plan prevents it**:

| Requirement | Config in this plan | Why it works |
|------------|-------------------|--------------|
| Browser attaches trace headers | `tracePropagationTargets: [/^\//, /^\/api\//]` | `/^\//` matches ALL same-origin requests (including Hono RPC) |
| Server reads trace headers | `withSentry()` on Hono app | Auto-reads `sentry-trace` + `baggage` from incoming requests |
| Same-origin requests | Hono RPC uses relative URLs | No CORS preflight needed |
| Hono RPC uses `fetch()` | Hono RPC client is built on `fetch()` | Sentry SDK patches `fetch()` globally |

**Critical detail about `tracePropagationTargets`**:
```ts
tracePropagationTargets: [/^\//, /^\/api\//],
```
- `/^\//` — matches ANY URL starting with `/` (all same-origin requests)
- This includes Hono RPC calls like `/api/rpc/users`, `/api/rpc/posts`, etc.
- If this array is empty (`[]`), NO trace headers are sent and traces will always be separate

**How to verify** (use `deno task preview:worker`):
1. Open browser DevTools → Network tab
2. Trigger a Hono RPC call from the UI (e.g., click a button that calls `rpc.api.example.$get()`)
3. Select the RPC request in Network tab → check Request Headers:
   - `sentry-trace` should be present (e.g., `abc123-def456-1`)
   - `baggage` should be present (e.g., `sentry-trace_id=abc123,...`)
4. Open Spotlight or Sentry → find the trace
5. The trace should show: [Browser click span] → [Worker RPC span] as ONE connected waterfall

**If it's broken**:
| Symptom | Cause | Fix |
|---------|-------|-----|
| No `sentry-trace` header on requests | `tracePropagationTargets` empty or wrong regex | Verify `[/^\//, /^\/api\//]` in both client and server init |
| `sentry-trace` present but separate traces | Worker not wrapped with `withSentry()` | Verify `export default Sentry.withSentry(...)` in `worker.ts` |
| CORS preflight blocks headers | Hono RPC uses cross-origin URL | Add `Access-Control-Allow-Headers: sentry-trace, baggage` to CORS config |
| Traces connected for `fetch()` but not Hono RPC | Hono RPC doesn't use standard `fetch()` | Check Hono RPC source — it should use `fetch()` internally |

**Test script** — add to a route for verification:
```tsx
// app/routes/test-trace.tsx
import * as Sentry from "@sentry/react-router";
import { rpc } from "../lib/hono-client";

export async function loader() {
  // This creates a span on the server (via withSentry)
  return { timestamp: Date.now() };
}

export default function TestTrace() {
  const handleClick = async () => {
    // This creates a browser span that should connect to the server span
    const data = await rpc.api.test.$get();
    console.log(data);
  };

  return <button onClick={handleClick}>Test Trace Propagation</button>;
}
```

---

### Issue 4: Missing Page Load Traces (SSG and SSR)

**What happens**: No page load transaction appears in Sentry for either SSG (prerendered) pages, SSR pages, or both.

**Root cause**: Different for each:
- **SSG pages**: The browser SDK must create a standalone page load transaction (no server involved)
- **SSR pages**: The server must create a span AND inject trace meta tags so the browser SDK can connect

**How this plan prevents it**:

#### SSG pages (prerendered)
- Served directly from Cloudflare CDN — worker never runs
- `entry.client.tsx` initializes Sentry and `reactRouterTracingIntegration()` creates a page load transaction
- This is a **standalone trace** (no server span) — this is correct and expected behavior
- The transaction is named after the React Router route pattern

#### SSR pages (`/ssr`, `/home`)
- Worker runs → `withSentry()` creates server span → SSR renders HTML
- `getTraceMetaTags()` in `ssr-handler.ts` injects `<meta name="sentry-trace">` and `<meta name="baggage">` into `<head>`
- Browser SDK reads meta tags on init → connects browser page load span to server trace
- Result: ONE connected trace with [Server SSR span] → [Browser page load span]

**How to verify**:

For **SSG pages**:
1. Navigate to any prerendered page (e.g., `/about`)
2. Open Sentry → Performance → filter by `transaction:/about`
3. Should see a page load transaction with browser vitals
4. The trace is standalone (no server spans) — this is correct

For **SSR pages** (`deno task preview:worker`):
1. Navigate to `/ssr` or `/home`
2. Open browser DevTools → Elements → inspect `<head>`
3. Should see: `<meta name="sentry-trace" content="abc123-def456-1"/><meta name="baggage" content="..."/>`
4. Open Sentry/Spotlight → find the trace
5. Should see ONE connected trace: [Worker SSR span] → [Browser page load span]

**If it's broken**:
| Symptom | Cause | Fix |
|---------|-------|-----|
| No page load for SSG pages | `reactRouterTracingIntegration()` not loaded | Verify in `entry.client.tsx` integrations |
| No page load for SSR pages | Init not synchronous | Ensure `Sentry.init()` runs before `hydrateRoot()` |
| SSR trace not connected | Meta tags not injected | Check `<head>` for `sentry-trace` meta tag |
| SSR meta tags empty/missing | `getTraceMetaTags()` called outside Sentry context | Verify `withSentry()` wraps the Hono app (Scenario 2 only) |
| SSR page shows standalone trace | Using `deno task dev` (no server Sentry) | Switch to `deno task preview:worker` |

**Important note on SSG vs SSR traces**:
- SSG pages: Standalone traces (no server) — **this is correct**
- SSR pages: Connected traces (server → browser) — **this is correct**
- Don't expect SSG pages to have server spans — there's no server processing at request time

---

### Issue 5: Source Maps Not Matching (minified stack traces)

**What happens**: Sentry shows minified stack traces (e.g., `app-abc123.js:1:34567`) instead of readable source code locations. Errors are captured but not debuggable.

**Root cause**: The `release` value reported by the running code doesn't match the release tagged when source maps were uploaded to Sentry.

**How this plan prevents it**:
- Vite `define` bakes `__SENTRY_RELEASE__` into ALL bundles at build time
- The same `SENTRY_RELEASE` env var is used by:
  1. `getSentryDefine()` → bakes into client.js + worker.js
  2. `sentryReactRouter()` plugin → tags uploaded source maps
- Both use `loadEnv()` to read the same value → **guaranteed match**

**How to verify**:
1. Deploy with `SENTRY_RELEASE=abc1234`
2. Trigger an error in production
3. Open Sentry → Issues → find the error
4. The error should show `release: abc1234` in the sidebar
5. Stack traces should show readable file:line (not minified)

**If it's broken**:
| Symptom | Cause | Fix |
|---------|-------|-----|
| Stack traces minified | Release mismatch | Check `__SENTRY_RELEASE__` value in compiled bundle matches Sentry release |
| Release tag missing in Sentry | `define` not applied | Verify `getSentryDefine(mode)` in all Vite configs |
| Source maps not uploaded | `sentryReactRouter()` plugin not running | Verify it's in production plugins array in `vite.react-router.config.ts` |

---

## File Changes

### 1. Install Dependencies

```bash
deno add @sentry/react-router @sentry/cloudflare
```

### 2. `vite.define.ts` — NEW FILE

Shared define config imported by all Vite configs:

```ts
import { loadEnv } from 'vite';

export function getSentryDefine(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    __SENTRY_RELEASE__: JSON.stringify(env.SENTRY_RELEASE ?? 'local-dev'),
  };
}
```

### 3. `app/types/globals.d.ts` — NEW FILE

TypeScript declaration for the build-time constant:

```ts
declare const __SENTRY_RELEASE__: string;
```

### 4. `tsconfig.json` — MODIFY

Add `globals.d.ts` to includes so TypeScript resolves `__SENTRY_RELEASE__`:

```jsonc
{
  "include": [
    "./*.ts",
    "app/**/*",
    "vite-plugins/**/*.ts",
    "app/types/globals.d.ts"  // ← add
  ]
}
```

Note: If `app/types/` is already covered by `app/**/*`, no change needed.
The `include` glob `app/**/*` already covers `app/types/globals.d.ts`, so this may be implicit.

### 5. `app/types/vite-env.d.ts` — MODIFY

Add `VITE_SENTRY_SPOTLIGHT` and `VITE_SENTRY_DSN` to `ImportMetaEnv`:

```ts
interface ImportMetaEnv {
  PORT: string;
  VITE_DENO_DEPLOYMENT_ID: string;
  VITE_SENTRY_DSN: string;          // ← added
  VITE_SENTRY_SPOTLIGHT: string;    // ← added
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:theme-bootstrap' {
  export const themeBootstrapSrc: string;
}
```

### 6. All 4 Vite configs — add `define`

```ts
// vite.config.ts
import { getSentryDefine } from './vite.define.ts';

export default defineConfig(config => {
  return {
    define: getSentryDefine(config.mode),
    // ... rest unchanged
  };
});
```

```ts
// vite.react-router.config.ts
import { getSentryDefine } from './vite.define.ts';

export default defineConfig(({ mode }) => {
  return {
    define: getSentryDefine(mode),
    // ... rest unchanged
  };
});
```

```ts
// vite.worker.config.ts
import { getSentryDefine } from './vite.define.ts';

export default defineConfig(({ mode }) => ({
  define: getSentryDefine(mode ?? 'production'),
  // ... rest unchanged
}));
```

```ts
// vite.hono.config.ts
import { getSentryDefine } from './vite.define.ts';

export default defineConfig(({ mode }) => ({
  define: getSentryDefine(mode ?? 'production'),
  // ... rest unchanged
}));
```

### 7. `app/entry.client.tsx` — NEW FILE

Use `__SENTRY_RELEASE__` (build-time constant) instead of `import.meta.env.VITE_APP_VERSION`:

```tsx
import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __SENTRY_RELEASE__,  // ← build-time constant, not runtime env
  sendDefaultPii: true,

  // ── Logs ──────────────────────────────────────────────
  enableLogs: true,

  // ── Tracing (synchronous — must capture page load) ───
  tracesSampleRate: 1.0,
  tracePropagationTargets: [/^\//, /^\/api\//],
  integrations: [
    Sentry.reactRouterTracingIntegration(),
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
  ],

  // ── Filtering ─────────────────────────────────────────
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    /^Loading chunk \d+ failed/,
  ],
  beforeSend(event) {
    // Strip sensitive data from error messages
    return event;
  },

  // ── Spotlight (local dev only) ────────────────────────
  ...(import.meta.env.DEV
    ? { spotlight: import.meta.env.VITE_SENTRY_SPOTLIGHT || true }
    : {}),
});

// ── Profiling (lazy-loaded after page interactive) ─────
requestIdleCallback(async () => {
  const integration = await Sentry.lazyLoadIntegration(
    "browserProfilingIntegration"
  );
  Sentry.addIntegration(integration());
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
```

### 8. `app/worker.ts` — MODIFY

Use `__SENTRY_RELEASE__` (build-time constant) instead of `env.SENTRY_RELEASE`:

```ts
import * as Sentry from "@sentry/cloudflare";
import { createApp } from "./app.ts";
import { createSsrHandler } from "./ssr-handler.ts";

const app = createApp();

if (import.meta.env.PROD) {
  createSsrHandler(app);
}

export default Sentry.withSentry(
  (env) => ({
    dsn: env.SENTRY_DSN,
    release: __SENTRY_RELEASE__,  // ← build-time constant, not runtime env
    sendDefaultPii: true,

    // ── Tracing ─────────────────────────────────────────
    tracesSampleRate: 1.0,
    tracePropagationTargets: [/^\//, /^\/api\//],

    // ── Logs ────────────────────────────────────────────
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: ["log", "warn", "error"],
      }),
    ],

    // ── Filtering ───────────────────────────────────────
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
    ],
    beforeSend(event) {
      // Don't send 4xx errors from production
      if (event.exception?.values?.[0]?.value?.includes("Not Found")) {
        return null;
      }
      return event;
    },

    // ── Spotlight (local wrangler dev only) ──────────────
    ...(env.SENTRY_SPOTLIGHT
      ? { spotlight: env.SENTRY_SPOTLIGHT }
      : {}),
  }),
  app, // Hono app — honoIntegration auto-captures errors
);
```

**What `withSentry()` auto-includes** (no explicit config needed):
- `honoIntegration()` — captures Hono `onError` exceptions, sets transaction name with route pattern
- `fetchIntegration()` — traces outbound `fetch()` calls, attaches `sentry-trace` + `baggage` headers
- `contextLinesIntegration()` — adds source code context to stack traces
- These are part of `defaultIntegrations` — do NOT remove them

### 9. `app/ssr-handler.ts` — MODIFY (SSR Trace Propagation)

Inject `<meta name="sentry-trace">` + `<meta name="baggage">` into SSR HTML
so browser SDK connects its page load span to the server trace.

Key: `Sentry.getTraceMetaTags()` is called inside the Hono middleware which runs
within the `withSentry` AsyncLocalStorage context, so it returns the active
server span's trace data.

```ts
// At the top of the file:
import * as Sentry from "@sentry/cloudflare";

// Inside createSsrHandler(), AFTER getting the SSR response, BEFORE returning:

// Only inject trace meta tags into HTML responses (skip redirects, JSON, etc.)
const contentType = responseHeaders.get('Content-Type') ?? '';
const isHtml = contentType.includes('text/html');

if (isHtml) {
  const traceMetaTags = Sentry.getTraceMetaTags();

  if (response.body && traceMetaTags) {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let modified = "";
    let injected = false;

    const transformedBody = response.body.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          modified += decoder.decode(chunk, { stream: true });
          // Check for </head> — handle case where tag spans chunk boundaries
          // by only checking in the flush callback for partial matches
          const headCloseIndex = modified.indexOf("</head>");
          if (!injected && headCloseIndex !== -1) {
            injected = true;
            modified =
              modified.slice(0, headCloseIndex) +
              traceMetaTags +
              modified.slice(headCloseIndex);
          }
        },
        flush(controller) {
          // Flush remaining bytes from decoder
          const remainder = decoder.decode();
          if (remainder) modified += remainder;
          // Fallback: if </head> was never found, inject after <head>
          if (!injected) {
            const headOpenIndex = modified.indexOf("<head>");
            if (headOpenIndex !== -1) {
              modified =
                modified.slice(0, headOpenIndex + 6) +
                traceMetaTags +
                modified.slice(headOpenIndex + 6);
            }
          }
          controller.enqueue(encoder.encode(modified));
        },
      })
    );

    return new Response(transformedBody, {
      headers: responseHeaders,
      status,
    });
  }
}

// Non-HTML responses (redirects, JSON, etc.) — return as-is
return new Response(response.body, {
  headers: responseHeaders,
  status,
});
```

### 10. `app/types/hono.types.ts` — MODIFY

Remove `SENTRY_RELEASE` (baked into bundle via `define`). Keep `SENTRY_DSN` and `SENTRY_SPOTLIGHT` as runtime vars:

```ts
export interface HonoEnv {
  Bindings: {
    ASSETS: Fetcher;
    SENTRY_DSN?: string;       // ← runtime (different per environment)
    SENTRY_SPOTLIGHT?: string; // ← runtime (local dev only)
    // SENTRY_RELEASE removed — baked into bundle via Vite define
  };
  // ... existing Variables unchanged
}
```

### 11. `app/utils/csp.ts` — MODIFY

Add Sentry domains to `connect-src`:

```ts
const defaultConnectSrc = [
  "'self'",
  "https://cloudflareinsights.com",
  "*.sentry.io", // Sentry ingest
];
```

For Spotlight in dev, add the sidecar URL to `connect-src` by extending `buildPolicy`:

```ts
// In buildPolicy() or at the call site in ssr-handler.ts:
const connectSrc = [
  ...defaultConnectSrc,
  ...(import.meta.env.DEV ? ["http://localhost:8969"] : []),
];
```

Or pass it via `options.connectSrc` when calling `csp.buildPolicy()` in `ssr-handler.ts`.

### 12. `vite.react-router.config.ts` — MODIFY (Source Map Upload)

Add `sentryReactRouter` plugin + `define`. The plugin reads `SENTRY_RELEASE` via `loadEnv()`
(the same env var that `getSentryDefine` reads — guarantees identical release value):

```ts
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter, type SentryReactRouterBuildOptions } from '@sentry/react-router';
import stylex from '@stylexjs/unplugin';
import { defineConfig, loadEnv } from 'vite';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { getSentryDefine } from './vite.define.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const env = loadEnv(mode, process.cwd(), '');

  const sentryConfig: SentryReactRouterBuildOptions = {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,
    release: env.SENTRY_RELEASE, // ← same value as define (from loadEnv)
  };

  return {
    build: {
      cssCodeSplit: false,
      sourcemap: true, // ← required for source map upload
    },
    define: getSentryDefine(mode),
    plugins: isDev
      ? []
      : [
          themeBuildPlugin(),
          stylex.vite({ useCSSLayers: true }),
          sentryReactRouter(sentryConfig), // ← source map upload at build end
          reactRouter(),
          headersCopyPlugin({
            dest: 'build/client/_headers',
            headersDir: 'headers',
            mode,
          }),
        ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
```

### 13. `.dev.vars` — NEW FILE (gitignored)

Local secrets for `wrangler dev`. No `SENTRY_RELEASE` (baked in via `define`):

```
SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
SENTRY_SPOTLIGHT=http://localhost:8969/stream
```

#### Source maps: React Router build vs Worker bundle

The `sentryReactRouter` plugin in `vite.react-router.config.ts` uploads source maps for:
- `build/client/` (client bundle) ✅
- `build/server/` (server bundle) ✅

The worker bundle (`build/worker.js` + `build/worker.js.map`) is produced by `vite.worker.config.ts`.
These are NOT uploaded to Sentry by the plugin. Options:
1. **Cloudflare native uploader** — `upload_source_maps: true` in `wrangler.jsonc` (already enabled). This handles Cloudflare's own stack trace resolution but NOT Sentry's.
2. **Separate `sentry-cli` step** in CI — upload `build/worker.js.map` with the same release:
   ```bash
   npx @sentry/cli sourcemaps upload --release $SENTRY_RELEASE --strip-prefix build/ build/worker.js.map
   ```
3. **Accept server-only errors are minified** — if most errors happen in client-side code (React components), this is acceptable.

#### Local `wrangler deploy` (without CI)

If running `wrangler deploy` locally (not from GitHub Actions), `SENTRY_RELEASE` won't be set
in the environment. `loadEnv()` falls back to `'local-dev'` via `??` in `getSentryDefine()`.
This means the release in the bundle will be `"local-dev"`. Source maps won't match unless
you set `SENTRY_RELEASE` manually:
```bash
SENTRY_RELEASE=$(git rev-parse --short HEAD) wrangler deploy --env production
```

### 14. `.gitignore` — MODIFY

Add:

```
.dev.vars
```

### 15. GitHub Actions Workflow — `.github/workflows/deploy-cf-worker.yml` — MODIFY

`SENTRY_RELEASE` is set as env var for `loadEnv()` during build (define injection + source map upload).
No `wrangler secret put SENTRY_RELEASE` needed — release is baked into the bundle:

```yaml
env:
  SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
  SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 25

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v2.x

      - name: Install Dependencies
        run: deno install

      - name: Set Sentry Release
        run: |
          echo "SENTRY_RELEASE=$(git rev-parse --short HEAD)" >> $GITHUB_ENV

      - name: Build & Deploy Canary
        id: deploy-canary
        run: |
          echo "Building Canary (release: $SENTRY_RELEASE)..."
          deno task build:worker:canary
          # Source maps uploaded automatically by sentryReactRouter plugin
          # __SENTRY_RELEASE__ baked into client.js + worker.js via Vite define

          echo "Deploying Canary..."
          deno run -A npm:wrangler deploy --env canary > deploy-canary.log 2>&1 || { cat deploy-canary.log; exit 1; }
          cat deploy-canary.log
          URL=$(grep -oE 'https://[^ ]*workers\.dev' deploy-canary.log | head -n 1)
          echo "CANARY_URL=$URL" >> $GITHUB_ENV
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          SENTRY_RELEASE: ${{ env.SENTRY_RELEASE }}

      - name: Build & Deploy Production
        if: github.ref == 'refs/heads/main'
        id: deploy-production
        run: |
          echo "Building Production (release: $SENTRY_RELEASE)..."
          deno task build:worker

          echo "Deploying Production..."
          deno run -A npm:wrangler deploy --env production > deploy-prod.log 2>&1 || { cat deploy-prod.log; exit 1; }
          cat deploy-prod.log
          URL=$(grep -oE 'https://[^ ]*workers\.dev' deploy-prod.log | head -n 1)
          echo "PROD_URL=$URL" >> $GITHUB_ENV
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          SENTRY_RELEASE: ${{ env.SENTRY_RELEASE }}

      # ... Summary and Warm up steps unchanged
```

### 16. Cloudflare Secrets (one-time setup)

Only `SENTRY_DSN` needed as a secret. `SENTRY_RELEASE` is baked in — no secret needed:

```bash
# Production
wrangler secret put SENTRY_DSN --env production

# Canary
wrangler secret put SENTRY_DSN --env canary
```

---

## Local Debugging with Spotlight

### What is Spotlight

A local sidecar server that receives Sentry events from your dev server
and displays them in a desktop app or browser UI (`http://localhost:8969`).

---

### Scenario 1: `deno task dev` — Deno local dev

**What runs:**
- Vite dev server (port 5173) with Hono dev server
- React Router SSR via `virtual:react-router/server-build`
- Client SDK initialized in `entry.client.tsx`

**What Sentry is active:**

| Layer | Active? | Notes |
|-------|---------|-------|
| Client SDK | ✅ | Initialized via `entry.client.tsx`, sends to Spotlight |
| Server SDK | ❌ | `worker.ts` (with `withSentry()`) is NOT loaded in dev mode |
| SSR trace injection | ❌ | `getTraceMetaTags()` needs `withSentry()` context |
| Trace propagation (API calls) | Partial | Client attaches headers, but server doesn't read them |

**Prerequisites:**
```bash
# Ensure .env has (already configured):
VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream
VITE_SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
```

**Steps:**
```bash
# Terminal 1: Start Spotlight sidecar
npx @spotlightjs/spotlight

# Terminal 2: Start dev server
deno task dev
```

**What to verify:**
- Open `http://localhost:5173` in browser
- Navigate to a route that throws an error (e.g., `/errors`)
- Check Spotlight UI at `http://localhost:8969` — client errors + traces should appear
- Browser DevTools Network tab → requests to `/stream` on port 8969 confirm Spotlight connection

**Limitations:**
- No server-side Sentry (no `@sentry/cloudflare` or `@sentry/deno` in Hono dev server)
- No SSR trace propagation (server doesn't create Sentry spans)
- API calls from browser will have trace headers attached, but the server won't create child spans
- Use Scenario 2 for full client+server debugging

---

### Scenario 2: `deno task preview:worker` — CF Worker local dev

**What runs:**
- Production build (`deno task build:worker`)
- `wrangler dev` — local Cloudflare Worker runtime
- Full Sentry on both client and server

**What Sentry is active:**

| Layer | Active? | Notes |
|-------|---------|-------|
| Client SDK | ✅ | Initialized via `entry.client.tsx`, sends to Spotlight |
| Server SDK | ✅ | `withSentry()` wraps Hono app, sends to Spotlight |
| SSR trace injection | ✅ | `getTraceMetaTags()` injected into SSR HTML |
| Trace propagation (API calls) | ✅ | Full: client headers → server child spans |

**Prerequisites:**
```bash
# Create .dev.vars if not exists:
cat > .dev.vars << 'EOF'
SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
SENTRY_SPOTLIGHT=http://localhost:8969/stream
EOF
```

**Steps:**
```bash
# Terminal 1: Start Spotlight sidecar
npx @spotlightjs/spotlight

# Terminal 2: Build and start CF Worker locally
deno task preview:worker
# This runs: deno task build:worker && wrangler dev
```

**What to verify:**
1. **Client errors**: Open browser, trigger an error → check Spotlight for client-side error event
2. **Server errors**: Hit a Hono route that throws → check Spotlight for server-side error event
3. **SSR trace propagation**: Load an SSR page (`/ssr` or `/home`) →
   - Open browser DevTools Elements → inspect `<head>` for `<meta name="sentry-trace">` and `<meta name="baggage">`
   - In Spotlight, the SSR page load should show ONE connected trace (server span → browser span)
4. **API trace propagation**: Trigger a Hono RPC call from browser →
   - In Spotlight, the API call should show ONE connected trace (browser span → server span)
   - Browser DevTools Network tab → check that `sentry-trace` and `baggage` headers are present on the request
5. **Logs**: Run `Sentry.logger.info("test")` in a route → check Spotlight Logs tab
6. **Spotlight connection**: Browser DevTools Network tab → requests to `localhost:8969/stream`

---

### Scenario 3: `deno task preview` — Deno production build

**What runs:**
- Production build (`deno task build`)
- `deno task start` — Deno production server (`build/server.js`)

**What Sentry is active:**

| Layer | Active? | Notes |
|-------|---------|-------|
| Client SDK | ✅ | Sends to Sentry production (not Spotlight) unless Spotlight configured |
| Server SDK | ❌ | `server.ts` does NOT use `withSentry()` |
| SSR trace injection | ❌ | No server Sentry context |

**Note:** This scenario tests the Deno production build. Server-side Sentry is not available
for the Deno server entry (`app/server.ts`). Only client-side Sentry is active.
Use Scenario 2 for full-stack debugging.

---

### Debugging Quick Reference

| Task | Command | Spotlight shows |
|------|---------|----------------|
| Client errors only | `deno task dev` | Client errors, traces, logs |
| Full client+server | `deno task preview:worker` | Client + server errors, traces, logs, connected traces |
| Check Spotlight connection | Browser DevTools → Network → filter `8969` | `POST` requests to `localhost:8969/stream` |
| Verify SSR meta tags | Browser DevTools → Elements → `<head>` | `<meta name="sentry-trace" ...>` |
| Verify API trace headers | Browser DevTools → Network → select API request | `sentry-trace` and `baggage` request headers |

---

### Troubleshooting Spotlight

| Issue | Cause | Fix |
|-------|-------|-----|
| No events in Spotlight | Sidecar not running | Run `npx @spotlightjs/spotlight` in a separate terminal |
| Client events only, no server | Using `deno task dev` | Switch to `deno task preview:worker` for server Sentry |
| No SSR trace connection | `getTraceMetaTags()` returns empty | Ensure `wrangler dev` (not `deno task dev`) — `withSentry()` must be active |
| API calls not connected | `tracePropagationTargets` not matching | Check that the API URL matches the regex `/^\/api\//` |
| `SENTRY_SPOTLIGHT` not found | `.dev.vars` missing | Create `.dev.vars` with `SENTRY_SPOTLIGHT=http://localhost:8969/stream` |
| Events going to Sentry production | Spotlight URL wrong | Verify `VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream` in `.env` |
| Port 8969 in use | Another Spotlight instance | Kill existing process: `lsof -ti:8969 | xargs kill` |
| `wrangler dev` ignores `.dev.vars` | Wrong working directory | Run `wrangler dev` from project root where `.dev.vars` exists |
| CSP blocks Spotlight | Missing `localhost:8969` in `connect-src` | Add `http://localhost:8969` to CSP (see step 11) |
| Trace meta tags in redirect | Injected into non-HTML response | The `ssr-handler.ts` guard checks `Content-Type: text/html` — verify this check runs |

---

## Verification Checklist

| Check | How |
|-------|-----|
| Client errors | Throw in a route -> check Sentry Issues |
| Server errors | Throw in Hono route -> check Sentry Issues |
| Page load tracing | Sentry Performance -> check transactions |
| SSR trace linked | Page load + SSR should be ONE trace (check meta tags in DevTools) |
| API trace linked | `fetch('/api/...')` -> check span waterfall in Sentry |
| Logs | `Sentry.logger.info("test")` -> Sentry Logs tab |
| Browser profiling | Sentry Profiles tab (after lazy load completes) |
| Source maps | Stack traces show readable file:line (not minified) |
| Release tag | Sentry Issues show correct `release` value matching git SHA |
| `__SENTRY_RELEASE__` baked | Check compiled bundle — should contain literal string, not `process.env` |
| Spotlight (client) | `deno task dev` → events in `http://localhost:8969` |
| Spotlight (full stack) | `deno task preview:worker` → connected traces in `http://localhost:8969` |
| TypeScript | Run `deno task check` — no type errors |

---

## GitHub Secrets to Add

| Secret | Value |
|--------|-------|
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_PROJECT` | Your Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Sentry auth token with `project:releases` + `org:read` scopes |

---

## Summary of Files

| File | Action | Purpose |
|------|--------|---------|
| `vite.define.ts` | **Create** | Shared `getSentryDefine()` — `__SENTRY_RELEASE__` via Vite define |
| `app/types/globals.d.ts` | **Create** | TypeScript declaration for `__SENTRY_RELEASE__` |
| `app/types/vite-env.d.ts` | Modify | Add `VITE_SENTRY_DSN`, `VITE_SENTRY_SPOTLIGHT` to `ImportMetaEnv` |
| `package.json` | Modify | Add `@sentry/react-router`, `@sentry/cloudflare` |
| `app/entry.client.tsx` | **Create** | Sentry init: tracing + logs (sync), profiling (lazy) |
| `app/worker.ts` | Modify | Wrap Hono app with `Sentry.withSentry()` |
| `app/ssr-handler.ts` | Modify | Inject trace meta tags into SSR HTML |
| `app/types/hono.types.ts` | Modify | Add SENTRY_DSN, SENTRY_SPOTLIGHT (remove SENTRY_RELEASE) |
| `app/utils/csp.ts` | Modify | Add `*.sentry.io` to connect-src |
| `vite.config.ts` | Modify | Add `define: getSentryDefine(mode)` |
| `vite.react-router.config.ts` | Modify | Add `define` + `sentryReactRouter()` for source map upload |
| `vite.worker.config.ts` | Modify | Add `define: getSentryDefine(mode)` |
| `vite.hono.config.ts` | Modify | Add `define: getSentryDefine(mode)` |
| `.dev.vars` | **Create** | Local wrangler dev secrets (no SENTRY_RELEASE) |
| `.gitignore` | Modify | Add `.dev.vars` |
| `.github/workflows/deploy-cf-worker.yml` | Modify | Add SENTRY_RELEASE env var for build-time define |

## Files NOT Modified

| File | Reason |
|------|--------|
| `app/entry.server.tsx` | SSR trace injection handled in `ssr-handler.ts` |
| `app/root.tsx` | Error capture by `honoIntegration` (auto) + browser SDK (auto) |
| `wrangler.jsonc` | `nodejs_als` and `nodejs_compat` already present |
| `tsconfig.json` | `app/**/*` glob already covers `app/types/globals.d.ts` |
