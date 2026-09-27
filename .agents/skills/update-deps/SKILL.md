---
name: update-deps
description: Audit outdated dependencies and present a risk-aware table so the user picks rows before anything changes. Catalog-aware. Use for "outdated deps", "dependency audit", "upgrade check", "update deps", or before a planned upgrade.
---

# Update Dependencies Audit

## Detection

Detect the package manager, the workspace shape, and any version catalog. A repo
can use several at once (for example Node and Rust), so detect every match and
audit each. If no lockfile matches, or two ecosystems conflict, ask the user
instead of guessing.

**Monorepo:** Decide this first, because it decides where a version may be edited.

- Node: `workspaces` in `package.json`, `pnpm-workspace.yaml`, or Deno `workspace` in
  `deno.json`. Rust: a `Cargo.toml` with `[workspace]`, plus every member manifest
  and any standalone crate outside it.
- Audit every member manifest, not just the root. A package pinned in several
  members is one central entry, not N edits. Path dependencies stay path deps.
- If it is a monorepo and no catalog exists, say so and ask before editing. Do not
  scatter a version across member manifests by default.

**Catalogs (any package manager):** A `catalog` block is the source of truth for
versions wherever it is defined. Check every manifest and `pnpm-workspace.yaml`:

```bash
rg -n '"catalogs?"' --glob '**/package.json' --glob '**/pnpm-workspace.yaml' .
rg -n '"catalog:' --glob '**/package.json' .
```

- If a catalog is present, **use it**: edit the catalog entry, not the consuming
  manifest. Named catalogs (`catalogs: { name: {...} }`) count, so match a consumer's
  `catalog:` or `catalog:name` reference to the right entry.
- `deno outdated` can miss catalog-only drift. Cross-check with `npm view <pkg> version`.

| Detector | Condition | Command |
|----------|-----------|---------|
| **Deno** | `deno.json`/`deno.jsonc` | `deno outdated --latest` |
| **Rust/Cargo** | `Cargo.toml`/`Cargo.lock` | `cargo outdated --workspace --root-deps-only`, else `cargo metadata` plus crates.io |
| **Bun** | `bun.lockb` | `bun pm outdated` from each workspace root |
| **pnpm** | `pnpm-lock.yaml` | `pnpm outdated --long --recursive` |
| **Yarn** | `yarn.lock` | `yarn outdated --json` (v1), `yarn workspaces foreach --all outdated` (berry) |
| **npm** | `package-lock.json` | `npm outdated --long --json --workspaces` |

**Deno:** `deno outdated` only surfaces pinned deps. Run `deno install` after manual
edits. `minimumDependencyAge` (default 24h) may block recent versions, see workflow
step 1.

**Rust/Cargo:** `cargo metadata --format-version 1 --locked` identifies direct, path,
optional, build, and transitive deps. Do not treat a transitive crate as an upgrade
candidate unless it has a security advisory or the user asks. Run `cargo audit` when
installed and fold RustSec advisories into the risk assessment. For WASM/Worker
crates, record the target triple and required build tool such as `worker-build`,
`wasm-bindgen`, or `wasm-opt`.

## Fetching Release Notes

Fetch each package's GitHub releases or CHANGELOG (`npm view <pkg> repository.url`).
Summarize changes between current and target, focusing on breaking changes,
security fixes, and deprecations. Never fabricate; if a fetch fails, mark the row
risk as "unknown".

