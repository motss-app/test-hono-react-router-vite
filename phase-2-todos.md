# Phase 2 todo list

Purpose: document Phase 2 progress before moving to Phase 3.

## Goals
- Investigate why the Cloudflare-native dev runner fails page SSR in local development.
- Preserve Hono API routes in both dev and production.

## Todo
- [x] Reproduce the Cloudflare-native SSR failure and capture the exact error surface.
- [x] Compare the worker dev runner path with the restored Hono dev server path.
- [x] Verify whether the worker runner can render `/`, `/about`, and `/ssr` after any config or shim change.
- [x] Keep `/api/test` and `/api/rpc/hello` working while testing SSR fixes.
- [x] Run `deno task format:check`, `deno task lint`, `deno task check`, and `deno task build:worker` after each fix attempt.
- [x] Record whether the Hono dev server remains the required local bootstrap or can be retired later.

## Completion notes
- The dev startup race was in `scripts/dev-spotlight.ts`: the app could boot before Spotlight was listening, which caused `connection refused` transport errors during page loads.
- `scripts/dev-spotlight.ts` now waits for Spotlight to respond before starting `dev:app`, so `deno task dev` comes up cleanly.
- `vite.worker.config.ts` now explicitly externalizes `node:async_hooks`, which removes Rolldown's automatic externalization warning from the Sentry Cloudflare bundle.
- Verified routes: `/`, `/about`, `/ssr`, `/api/test`, and `/api/rpc/hello`.
- Verification commands passed: `deno task format:check`, `deno task lint`, `deno task check`, and `deno task build:worker`.
