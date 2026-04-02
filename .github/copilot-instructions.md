# GitHub Copilot Instructions

Shared defaults live in the global Copilot instructions. This file only contains
repository-specific rules for this codebase.

This repository is a **Deno-first** project using **Hono** and **React Router v7**.

## Repo-specific workflow

- **ALWAYS** use `deno install` to add dependencies.
  - Example: `deno install npm:react` or `deno install --dev npm:@types/react`.
- Dependencies are managed in `package.json` but installed via Deno.
- Use `deno task [script-name]` to run scripts defined in `deno.json`.
- Do not use `npm run` or `pnpm run` for this repo.
- If a one-off external CLI is needed, use `pnpm dlx` instead of `npx`.

## Project structure

- **Runtime**: Deno (Development & Production), Cloudflare Workers (Production).
- **Entry Points**:
  - `app/server.ts`: Entry point for Deno / Node.js (Dev).
  - `app/worker.ts`: Entry point for Cloudflare Workers.
- **Configuration**:
  - `deno.json`: Main configuration for Deno tasks and compiler options.
  - `wrangler.jsonc`: Configuration for Cloudflare Workers.
  - `vite.hono.config.ts`: *never* include the `@stylexjs/unplugin` plugin; the only config allowed to hold `stylex.vite()` is `vite.config.ts`.
  - **Never create or import a global stylesheet such as `app.css`**. All global helpers and resets must be expressed via StyleX tokens, utilities, or components.

## Coding conventions

- Prefer `satisfies` for object literals that must conform to a type unless an explicit variable annotation is required.
- Do not export values, functions, types, or interfaces unless they are actually consumed outside the file.
- Prefer exporting values, functions, types, and interfaces at their declaration sites instead of using trailing `export { ... }` blocks.
- Use `import.meta.env` for environment variables.
- Avoid default parameter values in function signatures. Do not use `= {}` or any other default parameter value; prefer explicit local normalization instead.
- Use `//` for single-line comments and `/** */` for multi-line comments/JSDoc.

## Hono + React Router integration

- Access Hono context in React Router loaders/actions via `context`.
- Use `v8_middleware: true` in `react-router.config.ts`.
- Define context keys using `Symbol.for` (e.g. `app/router-context.ts`).
- In `app/ssr-handler.ts`, initialize context with `new RouterContextProvider(new Map([[HonoContext, c.var]]))`.
- In loaders, use `context.get(HonoContext)`.
- Prefer `RouterContextProvider` over `hono/context-storage` (AsyncLocalStorage) for better performance.

## Maintenance rules

- When the user asks to "add instructions", update this file immediately.
- Never gratuitously modify other Vite configs with the StyleX plugin.
- Never suggest adding `app.css` or any other global CSS file anywhere in the repo.
- Always check for and fix type errors after code changes with `deno task check`.
- Always verify relevant tests or build tasks (for example `deno task build`) after changes.
