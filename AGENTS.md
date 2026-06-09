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

**Always re-run the benchmark after every concluded change** to ensure no performance regression.

1. Run `deno task bench:all`
2. Display the benchmark outcome in **tabular form** for maximum readability
3. Compare results with the previous benchmark run (if available from `output/bench-*.json`)
4. If any route shows >10% degradation in RPS or p99, flag it for investigation before proceeding

## Benchmark format

When displaying benchmark results, always use the table format produced by `scripts/bench-all.ts`:

```
─────────────────────────────────────────────────────────────────────────────────
 BENCHMARK RESULTS
─────────────────────────────────────────────────────────────────────────────────
Route                |     RPS |         p75 |         p95 |         p99 | ...
─────────────────────────────────────────────────────────────────────────────────
...
```

The table must include: Route name, RPS, p75 latency, p95 latency, p99 latency, Avg latency, Request count, Success rate.

## Quick reference

| Command | Description |
|---------|-------------|
| `deno task bench:all` | Full benchmark (all routes, 100 conns, 15s each) |
| `deno task bench` | Single-endpoint bench (gateway `/api/test`, 30s, 7999 conns) |

Bench results are deterministic enough to detect regressions when run on the same machine with the same concurrency and duration settings. If you see noise, increase `BENCH_DURATION` (e.g. `BENCH_DURATION=30s`).

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`.
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **CLI tools**: Prefer Rust-based CLI tools when available (e.g. `rg` over `grep`, `bat` over `cat`, `fd` over `find`, `sd` over `sed`).
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function body instead.
- **Verification**: Run `deno task check` after code changes unless the task is docs-only or the user explicitly says not to.

## Related Instruction Files

- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions.
- `.github/LLMS.md`: external LLM reference material used by this repo.
- `docs/dev-urls.md`: all health check, SSR, and API URLs to probe after changes.

If repository conventions change, keep this file and `.github/copilot-instructions.md` aligned where they intentionally overlap.
