# Vite+ Integration

Vite+ (`vite-plus@0.3.2`) supplies config helpers and test API imports.
Frontend tasks run pinned Vitest directly with Deno so `-A` reaches the runner.
Vite+ also powers commit hooks.

## What was adopted

| Capability | Command | Notes |
|---|---|---|
| Tests (unit + browser) | `deno task --cwd=packages/frontend test` | Runs `vitest@4.1.11` directly with `deno run -A`. Root `deno task test` delegates across BFF, frontend, and gateway. |
| Commit hooks | `vp hooks enable` / `vp staged` | `staged` block in root `vite.config.ts` (Biome on staged files) + project-owned `.vite-hooks/pre-commit` |

## What was NOT adopted (and why)

| Capability | Status | Rationale |
|---|---|---|
| `vp dev` / `vp build` | ❌ Not wired | `vp` runs Vite under **Node**, but all Vite configs call `Deno.*` APIs (`Deno.env`, `Deno.stderr.writeSync`, `Deno.cwd()`). Would require codebase-wide migration to `process.env`. Phase 2 runtime-agnostic config was reverted — `vp test` doesn't load app configs. |
| `vp run` | ❌ Not wired | Requires `package.json` `scripts` mirroring `deno.json` tasks. Two sources of truth, no caching benefit, conflicts with "prefer `deno task`" repo rule. |
| `vp install` | ❌ Not wired | No `packageManager` field in `package.json`. Repo rule mandates `deno install`; pnpm would fight Deno's `node_modules` + `deno.lock`. |
| `vp check` | ❌ Rejected | Repo rules mandate Biome; `deno check --unstable-tsgo` covers typecheck. |
| `vp pack` | ❌ Not needed | No npm libraries are published. |
| `vp migrate` | ❌ Avoided | Would rewrite manifests toward pnpm/npm, breaking Deno-first setup. |

- `vite-plus@0.3.2` is pinned as a devDependency and supplies `defineConfig`
  and `vite-plus/test`.
- Frontend test tasks use the pinned Vitest CLI directly. Running `vp test`
  through `deno x` started Vitest as a Deno child without permission flags and
  failed while reading `FORCE_TTY`.
- Root `vitest.config.ts` discovers `packages/*/vitest.config.*.ts`, so each
  package can add independently named Vitest projects.
- `packages/frontend/vitest.config.ts` aggregates the `frontend-unit` and
  `frontend-browser` configs for package-local Deno tasks.
- The unit project uses the threads pool so workers inherit Deno's `-A`
  permissions instead of starting permissionless Deno child processes.
- The direct `vitest@4.1.11` dependency matches the `vite-plus/test` API version.
- Test files import from `vite-plus/test` (re-export of upstream `vitest`).

## Test file conventions

| Suffix | Project | Environment | Notes |
|---|---|---|---|
| `*.unit.test.ts` | `frontend-unit` | node | `describe/expect/it` from `vite-plus/test` |
| `*.browser.test.ts` | `frontend-browser` | Playwright Chromium (headless) | Same imports; runs in Playwright-managed Chromium via `vitest browser` |

## Command guidance

- Repo tasks (build, lint, check, bench): `deno task`. Tasks live in
  `deno.json`. `vp run` is not wired because there are no `package.json`
  scripts.
- Package installs: `deno install` with pinned versions only.
  `vp install` is not wired (no `packageManager` field, conflicts with
  Deno dependency management).
- Testing from root: `deno task test` runs the BFF, frontend, and gateway
  tasks. BFF and gateway currently have no tests.

(Section moved to "What was NOT adopted" table above.)

## Setup notes

- Playwright browsers must match the pinned `playwright@1.63.0`:
  `deno run -A npm:playwright@1.63.0 install chromium`
- Browser tests use Playwright-managed Chromium (headless), not system Chrome.
  Run the Playwright install command above before running browser tests.
- CI: `.github/actions/setup-deno` pins Deno 2.9.6 (matches local).
