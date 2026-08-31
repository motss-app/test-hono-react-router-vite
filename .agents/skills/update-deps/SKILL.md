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
| **Bun** | `bun.lockb` | `bun pm outdated` | Check `workspaces` in `package.json` |
| **pnpm** | `pnpm-lock.yaml` | `pnpm outdated --long` | Check `pnpm-workspace.yaml` |
| **Yarn** | `yarn.lock` | `yarn outdated --json` (v1) or `yarn up -R '**' --check` (berry) | Check `workspaces` in `package.json` |
| **npm** | `package-lock.json` | `npm outdated --long --json` | Check `workspaces` in `package.json` |

**Deno:** `deno outdated` only surfaces pinned deps. Run `deno install` after manual edits. `minimumDependencyAge` (default 24h in `deno.json`) may block recent versions — note blocked versions and suggest `--minimum-dependency-age=0` override with supply-chain warning. For monorepos, check each workspace member independently.

**pnpm:** Use `pnpm outdated --recursive` for monorepos. Do NOT assume catalog is used — always scan every `package.json`.

**npm:** Use `npm outdated --workspaces` for monorepos. Each workspace may pin different versions.

**Yarn:** Berry (v2+) has no built-in `outdated` — use `yarn upgrade-interactive` or `yarn workspaces foreach --all outdated`. v1: `yarn outdated` works directly.

**Bun:** Run `bun pm outdated` from each workspace root in monorepos.

## Fetching Release Notes

Fetch each package's GitHub releases or CHANGELOG (`npm view <pkg> repository.url`). Summarize changes between current and target version — focus on breaking changes, security fixes (CVEs), deprecations.

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
| # | Risk | Package | Current -> Latest | Key Changes | Changelog |
|---|------|---------|-------------------|-------------|-----------|
| 1 | HIGH | `pkg-a` | 1.0 -> 2.0 | Breaking: removed `X` API, use `Y` instead | [link](url) |
| 2 | MED  | `pkg-b` | 3.1 -> 3.2 | Security: CVE-2026-1234 in `parseBody()` | [link](url) |
| 3 | LOW  | `pkg-c` | 2.5 -> 2.6 | Bug fix: false positive in `noUnusedVariables` | [link](url) |
```

- One row per dep, 1-3 key changes (short phrases with code-level impact).
- Group related packages (e.g., `@sentry/*`) into one row if same version bump.
- Changelog column: link to releases page or CHANGELOG.md.
- After table: recommended upgrade order (e.g., "Upgrade #3 first (LOW), then #2 (MED), manual test #1 (HIGH)").

## Upgrade Workflow

When the user picks items:

1. Apply the upgrade, then reinstall to sync lockfile (`deno install` / `npm install` / etc.).
2. Verify in order (use project-specific commands; skip if not configured):
   - Typecheck: `deno task check` / `tsc --noEmit` / `tsc -b`
   - Lint: `deno task lint` / `biome check` / `eslint .`
   - Format: `deno task format` / `biome format` / `prettier --check`
   - Tests: `deno test` / `vitest run` / `jest` / `npm test` (skip if no test config found)
   - Benchmark: `deno task bench:all` or equivalent (skip if not configured)
3. Report results (omit rows for skipped checks):

```
| Check | Result |
|-------|--------|
| Typecheck | Pass |
| Lint | Pass (pre-existing issues only) |
| Format | Pass |
| Tests | Pass (N tests) or Skipped (no test config) |
| Benchmark | No regressions |
```

4. If any check fails: stop, flag the failing package, suggest rollback. Let user decide.
5. After verification passes, ask user to confirm before next batch or committing.

## Rules

- **NEVER auto-upgrade.** Present the table, then STOP. Wait for user to reply with which #s to upgrade. No exceptions.
- Fetch real release notes — never fabricate. If fetch fails, note risk as "unknown."
- Check the codebase — if a deprecated API is used, escalate risk. Use `grep_search` to verify.
- Keep compact: one table row per dep, 1-3 key changes, always include changelog link.
