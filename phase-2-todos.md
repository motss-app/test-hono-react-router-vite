# Phase 2 todo list

Purpose: document Phase 2 progress before moving to Phase 3.

## Goals
- Prove the new dev shell works.
- Prove Hono API routes still work in dev and production.

## Todo
- [ ] Run `deno task format:check` and confirm there are no formatting diffs or warnings.
- [ ] Run `deno task lint` and confirm there are no lint errors or warnings.
- [ ] Run `deno task check` and confirm type generation and type checking pass cleanly.
- [ ] Run `deno task dev:app` and confirm the app boots without runtime errors or warnings.
- [ ] Hit `/api/test` and `/api/rpc/hello` in dev and confirm both responses are correct.
- [ ] Run `deno task build:worker` and confirm the production worker build succeeds cleanly.
- [ ] Confirm the Hono API contract still works in production build output.
- [ ] Record any regressions, warnings, or follow-up fixes before starting Phase 3.

## Completion notes
- Update this section with a short summary only after every check above passes without errors or warnings.
