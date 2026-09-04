---
name: coding
description: Full-stack coding agent for this Deno-first Hono + React Router 8 repository. Handles code changes, typechecking, linting, formatting, benchmarking, and dev server validation.
tools: [vscode, execute, read, agent, vscode.mermaid-markdown-features/renderMermaidDiagram, GitHub.vscode-pull-request-github/issue_fetch, GitHub.vscode-pull-request-github/labels_fetch, GitHub.vscode-pull-request-github/notification_fetch, GitHub.vscode-pull-request-github/doSearch, GitHub.vscode-pull-request-github/activePullRequest, GitHub.vscode-pull-request-github/pullRequestStatusChecks, GitHub.vscode-pull-request-github/openPullRequest, GitHub.vscode-pull-request-github/create_pull_request, GitHub.vscode-pull-request-github/resolveReviewThread, ms-azuretools.vscode-containers/containerToolsConfig, edit, search, web, browser, 'cloudflare-docs/*', 'cloudflare-observability/*', 'cloudflare-workers-bindings/*', 'cloudflare-workers-builds/*', 'io.github.chromedevtools/chrome-devtools-mcp/*', 'io.github.getsentry/sentry-mcp/*', 'playwright/*', 'github/*', 'amplitude/mcp-server-guide/*', 'cloudflare-api/*', todo]
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
6. **Verify UI in the VS Code integrated browser** — see Frontend Verification below

## Frontend Verification (Integrated Browser)

- **Always use the VS Code integrated browser for any frontend verification**
  (visual checks, navigation, screenshots, page state). Sharing the integrated
  browser may require user permission — ask the user to share it or open a page
  with the browser tools; never work around it by spawning another browser.
- **Never write custom scripts** (Puppeteer/Playwright/`node` one-offs) or spawn
  a standalone/headless browser instance to verify the frontend.
- Prefer browser tools in this order:
  1. VS Code integrated browser tools (`open_browser_page`, `navigate_page`,
     `read_page`, `click_element`, `screenshot_page`, `type_in_page`,
     `hover_element`, `handle_dialog`, ...).
  2. Browser MCP tools (`playwright/*`, `io.github.chromedevtools/chrome-devtools-mcp/*`)
     when the integrated browser tools lack a needed capability — reuse the
     already-open page instead of launching a new browser.
- `run_playwright_code` is a last resort only when no integrated browser or MCP
  tool covers the needed action; explain why before using it.

## Code Comment Style

The user/author prefers **multi-line (block) comments in any language**. Only
use a single-line comment when the entire sentence — including all whitespace
and symbols — is strictly a one-liner that is less than 80 characters long.

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
