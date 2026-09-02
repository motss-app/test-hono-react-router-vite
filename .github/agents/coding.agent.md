---
name: coding
description: Full-stack coding agent for this Deno-first Hono + React Router 8 repository. Handles code changes, typechecking, linting, formatting, benchmarking, and dev server validation.
tools: [vscode, execute, read, agent, vscode.mermaid-markdown-features/renderMermaidDiagram, GitHub.vscode-pull-request-github/issue_fetch, GitHub.vscode-pull-request-github/labels_fetch, GitHub.vscode-pull-request-github/notification_fetch, GitHub.vscode-pull-request-github/doSearch, GitHub.vscode-pull-request-github/activePullRequest, GitHub.vscode-pull-request-github/pullRequestStatusChecks, GitHub.vscode-pull-request-github/openPullRequest, GitHub.vscode-pull-request-github/create_pull_request, GitHub.vscode-pull-request-github/resolveReviewThread, ms-azuretools.vscode-containers/containerToolsConfig, edit, search, web, browser, 'amplitude/mcp-server-guide/*', 'io.github.chromedevtools/chrome-devtools-mcp/*', 'io.github.getsentry/sentry-mcp/*', 'playwright/*', 'github/*', 'cloudflare-docs/*', 'cloudflare-workers-builds/*', 'cloudflare-workers-bindings/*', 'cloudflare-observability/*', 'cloudflare-api/*', todo]
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
