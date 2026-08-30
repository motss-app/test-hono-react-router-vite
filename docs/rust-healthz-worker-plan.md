# Plan: Rewrite Healthz Endpoint in Rust on Cloudflare Workers

> Date: 2026-08-30

## Motivation

The three healthz endpoints (`/healthz`, `/api/healthz`, `/fe/healthz`) currently run inside
their respective Hono-based JavaScript workers (gateway, BFF, frontend). They return plain
text strings (`"gateway ok"`, `"bff ok"`, `"frontend ok"`).

Rewriting them in Rust (via `workers-rs`) and deploying as a **dedicated lightweight worker**
would:

1. **Benchmark Rust vs JavaScript** — measure cold start, throughput (RPS), and p99 latency
   differences for a trivial endpoint on the same CF Workers platform.
2. **Prove the Rust↔JS interop story** — validate that a Rust WASM worker can coexist with
   the existing Deno/TypeScript workers via service bindings or routing.
3. **Reduce CPU cost** — Rust WASM workers use significantly less CPU time for the same work,
   which matters at scale for CF Workers billing.

---

## Architecture Options

### Option A: Standalone Rust Worker (Recommended)

Deploy a new, self-contained Rust worker (`healthz-rust`) alongside the existing workers.

```
Browser → Gateway (Hono/TS)
              ├── /healthz         → existing gateway handler (keep)
              ├── /api/healthz     → BFF (keep)
              ├── /fe/healthz      → frontend (keep)
              └── /rust/healthz    → NEW: Rust worker via service binding
```

**Pros**: Minimal disruption; easy A/B comparison; simple rollback.
**Cons**: Extra worker to manage; doesn't replace existing endpoints.

### Option B: Replace Gateway `/healthz` with Rust Worker

Point the gateway's `/healthz` route to a Rust worker via service binding.

```
Browser → Gateway (Hono/TS)
              └── /healthz → service binding → Rust worker
```

**Pros**: Single source of truth for gateway health.
**Cons**: Tighter coupling; harder to roll back.

### Option C: Rust Worker as Front Proxy for All Health Checks

A single Rust worker aggregates health from all three workers and returns a combined status.

```
Browser → /healthz (Rust) → gateway/fetch → gateway ok
                                         → bff ok
                                         → frontend ok
```

**Pros**: Unified health endpoint; can return JSON with per-service status.
**Cons**: More complex; introduces a new hop; overkill for current needs.

**Recommendation**: **Option A** for deployment (standalone worker), **auxiliary worker**
for local dev (same pattern as BFF). This gives production isolation with zero-friction
development. See Step 3 for dev mode details.

---

## Implementation Plan

### Step 1: Scaffold the Rust Worker

```
packages/healthz-rust/
├── Cargo.toml
├── wrangler.toml
├── src/
│   └── lib.rs
└── README.md
```

**`Cargo.toml`**:

```toml
[package]
name = "healthz-rust"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
worker = "0.8"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
console_error_panic_hook = "0.1"

[profile.release]
lto = true
strip = true
codegen-units = 1
opt-level = "s"   # optimize for size
```

**`wrangler.toml`**:

```toml
name = "healthz-rust"
main = "build/worker/shim.mjs"
compatibility_date = "2025-12-01"
compatibility_flags = ["nodejs_compat"]
no_bundle = true

[build]
command = "cargo install worker-build && worker-build --release"
```

### Step 2: Write the Worker Code

**`src/lib.rs`** — raw routing, no framework:

```rust
use worker::*;

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    match req.path().as_str() {
        "/healthz" => Response::ok("gateway rust ok"),
        "/healthz/json" => {
            let body = serde_json::json!({
                "status": "ok",
                "worker": "healthz-rust",
                "runtime": "rust/wasm",
                "timestamp": js_sys::Date::new_0().to_iso_string().to_string()
            });
            Response::from_json(&body)
        }
        _ => Response::error("Not Found", 404),
    }
}
```

No `Router`, no Axum — just a match statement. Smallest binary, fastest cold start.

### Step 3: Dev Mode Integration

