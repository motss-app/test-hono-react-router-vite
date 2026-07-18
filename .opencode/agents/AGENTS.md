---
name: Coding Agent
description: Custom agent using AGENTS.md instructions
mode: primary
---

# Agent Instructions

**Always work inside this directory (`/Users/rongsen/motss/test-hono-react-router-vite`).** Do not navigate outside it, and never request to access files or folders outside this directory. If a task requires something outside, stop and ask the user how to proceed.

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
6. After verification passes, probe every URL in `docs/dev-urls.md` to ensure all return 200. Run these against the gateway at `localhost:8787` (and `localhost:5173` for direct frontend URLs). If the dev servers are not running, skip this step.
7. Report what changed, what was verified, the URL probe results, and any remaining risks or blockers.

## Browser Interaction Rules

- **Never use `run_playwright_code`** when VS Code Copilot Chat browser tools (`click_element`, `screenshot_page`, `navigate_page`, `read_page`, `type_in_page`, `hover_element`, etc.) are available.
- Prefer VS Code browser tools for all browser interactions (clicking, screenshots, navigation, reading page state).
- Only fall back to `run_playwright_code` as a last resort when no equivalent browser tool exists for the needed action.

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

## Coding Conventions

- Prefer `satisfies` for object literals that must conform to a type unless an explicit variable annotation is required.
- Do not export values, functions, types, or interfaces unless they are actually consumed outside the file.
- Prefer exporting at declaration sites instead of trailing `export { ... }` blocks.
- Use `import.meta.env` for environment variables.
- Use `//` for single-line comments and `/** */` for multi-line comments/JSDoc.

## Hono + React Router Integration

- Access Hono context in React Router loaders/actions via `context`.
- Use `v8_middleware: true` in `packages/frontend/react-router.config.ts`.
- Define context keys using `Symbol.for` (e.g. `app/router-context.ts`).
- In `packages/frontend/app/ssr-handler.ts`, initialize context with `new RouterContextProvider(new Map([[HonoContext, c.var]]))`.
- In loaders, use `context.get(HonoContext)`.
- Prefer `RouterContextProvider` over `hono/context-storage` (AsyncLocalStorage) for better performance.

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`. Always use **exact** pinned versions — no caret (`^`) or tilde (`~`) prefixes in `package.json` (e.g. `"react": "19.2.7"`, not `"^19.2.7"` or `"~19.2.7"`). When installing via CLI, specify the exact version: `deno install npm:package@1.2.3`, never `deno install npm:package`.
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **One-off CLIs**: If a one-off external CLI is needed, use `pnpm dlx` instead of `npx`.
- **CLI tools**: Prefer Rust-based CLI tools when available (e.g. `rg` over `grep`, `bat` over `cat`, `fd` over `find`, `sd` over `sed`).
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Vite configs**: Never gratuitously modify Vite configs with the StyleX plugin — keep it in the designated files only.
- **Base UI components**: When implementing a component using Base UI (`@base-ui/react`), retrieve the latest API reference from `https://base-ui.com/llms.txt` before writing code. Base UI is unstyled — use vanilla-extract CSS for styling components.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function body instead.
- **JSX rendering**: Never use `&&` for conditional rendering — falsy-but-renderable values (e.g. `""`, `0`) slip through and render unintended text. Use `{condition ? <A /> : null}` or `{condition ? <A /> : <B />}` instead.
- **Temporary files**: Never write to `/tmp/` or any directory outside the workspace root. Use `/var/folders/5p/x6m44h3n36v4w5pdttg8vtrw0000gn/T/opencode` if temp space is needed — it is pre-approved for external directory access.

## Related Instruction Files

- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions (delegates to this file).
- `.github/LLMS.md`: external LLM reference material used by this repo.
- `docs/dev-urls.md`: all health check, SSR, and API URLs to probe after changes.

## Maintenance

- When the user asks to "add instructions", update this file immediately.
- Keep `.github/copilot-instructions.md` as a thin pointer to this file — do not duplicate rules there.
