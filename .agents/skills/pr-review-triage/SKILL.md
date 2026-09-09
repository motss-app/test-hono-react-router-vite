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

When the user explicitly authorizes review interaction, handle `no-fix` threads with a thumbs-down reaction, reply, and resolution. Handle `fix` threads with a thumbs-up reaction, reply, and resolution only after the fix is implemented and verified. Handle `fixed` threads through the same thumbs-up path after verifying the existing fix. Never resolve a thread merely because its original line is outdated.

React to the original inline comment when the user authorizes review interaction:

- `THUMBS_UP` for a valid comment whose fix was implemented and verified
- `THUMBS_DOWN` for a `no-fix` comment that is incorrect, already addressed, out of scope, or not applicable
- no reaction for informational or uncertain comments

## Workflow

1. Read the repository instructions, relevant package manifest, and lockfile before inspecting code. Preserve repository-specific branch, dirty-worktree, testing, and authorization rules. If the user explicitly authorizes an exception to a repository branch guard, record that scope and do not generalize it.

2. Identify the target PR and confirm its current head SHA. Verify GitHub CLI authentication before using `gh`. Fetch all review threads, not only top-level issue comments. Prefer the GraphQL `reviewThreads` connection so each thread includes its ID, `isResolved`, `isOutdated`, path, line, and comments. Include each original review comment's GraphQL `id`, because reactions target the comment ID, not the thread ID or database ID.

3. Ignore automated status comments and review-summary bodies for inline triage unless the user asks to handle them. Number every unresolved inline thread and record its priority, author, current or outdated status, file location, and a concise disposition.

4. Inspect the current head code and tests at the referenced path. Compare the comment's claim with the current implementation, not only the historical diff location. An outdated anchor is still actionable when the same behavior remains elsewhere. Check the public contract, callers, tests, and relevant configuration before marking a concern `no-fix`.

5. For each `fix` thread, report the required change and the evidence. Do not edit code unless the user explicitly asks to implement the fixes. If fixes are authorized, make the smallest targeted change, run the relevant tests and repository-required checks, then re-read the changed files and diff before reporting completion. After a fix is verified, add a `THUMBS_UP` reaction to the original review comment. If post-fix review interaction is authorized, reply with the verified change, then resolve the thread. Do not add the reaction or resolve the thread before the fix is verified.

6. For each `fixed` thread, verify that the current head contains the requested fix and that the relevant checks pass. Do not make a duplicate code change. After verification and explicit review-interaction authorization, follow the `fix` path by adding `THUMBS_UP`, replying with the evidence, and resolving the thread.

7. For each `no-fix` thread, add a `THUMBS_DOWN` reaction to the original review comment, then write a short factual reply that explains why the concern does not require a change. After the reply succeeds, resolve the same review-thread ID. Do not resolve first. If the reaction, reply, or resolution fails, report the exact failure and leave the thread unresolved when possible.

8. Do not react to, reply to, or resolve informational comments or threads whose disposition is uncertain. Do not resolve a `fix` or `fixed` thread until its implementation is verified and the user has authorized post-fix review interaction. Ask the user when a missing product decision or contract makes classification material.

## Post-push completion

When code fixes are committed and pushed as part of this workflow, treat the push as a checkpoint rather than completion. Refresh the remote PR head and review threads after the push, then apply the authorized reaction, reply, and resolution mutations against the pushed commit. Do not act on local-only code, stale thread state, or the pre-push head. If the commit workflow ended the turn before this handoff, the next `pr-review-triage` invocation must resume here before reporting the review complete.

## GitHub mutations

Use the thread ID, not the comment database ID, for replies and resolution. The mutations are conceptually:

```graphql
mutation Reply($threadId: ID!, $body: String!) {
  addPullRequestReviewThreadReply(
    input: {pullRequestReviewThreadId: $threadId, body: $body}
  ) {
    comment { id }
  }
}

mutation Resolve($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}

mutation React($commentId: ID!, $content: ReactionContent!) {
  addReaction(input: {subjectId: $commentId, content: $content}) {
    reaction { content }
  }
}
```

Use `gh api graphql` for these operations when available. React to the original review comment, not to the reply. Keep replies specific to the observed code and avoid promising a fix that was not made.

## Final report

Report the PR URL, pushed head SHA, a numbered disposition for every thread, the evidence for each `fix`, `fixed`, or `no-fix`, reactions, replies, resolutions, and verification results. State explicitly when no threads qualified for reaction, reply, or resolution, and when no post-push actions remain pending. Mention any remaining uncertainty or blocked validation.
