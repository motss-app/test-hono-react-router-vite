# Wrangler Configuration Settings

This document describes all settings used in the monorepo's Cloudflare Workers (`wrangler.jsonc`).

## TL;DR - Quick Reference

| Setting | frontend-app | bff-api | edge-gateway |
|---------|--------------|---------|--------------|
| `compatibility_date` | `2026-04-13` | `2026-04-25` | `2026-04-25` |
| `compatibility_flags` | 5 flags | 5 flags | 5 flags |
| `observability.enabled` | ✅ 100% sampling | ✅ 100% sampling | ✅ 100% sampling |
| `logs.enabled` | ✅ 100% + invocation | ✅ 100% + invocation | ✅ 100% + invocation |
| `traces.enabled` | ✅ 100% | ✅ 100% | ✅ 100% |
| `placement.mode` | `smart` | `smart` | `smart` |
| `minify` | `false` | `false` | `false` |
| `preserve_file_names` | ✅ | ✅ | ✅ |
| `upload_source_maps` | ✅ | ✅ | ✅ |
| `preview_urls` | `false` | `false` | `true` |
| `workers_dev` | `false` | `false` | `true` |
| `dev.inspector_port` | `9232` | `9231` | `9230` |
| `assets` | ✅ static files | ❌ | ❌ |
| `services` (binds) | ❌ | ❌ | FRONTEND + BFF |
| `env.routes` | custom domain | ❌ | canary + production |
| `SENTRY_DSN` | ✅ per env | ❌ | ❌ |

## Workers Overview

| Worker | File | Purpose |
|--------|------|---------|
| `frontend-app` | `packages/frontend/wrangler.jsonc` | Serves React Router app with static assets |
| `bff-api` | `packages/bff/wrangler.jsonc` | Backend-for-frontend API layer |
| `edge-gateway` | `packages/gateway/wrangler.jsonc` | Edge gateway routing to frontend and BFF |

---

## Common Settings

### `compatibility_date`
Sets the compatibility date for the Workers runtime. This pins the runtime version.

| Worker | Value |
|--------|-------|
| frontend-app | `2026-04-13` |
| bff-api | `2026-04-25` |
| edge-gateway | `2026-04-25` |

### `compatibility_flags`
Enable specific runtime features:

| Flag | Description |
|------|-------------|
| `enable_request_signal` | Enables `AbortSignal` support in request handling |
| `nodejs_als` | Enables Node.js Async Local Storage compatibility |
| `nodejs_compat` | Enables Node.js compatibility mode |
| `pedantic_wpt` | Enables stricter Web Platform Tests compliance |
| `request_signal_passthrough` | Passes request signals through to downstream handlers |

All three workers use the same flags.

### `observability`
Controls logging and tracing for the worker. All workers have 100% sampling enabled.

```jsonc
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1.0,  // 100% sampling
    "logs": {
      "enabled": true,
      "head_sampling_rate": 1.0,  // 100% sampling
      "invocation_logs": true,
      "persist": true
    },
    "traces": {
      "enabled": true,
      "head_sampling_rate": 1.0,  // 100% sampling
      "persist": true
    }
  }
}
```

| Setting | Description |
|---------|-------------|
| `enabled` | Master switch for observability |
| `head_sampling_rate` | Overall sampling rate (1.0 = 100%) |
| `logs.enabled` | Enable structured logging |
| `logs.head_sampling_rate` | Log sampling rate |
| `logs.invocation_logs` | Log each worker invocation |
| `logs.persist` | Persist logs to Cloudflare dashboard |
| `traces.enabled` | Enable distributed tracing |
| `traces.head_sampling_rate` | Trace sampling rate |
| `traces.persist` | Persist traces to Cloudflare dashboard |

### `placement`
Sets the worker placement mode. All workers use `"smart"` mode for optimal regional placement.

```jsonc
{
  "placement": {
    "mode": "smart"
  }
}
```

### `minify`
Controls JavaScript minification. Disabled (`false`) in all workers for easier debugging.

### `preserve_file_names`
Preserves original file names in the worker bundle. Enabled (`true`) in all workers.

### `upload_source_maps`
Uploads source maps to Cloudflare for better error stack traces. Enabled (`true`) in all workers.

### `preview_urls`
Controls whether Wrangler generates preview URLs during development.

| Worker | Value | Reason |
|--------|-------|--------|
| frontend-app | `false` | Uses custom domain |
| bff-api | `false` | API only, no direct preview needed |
| edge-gateway | `true` | Needs preview URL for testing |

