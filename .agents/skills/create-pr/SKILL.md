---
name: create-pr
description: "Use when the user wants to create a PR for the current branch. Auto-assigns labels, assigns to branch creator, generates PR description with issue links, blast radius, and verification summary."
argument-hint: "create a pr for this branch"
disable-model-invocation: true
---

# Create PR

Purpose
- Create a GitHub PR for the current branch with auto-generated description, labels, and assignee.

When to use
- The user explicitly says "create a pr" or similar.
- The branch has commits ready for review.

Rules
- Always prompt for base branch if not provided by user.
- Do not force-push or rewrite commits.
- Stop after the first successful PR creation.

## Prerequisites

- `gh` CLI must be authenticated (`gh auth status`).
- Current branch must have at least one commit.
- Current branch must be pushed to remote (or push it first).
- GPG signing should be available if possible (check `git config --get user.signingkey`).

## Checklist

- [ ] Determine base branch (prompt user if not provided)
- [ ] Get branch creator via `git log --format='%ae' -1`
- [ ] Analyze commits for labels and issue links
- [ ] Verify GPG signing is available (note in PR if not)
- [ ] Generate PR description
- [ ] Create PR with `gh pr create`
- [ ] Report PR URL

## Base Branch Detection

1. If user provides a base branch, use it.
2. Otherwise, prompt the user: "What is the base branch? (e.g., main, develop)"
3. Validate the base branch exists: `git rev-parse --verify <base>`

## Label Assignment

Parse conventional commit prefixes to assign labels:

| Commit prefix | Label |
|---------------|-------|
| `feat:` | `enhancement` |
| `fix:` | `bug` |
| `docs:` | `documentation` |
| `chore:` | `dependencies` |
| `refactor:` | `refactor` |
| `test:` | `tests` |
| `perf:` | `performance` |
| `ci:` | `ci` |
| `build:` | `build` |

Also assign:
- `vanilla-extract` if any `.css.ts` files changed
- `stylex` if any `.stylex.ts` files were deleted
- `breaking-change` if commit message contains `BREAKING CHANGE` or `!:`

Use `gh label list` to verify labels exist before assigning. Create missing labels with `gh label create`.

## PR Description Format

Follow line length limits from AGENTS.md (72 chars max per line).

```markdown
## Summary

<1-2 sentence summary of what this PR does>

## Changes

<bullet list of key changes, grouped by theme>

- **Theme 1**: description
- **Theme 2**: description

## Issue Links

<list any linked issues, or "None" if no issues referenced>

Closes #<issue-number>

## Blast Radius

| Category | Details |
|----------|---------|
| Files changed | <count> |
| Insertions | +<lines> |
| Deletions | -<lines> |
| Packages affected | <list packages> |
| Risk level | low / medium / high |

## Verification

<list all verification steps performed>

- [ ] Typecheck passed (`deno task check`)
- [ ] Biome lint passed
- [ ] Biome format passed
- [ ] Dev server probe: all URLs return 200
- [ ] Benchmark: no regression detected

## Testing

<how to test this change manually>
```

## Issue Link Detection

Scan commit messages for issue references:
- `Closes #123`, `Fixes #123`, `Resolves #123`
- `#123` in commit body
- `Issue: #123`

Extract all unique issue numbers and include them in the PR description.

## Commit Analysis

Run `git log <base>..<head> --oneline` to get all commits in the branch.

For each commit:
1. Parse the conventional commit prefix
2. Extract the commit message subject
3. Check for issue references
4. Check for breaking changes

## Blast Radius Calculation

Run `git diff --stat <base>..<head>` to get:
- Total files changed
- Total insertions and deletions
- List of affected packages (from file paths)

Risk assessment:
- **low**: < 10 files, no config changes, no dependency changes
- **medium**: 10-50 files, or config changes, or dependency changes
- **high**: > 50 files, or breaking changes, or critical path files

## Verification Summary

Check what verification was performed by examining:
1. Recent git log for verification-related commits
2. CI status via `gh api repos/{owner}/{repo}/commits/{sha}/status`
3. Presence of test files in the diff

## Execution

1. Get branch creator: `git log --format='%ae' -1`
2. Get base branch (prompt if not provided)
3. Analyze commits: `git log {base}..HEAD --oneline`
4. Get diff stats: `git diff --stat {base}..HEAD`
5. Generate PR title using PR Title Generation rules below
6. Generate PR description using template above
7. Create PR:
   ```bash
   gh pr create \
     --base {base} \
     --title "{title}" \
     --body "{description}" \
     --assignee "{creator}" \
     --label "{labels}"
   ```
8. Report PR URL

## PR Title Generation

Follow commit message format from AGENTS.md.

**PR-specific scope priority** (overrides AGENTS.md for PR titles):
1. If issue references found: use issue number (e.g., `feat(#123):`)
2. Else if single package affected: use package name (e.g., `feat(frontend):`)
3. Else if single domain: use domain (e.g., `feat(auth):`, `feat(bench):`)
4. Else use `deps`, `ci`, `build`, or `misc` as appropriate

**Description**:
- Use imperative mood ("add" not "added")
- No period at end
- Concise summary of the change
- Truncate with `...` if exceeds 72 chars total

**Fallback**: If no conventional commits found, use first commit message truncated to 72 chars.
