# Agent Instructions

- Always read this workspace `AGENTS.md` before acting.
- Always read the global `MEMORY.md` when available.
- Always read the relevant lockfile to determine the package manager and languages in use.

**This file is the single source of truth for repository rules.** Agents that auto-load this file (Codex, Copilot, and others) must follow it directly with no `@`-mention needed.

**Always work inside this directory (`/Users/rongsen/motss/test-hono-react-router-vite`).** Do not navigate outside it, and never request to access files or folders outside this directory. If a task requires something outside, stop and ask the user how to proceed.

Before editing, verify the repository root is the main checkout and the current branch is `main`. If running in a worktree or another branch, stop and ask the user to reopen the task in the Local environment. Do not create or use worktrees.

## Skill Selection

- Load `frontend-skill` when the task is primarily about visual direction, layout, landing pages, demos, or premium UI polish.
- Load `skill-vite-plugin-creation` when the task is about creating or updating a Vite plugin that watches a TypeScript entry and emits a JavaScript artifact.
- Load `commit-push-once` when the user explicitly invokes the commit-push-once trigger and wants the current staged changes committed and pushed exactly once. Treat that invocation as one-time permission only; do not reuse it until the user says so again.
- Load `remix` skill **only** when the user is migrating away from this repo to a new Remix 3 project, or asks explicitly about Remix 3 patterns. This repo itself uses **React Router v7**, not Remix 3, so do not auto-load this skill for in-repo work.

## Default Workflow

1. Inspect the relevant files before editing. Do not guess the project structure.
2. Prefer targeted changes over broad rewrites unless the user explicitly asks for a larger refactor.
3. **Always fix errors whenever possible.** When lint, typecheck, or other verification tools report issues, fix them before proceeding.
4. Follow repository rules in this file even when a skill is loaded, unless the skill gives a more specific instruction for the same area.
5. After code changes, run `deno task check` unless the task is documentation-only or the user says not to.
6. Run Biome check/fix for linting and formatting after code changes.
7. Run the benchmark after concluded changes to guard against regressions.
8. Verify UI changes in the VS Code integrated browser (see Browser Interaction Rules).
9. After verification passes, probe every URL in `docs/dev-urls.md` to ensure all return 200. Run these against the gateway at `localhost:8787` (and `localhost:5173` for direct frontend URLs). If the dev servers are not running, skip this step.
10. Report what changed, what was verified, the URL probe results, and any remaining risks or blockers.

## Browser Interaction Rules

- **Always use the VS Code integrated browser for any frontend verification**
  (visual checks, navigation, screenshots, page state). Sharing the integrated
  browser may require user permission. Ask the user to share it or open a page
  with the browser tools; never work around it by spawning another browser.
- **Never write custom scripts** (Puppeteer/Playwright/`node` one-offs) or spawn
  a standalone/headless browser instance to verify the frontend.
- Prefer browser tools in this order:
  1. VS Code integrated browser tools (`open_browser_page`, `navigate_page`,
     `read_page`, `click_element`, `screenshot_page`, `type_in_page`,
     `hover_element`, `handle_dialog`, ...).
  2. Browser MCP tools (`playwright/*`, `io.github.chromedevtools/chrome-devtools-mcp/*`)
     when the integrated browser tools lack a needed capability, reuse the
     already-open page instead of launching a new browser.
- `run_playwright_code` is a last resort only when no integrated browser or MCP
  tool covers the needed action; explain why before using it.

## Project Structure

- **Runtime**: Deno for task orchestration and builds; Cloudflare Workers for app runtime.
- **Entry Points**:
  - `packages/frontend/worker.ts`: Frontend Cloudflare Worker entry point used by local dev and production builds.
  - `packages/gateway/src/worker.ts`: Gateway Cloudflare Worker entry point.
  - `packages/frontend/app/ssr-handler.ts`: Shared SSR helper used by the frontend worker.
- **Configuration**:
  - `deno.json`: Main configuration for Deno tasks and compiler options.
  - `packages/frontend/wrangler.jsonc`: Frontend Cloudflare Worker deploy configuration.
  - `packages/frontend/vite.config.ts`: Frontend Cloudflare Vite dev config; keep `@stylexjs/unplugin` here, not in gateway configs.
  - `packages/frontend/vite.react-router.config.ts`: Frontend React Router production build config; this is also allowed to use StyleX.

## Agent Behavior Rules

- Never instruct or tell the user to check, fact check, or find out something themselves.
- Never teach or explain concepts unless the user explicitly asks.
- Do the work yourself — look it up, run the command, fetch the docs.
- When the user asks a question, you must research it and provide the answer. Do not deflect.
- When you don't know something, say so and offer to look it up.

## Coding Conventions

