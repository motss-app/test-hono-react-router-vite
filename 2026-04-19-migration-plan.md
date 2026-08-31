# 🎯 Migration Plan: Node-Simulated $\rightarrow$ Cloudflare-Native

## 🎯 Objective
Replace the Node-simulated local development path with a Cloudflare-native local development path using `@cloudflare/vite-plugin`. The goal is to align the local development environment (`deno task dev:app`) with the production Cloudflare Worker runtime as closely as possible.

---

## 🛠️ Implementation Blueprint

### Phase 1: Core Migration (Required Work)
**Goal:** Swap the simulation layers for the native Cloudflare runtime bridge with minimal disruption.

#### 1.1 Dependency Update (`package.json`)
Add the official Cloudflare Vite plugin. We pin the version to `1.32.3` to ensure stability.
```diff
 {
   "devDependencies": {
+    "@cloudflare/vite-plugin": "1.32.3",
     "@react-router/dev": "7.14.1",
```
*Note: Other dependencies like `@hono/vite-dev-server` are kept for now to avoid breaking the build until the new path is verified.*

#### 1.2 Vite Plugin Swap (`vite.config.ts`)
Replace the `honoDevServer` (Node adapter) with the Cloudflare Vite plugin. This tells Vite to spawn a `workerd` instance.
```diff
- import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
- import { nodeAdapter } from '@hono/vite-dev-server/node';
+ import { cloudflare } from '@cloudflare/vite-plugin';

 // ... inside plugins array
-       ...(isDev
-         ? [
-             honoDevServer({
-               adapter: nodeAdapter(),
-               entry: './app/server.ts',
-               exclude: [ ... ],
-             }),
+       ...(isDev ? [
+             cloudflare(), 
              stylex.vite({ useCSSLayers: true }),
              reactRouter(),
              ...sentryPlugins,
            ] : []),
```

#### 1.3 Task Pipeline Update (`deno.json`)
Update the dev command to use the native Vite flow. The plugin handles `wrangler.jsonc` environment binding natively.
```diff
-    "dev:app": "deno run -A scripts/run-deno-with-optional-env.ts -P npm:vite",
+    "dev:app": "deno run -A -P npm:vite",
```

#### 1.4 Runtime Sentry Update (`app/monitoring/sentry.ts`)
Ensure Sentry uses the Cloudflare SDK for local development.
```diff
- if (isDenoRuntime) {
-   SentryDeno.init({ ... });
- } else {
-   SentryCF.init({ ... });
- }
+ Sentry.init({
+   dsn: env.SENTRY_DSN,
+   // ... existing config
+ });
```

---

### Phase 2: Runtime Validation

#### 2.1 Verification Commands
- **Boot Check:** `deno task dev:app` $\rightarrow$ Expect "Cloudflare Worker" startup logs.
- **HMR Check:** Edit `app/routes/home.tsx` $\rightarrow$ Expect instant browser update.
- **Env Check:** Log `env.SENTRY_DSN` in the worker $\rightarrow$ Expect value from `wrangler.jsonc`.

#### 2.2 Acceptance Criteria
- [ ] `deno task dev:app` starts successfully.
- [ ] Page loads in browser without "Hono intercepted JS" errors.
- [ ] Sentry events contain `platform: cloudflare` tag locally.
- [ ] `deno task build:worker` still generates a valid `build/worker.js`.

---

### Phase 3: Optional Fallbacks & Cleanup (Post-Verification)

#### 3.1 Routing Collision Fallback (Only if needed)
If Hono intercepts Vite internal requests (e.g., `?import` or `/@vite/`), implement this guard:
```typescript
if (isDev) {
  app.all('*', async (c, next) => {
    const url = c.req.url;
    if (url.includes('?import') || url.includes('/@vite/') || url.includes('/node_modules/')) {
      return next(); 
    }
    await next();
  });
}
```

#### 3.2 Full Runtime Retirement (Optional Cleanup)
Once the new flow is proven stable:
- **Dependency Cleanup:** Remove `@hono/node-server`, `@hono/vite-dev-server`, and `@sentry/deno` from `package.json`.
- **File Deletion:** `scripts/run-deno-with-optional-env.ts`.
- **Spotlight Support:** `app/monitoring/sentry-spotlight-deno.ts` **MUST BE KEPT** as local Spotlight development is still required.

---

## ↩️ Rollback Boundaries
The following files should remain untouched during the migration if they are modified, the migration has overreached:
- `app/routes/**/*.tsx` (UI Logic)
- `app/critical/**/*` (Core CSS/Bootstrap)
- `wrangler.jsonc` (Infrastructure config)
