# Vite+ Integration

Vite+ (`vp` 0.3.0) is integrated for **testing and commit hooks only**.
See `2026-08-30-vite-plus-integration-plan.md` for the full fit assessment.

## What was adopted

| Capability | Command | Notes |
|---|---|---|
| Tests (unit + browser) | `vp test run` / `deno task --cwd=packages/frontend test` | Two named projects: `unit` (node), `browser` (Playwright Chromium, headless) |
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

- The **global `vp` CLI** is installed (official installer, `v0.3.0`) — restart
  the shell after installing.
- `vite-plus@0.3.0` is also a pinned devDependency (via `deno install --dev`);
  deno tasks invoke it through `deno x vp` so CI works without the global CLI.
- `packages/frontend/vitest.config.ts` uses `defineConfig` from `vite-plus` with
  two named projects (`unit`, `browser`).
- Test files import from `vite-plus/test` (re-export of upstream `vitest`).

## Test file conventions

| Suffix | Project | Environment | Notes |
|---|---|---|---|
| `*.unit.test.ts` | `unit` | node | `describe/expect/it` from `vite-plus/test` |
| `*.browser.test.ts` | `browser` | Playwright Chromium (headless) | Same imports; runs in Playwright-managed Chromium via `vitest browser` |

## Command guidance

- **Repo tasks** (build, lint, check, bench): `deno task` — tasks live in
  `deno.json`. `vp run` is not wired (no `package.json` scripts).
- **Package installs**: `deno install` (pinned versions) only.
  `vp install` is not wired (no `packageManager` field, conflicts with
  Deno dependency management).
- **Testing from root**: `deno task test` delegates to
  `deno task --cwd=packages/frontend test` which runs `deno x vp test run`.
  `deno x vp test run` from root does NOT work — vitest can't resolve nested
  `test.projects` inside workspace project configs.

(Section moved to "What was NOT adopted" table above.)

## Setup notes

- Global CLI: `curl -fsSL https://vite.plus | bash` (already done on this machine).
- Playwright browsers must match the pinned `playwright@1.62.1`:
  `deno run -A npm:playwright@1.62.1 install chromium`
- Browser tests use Playwright-managed Chromium (headless), not system Chrome.
  Run the Playwright install command above before running browser tests.
- CI: `.github/actions/setup-deno` pins Deno 2.9.6 (matches local).
