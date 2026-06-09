---
name: benchmark
description: Measure RPS, p75, p95, p99 latency across all routes using `oha`. Run after every change to guard against performance regressions.
---

# Benchmark Runner

Use this skill whenever the task involves performance, load testing, or benchmarking the application. The benchmark measures **requests per second (RPS)** and **latency percentiles (p75, p95, p99)** for every route.

## When To Use

- A change touches route logic, loaders, middleware, API handlers, or SSR rendering
- The user says "benchmark", "perf", "performance", "latency", or "regression"
- Before and after a refactor to confirm performance is preserved
- After upgrading any dependency

## Prerequisites

- `oha` must be installed (`brew install oha`)
- The project uses dev-mode servers (frontend on `:5173`, gateway on `:8787`)

## How To Run

```bash
# Quick run (defaults: 100 connections, 15s per route)
deno task bench:all

# Longer, more accurate run
BENCH_DURATION=30s BENCH_CONCURRENCY=500 deno task bench:all

# Against an already-running server (skip server management)
BENCH_NO_START=1 deno task bench:all

# Against a different base URL
BENCH_BASE_URL=https://hono-react-router-vite.motss.fyi deno task bench:all

# Skip saving results
BENCH_NO_SAVE=1 deno task bench:all

# Skip comparison with previous results
BENCH_NO_COMPARE=1 deno task bench:all

# Set regression alert threshold (default: 10%)
BENCH_REGRESSION_PCT=15 deno task bench:all

# Run just the existing single-endpoint bench (30s, 7999 conns on /api/test)
deno task bench
```

## Kill Ports

```bash
# Kill default ports (5173, 8787, 3000)
deno task kill-ports

# Kill specific ports with verbose output
deno task kill-ports:all

# Kill custom set of ports
deno run -A scripts/kill-ports.ts 8080 9090 --verbose
```

## Output Format

Every run produces a **table** like this:

```
─────────────────────────────────────────────────────────────────────────────────
 BENCHMARK RESULTS  (total: 142.3s)
─────────────────────────────────────────────────────────────────────────────────
Route                |     RPS |         p75 |         p95 |         p99 |         Avg | Requests | Success |      BW/s
─────────────────────────────────────────────────────────────────────────────────
Health (gateway)     |   15234 |      0.45ms |      0.89ms |      2.10ms |      0.52ms |   228510 |   100.0% |   1.2 MB
Home                 |    8234 |      3.20ms |      8.45ms |     15.30ms |      4.10ms |   123510 |   100.0% |  45.3 MB
...
```

## Routes Benchmarked

| Route              | Description            |
| ------------------ | ---------------------- |
| `/healthz`         | Gateway health check   |
| `/api/healthz`     | BFF health check       |
| `/`                | Home page              |
| `/about`           | About page             |
| `/holy-grail`      | Holy grail layout      |
| `/ssr`             | SSR demo (5ms delay)   |
| `/hono-rpc`        | Hono RPC demo page     |
| `/errors`          | Error handling index   |
| `/errors/404`      | Dynamic error route    |
| `/api/rpc/hello`   | RPC API endpoint       |
| `/api/test`        | Test API endpoint      |

## Interpreting Results

- **RPS** (Requests Per Second): higher is better. Compare with previous runs.
- **p75/p95/p99**: latency percentiles. Lower is better. p99 > 500ms on simple routes warrants investigation.
- **SSR routes** (`/ssr`, `/hono-rpc`) will naturally have higher latency due to server rendering.
- **Static routes** (`/holy-grail` is prerendered) should be fastest.
- **Health checks** should be extremely fast (sub-ms).
- If **all** routes regress, the bottleneck is at the gateway / infra level.
- If only one route regresses, investigate its loader / component logic.

## Architecture Context

Frontend (React Router SSR, port 5173) ← Gateway (port 8787, proxies `/api/*` to BFF)

The benchmark hits the gateway on port 8787 so every request exercises the full stack:
1. Gateway routing
2. Frontend SSR or BFF API handling
3. Response proxying back through the gateway

## Result Persistence

Every benchmark run is saved to `output/bench-<ISO-timestamp>.json`. The JSON file contains:

- Timestamp, git commit SHA, config (duration, concurrency)
- Per-route results (RPS, p75, p95, p99, avg latency, total requests, success rate, bandwidth)

On subsequent runs, the script automatically loads the most recent `output/bench-*.json` and compares:

- **RPS change** — if RPS dropped by more than `BENCH_REGRESSION_PCT` (default 10%), it's flagged
- **p99 change** — if p99 increased by more than `BENCH_REGRESSION_PCT`, it's flagged

Regressions are printed in a summary table. Persistence can be skipped with `BENCH_NO_SAVE=1` and comparison with `BENCH_NO_COMPARE=1`.

## Spawning Agents Concurrently

Yes, opencode can spawn a sub-agent using the **Task** tool while the benchmark runs. The calling agent is not blocked — it receives the result when the sub-agent finishes. This is useful for:

- Running tests or typechecking in parallel with benchmarks
- Analyzing logs or traces while load testing
- Comparing new results against historical data without blocking the main flow

Use the `task` tool with `subagent_type` set to `general` or `explore` to run work concurrently.
