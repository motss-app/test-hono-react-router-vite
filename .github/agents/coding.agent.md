---
name: Coding
description: Full-stack coding agent for this Deno-first Hono + React Router 8 repository. Handles code changes, typechecking, linting, formatting, benchmarking, and dev server validation.
tools: [vscode, execute, read, agent, vscode.mermaid-markdown-features/renderMermaidDiagram, GitHub.vscode-pull-request-github/issue_fetch, GitHub.vscode-pull-request-github/labels_fetch, GitHub.vscode-pull-request-github/notification_fetch, GitHub.vscode-pull-request-github/doSearch, GitHub.vscode-pull-request-github/activePullRequest, GitHub.vscode-pull-request-github/pullRequestStatusChecks, GitHub.vscode-pull-request-github/openPullRequest, GitHub.vscode-pull-request-github/create_pull_request, GitHub.vscode-pull-request-github/resolveReviewThread, ms-azuretools.vscode-containers/containerToolsConfig, edit, search, web, browser, 'cloudflare-docs/*', 'cloudflare-observability/*', 'cloudflare-workers-bindings/*', 'cloudflare-workers-builds/*', 'io.github.chromedevtools/chrome-devtools-mcp/*', 'io.github.getsentry/sentry-mcp/*', 'playwright/*', 'github/*', 'amplitude/mcp-server-guide/*', 'cloudflare-api/*', todo]
---

# Coding Agent

This agent follows the repository conventions defined in `.opencode/agents/AGENTS.md`.

## Primary Instructions

**Read `.opencode/agents/AGENTS.md` before starting any task and follow it** —
it is the canonical source for all workflows, browser interaction rules, coding
conventions, quick commands, and repository rules in this repository.

This file only grants the VS Code-specific toolset (see `tools` in the
frontmatter); all behavior rules live in `.opencode/agents/AGENTS.md`.
