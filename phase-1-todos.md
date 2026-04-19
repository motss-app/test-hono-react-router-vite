# Phase 1 todo list

Purpose: document Phase 1 progress before moving to Phase 2.

## Goals
- Keep the Cloudflare-native dev shell for page SSR and Hono APIs.
- Preserve Hono as the owner of `/api/*` in dev and production.

## Todo
- [x] Review the current `vite.config.ts` and `deno.json` changes.
- [x] Confirm the Cloudflare Vite plugin is wired for dev only.
- [x] Confirm local dev uses `env.development` in `wrangler.jsonc`.
- [x] Confirm the Cloudflare-native dev shell boots and renders page routes under the plugin.
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
- `deno task dev:app` boots with the Cloudflare Vite plugin and renders `/`, `/about`, and `/ssr`.
- `/api/test` and `/api/rpc/hello` still return the expected Hono JSON responses in dev.
- `scripts/dev-spotlight.ts` waits for Spotlight to become ready before starting `dev:app`, which keeps the full dev shell stable.
- Verification used Deno 2.7.11 from the archived binary because the local 2.7.12 binary reproduces the `TsconfigCache` NAPI regression during React Router/Rolldown builds.
