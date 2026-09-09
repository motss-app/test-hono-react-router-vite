---
name: pr-review-triage
description: Review GitHub PR threads against current code and safely handle justified replies and resolutions.
---

# PR Review Triage

Use this skill when the user asks to review comments on a GitHub pull request, decide which comments require code changes, and reply to or resolve comments that do not require changes.

## Outcome

Produce an evidence-backed disposition for every unresolved inline review thread:

- `fix`: the current code still has the behavior or risk described by the comment
- `no-fix`: the comment is incorrect, already addressed, out of scope, or not applicable to the current implementation
- `informational`: an automated status comment or review summary that is not an inline issue

When the user explicitly authorizes review interaction, reply to and resolve only `no-fix` threads. Never resolve a `fix` thread merely because its original line is outdated.

## Workflow

1. Read the repository instructions, relevant package manifest, and lockfile before inspecting code. Preserve repository-specific branch, dirty-worktree, testing, and authorization rules. If the user explicitly authorizes an exception to a repository branch guard, record that scope and do not generalize it.

2. Identify the target PR and confirm its current head SHA. Verify GitHub CLI authentication before using `gh`. Fetch all review threads, not only top-level issue comments. Prefer the GraphQL `reviewThreads` connection so each thread includes its ID, `isResolved`, `isOutdated`, path, line, and comments.

3. Ignore automated status comments and review-summary bodies for inline triage unless the user asks to handle them. Number every unresolved inline thread and record its priority, author, current or outdated status, file location, and a concise disposition.

4. Inspect the current head code and tests at the referenced path. Compare the comment's claim with the current implementation, not only the historical diff location. An outdated anchor is still actionable when the same behavior remains elsewhere. Check the public contract, callers, tests, and relevant configuration before marking a concern `no-fix`.

5. For each `fix` thread, report the required change and the evidence. Do not edit code unless the user explicitly asks to implement the fixes. If fixes are authorized, make the smallest targeted change, run the relevant tests and repository-required checks, then re-read the changed files and diff before reporting completion.

6. For each `no-fix` thread, write a short factual reply that explains why the concern does not require a change. After the reply succeeds, resolve the same review-thread ID. Do not resolve first. If either mutation fails, report the exact failure and leave the thread unresolved.

7. Do not reply to or resolve `fix` threads, informational comments, or threads whose disposition is uncertain. Ask the user when a missing product decision or contract makes classification material.

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
```

Use `gh api graphql` for these operations when available. Keep replies specific to the observed code and avoid promising a fix that was not made.

## Final report

Report the PR URL, head SHA, a numbered disposition for every thread, the evidence for each `fix` or `no-fix`, mutations performed, and verification results. State explicitly when no threads qualified for reply and resolution. Mention any remaining uncertainty or blocked validation.