### `workers_dev`
Controls whether the worker is deployed to `*.workers.dev` subdomain.

| Worker | Value | Reason |
|--------|-------|--------|
| frontend-app | `false` | Uses custom domain via gateway |
| bff-api | `false` | Internal service, no direct access |
| edge-gateway | `true` | Main entry point |

### `dev.inspector_port`
Port for the Chrome DevTools inspector during local development.

| Worker | Port |
|--------|------|
| frontend-app | `9232` |
| bff-api | `9231` |
| edge-gateway | `9230` |

### `main`
Entry point for the worker. The top-level config always points to the source file so that `@cloudflare/vite-plugin` does not fail during CI builds (the dist directory is gitignored and does not exist until after Vite builds). Deployment environments (`production`, `canary`) override this to the pre-built Vite output.

| Worker | Top-level `main` | Deployment envs (`production`/`canary`) `main` |
|--------|-----------------|------------------------------------------------|
| frontend-app | `../../build/worker.js` | _(inherits top-level — frontend build doesn't use cloudflare plugin)_ |
| bff-api | `./src/worker.ts` | `./dist/bff_api/index.js` |
| edge-gateway | `./src/worker.ts` | `./dist/edge_gateway/index.js` |

---

## Worker-Specific Settings

### frontend-app

#### `assets`
Configuration for serving static assets built by Vite.

```jsonc
{
  "assets": {
    "binding": "ASSETS",
    "directory": "../../build/client",
    "html_handling": "drop-trailing-slash"
  }
}
```

#### `base_dir`
Base directory for the worker build output: `"../../build"`

#### `find_additional_modules`
Set to `true` - automatically finds additional modules needed by the worker.

#### `no_bundle`
Set to `true` - skips bundling (Vite handles bundling).

#### `rules`
ESModule rules for JavaScript assets:

```jsonc
{
  "rules": [
    {
      "globs": ["assets/**/*.js"],
      "type": "ESModule"
    }
  ]
}
```

#### `vars` (Environment Variables)
- `SENTRY_DSN`: Configured per environment (canary, preview, production)

---

### bff-api

Minimal configuration - a pure API worker that:
- Serves from `./src/worker.ts` (top-level `main`)
- Deployments (`production`, `canary`) override `main` to `./dist/bff_api/index.js` with `no_bundle: true` — Vite pre-bundles the worker and Wrangler deploys it as-is
- No external services or routes (internal only)

---

### edge-gateway

#### `services`
Binds to upstream services:

```jsonc
{
  "services": [
    { "binding": "FRONTEND", "service": "frontend-app" },
    { "binding": "BFF", "service": "bff-api" }
  ]
}
```

#### `env.canary.services`
Canary environment binds to canary versions:
- `FRONTEND` → `frontend-app-canary`
- `BFF` → `bff-api-canary`

#### `env.*.routes`
Custom domain routing:

| Environment | Pattern |
|-------------|---------|
| canary | `hono-react-router-vite-canary.motss.fyi` |
| production | `hono-react-router-vite.motss.fyi` |

Both have `custom_domain: true`.

---

## Environment-Specific Configuration

### `CLOUDFLARE_ENV` during builds

Do NOT set `CLOUDFLARE_ENV` during `deno task build` for workers that use `@cloudflare/vite-plugin` (BFF, gateway). The build must use the top-level config so the plugin can resolve `main: ./src/worker.ts` (which always exists). The `--env` flag is only passed to `wrangler deploy`, which reads the pre-built dist output after Vite has finished.

The CI deploy actions follow this pattern: the build step runs without `CLOUDFLARE_ENV`, and `wrangler deploy --env canary` (or `--env production`) uses the environment-specific `main` and `no_bundle` settings.

### Sentry DSN
The frontend worker configures Sentry for error monitoring:

| Environment | DSN |
|-------------|-----|
| default/vars | `https://8dcd1f24afff2f432f13332d6e2837a1@o237444.ingest.us.sentry.io/4511078663782400` |
| canary | Same as default |
| preview | Same as default (with `minify: false`, `no_bundle: false`) |
| production | Same as default |

---

## Schema Validation

All configs reference the Wrangler config schema:
```jsonc
{ "$schema": "../../node_modules/wrangler/config-schema.json" }
```

This provides autocomplete and validation in supported editors.
