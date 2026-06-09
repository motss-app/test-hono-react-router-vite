# Agent Instructions

**Always work inside this directory (`/Users/rongsen/motss/test-hono-react-router-vite`).** Do not navigate outside it, and never request to access files or folders outside this directory. If a task requires something outside, stop and ask the user how to proceed.

## Skill Selection

- Load `frontend-skill` when the task is primarily about visual direction, layout, landing pages, demos, or premium UI polish.
- Load `skill-vite-plugin-creation` when the task is about creating or updating a Vite plugin that watches a TypeScript entry and emits a JavaScript artifact.
- Load `commit-push-once` when the user explicitly invokes the commit-push-once trigger and wants the current staged changes committed and pushed exactly once. Treat that invocation as one-time permission only; do not reuse it until the user says so again.
- Load `benchmark` skill when the task involves performance, load testing, or benchmarking.
- Load `remix` skill when working with Remix 3 app structure, routes, controllers, middleware, validation, data access, auth, sessions, or UI.

## Default Workflow

1. Inspect the relevant files before editing. Do not guess how the project is structured.
2. Prefer targeted changes over broad rewrites unless the user explicitly asks for a larger refactor.
3. **Always fix errors whenever possible.** When lint, typecheck, or other verification tools report issues, fix them before proceeding.
4. Follow repository rules in this file even when a skill is loaded, unless the skill gives a more specific instruction for the same area.
5. After code changes, run `deno task check` unless the task is documentation-only or the user says not to.
6. After verification passes, probe every URL in `docs/dev-urls.md` to ensure all return 200. Run these against the gateway at `localhost:8787` (and `localhost:5173` for direct frontend URLs). If the dev servers are not running, skip this step.
7. Report what changed, what was verified, the URL probe results, and any remaining risks or blockers.

## Performance regression guard

**Run the benchmark after every concluded change** to guard against performance regression.

1. Run `BENCH_DURATION=20s deno task bench:all`
2. Display the benchmark outcome in **tabular form** for maximum readability
3. If any route shows >10% degradation in RPS or p99 compared to the previous run, flag it for investigation before proceeding

