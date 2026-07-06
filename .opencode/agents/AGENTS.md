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

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`. Always pin dependency versions — never install without a version specifier (e.g. `deno install npm:package@1.2.3`, not `deno install npm:package`).
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **CLI tools**: Prefer Rust-based CLI tools when available (e.g. `rg` over `grep`, `bat` over `cat`, `fd` over `find`, `sd` over `sed`).
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Base UI components**: When implementing a component using Base UI (`@base-ui/react`), retrieve the latest API reference from `https://base-ui.com/llms.txt` before writing code. Base UI is unstyled — use vanilla-extract CSS for styling components.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function body instead.
- **JSX rendering**: Never use `&&` for conditional rendering — falsy-but-renderable values (e.g. `""`, `0`) slip through and render unintended text. Use `{condition ? <A /> : null}` or `{condition ? <A /> : <B />}` instead.
- **Verification**: Run `deno task check` after code changes unless the task is docs-only or the user explicitly says not to.
- **Temporary files**: Never write to `/tmp/` or any directory outside the workspace root. Use `/var/folders/5p/x6m44h3n36v4w5pdttg8vtrw0000gn/T/opencode` if temp space is needed — it is pre-approved for external directory access.

## Related Instruction Files

- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions.
- `.github/LLMS.md`: external LLM reference material used by this repo.
- `docs/dev-urls.md`: all health check, SSR, and API URLs to probe after changes.

If repository conventions change, keep this file and `.github/copilot-instructions.md` aligned where they intentionally overlap.
