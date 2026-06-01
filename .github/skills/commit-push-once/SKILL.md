---
name: commit-push-once
description: "Use when the user explicitly invokes the commit-push-once trigger to git commit already staged changes and push them once. Do not auto-load for general git work."
argument-hint: "commit staged changes and push once"
disable-model-invocation: true
---

# Commit push once

Purpose
- Treat a user invocation as one-time authorization to commit only the staged changes and push the current branch once.

When to use
- The user explicitly says the one-shot trigger name.
- The task is to commit already staged changes and push them once, without creating ongoing permission.
- Use this only for a one-shot git commit/push request, not for general repository cleanup or refactoring.

Rules
- Do not store the trigger or any permission in memory.
- Do not treat the invocation as blanket permission for later turns.
- Only commit what is already staged.
- Do not stage additional files unless the user explicitly asks.
- Do not unstage, amend, or rewrite commits.
- Do not switch branches.
- If nothing is staged, report that there is nothing to commit and stop.
- If the push succeeds, stop immediately.
- If the push fails, report the failure and stop; do not retry unless the user explicitly asks.

Success criteria
- The commit message is concise, based on the staged changes, and follows Conventional Commits format (for example, `fix: ...` or `chore: ...`).
- The push target is the current branch or its configured upstream.
- Report the commit hash and branch after a successful push.

Checklist
- [ ] inspect staged diff
- [ ] commit staged changes
- [ ] push the current branch
- [ ] verify clean status
- [ ] stop after the first successful push

Notes
- If the branch has no configured upstream, push to the repository remote the user is working against.
