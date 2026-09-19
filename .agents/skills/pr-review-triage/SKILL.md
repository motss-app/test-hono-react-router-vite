---
name: pr-review-triage
description: Review GitHub PR threads against current code and safely handle justified replies and resolutions.
---

# PR Review Triage

Use this skill when the user asks to review comments on a GitHub pull request, decide which comments require code changes, and reply to or resolve comments that do not require changes.

## Outcome

Produce an evidence-backed disposition for every unresolved inline review thread:

- `fix`: the current code still has the behavior or risk described by the comment
- `fixed`: the comment correctly identified an issue and the current head already contains a verified fix
- `no-fix`: the comment is incorrect, already addressed, out of scope, or not applicable to the current implementation
- `informational`: an automated status comment or review summary that is not an inline issue

When explicitly invoked, this skill runs a full sweep. For each thread:

- `fix`: implement and verify the change, then react 👍, reply, and resolve after the push
- `fixed`: verify the existing fix, then react 👍, reply, and resolve after the push
- `no-fix`: react 👎, reply, and resolve without changing code
- `informational` or uncertain: leave open and report why

Do not push before fixes are verified. Preserve unrelated dirty work. Never
resolve a thread merely because its original line is outdated.

## Workflow

Read the repository instructions, identify the current PR and remote head,
fetch all review threads, and inspect the current code and tests. Classify
every unresolved thread, including outdated ones, then choose the disposition
above. Use judgment about the appropriate checks and smallest safe fix.

For `fix` and `fixed`, verify the result before any GitHub mutation. After
all fixes pass, commit and push, refresh the remote head, then for each
thread: react to the original comment, reply with concise evidence, and
resolve by thread ID. For `no-fix`, react, reply, and resolve without
editing code. Leave informational or uncertain threads open.

All of this happens in a single turn. Do not stop after pushing — if the
push succeeds but threads are not reacted to, replied to, and resolved, the
task is incomplete. Use `gh api graphql` for mutations. Do not resolve a
thread before its reply succeeds. After all mutations, run a final
verification query to confirm zero unresolved threads remain (excluding any
intentionally left open).

Preserve unrelated dirty work. Never resolve against a local-only or stale
head. If a mutation fails, report it rather than substituting another action.

## Final report

Report the PR, pushed head, dispositions, changes, checks, reactions, replies,
resolutions, and any threads left open with the reason.