Register the Rust worker as an **auxiliary worker** in the gateway's vite config — same
pattern as the existing BFF auxiliary worker.

#### Updated dev topology

| Worker | Dev Port | Inspector Port | Start Method |
|--------|----------|----------------|--------------|
| Gateway | 8787 | 9230 | `deno task dev` (packages/gateway) |
| Frontend | 5173 | 9232 | `deno task dev` (packages/frontend) |
| BFF | — (auxiliary) | 9231 | Started by gateway's vite config |
| **Healthz Rust** | **— (auxiliary)** | **9233** | **Started by gateway's vite config** |

#### Changes to `packages/gateway/vite.config.ts`

```typescript
cloudflare({
  ...(isDev
    ? {
        auxiliaryWorkers: [
          { configPath: '../bff/wrangler.jsonc' },
          { configPath: '../healthz-rust/wrangler.toml' },  // NEW
        ],
      }
    : {}),
  configPath: './wrangler.jsonc',
}),
```

#### Start everything

```bash
deno task dev   # gateway + BFF + frontend + Rust healthz — all wired up
```

`c.env.HEALTHZ_RUST.fetch()` works in dev via the vite plugin's service binding
emulation — **no separate port, no fallback logic**. Same model as production.

> **Caveat**: `wrangler.toml` (Rust) vs `wrangler.jsonc` (existing workers). The vite
> plugin passes `configPath` to wrangler/miniflare which supports both formats natively.

#### First-build cold start

The Rust worker's `[build]` command (`cargo build` + `worker-build`) runs on first
request in dev mode. Expect ~10-30s cold start on the first compile. Subsequent requests
use the cached WASM binary. Same behavior as the BFF auxiliary worker.

#### Prerequisites

```bash
# One-time setup
rustup target add wasm32-unknown-unknown
cargo install worker-build
cargo install cargo-generate  # optional, for templates
```

#### Dev commands

```bash
# Everything starts with one command (Option B — auxiliary worker)
deno task dev

# Build WASM manually (if you need a fresh build outside of dev)
cd packages/healthz-rust
cargo build --target wasm32-unknown-unknown --release

# Rust code checks (no build needed)
cd packages/healthz-rust
cargo check
cargo clippy
cargo fmt -- --check
```

### Step 4: Add Service Binding to Gateway

In `packages/gateway/wrangler.jsonc`, add a service binding:

```jsonc
{
  "services": [
    {
      "binding": "HEALTHZ_RUST",
      "service": "healthz-rust",
      "environment": "production"
    }
  ]
}
```

Update `packages/gateway/src/bindings.ts`:

```typescript
export interface GatewayBindings {
  FRONTEND: WorkerFetcher;
  BFF: WorkerFetcher;
  HEALTHZ_RUST?: WorkerFetcher;
  SENTRY_DSN?: string;
}
```

Add a proxy route in `packages/gateway/src/worker.ts`:

```typescript
app.get('/rust/healthz', async c => {
  const healthzRust = c.env.HEALTHZ_RUST;
  if (!healthzRust) {
    return c.text('healthz-rust binding not configured', 503);
  }
  const resp = await healthzRust.fetch(new Request('http://healthz/healthz'));
  return new Response(resp.body, {
    status: resp.status,
    headers: { 'x-worker': 'healthz-rust', ...Object.fromEntries(resp.headers) },
  });
});
```

### Step 5: CI/CD Deployment

Add a new GitHub Actions workflow or extend the existing deploy workflow:

```yaml
# .github/actions/deploy-healthz-rust/run.ts
import { runCapture, withLogGroup } from '../lib/deploy.ts';

await withLogGroup('🚀 Deploying Rust healthz worker', async () => {
  const result = await runCapture(
    ['wrangler', 'deploy', '--env', 'canary'],
    { cwd: 'packages/healthz-rust' }
  );
  if (result.code !== 0) {
    throw new Error(`Healthz Rust deploy failed: ${result.code}`);
  }
  return result;
});
```

### Step 6: Testing

#### Rust-side tests

```bash
# Unit tests (native, not WASM)
cargo test

# Clippy lint
cargo clippy -- -D warnings

# Format check
cargo fmt -- --check
```

