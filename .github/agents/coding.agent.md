---
name: coding
description: Full-stack coding agent for this Deno-first Hono + React Router 8 repository. Handles code changes, typechecking, linting, formatting, benchmarking, and dev server validation.
tools: [vscode/installExtension, vscode/memory, vscode/newWorkspace, vscode/resolveMemoryFileUri, vscode/runCommand, vscode/switchAgent, vscode/vscodeAPI, vscode/extensions, vscode/askQuestions, execute/runNotebookCell, execute/getTerminalOutput, execute/killTerminal, execute/sendToTerminal, execute/runTask, execute/createAndRunTask, execute/runInTerminal, execute/runTests, execute/testFailure, read/getNotebookSummary, read/problems, read/readFile, read/viewImage, read/readNotebookCellOutput, read/skill, read/terminalSelection, read/terminalLastCommand, read/getTaskOutput, agent/runSubagent, edit/createDirectory, edit/createFile, edit/createJupyterNotebook, edit/editFiles, edit/editNotebook, edit/rename, search/codebase, search/fileSearch, search/listDirectory, search/textSearch, search/usages, web/fetch, web/githubTextSearch, browser/openBrowserPage, browser/readPage, browser/screenshotPage, browser/navigatePage, browser/clickElement, browser/dragElement, browser/hoverElement, browser/typeInPage, browser/runPlaywrightCode, browser/handleDialog, github/add_comment_to_pending_review, github/add_issue_comment, github/add_reply_to_pull_request_comment, github/create_branch, github/create_or_update_file, github/create_pull_request, github/create_repository, github/delete_file, github/fork_repository, github/get_commit, github/get_file_contents, github/get_label, github/get_latest_release, github/get_me, github/get_release_by_tag, github/get_tag, github/get_team_members, github/get_teams, github/issue_read, github/issue_write, github/list_branches, github/list_commits, github/list_issue_fields, github/list_issue_types, github/list_issues, github/list_pull_requests, github/list_releases, github/list_repository_collaborators, github/list_tags, github/merge_pull_request, github/pull_request_read, github/pull_request_review_write, github/push_files, github/request_copilot_review, github/run_secret_scanning, github/search_code, github/search_commits, github/search_issues, github/search_pull_requests, github/search_repositories, github/search_users, github/sub_issue_write, github/update_pull_request, github/update_pull_request_branch, github.vscode-pull-request-github/issue_fetch, github.vscode-pull-request-github/labels_fetch, github.vscode-pull-request-github/notification_fetch, github.vscode-pull-request-github/doSearch, github.vscode-pull-request-github/activePullRequest, github.vscode-pull-request-github/pullRequestStatusChecks, github.vscode-pull-request-github/openPullRequest, github.vscode-pull-request-github/create_pull_request, github.vscode-pull-request-github/resolveReviewThread, ms-azuretools.vscode-containers/containerToolsConfig, todo]
---

# Coding Agent

This agent follows the repository conventions defined in `.opencode/agents/AGENTS.md`.

## Primary Instructions

For the complete set of instructions, workflows, and rules, refer to:
- **`.opencode/agents/AGENTS.md`** — the canonical source for agent behavior in this repository

## Key Workflows

1. **Inspect before editing** — never guess project structure
2. **Run `deno task check`** after code changes (typecheck)
3. **Run Biome check/fix** for linting and formatting
4. **Run benchmark** after concluded changes to guard against regressions
5. **Probe dev URLs** after verification passes

## Quick Commands

| Command | Description |
|---------|-------------|
| `deno task check` | Typecheck the project |
| `deno run -P=lint npm:@biomejs/biome check .` | Lint check |
| `deno run -P=lint npm:@biomejs/biome check --write .` | Lint fix |
| `deno run -P=format npm:@biomejs/biome format --write .` | Format |
| `BENCH_DURATION=20s deno task bench:all` | Full benchmark |
| `deno task dev` | Start all dev servers |

## Related Files

- `.opencode/agents/AGENTS.md` — full agent instructions
- `AGENTS.md` — root-level agent instructions
- `.github/copilot-instructions.md` — GitHub Copilot instructions
- `docs/dev-urls.md` — health check and API URLs
- `docs/setup.md` — project setup guide
- `docs/build-setup.md` — build configuration
- `docs/gateway-architecture.md` — gateway architecture overview
- `docs/rendering-modes.md` — SSR vs prerendering modes
- `docs/error-handling.md` — error handling patterns
- `docs/sentry-cloudflare-workers-vs-nodejs.md` — Sentry CF Workers vs Node.js
- `docs/benchmark-baseline.md` — benchmark baseline data
- `docs/testing.md` — testing guide
