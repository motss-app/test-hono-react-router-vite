---
name: update-deps
description: Detect outdated dependencies, fetch release notes, and present a risk-aware upgrade summary so the user can decide what to upgrade now vs later.
---

# Update Dependencies Audit

Use when user says "outdated deps", "dependency audit", "upgrade check", or before a planned upgrade.

## Detection

Detect the package manager and workspace structure from the project.

| Detector | Condition | Command | Monorepo |
|----------|-----------|---------|----------|
| **Deno** | `deno.json`/`deno.jsonc` | `deno outdated --latest` | Check `workspace` in `deno.json` |
| **Rust/Cargo** | `Cargo.toml`/`Cargo.lock` | `cargo outdated --workspace --root-deps-only` when installed; otherwise use `cargo metadata` plus crates.io version data | Check every Cargo manifest; follow path dependencies and workspace roots |
| **Bun** | `bun.lockb` | `bun pm outdated` | Check `workspaces` in `package.json` |
| **pnpm** | `pnpm-lock.yaml` | `pnpm outdated --long` | Check `pnpm-workspace.yaml` |
| **Yarn** | `yarn.lock` | `yarn outdated --json` (v1) or `yarn up -R '**' --check` (berry) | Check `workspaces` in `package.json` |
| **npm** | `package-lock.json` | `npm outdated --long --json` | Check `workspaces` in `package.json` |

**Deno:** `deno outdated` only surfaces pinned deps. Run `deno install` after manual edits. `minimumDependencyAge` (default 24h in `deno.json`) may block recent versions — note blocked versions and suggest `--minimum-dependency-age=0` override with supply-chain warning. For monorepos, check each workspace member independently.

**pnpm:** Use `pnpm outdated --recursive` for monorepos. Do NOT assume catalog is used — always scan every `package.json`.

**npm:** Use `npm outdated --workspaces` for monorepos. Each workspace may pin different versions.

**Yarn:** Berry (v2+) has no built-in `outdated` — use `yarn upgrade-interactive` or `yarn workspaces foreach --all outdated`. v1: `yarn outdated` works directly.

**Bun:** Run `bun pm outdated` from each workspace root in monorepos.

**Rust/Cargo:** Find every `Cargo.toml`, including standalone crates and path
dependencies. Use `cargo metadata --format-version 1 --locked` to identify
direct, path, optional, build, and transitive dependencies. Prefer
`cargo outdated --workspace --root-deps-only --exit-code 0` when
`cargo-outdated` is installed; if it is unavailable, resolve current versions
from crates.io and compare them with `Cargo.lock` and the manifest constraints.
Do not treat a transitive crate as an upgrade candidate unless it is the source
of a security advisory or the user explicitly asks for transitive updates.
Run `cargo audit` when installed and include RustSec advisories in the risk
assessment. For WASM/Worker crates, record the target triple and any required
build tool such as `worker-build`, `wasm-bindgen`, or `wasm-opt`.

## Fetching Release Notes

Fetch each package's GitHub releases or CHANGELOG (`npm view <pkg> repository.url`). Summarize changes between current and target version — focus on breaking changes, security fixes (CVEs), deprecations.

For Rust crates, fetch the crates.io package metadata to find the repository,
then inspect that repository's releases, CHANGELOG, migration guide, or commit
range between the locked version and the proposed version. Use the crate's
official repository or RustSec as the source of truth; never infer release
changes from the version number alone. List a changelog link for every direct
Rust dependency row, and list the relevant advisory or upstream changelog for
any transitive/security row.

## Risk Classification

| Risk | Criteria | Action |
|------|----------|--------|
| HIGH | Major version bump / breaking changes / security advisory | Manual upgrade with migration testing |
| MED  | Security fix / minor version with notable changes | Review changelog, upgrade when convenient |
| LOW  | Patch version, no breaking changes | Safe to batch-upgrade |
| SKIP | Transitive or pinned by another dep | No action needed |

## Output Format

Single numbered table. No separate sections.

```
| # | Risk | Ecosystem | Package | Current -> Latest | Key Changes | Changelog |
|---|------|-----------|---------|-------------------|-------------|-----------|
| 1 | HIGH | npm | `pkg-a` | 1.0 -> 2.0 | Breaking: removed `X` API, use `Y` instead | [link](url) |
| 2 | MED  | Rust | `serde` | 1.0 -> 1.1 | API or MSRV change; verify affected derives | [link](url) |
| 3 | LOW  | npm | `pkg-c` | 2.5 -> 2.6 | Bug fix: false positive in `noUnusedVariables` | [link](url) |
```

- One row per dep, 1-3 key changes (short phrases with code-level impact).
- Group related packages (e.g., `@sentry/*`) into one row if same version bump.
- For Rust, use one row per direct dependency by default. Group tightly coupled
  crates only when they share a release and changelog; keep RustSec advisories
  as their own row when the affected crate is transitive.
- Changelog column: link to releases page or CHANGELOG.md.
- After table: recommended upgrade order (e.g., "Upgrade #3 first (LOW), then #2 (MED), manual test #1 (HIGH)").

## Upgrade Workflow

When the user picks items:

1. Apply only the rows the user selected, then reinstall/update the lockfile
   (`deno install` / `npm install` / `cargo update` / etc.). Never upgrade
   unselected rows as collateral changes.
   - Rust: update the manifest constraint when needed, then use
     `cargo update -p <crate>` or `cargo update -p <crate> --precise <version>`
     for a targeted lockfile change. Preserve path dependencies and verify the
     resulting `Cargo.lock` diff.
2. Verify in order (use project-specific commands; skip if not configured):
   - Typecheck: `deno task check` / `tsc --noEmit` / `tsc -b`
   - Lint: `deno task lint` / `biome check` / `eslint .`
   - Format: `deno task format` / `biome format` / `prettier --check`
   - Tests: `deno test` / `vitest run` / `jest` / `npm test` (skip if no test config found)
   - Benchmark: `deno task bench:all` or equivalent (skip if not configured)
   - Rust compile: `cargo check --locked` for affected crates and the relevant
     target; for Workers/WASM also run `worker-build --release` or the project's
     documented build script.
   - Rust audit: rerun `cargo audit` when it was available during detection.
3. Report results (omit rows for skipped checks):

```
| Check | Result |
|-------|--------|
| Typecheck | Pass |
| Lint | Pass (pre-existing issues only) |
| Format | Pass |
| Tests | Pass (N tests) or Skipped (no test config) |
| Benchmark | No regressions |
| Rust compile | Pass or Skipped (no Rust target/build configured) |
| Rust audit | Pass, findings reported, or Skipped (cargo-audit unavailable) |
```

4. If any check fails: stop, flag the failing package, suggest rollback. Let user decide.
5. After verification passes, ask user to confirm before next batch or committing.

## Rules

- **NEVER auto-upgrade.** Present the table, then STOP. Wait for user to reply with which #s to upgrade. No exceptions.
- Fetch real release notes — never fabricate. If fetch fails, note risk as "unknown."
- Check the codebase — if a deprecated API is used, escalate risk. Use `grep_search` to verify.
- Keep compact: one table row per dep, 1-3 key changes, always include changelog link.
