# Benchmark Baseline

Last updated: <!-- updated -->2026-06-09<!-- /updated -->

Only direct servers (bypassing workerd) are benchmarked. Gateway routes are excluded because workerd dev mode is too noisy for regression detection.

## BFF Direct (`http://127.0.0.1:3001`)

| Route          | RPS       | p75      | p95      | p99      | Avg      |
|----------------|-----------|----------|----------|----------|----------|
| healthz        | 76039     | 1.76ms   | 1.92ms   | 2.27ms   | 1.68ms   |
| rpc            | 30736     | 4.31ms   | 4.61ms   | 4.99ms   | 4.16ms   |
| test           | 64805     | 2.06ms   | 2.25ms   | 2.46ms   | 1.97ms   |

## FE Direct (`http://127.0.0.1:5174`) — Prerendered HTML

| Route       | RPS    | p75      | p95      | p99      | Avg      |
|-------------|--------|----------|----------|----------|----------|
| home        | 3244   | 42.36ms  | 48.69ms  | 57.59ms  | 39.47ms  |
| about       | 2829   | 48.78ms  | 55.42ms  | 66.17ms  | 45.28ms  |
| holy-grail  | 2903   | 47.65ms  | 54.33ms  | 60.95ms  | 44.11ms  |
| errors      | 3185   | 43.52ms  | 51.45ms  | 60.39ms  | 40.22ms  |

## SSR Direct (`http://127.0.0.1:5175`)

| Route       | RPS    | p75       | p95       | p99       | Avg       |
|-------------|--------|-----------|-----------|-----------|-----------|
| home        | 960    | 128.57ms  | 202.12ms  | 211.83ms  | 133.75ms  |
| about       | 788    | 156.42ms  | 230.04ms  | 233.97ms  | 162.74ms  |
| holy-grail  | 824    | 149.06ms  | 229.60ms  | 237.25ms  | 156.04ms  |
| errors      | 717    | 172.95ms  | 250.64ms  | 258.68ms  | 179.31ms  |
| ssr         | 979    | 140.80ms  | 198.67ms  | 250.56ms  | 131.22ms  |
| hono-rpc    | 968    | 126.70ms  | 206.36ms  | 214.31ms  | 132.71ms  |
