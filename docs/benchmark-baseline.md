# Benchmark Baseline

Last updated: <!-- updated -->2026-07-24<!-- /updated -->

## System

- **OS**: linux x86_64
- **Deno**: 2.9.2
- **CPUs**: 4 logical cores
- **Runner**: GitHub Actions 1000004766
- **Runner label**: unknown

Only direct servers (bypassing workerd) are benchmarked. Gateway routes are excluded because workerd dev mode is too noisy for regression detection.

## BFF Direct (`http://127.0.0.1:3001`)

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|
| BFF Direct (healthz) |  74731 |    1.52ms |    2.99ms |    3.10ms |    1.71ms |
| BFF Direct (rpc) |  27590 |    5.11ms |    5.46ms |    6.68ms |    4.64ms |
| BFF Direct (test) |  50372 |    3.73ms |    4.03ms |    4.15ms |    2.54ms |

## FE Direct (`http://127.0.0.1:5174`) — Prerendered HTML

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|
| FE Direct (home) |  10969 |   12.89ms |   15.47ms |   15.81ms |   11.67ms |
| FE Direct (about) |  10800 |   13.02ms |   15.69ms |   15.88ms |   11.85ms |
| FE Direct (holy-g... |  11567 |   12.90ms |   13.23ms |   15.72ms |   11.07ms |
| FE Direct (errors) |  10788 |   13.05ms |   15.66ms |   15.86ms |   11.86ms |

## SSR Direct (`http://127.0.0.1:5175`)

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|
| SSR Direct (home) |     85 |     1.77s |     1.86s |     1.98s |     1.62s |
| SSR Direct (about) |     85 |     1.55s |     2.75s |     3.03s |     1.65s |
| SSR Direct (holy-... |     87 |     1.55s |     2.58s |     2.87s |     1.60s |
| SSR Direct (errors) |     63 |     2.21s |     3.21s |     3.60s |     2.28s |
| SSR Direct (ssr) |    123 |  936.69ms |     2.69s |     2.95s |     1.11s |
| SSR Direct (hono-... |    165 |  804.64ms |     1.19s |     1.66s |  811.52ms |
