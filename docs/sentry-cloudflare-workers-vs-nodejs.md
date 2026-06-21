# Sentry + React Router: Cloudflare Workers vs Node.js

Reference: Sentry JavaScript SDK PR #21633
(`https://github.com/getsentry/sentry-javascript/pull/21633`)

Sentry provides two import paths for `@sentry/react-router`:

| Package | Runtime | Import Path |
|---------|---------|-------------|
| `@sentry/react-router` | Node.js | `@sentry/react-router` |
| `@sentry/react-router/cloudflare` | Cloudflare Workers, Deno, Bun | `@sentry/react-router/cloudflare` |

The Cloudflare subpath does NOT re-export every symbol from the
Node.js subpath. This document lists every API difference and
explains what we do (and cannot do) as a result.

---

## entry.server.tsx

### `createSentryHandleRequest`

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Exported?** | Yes | **No** |
| **Signature** | `createSentryHandleRequest({ streamTimeout, ServerRouter, renderToPipeableStream, createReadableStreamFromReadable })` | N/A |
| **Rendering fn** | `renderToPipeableStream` (Node.js `Readable`) | `renderToReadableStream` (Web `ReadableStream`) |
| **Stream factory** | `createReadableStreamFromReadable` (`@react-router/node`) | Native `Response` body |

**Why we cannot use it:**
Cloudflare Workers and Deno do not have `renderToPipeableStream`
or `createReadableStreamFromReadable`. They use the Web Streams API
natively. `createSentryHandleRequest` wraps the Node.js stream
pipeline with Sentry span tracking; that pipeline does not exist
in our runtime.

**What we use instead:**
`wrapSentryHandleRequest` (exported from the cloudflare subpath)
wraps a handler that returns `new Response(body)` — which is exactly
what `renderToReadableStream` produces.

```ts
// Node.js (Sentry's e2e test)
import * as Sentry from '@sentry/react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { renderToPipeableStream } from 'react-dom/server';

const handleRequest = Sentry.createSentryHandleRequest({
  streamTimeout: ABORT_DELAY,
  ServerRouter,
  renderToPipeableStream,
  createReadableStreamFromReadable,
});
export default handleRequest;

// Cloudflare Workers (our code)
import { wrapSentryHandleRequest } from '@sentry/react-router/cloudflare';
import { renderToReadableStream } from 'react-dom/server';

export default wrapSentryHandleRequest(async function handleRequest(
  request, responseStatusCode, responseHeaders, routerContext
) {
  const body = await renderToReadableStream(<ServerRouter ... />);
  return new Response(body, { headers: responseHeaders, status });
});
```

### `createSentryHandleError`

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Exported?** | Yes | **No** |
| **Signature** | `createSentryHandleError({ logErrors: boolean })` | N/A |
| **Aborted request check** | Yes (`request.signal.aborted`) | N/A |
| **Scope extras** | None | N/A |

**Why we cannot use it directly:**
Not exported from the cloudflare subpath.

**What we use instead:**
A custom `handleError` function that:

1. Filters demo/runtime errors (avoids noise in Sentry)
2. Checks `request.signal.aborted` (avoids capturing cancels)
3. Conditionally logs to console in development only
4. Tags events with `appSessionId` for session correlation

```ts
// Node.js (Sentry's e2e test)
import * as Sentry from '@sentry/react-router';
export const handleError = Sentry.createSentryHandleError({ logErrors: true });

// Cloudflare Workers (our code)
export const handleError: HandleErrorFunction = (error, { request }) => {
  // filter demo errors, check aborted, conditionally log, tag with appSessionId
  if (!request.signal.aborted) {
    captureException(error);
  }
};
```

### `sentryHandleRequest` vs `wrapSentryHandleRequest`

Both are exported from the cloudflare subpath. The difference:

| | `sentryHandleRequest` | `wrapSentryHandleRequest` |
|-|----------------------|--------------------------|
| **Usage** | Direct handler | Higher-order function wrapping your handler |
| **Typical use** | Simple apps | Apps with custom rendering logic (bot detection, CSP nonce, streaming) |

We use `wrapSentryHandleRequest` because our handler has significant
logic (bot detection, CSP nonce injection, streaming control) that
lives inside the wrapped function.

### `injectTraceMetaTags`

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Exported?** | Yes (via `getMetaTagTransformer`) | Yes (direct) |

This works the same way on both runtimes. We call it to inject
`<meta name="sentry-trace">` and `<meta name="baggage">` into the
HTML stream so the client can continue the trace.

```ts
return new Response(injectTraceMetaTags(body), { ... });
```

---

## entry.client.tsx

### `sentryOnError` (HydratedRouter prop)

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Exported?** | Yes | Yes |
| **Available from** | `@sentry/react-router` | `@sentry/react-router/cloudflare` |
| **Usage** | `<HydratedRouter onError={Sentry.sentryOnError} />` | Same |

**What it does:**
Captures client-side rendering errors that occur inside
`HydratedRouter` (e.g., errors thrown during hydration or
client-side navigation rendering). Without this prop, those
errors would be silently swallowed by React Router.

**Status:** We now use this. Added in the latest commit.

### `reactRouterTracingIntegration`

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Exported?** | Yes | Yes |
| **Signature** | Identical | Identical |

Works the same way on both runtimes.

### `useInstrumentationAPI`

| | Node.js | Cloudflare Workers |
|-|---------|-------------------|
| **Status** | Deprecated since 10.58.0 | Deprecated since 10.58.0 |
| **Action** | Remove from `reactRouterTracingIntegration()` | Same |

**Status:** We removed this. No longer needed.

---

## Summary: What Cloudflare Workers Users Cannot Adopt

| Sentry API | Why Unavailable on CF Workers | Our Alternative |
|-----------|------------------------------|-----------------|
| `createSentryHandleRequest` | Uses `renderToPipeableStream` + `createReadableStreamFromReadable` (Node.js streams) | `wrapSentryHandleRequest` + `renderToReadableStream` |
| `createSentryHandleError` | Not re-exported from cloudflare subpath | Custom `handleError` with richer logic |

## Summary: What Cloudflare Workers Users CAN Adopt

| Sentry API | Available Since | We Use It? |
|-----------|----------------|-----------|
| `sentryOnError` | 10.59.0 | **Yes** (added now) |
| `reactRouterTracingIntegration` | 10.57.0 | Yes |
| `wrapSentryHandleRequest` | 10.57.0 | Yes |
| `injectTraceMetaTags` | 10.59.0 | Yes |
| `createSentryClientInstrumentation` | 10.59.0 | Investigating |

## When to Revisit

If Sentry adds a `renderToReadableStream`-based handler or re-exports
`createSentryHandleError` from the cloudflare subpath, we should
adopt it to stay closer to the upstream pattern. Track:

- `@sentry/react-router/cloudflare` adding `createSentryHandleRequest`
  with Web Streams support
- `@sentry/react-router/cloudflare` re-exporting `createSentryHandleError`
