---
name: commit-push-once
description: "Use when the user explicitly invokes the commit-push-once trigger to git commit and push once. Supports staging before committing."
argument-hint: "commit (staged) changes and push once, optionally staging files first"
disable-model-invocation: true
---

# Commit push once

Purpose
- Treat a user invocation as one-time authorization to commit changes and push the current branch once.
- Optionally stage files before committing.

When to use
- The user explicitly says the one-shot trigger name.
- The task is to commit changes and push them once, without creating ongoing permission.
- Use this only for a one-shot git commit/push request, not for general repository cleanup or refactoring.

## Invocation patterns

| Pattern | Behavior |
|---------|----------|
| `commit-push-once` | Commit only already-staged changes, then push. |
| `commit-push-once stage all` | Stage all untracked/modified files (`git add -A`), then commit and push. |
| `commit-push-once stage <file ...>` | Stage the specified file(s) only, then commit and push. |

Examples:
- `commit-push-once stage deno.lock` — stages `deno.lock`, runs checks, commits, and pushes.
- `commit-push-once stage all` — stages everything, runs checks, commits, and pushes.
- `commit-push-once` — commits whatever is already staged, runs checks, and pushes.

Rules
- Do not store the trigger or any permission in memory.
- Do not treat the invocation as blanket permission for later turns.
- Do not stage additional files unless the user explicitly asks via `stage` keyword.
- Do not unstage, amend, or rewrite commits.
- Do not switch branches.
- If nothing is staged and no `stage` keyword was used, report that there is nothing to commit and stop.
- If the push succeeds, stop immediately for a standalone commit-push request. When this invocation is an explicitly authorized handoff from `pr-review-triage`, continue only with that workflow's post-push reaction, reply, and resolution steps. Do not make another commit or push.
- If the push fails, report the failure and stop; do not retry unless the user explicitly asks.

Success criteria
- The commit message follows commit message format from AGENTS.md
- The push target is the current branch or its configured upstream.
- Report the commit hash and branch after a successful push.

Checklist
- [ ] if `stage all` → run `git add -A`
- [ ] if `stage <file ...>` → run `git add <file ...>`
- [ ] inspect staged diff
- [ ] run `deno task format` to auto-fix formatting
- [ ] run `deno task lint` and fix any issues
- [ ] run `deno task check` and fix any type errors
- [ ] re-stage any files changed by format/lint/typecheck
- [ ] check if GPG signing is available: `git config --get user.signingkey`
- [ ] commit staged changes (use `git commit -S` if GPG key available)
- [ ] push the current branch
- [ ] verify clean status
- [ ] stop after the first successful push, unless an explicitly authorized `pr-review-triage` post-push handoff is active

Notes
- Always run format, lint, and typecheck before committing. If any check fails, fix the issues before proceeding with the commit.
- If the branch has no configured upstream, push to the repository remote the user is working against.
- Always sign commits with GPG if available. Use `git commit -S` for signed commits. If GPG is not configured, proceed without signing but note it in the commit message.
