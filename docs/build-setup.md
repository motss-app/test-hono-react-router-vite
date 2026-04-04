# Build Setup

Project builds everything into a single `build/` folder for easy deployment.

## Build Structure

```
build/
├── index.js              # Hono server (production entry)
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
deno task build  # Runs: react-router build && vite build --mode server
```

1. **React Router build**: Creates client + SSR bundles
2. **Vite server build**: Compiles `app/server.ts` to `build/index.js`

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

Rule of thumb: do not disable future flags preemptively; only turn one off if it directly causes a build or runtime problem.

## Configuration

### `vite.config.ts`
- `--mode server` triggers Hono server build
- `emptyOutDir: false` preserves React Router builds

### Sentry note

For this repo, the Sentry build flow must avoid post-build JS rewriting on the client bundle. Legacy sourcemap upload is used so `unstable_subResourceIntegrity` stays valid. The Vite build configs minify their outputs, and the Worker deploy keeps `wrangler.jsonc` on `"no_bundle": true` plus `"preserve_file_names": true` so the deployed `worker.js` stays identical to the artifact that produced `worker.js.map`.

### Production Start
```bash
deno task start  # NODE_ENV=production node ./build/index.js
```

## Docker Deployment

- **Base**: Deno runtime
- **Package manager**: Deno
- **Multi-stage build**: Optimized for size
- **Deployment**: Only `build/`

## Key Features

- ✅ **Single folder deployment**
- ✅ **No tsx runtime** (pre-compiled)
- ✅ **Bun compatible** (use Node.js for React 19 SSR)
- ✅ **Static file serving** + API + SSR