#### Integration tests (via wrangler + Miniflare)

Create `packages/healthz-rust/tests/healthz.test.ts`:

```typescript
import assert from "node:assert";
import { Miniflare } from "miniflare";

const mf = new Miniflare({
  scriptPath: "./build/worker/shim.mjs",
  modules: true,
  modulesRules: [
    { type: "CompiledWasm", include: ["**/*.wasm"], fallthrough: true },
  ],
});

describe("healthz-rust worker", () => {
  it("returns plain text on /healthz", async () => {
    const res = await mf.dispatchFetch("http://localhost/healthz");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await res.text(), "gateway rust ok");
  });

  it("returns JSON on /healthz/json", async () => {
    const res = await mf.dispatchFetch("http://localhost/healthz/json");
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(body.worker, "healthz-rust");
    assert.strictEqual(body.runtime, "rust/wasm");
    assert.ok(body.timestamp);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await mf.dispatchFetch("http://localhost/unknown");
    assert.strictEqual(res.status, 404);
  });
});
```

Run:

```bash
# Build first
cd packages/healthz-rust
cargo build --target wasm32-unknown-unknown --release
worker-build --release

# Then test
npx vitest run tests/healthz.test.ts
```

#### E2E tests (curl against running dev server)

```bash
# With deno task dev running (gateway on port 8787, Rust as auxiliary worker)
curl -sf http://localhost:8787/rust/healthz | grep -q "gateway rust ok" && echo "PASS" || echo "FAIL"
curl -sf http://localhost:8787/rust/healthz/json | jq -e '.status == "ok"' && echo "PASS" || echo "FAIL"
```

### Step 7: Benchmark Comparison

#### 7a. Add Rust worker to `scripts/bench-all.ts`

Add a new route definition to the `routes` array in `scripts/bench-all.ts`:

```typescript
// Rust healthz via gateway service binding
{
  name: 'Health (Rust via Gateway)',
  path: '/rust/healthz',
},
```

#### 7b. Start all servers for benchmarking

```bash
# Single command — all workers start together
deno task dev
```

#### 7c. Run benchmarks

```bash
# Full benchmark suite (includes all existing + new Rust routes)
BENCH_DURATION=20s deno task bench:all

# Quick comparison: just healthz endpoints
oha http://127.0.0.1:8787/healthz           # gateway TS
oha http://127.0.0.1:8787/rust/healthz       # Rust via gateway service binding
oha http://127.0.0.1:8787/api/healthz        # BFF TS (reference)
```

#### 7d. Expected comparison table

| Endpoint | Runtime | RPS | p75 | p95 | p99 |
|----------|---------|-----|-----|-----|-----|
| `/healthz` (gateway, TS) | V8/JS | baseline | baseline | baseline | baseline |
| `/rust/healthz` (Rust, via gateway binding) | WASM | ? | ? | ? | ? |
| `/api/healthz` (BFF, TS) | V8/JS | ~74,731 | ~1.52ms | ~2.99ms | ~3.10ms |

#### 7e. What to measure

- **RPS**: Requests per second at 128 concurrency
- **Latency**: p75, p95, p99 (via `oha` output)
- **Cold start**: First request latency after worker idle (measure manually with `curl -w '%{time_starttransfer}'`)
- **WASM size**: `ls -lh build/worker/` — target < 100 KB
- **CPU time**: CF Workers analytics dashboard (production only)

#### 7f. Update benchmark baseline

After confirming stable results:

```bash
deno task update-baseline
```

This updates `docs/benchmark-baseline.md` with the new Rust routes.

### Step 8: Update `docs/dev-urls.md`

Add the new Rust healthz URL to the dev-urls table:

```markdown
## Health checks

| URL | Expected | Worker |
|---|---|---|
| `GET /healthz` | `"gateway ok"` | Gateway |
| `GET /api/healthz` | `"bff ok"` | BFF (via gateway proxy) |
| `GET /fe/healthz` | `"frontend ok"` | Frontend (via gateway proxy) |
| `GET /rust/healthz` | `"gateway rust ok"` | Healthz Rust (via gateway service binding) |
```