- Prefer `satisfies` for object literals that must conform to a type unless an explicit variable annotation is required.
- Do not export values, functions, types, or interfaces unless they are actually consumed outside the file.
- Prefer exporting at declaration sites instead of trailing `export { ... }` blocks.
- Use `import.meta.env` for environment variables.
- Use `//` for single-line comments and `/** */` for multi-line comments/JSDoc.

## Code Comment Style

The user/author prefers **multi-line (block) comments in any language**. Only
use a single-line comment when the entire sentence, including all whitespace
and symbols, is strictly a one-liner that is less than 80 characters long.

## Prose Style

Never use semicolons or em dashes in comments, docs, or user-facing prose.
Use periods, commas, or colons instead. Code statement terminators are
unaffected by this rule.

## Hono + React Router Integration

- Access Hono context in React Router loaders/actions via `context`.
- Use `v8_middleware: true` in `packages/frontend/react-router.config.ts`.
- Define context keys using `Symbol.for` (e.g. `app/router-context.ts`).
- In `packages/frontend/app/ssr-handler.ts`, initialize context with `new RouterContextProvider(new Map([[HonoContext, c.var]]))`.
- In loaders, use `context.get(HonoContext)`.
- Prefer `RouterContextProvider` over `hono/context-storage` (AsyncLocalStorage) for better performance.

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`. Always pin dependency versions. Never install without a version specifier (e.g. `deno install npm:package@1.2.3`, not `deno install npm:package`).
- **Dependency versions**: When adding a new npm dependency, always check the npm registry for the latest available version before pinning. Do not guess or hardcode a version without verifying it is the latest stable release. Run `npm view <package> version` to find the current latest version.
- **Commit descriptions**: Non-trivial fix commits must include a body explaining the problem, evidence, rationale, scope, and verification. A title alone is insufficient. For example, `fix(vrt): reduce browser concurrency` must explain the timeout, why concurrency was suspected, why the new value was chosen, and how it was verified.
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **One-off CLIs**: If a one-off external CLI is needed, use `pnpm dlx` instead of `npx`.
- **CLI tools**: Prefer Rust-based CLI tools when available (e.g. `rg` over `grep`, `bat` over `cat`, `fd` over `find`, `sd` over `sed`).
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Vite configs**: Never gratuitously modify Vite configs with the StyleX plugin. Keep it in the designated files only.
- **Base UI components**: When implementing a component using Base UI (`@base-ui/react`), retrieve the latest API reference from `https://base-ui.com/llms.txt` before writing code. Base UI is unstyled, so use vanilla-extract CSS for styling components.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value. Normalize options inside the function body instead.
- **JSX rendering**: Never use `&&` for conditional rendering. Falsy-but-renderable values (e.g. `""`, `0`) slip through and render unintended text. Use `{condition ? <A /> : null}` or `{condition ? <A /> : <B />}` instead.
- **Temporary files**: Never write to `/tmp/` or any directory outside the workspace root. Use `/var/folders/5p/x6m44h3n36v4w5pdttg8vtrw0000gn/T/opencode` if temp space is needed. It is pre-approved for external directory access.

## Quick Commands

| Command | Description |
|---------|-------------|
| `deno task check` | Typecheck the project |
| `deno run -P=lint npm:@biomejs/biome check .` | Lint check |
| `deno run -P=lint npm:@biomejs/biome check --write .` | Lint fix |
| `deno run -P=format npm:@biomejs/biome format --write .` | Format |
| `BENCH_DURATION=20s deno task bench:all` | Full benchmark |
| `deno task dev` | Start all dev servers |

## Related Instruction Files

- `.opencode/agents/AGENTS.md`: thin pointer for opencode delegating to this file (frontmatter plus pointer only). Do not duplicate rules there.
- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions (delegates to this file).
- `.github/LLMS.md`: external LLM reference material used by this repo.
- `docs/dev-urls.md`: all health check, SSR, and API URLs to probe after changes.
- `docs/setup.md`: project setup guide.
- `docs/build-setup.md`: build configuration.
- `docs/gateway-architecture.md`: gateway architecture overview.
- `docs/rendering-modes.md`: SSR vs prerendering modes.
- `docs/error-handling.md`: error handling patterns.
- `docs/sentry-cloudflare-workers-vs-nodejs.md`: Sentry CF Workers vs Node.js.
- `docs/benchmark-baseline.md`: benchmark baseline data.
- `docs/testing.md`: testing guide.

## Maintenance

- When the user asks to "add instructions", update this file immediately.
- Keep `.opencode/agents/AGENTS.md` as a thin pointer to this file (frontmatter plus pointer only). Do not duplicate rules there.
- Keep `.github/copilot-instructions.md` as a thin pointer to this file. Do not duplicate rules there.
- Keep `.github/agents/coding.agent.md` as a thin pointer to this file (frontmatter plus pointer only). Do not duplicate rules there.
