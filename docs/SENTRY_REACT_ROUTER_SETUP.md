# Sentry + React Router Framework Mode + Hono Setup Guide

## Overview

This document describes the Sentry tracing setup for a React Router Framework Mode application using Hono for API routes, running on Deno in development and Cloudflare Workers in production.

For build-time Sentry source-map upload and the SRI-safe deployment flow, see `docs/sentry-setup.md`. That guide explains why this repo uses legacy sourcemap upload instead of the modern debug-ID injection path.

## Architecture

- **Client**: React Router 7 Framework Mode with `@sentry/react-router`
- **Server**: Hono for API routes + React Router SSR
- **Runtime**: Deno (dev) / Cloudflare Workers (prod)

## Root Cause: Missing Client Transactions

### The Problem

In React Router Framework Mode, the Sentry SDK's `reactRouterTracingIntegration()` has a known limitation:

1. The integration sets `instrumentNavigation: false` internally because it expects the instrumentation API to handle navigation
2. The instrumentation API hooks (`unstable_instrumentations`) are NOT invoked by `HydratedRouter` in Framework Mode
3. This results in **no client transactions** being created

### The Solution

Use `reactRouterTracingIntegration()` **without** `useInstrumentationAPI: true` and **without** `unstable_instrumentations`:

```tsx
// entry.client.tsx
import * as Sentry from '@sentry/react-router';

Sentry.init({
  integrations: [
    Sentry.reactRouterTracingIntegration(),
  ],
});
```

The SDK will use its built-in `instrumentHydratedRouter()` which patches the router after hydration to create navigation transactions.

## Server-Side Tracing

### The Problem

By default, server instrumentation only traces specific routes. We need to create proper pageload transactions for SSR pages.

### The Solution

Create explicit transactions for page loads:

```tsx
// server.ts
function handleAppRequest(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/assets/') || pathname.includes('.');

  if (!isServerSentryEnabled || isStaticAsset) {
    return PromiseFrom(app.fetch(request));
  }

  if (isApiRoute) {
    return startSpan(
      {
        forceTransaction: true,
        name: `${request.method} ${pathname}`,
        op: 'http.server',
      },
      async span => {
        const response = await PromiseFrom(app.fetch(request));
        setHttpStatus(span, response.status);
        return response;
      }
    );
  }

  return startSpan(
    {
      forceTransaction: true,
      name: `page load`,
      op: 'pageload',
    },
    async span => {
      const response = await PromiseFrom(app.fetch(request));
      setHttpStatus(span, response.status);
      return response;
    }
  );
}
```

## Common Issues

### Build output and SRI-safe uploads

If you are working on the build pipeline, do not reintroduce `sentryOnBuildEnd` or any post-build JS mutation that changes emitted client chunks after hashing.

This repo uses legacy sourcemap upload so React Router's integrity hashes stay valid during Cloudflare deployment.

The repo also keeps `unstable_previewServerPrerendering` off because that flag was the trigger for the React Router preview-server watcher race on temporary `vite.react-router.config.ts.timestamp-*.mjs` files.
In practice, the preview server was started during prerendering, generated a temp config module, and the watcher occasionally raced with the file disappearing in GitHub Actions.

### 1. Using `useInstrumentationAPI: true`

```tsx
// WRONG - doesn't work in Framework Mode
const tracing = reactRouterTracingIntegration({
  useInstrumentationAPI: true,
});
```

This doesn't work because `HydratedRouter` doesn't invoke the instrumentation hooks in Framework Mode.

### 2. Adding `unstable_instrumentations` to HydratedRouter

```tsx
// WRONG - not needed and doesn't help
<HydratedRouter
  unstable_instrumentations={[tracing.clientInstrumentation]}
/>
```

This is not needed when `useInstrumentationAPI: false`.

### 3. Using `startNewTrace` for user interactions

```tsx
// CORRECT - creates separate trace for each user interaction
const result = await startNewTrace(() =>
  startSpan({ name: 'my-span' }, async () => { /* ... */ })
);
```

Use `startNewTrace` when you want each user interaction (button clicks, form submissions) to create its own separate trace, completely independent from the initial page load trace.

Without `startNewTrace`, the span would be appended to the active transaction, causing "multiple root transactions" in the same trace.

### 4. Using `forceTransaction: true` for API calls that should be separate traces

```tsx
// Use when you want a new root transaction for an API call
const result = await startSpan(
  {
    forceTransaction: true,
    name: 'My API call',
    op: 'http.server',
  },
  async () => { /* ... */ }
);
```

Note: For Hono RPC calls, prefer `startNewTrace` over `forceTransaction: true` because `forceTransaction: true` alone still appends the server call to the existing client trace.

