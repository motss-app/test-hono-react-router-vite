# Gateway architecture

Current gateway setup for the repo.

## Overview

The gateway side of the stack uses `@cloudflare/vite-plugin`.

- `packages/gateway/vite.config.ts` uses `cloudflare(...)` from `@cloudflare/vite-plugin`
- that config runs the **gateway worker** and includes the **BFF worker** as an auxiliary worker only during local dev
- the **frontend app** is deployed privately from `packages/frontend/wrangler.jsonc` and still runs locally from `packages/frontend/vite.config.ts`

So the split is:

- **gateway + BFF** → Cloudflare Vite plugin driven
- **frontend app** → private frontend worker plus package-local Vite/Hono dev server

## Worker layout

| Surface | Worker name / role | Local HTTP port | Inspector port | Notes |
| --- | --- | ---: | ---: | --- |
| Gateway | `edge-gateway` | `8787` | `9230` | Browser-facing entrypoint; the only worker that keeps public custom domain, workers.dev, and preview URL exposure |
| Frontend app | `frontend-app` | `5173` | `9232` | Private frontend worker deployed from `packages/frontend/wrangler.jsonc`; locally served by `packages/frontend/vite.config.ts` for the page shell, SSR, and HMR |
| BFF API | `bff-api` | none | `9231` | Private Cloudflare worker deployed independently; reached through the gateway `BFF` binding |
| Spotlight | dev telemetry sidecar | `8969` | n/a | Optional local telemetry helper started by `deno task dev` |

## Local development

`deno task dev` starts the full local stack by launching the package-local frontend task and the gateway task.

`deno task build` runs the package frontend build first and then the gateway build, so the production artifact set is assembled from the package-local build steps instead of a single root Vite config.

The frontend dev server still needs `@hono/vite-dev-server` and `nodeAdapter()` because the app is not served as static Vite output in local development. Instead, Vite hosts the frontend workspace and Hono is mounted into that dev server so SSR, request handling, and HMR can all happen in the same local process.

Canary deploys now happen as independent package deploys, each driven by its own workflow file:

1. `deploy-fe-canary.yml` deploys the private frontend worker from `packages/frontend/wrangler.jsonc`
2. `deploy-bff-canary.yml` deploys the private BFF worker from `packages/bff/wrangler.jsonc`
3. `deploy-gw-canary.yml` deploys the public gateway worker with its package-local deploy config

The canary GitHub Actions setup is split into separate workflow files for frontend, BFF, and gateway so the package builds and deploys can run in parallel instead of waiting on a single monolithic step. There is no production workflow file at the moment.

Request flow:

1. The browser talks to the gateway on `http://localhost:8787`.
2. The gateway forwards page requests to the frontend service binding, which points at the local frontend dev server on `http://localhost:5173`.
3. The frontend dev server from `packages/frontend/vite.config.ts` mounts `app/server.ts` through `@hono/vite-dev-server` + `nodeAdapter()`, so Hono still handles SSR and request logic during local development.
4. The gateway forwards `/api/*` to the `BFF` service binding.
5. The BFF worker mounts the API under `/api`, so `/api/rpc/hello` and `/api/test` match the browser-facing contract.
6. Spotlight runs on `8969` when enabled.

## Deploy topology

- `edge-gateway` is the public worker entrypoint and keeps the public URL surface (`custom_domain`, `workers_dev`, and preview URLs)
- `frontend-app` is private-only and serves the app through service binding
- `bff-api` is private-only and deploys independently
- browser traffic goes through the gateway, which keeps the routing boundary in one place

## Port summary

There are **3 worker definitions** but only **2 public HTTP dev ports** locally and **1 public internet-facing worker** in production.

- `8787` → gateway
- `5173` → frontend app
- `bff-api` → no standalone public HTTP port in the current dev flow

The BFF is still a worker target, but local development consumes it through the gateway binding instead of exposing it as a browser-facing server. In production, the BFF deploys independently and never gets its own public URL.

The gateway is the only worker that intentionally keeps public URL exposure on (`custom_domain`, `workers_dev`, and preview URLs). The frontend and BFF stay private-only.

## Key files

- `packages/gateway/vite.config.ts` — Cloudflare Vite plugin setup and auxiliary worker wiring
- `packages/gateway/src/worker.ts` — gateway request routing
- `packages/gateway/deno.json` — gateway package tasks and typecheck entrypoint
- `packages/gateway/wrangler.jsonc` — gateway worker name, bindings, and inspector port
- `packages/gateway/.wrangler/deploy/config.json` — generated deploy manifest that points at the built gateway artifacts
- `packages/bff/src/worker.ts` — BFF worker mounted under `/api`
- `packages/bff/deno.json` — BFF package exports and typecheck entrypoint
- `packages/bff/wrangler.jsonc` — BFF worker name and inspector port
- `packages/shared/src/bindings.ts` — shared gateway binding types used by the gateway worker
- `packages/shared/deno.json` — shared contract package exports and typecheck entrypoint
- `packages/frontend/deno.json` — package-local frontend dev/build/preview/typecheck tasks
- `packages/frontend/vite.config.ts` — package-local frontend Vite/Hono dev config
- `packages/frontend/wrangler.jsonc` — private frontend deploy manifest and inspector port
- `.github/workflows/deploy-fe-canary.yml` — canary deploy for the private frontend worker
- `.github/workflows/deploy-bff-canary.yml` — canary deploy for the private BFF worker
- `.github/workflows/deploy-gw-canary.yml` — canary deploy for the public gateway worker
- `scripts/dev-spotlight.ts` — dev orchestrator that starts Spotlight plus the app and gateway tasks
- `deno.json` — root task entrypoints

## Mental model

Think in two layers:

- **HTTP layer**: `5173` for the frontend app, `8787` for the gateway
- **worker layer**: gateway → frontend / BFF service bindings, with frontend/BFF deployed independently from the gateway

If you are tracing a browser request locally, read it as:

`browser → localhost:8787 (gateway) → localhost:5173 (frontend Vite dev server) → app/server.ts (Hono SSR/request handling)`

That keeps page rendering, RPC, and deployment targets separate without making the browser care about three different backends.