---

## Quick Reference: All Commands

```bash
# ── Prerequisites (one-time) ──
rustup target add wasm32-unknown-unknown
cargo install worker-build

# ── Dev mode (single command) ──
deno task dev   # gateway + BFF + frontend + Rust healthz — all wired up

# ── Build ──
cd packages/healthz-rust && cargo build --target wasm32-unknown-unknown --release
cd packages/healthz-rust && worker-build --release

# ── Test ──
cd packages/healthz-rust
cargo test                                 # Rust unit tests
cargo clippy -- -D warnings                # Rust lint
cargo fmt -- --check                       # Rust format
npx vitest run tests/healthz.test.ts       # Integration tests (after build)

# ── Benchmark ──
BENCH_DURATION=20s deno task bench:all     # Full suite
oha http://127.0.0.1:8787/healthz          # gateway TS baseline
oha http://127.0.0.1:8787/rust/healthz     # Rust via service binding

# ── Deploy ──
wrangler deploy --env canary               # Canary
wrangler deploy                            # Production

# ── Verify ──
curl -sf http://localhost:8787/rust/healthz # Via gateway service binding
```

---

## Key Considerations

### Build Toolchain

| Component | Tool |
|-----------|------|
| Rust → WASM | `cargo build --target wasm32-unknown-unknown` |
| WASM → JS glue | `wasm-bindgen` (via `worker-build`) |
| JS minification | `webpack` (via `worker-build`) |
| Deployment | `wrangler deploy` |

### Binary Size

With `lto = true`, `strip = true`, `codegen-units = 1`, `opt-level = "s"`:
- A minimal healthz worker should compile to **~50-100 KB** WASM
- `wasm-opt` (invoked by `worker-build`) further reduces this
- CF Workers limit: 10 MB (free) / 10 MB (paid)

### Service Binding Integration

Service bindings are the **zero-latency** way to call another worker within CF's network.
The gateway can call the Rust worker without any network hop — just a function call.

### Deno Integration

The Rust worker is built independently by `cargo`/`worker-build`. The Deno workspace in
`deno.json` does **not** need to know about it beyond:
- `deno task dev` could optionally start `wrangler dev` in the Rust worker directory
- The gateway's wrangler config references it as a service binding

### Monitoring

- Sentry integration is **not needed** for a health endpoint (no user-facing errors)
- Add a `Server-Timing` header in the gateway proxy for latency visibility
- CF Workers analytics dashboard shows invocations, CPU time, and errors automatically

---

## Rollout Strategy

| Phase | Scope | Risk |
|-------|-------|------|
| 1. Scaffold + local dev | `packages/healthz-rust/` only | None |
| 2. Canary deploy | Single CF worker, no gateway binding | None |
| 3. Gateway proxy route | `/rust/healthz` added to gateway | Low — new route, no existing route modified |
| 4. Benchmark | Compare Rust vs TS endpoints | None — read-only measurement |
| 5. Optional: replace `/healthz` | Point gateway `/healthz` to Rust binding | Medium — changes existing behavior |

---

## Open Questions

1. **Which endpoint to rewrite first?** — Gateway `/healthz` is simplest (no bindings needed).
2. **Should the Rust worker return JSON or plain text?** — JSON enables richer health data;
   plain text keeps parity with existing endpoints.
3. **Worth the complexity for a health endpoint?** — This is primarily a **proof-of-concept** to
   validate the Rust↔Deno Workers story. If successful, the same pattern can be applied to
   higher-value endpoints (e.g., rate limiting, auth middleware, request transformation).
4. **Use `worker` crate Router or Axum?** — `worker` crate Router is simpler and has less
   overhead. Axum is possible but adds unnecessary complexity for this use case.

---

## Success Criteria

- [ ] Rust worker compiles and runs locally via `wrangler dev`
- [ ] Rust worker deploys to canary and responds at `/rust/healthz`
- [ ] Benchmark shows measurable RPS or latency improvement over TS endpoint
- [ ] No regressions in existing healthz endpoints
- [ ] Gateway service binding works in both dev and production
