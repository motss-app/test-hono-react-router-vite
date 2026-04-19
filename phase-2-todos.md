# Phase 2 todo list

Purpose: document Phase 2 progress before moving to Phase 3.

## Goals
- Verify the Cloudflare-native dev shell works in local development.
- Preserve Hono API routes in both dev and production.

## Todo
- [x] Reproduce the Cloudflare-native SSR failure and capture the exact error surface.
- [x] Restore the Cloudflare-native dev shell after the temporary fallback.
- [x] Verify the worker runner can render `/`, `/about`, and `/ssr` after the config and startup fixes.
- [x] Keep `/api/test` and `/api/rpc/hello` working while testing SSR fixes.
- [x] Run `deno task format:check`, `deno task lint`, `deno task check`, and `deno task build:worker` after each fix attempt.
- [x] Record whether the Hono dev server remains the required local bootstrap or can be retired later.

## Completion notes
- The Cloudflare-native dev shell is back in `vite.config.ts` via `@cloudflare/vite-plugin`, and the app renders `/`, `/about`, and `/ssr` under `deno task dev:app`.
- The dev startup race was in `scripts/dev-spotlight.ts`: the app could boot before Spotlight was listening, which caused `connection refused` transport errors during page loads.
- `scripts/dev-spotlight.ts` now waits for Spotlight to respond before starting `dev:app`, so `deno task dev` comes up cleanly.
- `vite.worker.config.ts` now explicitly externalizes `node:async_hooks`, which removes Rolldown's automatic externalization warning from the Sentry Cloudflare bundle.
- Verified routes: `/`, `/about`, `/ssr`, `/api/test`, and `/api/rpc/hello`.
- Verification commands passed under Deno 2.7.11: `deno task format:check`, `deno task lint`, `deno task check`, and `deno task build:worker`.
