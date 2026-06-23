# Benchmark Baseline

Last updated: <!-- updated -->2026-06-21<!-- /updated -->

## System

- **OS**: linux x86_64
- **Deno**: 2.8.3
- **CPUs**: 2 logical cores
- **Runner**: GitHub Actions 1000003050
- **Runner label**: unknown

Only direct servers (bypassing workerd) are benchmarked. Gateway routes are excluded because workerd dev mode is too noisy for regression detection.

## BFF Direct (`http://127.0.0.1:3001`)

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|

## SSR Direct (`http://127.0.0.1:5175`)

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|
