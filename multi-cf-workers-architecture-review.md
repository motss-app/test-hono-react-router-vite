# Multi-CF-Worker Architecture Improvements

## ~~Priority 1: Dev Service Binding Name Mismatch~~ (Not an issue)

**Files:** `packages/gateway/vite.config.ts`, `packages/gateway/wrangler.jsonc`

**Original issue:** The gateway's dev environment service binding references `bff-api-dev`, but the auxiliary worker registered by `@cloudflare/vite-plugin` uses the name `bff-api` from `packages/bff/wrangler.jsonc`. If the plugin resolves bindings by service name, `c.env.BFF.fetch()` would fail in local dev.

**Why it's not an issue:** When `CLOUDFLARE_ENV=dev` is set, `@cloudflare/vite-plugin` selects the `dev` environment, which causes Wrangler to automatically append `-dev` to all local worker names — including auxiliary workers. The BFF auxiliary worker (name `bff-api` from its wrangler.jsonc) becomes `bff-api-dev` at runtime, matching the gateway's dev env service binding. See `docs/gateway-architecture.md:51` and the [Wrangler service bindings docs](https://developers.cloudflare.com/workers/wrangler/configuration/#service-bindings) for the `<worker-name>-<environment-name>` convention.

---

## ~~Priority 2: Make Frontend an Auxiliary Worker in Dev~~ (Not feasible)

**Files:** `packages/gateway/vite.config.ts`, `packages/frontend/vite.config.ts`, `packages/gateway/src/worker.ts`

**Original issue:** Dev topology diverges from production. In dev, the gateway proxies page traffic to `http://localhost:5173` instead of using the `FRONTEND` service binding. This means the multi-worker topology is only partially tested in development.

**Why it's not feasible:** Auxiliary workers share the main worker's vite config pipeline. The frontend's dev vite config (`vite.config.ts`) requires `reactRouter()`, `stylex.vite()`, `sentryReactRouter()`, and `themeBuildPlugin()` — none of which belong in the gateway's build pipeline. The `reactRouter()` plugin provides dev-mode HMR and route updates through its own dev server WebSocket, which auxiliary workers don't support. The frontend must remain a standalone vite dev server in dev mode. The architecture doc (`docs/gateway-architecture.md:74-91`) already explains this limitation.

---

## ~~Priority 3: Deduplicate Wrangler Config~~ (Not feasible)

**Files:** All `packages/*/wrangler.jsonc`

**Original issue:** 26 identical lines across 3 workers (`compatibility_flags`, `observability`, `placement`, `preserve_file_names`, `upload_source_maps`). Adding a new worker means copying the same boilerplate.

**Why it's not feasible:** Wrangler does not support config file inheritance — there is no `extends` or `configPath` mechanism for wrangler configs. `configPath` only exists in `@cloudflare/vite-plugin`'s `auxiliaryWorkers` config and refers to the auxiliary worker's own config file, not a base config to inherit from. The only inheritance model is `env.*` inheriting from top-level keys within the same file. Deduplication would require an external code-generation or templating step.

---

## ~~Priority 4: Expand Shared Binding Types~~ (Not worth it)

**Files:** `packages/shared/src/bindings.ts`, `packages/bff/src/bindings.ts`

**Original issue:** `packages/shared/` only exports `GatewayBindings`. BFF defines its own local `BffBindings` (just `SENTRY_DSN?: string`). Each worker re-defines its own binding types.

**Why it's not worth it:** Each worker has a fundamentally different binding shape — the only overlap is `SENTRY_DSN?: string`, a single optional field. Moving `BffBindings` (3 lines) into shared adds import indirection with negligible reuse. The frontend's bindings are already coupled to `app/types/hono.types.ts`, not a separate file. `GatewayBindings` staying in shared makes sense (it's the cross-worker contract), but the others are fine as local types.

---

## ✅ Priority 5: Add Health Checks (Done)

**Files:** `packages/bff/src/api.ts`, `packages/frontend/worker.ts`, `packages/gateway/src/worker.ts`

**Changes:**
- BFF: `/api/healthz` added to `apiApp` (accessible through gateway at `/api/healthz`)
- Frontend: `/healthz` added (accessible through gateway at `/fe/healthz`)
- Gateway: `/fe/:path` routes to frontend; `/api/*` continues to proxy to BFF

---

## ~~Priority 6: Add TypeScript Project References~~ (Not applicable)

**Files:** `tsconfig.json`, all package configs

**Original issue:** Build order (shared -> bff/frontend -> gateway) is enforced by convention/scripts, not the type system. `tsconfig.json` doesn't include packages in `include` patterns.

**Why it's not applicable:** This project uses Deno (`deno.json`), not `tsc`. There are no `packages/*/tsconfig.json` files. The root `tsconfig.json` is for editor tooling only. Build order is managed by Deno workspace tasks in `deno.json`. The real concern — that workspace dependency order isn't declared — is valid, but TypeScript project references are the wrong mechanism in a Deno-compiled project.

---

## Priority 7: Move `app/` Into Frontend Package

**Files:** `app/` directory, all consumers

**Issue:** The `app/` directory lives at the root but is exclusively used by the frontend worker (and partially by the gateway for Sentry config). This couples the root workspace to the frontend implementation and makes it harder to extract shared logic.

**Fix:** Move `app/` into `packages/frontend/app/`:
- Update the frontend's `deno.json` exports and imports
- The gateway imports `../../../app/monitoring/sentry.ts` - extract reusable Sentry utils into a gateway-local module instead
- Update root `tsconfig.json` paths and deno workspace config

---

## Priority 8: Code Quality Nits

### 8a. Strip `Content-Length` in sentry-tunnel.ts

**File:** `packages/bff/src/sentry-tunnel.ts:163`

```ts
const headers = new Headers(request.headers);
headers.delete('Content-Length'); // add this
headers.set('Content-Type', envelopeContentType);
```

### 8b. Make `cloneResponse` a true clone

**File:** `packages/gateway/src/worker.ts:44`

```ts
function cloneResponse(response: Response): Response {
  if (response.status === 101 || response.status < 200 || response.status > 599) {
    return response;
  }
  return new Response(response.clone().body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}
```

### 8c. Standardize error response shape

Define a shared `ApiErrorResponse` type (in the gateway or a new shared module) and use it across BFF and gateway error responses.