### 4. Using `forceTransaction: true` in route handlers

```tsx
// WRONG - creates new root transaction instead of child span
const result = await startSpan(
  {
    forceTransaction: true,
    name: 'My action',
    op: 'ui.action.click',
  },
  async () => { /* ... */ }
);

// CORRECT - creates child span under existing transaction
const result = await startSpan(
  {
    name: 'My action',
    op: 'ui.action.click',
  },
  async () => { /* ... */ }
);
```

Using `forceTransaction: true` creates a new root transaction (trace) instead of a child span. This causes "multiple root transactions" issues when making API calls after initial page load.

### 5. Using `consoleLoggingIntegration` with tracing

```tsx
// WRONG - causes multiple root transactions for client traces
Sentry.init({
  integrations: [
    Sentry.consoleLoggingIntegration(),
    Sentry.reactRouterTracingIntegration(),
  ],
});

// CORRECT - disable console logging in production or don't use with tracing
Sentry.init({
  integrations: [
    Sentry.reactRouterTracingIntegration(),
  ],
});
```

**Why `consoleLoggingIntegration` causes issues:**

What `consoleLoggingIntegration` does:
- Intercepts `console.log`, `console.warn`, `console.error`, etc.
- Captures these messages and sends them to Sentry as events
- Uses `captureEvent` internally to send logs

Why it causes multiple root transactions:
1. When it captures console calls, it creates Sentry events
2. The event capture process interacts with the current scope/transaction context
3. This interferes with the tracing integration's transaction management
4. Each console call resets or creates new transaction contexts

Observed behavior:
- Multiple root transactions appear in client traces
- The transaction context gets corrupted or reset unexpectedly

**Recommendation:**
- Only use `consoleLoggingIntegration` when actively debugging
- Disable it in production or when using tracing

### 6. Wrong server trace continuation condition

```tsx
// WRONG - only continues trace in dev
if (!(import.meta.env.DEV && isServerSentryEnabled)) {
  // ... 
}

// CORRECT - always continue trace when enabled
if (!isServerSentryEnabled) {
  // ... 
}
```

## Expected Trace Behavior

After the fix, you should see:

1. **Server pageload**: `server; page load` - SSR of the page
2. **Server API calls**: `server; GET /api/...` - Hono API routes  
3. **Client navigation**: `client; <route-name>` - After hydration, client creates proper navigation spans

The client trace should properly continue from the server trace via `sentry-trace` and `baggage` headers.

## Files Modified

- `app/entry.client.tsx` - Client Sentry init with `reactRouterTracingIntegration()`
- `app/server.ts` - Server-side tracing with explicit pageload transactions
- `app/monitoring/sentry.ts` - Sentry configuration
- `app/root.tsx` - Removed SentryToolbar (causes errors)

## References

- [Sentry React Router Documentation](https://docs.sentry.io/platforms/javascript/guides/react-router/)
- [Instrumentation API (Experimental)](https://docs.sentry.io/platforms/javascript/guides/react-router/features/instrumentation-api/)

## BrokenPipe Error in Dev Server

### The Problem

When running `deno task dev`, the server sometimes crashes with:

```
BrokenPipe: Broken pipe (os error 32)
```

This error appears in Sentry as an unhandled promise rejection.

### Root Cause

The error occurs when:
1. The Vite dev server establishes a WebSocket connection with the browser for HMR (Hot Module Replacement)
2. The browser disconnects (tab closed, refresh, network issue)
3. Vite tries to send an HMR update through the closed WebSocket
4. This triggers a `BrokenPipe` error

This is a **normal side effect** of the HMR WebSocket connection, not a bug in the application.

### Why It Shows Up in Sentry

The Deno server runtime captures unhandled promise rejections and sends them to Sentry. The BrokenPipe error from the Vite WebSocket is one such rejection that gets captured.

### Possible Fixes

1. **Ignore exit code 1 in dev script** (recommended):
   ```ts
   // Allow exit code 1 in dev mode since it can be caused by BrokenPipe
   if (!appStatus.success && appStatus.code !== 1) {
     throw new Error(`App exited with code ${appStatus.code ?? 'unknown'}`);
   }
   ```

2. **Disable HMR** (not recommended):
   - Set `server.hmr: false` in vite config
   - Loses hot reloading functionality

3. **Handle at runtime** (more complex):
   - Catch and suppress WebSocket-related errors in the server code
   - Requires modifying Vite's internal behavior

### Recommendation

The simplest fix is option 1 - ignore exit code 1 in the dev script. This is because:
- The app process exits with code 1 when Vite crashes due to BrokenPipe
- In dev mode, this is harmless - just refresh the browser
- The server can recover on next request
