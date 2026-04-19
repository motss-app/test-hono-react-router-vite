# 🎯 Migration Plan: Cloudflare-native dev, Hono APIs preserved

## 🎯 Objective
Replace the Node-simulated local development path with a Cloudflare-native local development path using `@cloudflare/vite-plugin`, while keeping Hono as the owner of `/api/*` in both development and production.

This migration changes the runtime shell only. It must not move API endpoints away from the shared Hono app in `app/app.ts` and `app/apis/mod.ts`.

---

## 🛠️ Implementation Blueprint

### Phase 1: Core Migration
**Goal:** Swap the simulation layers for the native Cloudflare runtime bridge without changing API ownership.

Before moving to Phase 2, update `phase-1-todos.md` with the work completed and any follow-up notes.

#### 1.1 Dependency Update (`package.json`)
Add the official Cloudflare Vite plugin. Keep the version pinned to `1.32.3` for stability.

#### 1.2 Vite Plugin Swap (`vite.config.ts`)
Replace the `honoDevServer` Node adapter path with the Cloudflare Vite plugin so Vite uses the Cloudflare-native dev runtime.

This swap must not move or replace the API layer. `app/app.ts` remains the shared Hono app factory, `app/apis/mod.ts` remains mounted at `/api`, and `app/server.ts` plus `app/worker.ts` continue to route requests through that same Hono surface.

#### 1.3 Task Pipeline Update (`deno.json`)
Update `dev:app` to run the direct Vite entry used by the Cloudflare plugin.

#### 1.4 Runtime Sentry Update (`app/monitoring/sentry.ts`)
Keep runtime-specific Sentry wiring aligned with the entry point that is actually serving requests. Do not remove the Deno path while `app/server.ts` remains supported.

---

### Phase 2: Runtime Validation
**Goal:** Verify the new dev shell works without breaking Hono API behavior.

Before moving to Phase 3, update `phase-2-todos.md` with the verification results and any issues found.

#### 2.1 Verification Commands
- Start `deno task dev:app` and confirm the app boots under the Cloudflare-native dev path.
- Exercise `/api/test` and `/api/rpc/hello` in local dev and confirm both responses still come from Hono.
- Run `deno task build:worker` to confirm the production worker build still succeeds.
- Run `deno task check` to keep the migration changes type-safe.

#### 2.2 Acceptance Criteria
- `deno task dev:app` starts successfully.
- `/api/test` and `/api/rpc/hello` continue to be served by Hono in dev and production.
- Page loads in the browser without Hono-vs-Vite request interception issues.
- `deno task build:worker` still generates a valid `build/worker.js`.

---

### Phase 3: Optional Cleanup
**Goal:** Remove only migration scaffolding that is no longer needed, while leaving the Hono API surface intact.

Before finishing Phase 3, update `phase-3-todos.md` with the cleanup summary and any files that were intentionally left untouched.

#### 3.1 Safe cleanup targets
- Remove obsolete Node-simulated dev scaffolding only if it is no longer referenced.
- Keep the Hono API app and request entry points intact.
- If `@hono/vite-dev-server` or `@hono/node-server` remain unused after verification, remove them in a separate cleanup pass.
- Keep `@sentry/deno` until `app/server.ts` is intentionally retired.

#### 3.2 Explicit exclusions
- Do not remove Hono itself.
- Do not replatform `/api/*` into React Router.
- Do not treat the API router as disposable dev-only code.

---

## ↩️ Scope boundaries
The migration may change the local dev bootstrap, but it must preserve the existing Hono API contract.

### In scope
- `vite.config.ts`
- `deno.json`
- runtime-specific bootstrap and Sentry wiring if needed to keep the app working

### Out of scope
- `app/routes/**/*.tsx`
- `app/critical/**/*`
- `wrangler.jsonc`
- any attempt to move `/api/*` away from Hono

---

## Relevant files
- `/Users/rongsen/motss/test-hono-react-router-vite/vite.config.ts` — dev shell and plugin wiring only
- `/Users/rongsen/motss/test-hono-react-router-vite/deno.json` — `dev:app` task entry
- `/Users/rongsen/motss/test-hono-react-router-vite/app/app.ts` — shared Hono app factory that mounts `/api`
- `/Users/rongsen/motss/test-hono-react-router-vite/app/apis/mod.ts` — API router implementation
- `/Users/rongsen/motss/test-hono-react-router-vite/app/server.ts` — Deno/local runtime entry that still serves Hono requests
- `/Users/rongsen/motss/test-hono-react-router-vite/app/worker.ts` — Cloudflare Worker entry that still serves Hono requests
- `/Users/rongsen/motss/test-hono-react-router-vite/app/ssr-handler.ts` — SSR handler, separate from API ownership
- `/Users/rongsen/motss/test-hono-react-router-vite/app/monitoring/sentry.ts` — runtime-specific Sentry option helpers
- `/Users/rongsen/motss/test-hono-react-router-vite/phase-1-todos.md` — phase progress checklist before Phase 2
- `/Users/rongsen/motss/test-hono-react-router-vite/phase-2-todos.md` — phase progress checklist before Phase 3
- `/Users/rongsen/motss/test-hono-react-router-vite/phase-3-todos.md` — cleanup progress checklist before completion

---

## Verification
1. Update `phase-1-todos.md` while completing Phase 1 work.
2. Update `phase-2-todos.md` after validation and before any cleanup.
3. Update `phase-3-todos.md` before closing out the migration.
4. Run `deno task dev:app`, hit `/api/test` and `/api/rpc/hello`, run `deno task build:worker`, and run `deno task check`.

---

## Decisions
- Hono remains the API server in both dev and production.
- The Cloudflare Vite plugin changes the dev runtime shell, not the ownership of `/api/*`.
- React Router continues to own SSR/page routes; Hono continues to own API routes.
- Any future move away from Hono for APIs would be a separate project, not part of this migration.
