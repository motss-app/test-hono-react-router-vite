---
name: one-shot-commit-push
description: "Use when the user explicitly invokes the one-shot commit/push trigger and wants the current staged changes committed and pushed exactly once."
---

# One-shot commit and push

Purpose
- Treat a user invocation as one-time authorization to commit the staged changes and push the current branch.

When to use
- The user explicitly says the one-shot trigger name.
- The task is to commit staged changes and push them once, without creating ongoing permission.

Rules
- Do not store the trigger or any permission in memory.
- Do not treat the invocation as blanket permission for later turns.
- Only commit what is already staged.
- Do not stage additional files unless the user explicitly asks.
- If nothing is staged, report that there is nothing to commit and stop.
- If the push succeeds, stop immediately.
- If the push fails, report the failure and stop; do not retry repeatedly unless the user asks.

Checklist
- [ ] inspect staged diff
- [ ] commit staged changes
- [ ] push the current branch
- [ ] verify clean status
- [ ] stop after the first successful push

Notes
- Keep commit messages concise and based on the staged changes.
- If the branch has no configured upstream, push to the repository remote the user is working against and report what happened.
