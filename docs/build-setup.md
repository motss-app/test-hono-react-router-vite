# Build Setup

Project builds everything into a single `build/` folder for easy deployment.

## Build Structure

```
build/
├── worker.js             # Frontend Worker production entry
├── assets/               # Server bundle assets
├── client/               # React Router client build
│   ├── index.html        # SSG pages
│   ├── assets/           # JS/CSS bundles
│   └── ...
└── server/               # React Router SSR build
    └── index.js
```

## Build Process

```bash
deno task build  # Runs frontend and gateway builds
```

1. **React Router build**: Creates client + SSR bundles from `packages/frontend/vite.react-router.config.ts`
2. **Frontend Worker build**: Compiles `packages/frontend/worker.ts` to `build/worker.js` via `packages/frontend/vite.worker.config.ts`

When Sentry is enabled, the build may also print source-map upload progress, telemetry notices, and plugin timing warnings. Those lines are usually informational.

If you are debugging a failed canary build, focus on the final fatal error rather than the surrounding red text. In this repo, the important failure modes are:

- client integrity mismatches caused by asset mutation after hashing
- genuine source-map upload failures from Sentry CLI

The repo currently avoids React Router preview-server prerendering, which means the `vite.react-router.config.ts.timestamp-*.mjs` watcher race should not be present in normal canary builds.
The actual trigger was `unstable_previewServerPrerendering: true` in `react-router.config.ts`: that path starts a Vite preview server during prerendering, and the generated temp config module can disappear while the watcher is still tracking it.

### React Router future flags

Only `unstable_previewServerPrerendering` was turned off.

Why:

- it starts prerendering through a Vite preview server
- that preview server was the actual trigger for the temporary `vite.react-router.config.ts.timestamp-*.mjs` watcher race
- the race happened because React Router/Vite generated a temporary config module during prerendering and the watcher could outlive the file

What to keep on:

- `unstable_subResourceIntegrity` should stay enabled so the build keeps protecting browser chunks
- `unstable_optimizeDeps`, `unstable_passThroughRequests`, `unstable_trailingSlashAwareDataRequests`, `v8_middleware`, `v8_splitRouteModules`, and `v8_viteEnvironmentApi` can stay enabled unless a specific regression shows up

The app uses lazy route discovery so the browser can discover additional routes through the runtime `/__manifest` endpoint during navigation.

Rule of thumb: do not disable future flags preemptively only turn one off if it directly causes a build or runtime problem.

## Configuration

### `packages/frontend/vite.react-router.config.ts`
- Builds the browser client and SSR graph
- Copies `_headers` into `build/client/_headers`

### `packages/frontend/vite.worker.config.ts`
- Builds the frontend Cloudflare Worker entry
- Preserves `build/client/` while writing `build/worker.js`

### Sentry note

For this repo, the browser-facing React Router build keeps legacy sourcemap upload so `unstable_subResourceIntegrity` stays valid. The Worker build opts into modern Debug-ID upload via `useModernDebugIdUpload: true`, and the `./build/assets/**/*.map` plus `./build/worker.js.map` glob pair is retained only as the Worker `filesToDeleteAfterUpload` list. `wrangler.jsonc` keeps `"no_bundle": true` plus `"preserve_file_names": true` so Wrangler deploys the exact Vite-built Worker artifact. The Worker config also needs explicit module rules for the generated `assets/**/*.js` chunks so Wrangler uploads the full module graph alongside `worker.js`.

### Production Start
```bash
deno task start  # Alias for deno task preview (Cloudflare Worker preview)
```

## Deployment

- **Runtime**: Cloudflare Workers
- **Build output**: `build/`
- **Entry points**: `packages/frontend/worker.ts` and `packages/gateway/src/worker.ts`

## Key Features

- ✅ **Single folder deployment**
- ✅ **No tsx runtime** (pre-compiled)
- ✅ **Bun compatible** (use Node.js for React 19 SSR)
- ✅ **Static file serving** + API + SSR
