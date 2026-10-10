# Vite+ Integration

Vite+ (`vite-plus@1.0.0-rc.0`) supplies config helpers and test API imports.
Frontend tasks run pinned Vitest directly through the package script.
Vite+ also powers commit hooks.

## What was adopted

| Capability | Command | Notes |
|---|---|---|
| Tests (unit + browser) | `pnpm --dir packages/frontend test` | Runs `vitest@5.0.1` directly. Root `pnpm test` delegates across BFF, frontend, and gateway. |
| Commit hooks | `vp hooks enable` / `vp staged` | `staged` block in root `vite.config.ts` (Biome on staged files) + project-owned `.vite-hooks/pre-commit` |

## What was NOT adopted (and why)

| Capability | Status | Rationale |
|---|---|---|
| `vp dev` / `vp build` | ❌ Not wired | The repo rule prefers `pnpm [script-name]`, and the scripts in `package.json` already invoke Vite and the React Router CLI directly, so `vp` would only wrap commands that are already reachable. |
| `vp run` | ❌ Not wired | `package.json` `scripts` is now the single source of truth, so `vp run` would be a second entry point over the same commands with no caching benefit. |
| `vp install` | ❌ Not wired | `packageManager` is pinned in `package.json` and the repo rule mandates `pnpm install`, so a second installer has nothing to add. |
| `vp check` | ❌ Rejected | Repo rules mandate Biome; `pnpm check --unstable-tsgo` covers typecheck. |
| `vp pack` | ❌ Not needed | No npm libraries are published. |
| `vp migrate` | ❌ Not needed | The manifests are already pnpm (`pnpm-workspace.yaml` plus `package.json` scripts). |

- `vite-plus@1.0.0-rc.0` is pinned as a devDependency and supplies `defineConfig`
  and `vite-plus/test`.
- Frontend test tasks use the pinned Vitest CLI directly rather than going
  through `vp test`, which did not pick up the runner's TTY.
- Root `vitest.config.ts` discovers `packages/*/vitest.config.*.ts`, so each
  package can add independently named Vitest projects.
- `packages/frontend/vitest.config.ts` aggregates the `frontend-unit` and
  `frontend-browser` configs for package-local tasks.
- The unit project uses the threads pool instead of spawning one child
  process per test file.
- The direct `vitest@5.0.1` dependency matches the `vite-plus/test` API version.
- Test files import from `vite-plus/test` (re-export of upstream `vitest`).

## Test file conventions

| Suffix | Project | Environment | Notes |
|---|---|---|---|
| `*.unit.test.ts` | `frontend-unit` | node | `describe/expect/it` from `vite-plus/test` |
| `*.browser.test.ts` | `frontend-browser` | Playwright Chromium (headless) | Same imports; runs in Playwright-managed Chromium via `vitest browser` |

## Command guidance

- Repo tasks (build, lint, check, bench): `pnpm`. Tasks live in the
  `scripts` field of `package.json`.
- Package installs: `pnpm install` with pinned versions in
  `pnpm-workspace.yaml`. `vp install` is not wired.
- Testing from root: `pnpm test` runs the BFF, frontend, and gateway
  tasks. BFF and gateway currently have no tests.

(Section moved to "What was NOT adopted" table above.)

## Setup notes

- Playwright browsers must match the pinned `playwright@1.63.0`:
  `pnpm exec playwright@1.63.0 install chromium`
- Browser tests use Playwright-managed Chromium (headless), not system Chrome.
  Run the Playwright install command above before running browser tests.
- CI: `.github/actions/setup-node` installs Node from `package.json`
  (`engines.node`) and pnpm from `packageManager`, matching local.
