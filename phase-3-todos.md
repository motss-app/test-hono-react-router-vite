# Phase 3 todo list

Purpose: document optional cleanup progress after verification is complete.

## Goals
- Remove only obsolete migration scaffolding.
- Keep Hono API routing intact.

## Todo
- [ ] Run `deno task format:check` and confirm there are no formatting diffs or warnings before cleanup.
- [ ] Run `deno task lint` and confirm there are no lint errors or warnings before cleanup.
- [ ] Run `deno task check` and confirm type generation and type checking pass cleanly before cleanup.
- [ ] Run `deno task dev:app` and verify runtime behavior without errors or warnings before cleanup.
- [ ] Hit `/api/test` and `/api/rpc/hello` in dev and confirm both responses are still correct.
- [ ] Confirm Phase 1 and Phase 2 are complete.
- [ ] Identify any stale migration scaffolding that is safe to remove.
- [ ] Verify no cleanup step touches `app/app.ts`, `app/apis/**`, `app/server.ts`, or `app/worker.ts`.
- [ ] Confirm `@sentry/deno` is still needed before removing it.
- [ ] Record the cleanup summary only after everything above passes cleanly.

## Completion notes
- Update this section with the exact cleanup performed and any warnings that were intentionally left unresolved.
