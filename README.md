# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

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

For deployment builds, each Vite config now uploads only the source maps it owns with explicit glob patterns: React Router covers `./build/client/**/*.map` and `./build/server/**/*.map`, Deno/Hono covers `./build/assets/**/*.map` and `./build/server.js.map`, and the Worker covers `./build/assets/**/*.map` and `./build/worker.js.map`. Each build config passes its own explicit Sentry `dist` into `vite-utils/sentry-build.ts` (`react-router-dev`, `react-router`, `hono`, and `worker`), so release attribution stays stable and predictable across build modes. The Worker deploy also keeps `base_dir: "./build"`, `find_additional_modules: true`, and an `ESModule` rule for `assets/**/*.js` so the generated chunk graph ships with `worker.js`.

The deployment build configs minify in Vite, and `wrangler.jsonc` keeps `"no_bundle": true`, `"preserve_file_names": true`, and `minify: false` so Cloudflare deploys the exact Worker artifact that produced the uploaded `worker.js.map`.

The browser trace now also includes a short-lived `Client bootstrap` span around hydration, plus a `Lazy browser integrations` span for the deferred profiling/replay setup work, so startup gaps show up in Sentry instead of remaining as `No Instrumentation`.

For the full stack-specific setup guide, see [`docs/sentry-setup.md`](docs/sentry-setup.md).
For the Worker-specific React Router split, see [`docs/SENTRY_REACT_ROUTER_SETUP.md`](docs/SENTRY_REACT_ROUTER_SETUP.md).

On Cloudflare Workers, the deployed server/runtime owner is `@sentry/cloudflare` in `app/worker.ts`.
`app/entry.server.tsx` now uses the Worker-safe `@sentry/react-router/cloudflare` helper layer for
the React Router SSR branch instead of initializing a second server SDK.
`app/root.tsx` and other SSR-included route modules also use `@sentry/react-router/cloudflare`
so the Worker build stays on the Worker-safe entrypoint, while `app/entry.client.tsx` continues to
use `@sentry/react-router` for browser tracing, replay, profiling, and logs.

In local development, the browser SDK now targets Spotlight instead of real Sentry, and the Deno server uses a local Spotlight transport.

Start the app, API, and Spotlight together with:

```bash
deno task dev
```

If you only want the Spotlight sidecar:

```bash
deno task spotlight
```

By default the app sends dev telemetry to `http://localhost:8969/stream`. You can override that with:

```bash
SENTRY_SPOTLIGHT=1 # use default Spotlight sidecar URL
# or
SENTRY_SPOTLIGHT=http://localhost:8969/stream
VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream
```

Recommended local setup:

Create `.env` for app runtime and dev mode; add build-only credentials if you are doing a local build:

```bash
VITE_SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
SENTRY_DSN=https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400
SENTRY_SPOTLIGHT=1
VITE_SENTRY_SPOTLIGHT=http://localhost:8969/stream
```

If you are only running `deno task dev`, you can omit `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE`.

The Deno server and build config now read `.env`, so `deno task dev` and `deno task build` both see the same temporary local Sentry settings.

The theme bootstrap plugin is also part of the dev/build wiring:

- `vite.config.ts` keeps `themeBuildPlugin()` enabled so `virtual:theme-bootstrap` resolves during local SSR
- `vite.react-router.config.ts` keeps `themeBuildPlugin()` enabled so the production build emits the hashed bootstrap asset

For SSG-only pages, there is no server/runtime Sentry SDK to initialize. If the prerendered page
hydrates, keep the browser SDK in the client entrypoint; if it stays fully static, runtime Sentry
is optional and build-time source maps remain the only Sentry-related setup you need.

Worker runtime setup:

- Cloudflare Worker runtime DSN now comes from Wrangler `vars.SENTRY_DSN`
- deployed Worker request ownership stays in `app/worker.ts` via `@sentry/cloudflare`
- `wrangler.jsonc` keeps `"no_bundle": true`, `"preserve_file_names": true`, `"find_additional_modules": true`, `base_dir: "./build"`, and an `ESModule` rule for `assets/**/*.js` so the deployed Worker stays aligned with the Vite-built `build/worker.js`
- the React Router SSR branch in `app/entry.server.tsx` uses `@sentry/react-router/cloudflare`
  helpers such as `wrapSentryHandleRequest()` and `injectTraceMetaTags()`
- local Deno dev uses `.env`
- source map upload still needs local/CI env vars because Wrangler runtime vars are not available to the Vite/React Router build step

If you are running a local build, add `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE` to `.env` or export them in your shell; dev-only runs can omit them.

Cloudflare Worker local parity workflow (follow-up):

- use `deno task preview:worker` when you want to exercise the app and API inside local `workerd` instead of the Deno dev server; it uses a bundled Wrangler `preview` env so local module resolution works, while deploys still keep `no_bundle: true`
- keep Spotlight running separately with `deno task spotlight`
- keep Worker runtime env in Wrangler config or local Wrangler env files rather than `.env`
- browser-side Spotlight is already wired today
- worker-side Spotlight routing is not wired yet; that is the next follow-up if you want local Worker runtime parity without sending dev worker telemetry to your normal Sentry project

Example future-local workflow:

```bash
deno task spotlight
deno task preview:worker
```

Build-time source map upload uses:

```bash
VITE_SENTRY_DSN=your-public-dsn
SENTRY_DSN=your-public-dsn
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_RELEASE=your-release-name
```

For the temporary setup, keep the auth token and release in `.env` when you are building locally; that file is ignored by git.

Browser profiling is enabled. Server-side profiling is not configured because this app runs on Deno and Cloudflare Workers rather than Node's profiling integration.

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `deno task build`

```
├── package.json
├── deno.json
├── deno.lock
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This project uses [StyleX](https://stylexjs.com/) for styling and theming. Global styling is expressed through StyleX tokens, utilities, and components rather than a global CSS framework.

---

Built with ❤️ using React Router.
