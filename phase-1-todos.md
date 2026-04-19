# Phase 1 todo list

Purpose: document Phase 1 progress before moving to Phase 2.

## Goals
- Keep the working dev shell for page SSR and Hono APIs.
- Preserve Hono as the owner of `/api/*` in dev and production.

## Todo
- [x] Review the current `vite.config.ts` and `deno.json` changes.
- [x] Confirm the Cloudflare Vite plugin is wired for dev only.
- [x] Confirm local dev uses `env.development` in `wrangler.jsonc`.
- [x] Confirm the Cloudflare-native worker dev path still fails to SSR page routes.
- [x] Confirm `/api/*` still routes through Hono in `app/app.ts` and `app/apis/mod.ts`.
- [x] Verify `app/server.ts` and `app/worker.ts` still serve the shared Hono app.
- [x] Run `deno task format:check`.
- [x] Run `deno task lint`.
- [x] Run the Phase 1 verification commands.
- [x] Record any issues found before starting Phase 2.

## Completion notes
- Phase 1 is validated end-to-end.
- `deno task format:check` passes.
- `deno task lint` passes.
- `deno task check` passes after fixing the browser Sentry option typing in `app/monitoring/sentry.ts`.
- `deno task build:worker` completes successfully.
- `deno task dev:app` boots under the restored Hono dev server path.
- The Cloudflare-native worker dev path was tested, but it fails on SSR page routes with `ReferenceError: module is not defined` in React Router's runner.
- That worker path still serves `/api/*`, but it does not reliably render `/`, `/about`, or `/ssr` in dev, so Hono dev server remains required for the page SSR path.
- `/api/test` and `/api/rpc/hello` still return the expected Hono JSON responses in dev.
- The local dev shell keeps `CLOUDFLARE_ENV=development` in `.env.development`, but the active page-rendering dev bootstrap is still Hono's server path until the worker runner issue is fixed.
