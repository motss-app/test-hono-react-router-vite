---
name: commit-push-once
description: "Use when the user explicitly invokes the commit-push-once trigger to git commit and push once. Supports staging before committing."
argument-hint: "commit (staged) changes and push once, optionally staging files first"
disable-model-invocation: true
---

# Commit push once

Use only after an explicit invocation. It grants one commit and one push on
the current branch. It does not grant branch switches, resets, amend,
force-push, retries, or unrelated cleanup.

A `pr-review-triage` full-sweep may own this commit and push. In that case,
do not require a second trigger.

## Invocation patterns

| Pattern | Behavior |
|---------|----------|
| `commit-push-once` | Commit only already-staged changes, then push. |
| `commit-push-once stage all` | Stage all untracked/modified files (`git add -A`), then commit and push. |
| `commit-push-once stage <file ...>` | Stage the specified file(s) only, then commit and push. |

## Procedure

1. Inspect status, branch, upstream, and staged diff.
2. Stage only the scope requested by the user.
3. Run the repository's format, lint, and typecheck commands. Fix failures
   and re-stage changed files.
4. Re-read the diff, use a meaningful commit message, and sign when a GPG
   key is configured.
5. Commit once, push once, verify status, and report the commit and branch.

If nothing is staged for an unstaged-only invocation, stop. If push fails,
report the failure and do not retry without a new request.

For a triage handoff, a successful push is a checkpoint. Continue only with
the triage workflow's remote review mutations. Do not create another commit
or push.
