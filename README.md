# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v3/monitor/2jjkq.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Documentation

- **[📖 Full Documentation](docs.md)** - Complete project guide
- **[📚 Detailed Guides](docs/)** - In-depth documentation for specific topics

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎨 StyleX for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
deno install
```

### Development

Start the development stack with HMR, API, and Spotlight:

```bash
deno task dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
deno task build
```

### Sentry

This project now ships with Sentry wired for:

- React Router client error monitoring, tracing, session replay, browser profiling, and logs
- Deno server error monitoring, tracing, logs, and metrics
- Cloudflare Worker error monitoring, tracing, logs, and metrics
- build-time source map upload when Sentry build credentials are configured

For deployment builds, the React Router and Deno/Hono configs keep legacy sourcemap upload with explicit glob patterns, while the Worker config opts into modern Debug-ID upload via `useModernDebugIdUpload: true` and keeps `./build/assets/**/*.map` plus `./build/worker.js.map` only in `filesToDeleteAfterUpload`. Each build config passes its own explicit Sentry `dist` into `vite-utils/sentry-build.ts` (`react-router-dev`, `react-router`, `hono`, and `worker`), so release attribution stays stable and predictable across build modes. The Worker deploy also keeps `base_dir: "./build"`, `find_additional_modules: true`, and an `ESModule` rule for `assets/**/*.js` so the generated chunk graph ships with `worker.js`.

For Worker Debug-ID symbolication, source maps alone are not sufficient: Sentry needs both the built
source artifacts (`worker.js` and emitted `assets/**/*.js` chunks with Debug IDs) and their matching
`.map` files from the same build output.

The deployment build configs minify in Vite, and `packages/frontend/wrangler.jsonc` keeps `"no_bundle": true`, `"preserve_file_names": true`, and `minify: false` so Cloudflare deploys the exact Worker artifact that produced the uploaded `worker.js.map`.

The browser trace now also includes a short-lived `Client bootstrap` span around hydration, plus a `Lazy browser integrations` span for the deferred profiling/replay setup work, so startup gaps show up in Sentry instead of remaining as `No Instrumentation`.

For the full stack-specific setup guide, see [`docs/sentry-setup.md`](docs/sentry-setup.md).
For the Worker-specific React Router split, see [`docs/SENTRY_REACT_ROUTER_SETUP.md`](docs/SENTRY_REACT_ROUTER_SETUP.md).

On Cloudflare Workers, the deployed server/runtime owner is `@sentry/cloudflare` in `packages/frontend/worker.ts`.
`app/entry.server.tsx` now uses the Worker-safe `@sentry/react-router/cloudflare` helper layer for
the React Router SSR branch instead of initializing a second server SDK.
`app/root.tsx` and other SSR-included route modules also use `@sentry/react-router/cloudflare`
so the Worker build stays on the Worker-safe entrypoint, while `app/entry.client.tsx` continues to
use `@sentry/react-router` for browser tracing, replay, profiling, and logs.

In local development, the browser SDK sends envelopes to same-origin `/api/tunnel`, and the BFF forwards those envelopes to the local Spotlight sidecar on `8969`. `deno task dev` starts the Spotlight sidecar first and then launches the frontend and gateway dev tasks, so you do not need to launch the sidecar separately unless you want it on its own.

Start the app, API, and Spotlight together with:

```bash
deno task dev
```

If you only want the Spotlight sidecar:

```bash
deno task spotlight
```

Recommended local setup:

Create `.env.local` for app runtime and dev mode; add build-only credentials if you are doing a local build:

```bash
SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
```

If you are only running `deno task dev`, you can omit `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE`.

The browser and Worker build configs now share the same `SENTRY_DSN` env name, so `deno task dev` and `deno task build` both see the same DSN value when you set it locally.

The theme bootstrap plugin is also part of the dev/build wiring:

- `vite.config.ts` keeps `themeBuildPlugin()` enabled so `virtual:theme-bootstrap` resolves during local SSR
- `vite.react-router.config.ts` keeps `themeBuildPlugin()` enabled so the production build emits the hashed bootstrap asset

For SSG-only pages, there is no server/runtime Sentry SDK to initialize. If the prerendered page
hydrates, keep the browser SDK in the client entrypoint; if it stays fully static, runtime Sentry
is optional and build-time source maps remain the only Sentry-related setup you need.

Worker runtime setup:

- Cloudflare Worker runtime DSN now comes from Wrangler `vars.SENTRY_DSN`
- deployed Worker request ownership stays in `packages/frontend/worker.ts` via `@sentry/cloudflare`
- browser and local Worker envelopes are tunneled through the private BFF at `/api/tunnel`, which forwards to Spotlight in local development and to Sentry ingest in deployed environments so ad blockers have less to complain about
- `packages/frontend/wrangler.jsonc` keeps `"no_bundle": true`, `"preserve_file_names": true`, `"find_additional_modules": true`, `base_dir: "../../build"`, and an `ESModule` rule for `assets/**/*.js` so the deployed Worker stays aligned with the Vite-built `build/worker.js`
- the React Router SSR branch in `app/entry.server.tsx` uses `@sentry/react-router/cloudflare`
  helpers such as `wrapSentryHandleRequest()` and `injectTraceMetaTags()`
- local Deno dev uses `.env`
- source map upload still needs local/CI env vars because Wrangler runtime vars are not available to the Vite/React Router build step

If you are running a local build, add `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE` to `.env.local` or export them in your shell; dev-only runs can omit them.

Cloudflare Worker local parity workflow (follow-up):

- use `deno task preview:worker` when you want to exercise the app and API inside local `workerd` instead of the Deno dev server; it uses a bundled Wrangler `preview` env so local module resolution works, while deploys still keep `no_bundle: true`
- use `deno task dev` when you want the app/gateway stack plus Spotlight together; use `deno task spotlight` only if you want the sidecar on its own
- keep Worker runtime env in Wrangler config or local Wrangler env files rather than `.env`
- browser-side Spotlight is already wired today
- worker-side Spotlight routing is not wired yet; that is the next follow-up if you want local Worker runtime parity without sending dev worker telemetry to your normal Sentry project

Example future-local workflow:

```bash
deno task dev
deno task preview:worker
```

Build-time source map upload uses:

```bash
SENTRY_DSN=your-public-dsn
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_RELEASE=your-release-name
```

For the temporary setup, keep the auth token and release in `.env.local` when you are building locally; that file is ignored by git.

Browser profiling is enabled. Server-side profiling is not configured because this app runs on Deno and Cloudflare Workers rather than Node's profiling integration.

## Deployment

This repo now deploys through Cloudflare Workers rather than a standalone Docker or Node server runtime.

Use these artifacts and configs as the deployment source of truth:

- `packages/frontend/wrangler.jsonc` for the private frontend worker
- `packages/bff/wrangler.jsonc` for the private BFF worker
- `packages/gateway/wrangler.jsonc` for the public gateway worker
- `build/worker.js` plus `build/assets/**` for the frontend worker artifact set

For local production-like previewing, run `deno task build` followed by `deno task start`.

## Styling

This project uses [StyleX](https://stylexjs.com/) for styling and theming. Global styling is expressed through StyleX tokens, utilities, and components rather than a global CSS framework.

---

Built with ❤️ using React Router.