For Rust crates, find the repository via crates.io metadata and read its releases,
CHANGELOG, or migration guide between the locked and proposed versions. Never
infer changes from the version number alone. List a changelog link for every
direct Rust dep and the advisory link for any transitive or security row.

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
| # | Risk | Ecosystem | Package | Current -> Exact Pin | Edit Target | Key Changes | Changelog |
|---|------|-----------|---------|---------------------|-------------|-------------|-----------|
| 1 | HIGH | npm | `pkg-a` (catalog) | 1.0.0 -> 2.0.3 | `catalog` | Breaking: removed `X` API, use `Y` instead | [link](url) |
| 2 | MED  | Rust | `serde` | 1.0.219 -> 1.0.229 | `Cargo.toml` | MSRV change; verify affected derives | [link](url) |
| 3 | LOW  | npm | `pkg-c` (new catalog entry) | 2.5.0 -> 2.6.1 | `catalog` | Bug fix in `noUnusedVariables` | [link](url) |
```

- Every row shows the **exact** target pin, never a range. Resolve it before the
  table where possible, otherwise mark it `unresolved` and ask.
- Edit Target names the file or block to change: `catalog`, a named catalog, a
  `package.json` or `Cargo.toml` path, or a specific member manifest.
- One row per dep, 1-3 key changes, short phrases with code-level impact.
- Changelog column: link to releases page or CHANGELOG.md.
- Group packages sharing a version bump into one row (for example `@sentry/*`).
- Rust: one row per direct dep, except RustSec advisories, which get their own.
- After the table, give a recommended order (e.g. "3 (LOW) first, then 2 (MED),
  manual test 1 (HIGH)").

## Upgrade Workflow

When the user picks items:

1. Pin the exact target version per row, always. npm: `npm view <pkg> version`,
   then write it with no `^` or `~`. Rust: `cargo update -p <crate> --precise
   <version>`, or an exact manifest constraint such as `=0.2.129` when the project
   already pins that way. Take the newest release that clears `minimumDependencyAge`;
   if age policy blocks the newest, take the newest allowed and say so. Never pass
   `--minimum-dependency-age=0` without explicit approval. If a version cannot be
   resolved or pinned exactly, stop and ask.
2. Apply only the picked rows, then update the lockfile (`deno install` /
   `pnpm install` / `npm install` / `cargo update`). No collateral upgrades.
   - Catalog: edit the `catalog` entry, leave every `"pkg": "catalog:"` reference
     alone, reinstall, then confirm the catalog survived.
   - Rust: update the manifest constraint when needed, keep path dependencies, and
     check the `Cargo.lock` diff.
   - If one pin blocks another (for example `worker 0.8.7` needs
     `wasm-bindgen ^0.2.129` against an `=0.2.128` pin), upgrade the coupled set
     together and match any required CLI tool. Note the coupling in the summary.
3. Verify in order, skipping anything not configured: typecheck, lint, format,
   tests, benchmark, `cargo check --locked` for affected crates (plus
   `worker-build --release` or the documented build script for Workers/WASM), and
   `cargo audit` if it was available during detection.
4. Report results, omitting skipped checks:

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

5. If a check fails, stop, flag the package, and suggest rollback.
6. After verification, re-read each upgraded manifest entry and confirm it is an
   exact pin. Report the pins applied, then ask before the next batch or any commit.

## Rules

- **When unsure, ask.** Never guess. Stop and ask the user when the package
  manager cannot be detected or two ecosystems conflict, an exact version cannot
  be resolved or the registry lookup fails, the migration path for a breaking
  change is unclear, two pins conflict, release notes are missing, or the monorepo
  shape is ambiguous (no catalog, or a package pinned differently across members).
  State what is known, what is blocking, and the options. Do not downgrade a pin to
  a range or skip a row to make progress.
- **Table first.** Present the table, then stop. No edit, install, or version write
  until the user replies with row numbers. An audit-only request ends at the table.
  A hook or evaluator claiming nothing was upgraded does not authorize edits.
- **Undo means stop.** If the user reverts your edits, wait for a new instruction
  rather than retrying differently.
- **Catalogs and monorepos.** Follow the Detection rules: edit the catalog entry
  when one exists, and route a version to the one place that package manager
  centralizes it. Never delete, inline, or flatten a catalog, turn a `catalog:`
  reference into a literal, or add a literal beside an existing reference. If an
  install or formatter flattens one, restore from git and say so.
- **Pin exactly, always.** Every upgraded package and crate ends up at an exact
  version. No `^`, `~`, `>=`, `x`, or "latest" ranges, and no leaving a version
  unpinned, whatever the reason. If a pin is impossible, ask the user. After the
  install, re-read the manifest and confirm every upgraded entry is exact.
- **Skipped means skipped.** If the user excludes a package, drop it from the
  actionable rows and leave its pin untouched.
- **Escalate real risk.** Use `grep_search` to confirm a deprecated API is actually
  used, and never invent changelog entries.
- **No commit or push** unless the user asks in that same request.