**If the benchmark fails** (server doesn't start, routes error, or the script exits with an error):
- Report the failure clearly along with the error details.
- **Do not retry** — the issue is likely a pre-existing infrastructure or config problem, not something caused by your last change.
- If the failure is clearly related to your change (e.g. the server built and started, but routes error after your edit), fix the issue, then re-run once. If it fails again, stop and report.

## Latest benchmark results (BENCH_DURATION=5s)

Benchmark runs against **four server groups**:

| Server | Base URL | Description |
|--------|----------|-------------|
| Gateway (workerd) | `http://127.0.0.1:8787` | Full stack through Cloudflare Workers (dev mode) |
| BFF Direct | `http://127.0.0.1:3001` | Hono API via `Deno.serve()`, bypasses CF Worker |
| FE Direct | `http://127.0.0.1:5174` | Production build prerendered HTML served via Hono, bypasses CF Worker |
| SSR Direct | `http://127.0.0.1:5175` | Production SSR build via `Deno.serve()`, bypasses CF Worker |

To benchmark only direct servers: `BENCH_DURATION=20s deno run -A scripts/bench-all.ts`
To benchmark against a deployment: `BENCH_BASE_URL=https://your-deployment.com deno run -A scripts/bench-all.ts`

```
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 BENCHMARK RESULTS  (total: 512.2s)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Route                |       RPS |          p75 |          p95 |          p99 |          Avg | Requests |  Success |       BW/s
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Health (gateway)     |       186 |     813.95ms |       1.065s |       1.256s |     706.30ms |     3584 |   100.0% |       2 KB
Health (BFF)         |       115 |       1.251s |       1.307s |       1.314s |       1.163s |     2176 |   100.0% |      653 B
Home                 |        53 |       2.497s |       5.722s |       5.751s |       2.576s |      930 |   100.0% |     771 KB
About                |       257 |     302.43ms |       2.015s |       3.084s |     487.50ms |     5006 |   100.0% |     1.9 MB
Holy Grail           |       231 |       1.914s |       2.550s |       3.397s |     881.79ms |     2785 |    61.9% |     1.6 MB
SSR                  |       356 |     222.90ms |       1.496s |       1.860s |     354.19ms |     6986 |   100.0% |     1.8 MB
Hono RPC             |       325 |     293.39ms |       1.799s |       2.115s |     396.95ms |     6379 |   100.0% |     1.6 MB
Errors Index         |       473 |     153.06ms |       1.252s |       1.386s |     266.56ms |     9331 |   100.0% |     2.5 MB
Error 404            |       394 |     198.28ms |       1.441s |       1.872s |     325.15ms |     7762 |   100.0% |     2.0 MB
API RPC Hello        |       239 |       1.010s |       1.077s |       1.258s |     543.68ms |     4650 |   100.0% |     287 KB
API Test             |       122 |       1.132s |       1.391s |       1.486s |       1.060s |     2304 |   100.0% |       5 KB
BFF Direct (healthz) |     76039 |       1.76ms |       1.92ms |       2.27ms |       1.68ms |  1520965 |   100.0% |     456 KB
BFF Direct (rpc)     |     30736 |       4.31ms |       4.61ms |       4.99ms |       4.16ms |   614758 |   100.0% |     3.3 MB
BFF Direct (test)    |     64805 |       2.06ms |       2.25ms |       2.46ms |       1.97ms |  1296247 |   100.0% |     2.9 MB
FE Direct (home)     |      3244 |      42.36ms |      48.69ms |      57.59ms |      39.47ms |    64771 |   100.0% |    45.9 MB
FE Direct (about)    |      2829 |      48.78ms |      55.42ms |      66.17ms |      45.28ms |    56467 |   100.0% |    43.5 MB
FE Direct (holy-... |      2903 |      47.65ms |      54.33ms |      60.95ms |      44.11ms |    57940 |   100.0% |    43.9 MB
FE Direct (errors)   |      3185 |      43.52ms |      51.45ms |      60.39ms |      40.22ms |    63580 |   100.0% |    50.3 MB
SSR Direct (home)    |       960 |     128.57ms |     202.12ms |     211.83ms |     133.75ms |    19086 |   100.0% |    12.9 MB
SSR Direct (about)   |       788 |     156.42ms |     230.04ms |     233.97ms |     162.74ms |    15644 |   100.0% |    11.5 MB
SSR Direct (holy-... |       824 |     149.06ms |     229.60ms |     237.25ms |     156.04ms |    16349 |   100.0% |    11.8 MB
SSR Direct (errors)  |       717 |     172.95ms |     250.64ms |     258.68ms |     179.31ms |    14220 |   100.0% |    10.7 MB
SSR Direct (ssr)     |       979 |     140.80ms |     198.67ms |     250.56ms |     131.22ms |    19458 |   100.0% |    13.7 MB
SSR Direct (hono-... |       968 |     126.70ms |     206.36ms |     214.31ms |     132.71ms |    19232 |   100.0% |    13.4 MB
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

**Key observations:**
- Gateway routes are bottlenecked by workerd dev mode (serialized request processing, ~50-500 RPS)
- BFF Direct shows **~76k RPS** with **~2-5ms p99** — comparable to the ~40k RPS baseline
- FE Direct serves prerendered HTML at **~2.8-3.2k RPS** with **~40-100ms p99** (disk I/O bound)
- SSR Direct (pure SSR via Deno.serve, no workerd) achieves **~700-1000 RPS** with **~130-260ms p99** — ~3-4x slower than prerendered, but ~2-5x faster than through workerd
- Frontend routes through the gateway include full SSR, Sentry instrumentation, CSP headers — same as production

## Quick reference

| Command | Description |
|---------|-------------|
| `deno task bench:all` | Full benchmark (all 18 routes, 128 conns, 20s). Starts CF gateway + standalone BFF + standalone FE |
| `deno task bench` | Single-endpoint bench (gateway `/api/test`, 30s, 7999 conns) |

To benchmark only direct servers: `BENCH_DURATION=20s deno run -A scripts/bench-all.ts`
To benchmark against a deployment: `BENCH_BASE_URL=https://your-deployment.com deno run -A scripts/bench-all.ts`

Bench results are deterministic enough to detect regressions when run on the same machine with the same concurrency and duration settings. If you see noise, increase `BENCH_DURATION` (e.g. `BENCH_DURATION=30s`).

## Updating this file

**After every code change, run `BENCH_DURATION=20s deno task bench:all` and paste the new benchmark table above.** This ensures the agent always has fresh baseline numbers for regression comparison.

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`.
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **CLI tools**: Prefer Rust-based CLI tools when available (e.g. `rg` over `grep`, `bat` over `cat`, `fd` over `find`, `sd` over `sed`).
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function body instead.
- **Verification**: Run `deno task check` after code changes unless the task is docs-only or the user explicitly says not to.
- **Temporary files**: Never write to `/tmp/` or any directory outside the workspace root. Use `/var/folders/5p/x6m44h3n36v4w5pdttg8vtrw0000gn/T/opencode` if temp space is needed — it is pre-approved for external directory access.

## Related Instruction Files

- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions.
- `.github/LLMS.md`: external LLM reference material used by this repo.
- `docs/dev-urls.md`: all health check, SSR, and API URLs to probe after changes.

If repository conventions change, keep this file and `.github/copilot-instructions.md` aligned where they intentionally overlap.
