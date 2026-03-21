# GitHub Copilot Instructions

This repository is a **Deno-first** project using **Hono** and **React Router v7**.

## Package Management
- **ALWAYS** use `deno install` to add dependencies.
  - Example: `deno install npm:react` or `deno install --dev npm:@types/react`.
- **NEVER** use `npm install`, `pnpm install`, or `yarn install` directly.
- Dependencies are managed in `package.json` but installed via Deno.

## Task Execution
- Use `deno task [script-name]` to run scripts defined in `deno.json`.
- Do not use `npm run`.

## Project Structure
- **Runtime**: Deno (Development & Production), Cloudflare Workers (Production).
- **Entry Points**:
  - `app/server.ts`: Entry point for Deno / Node.js (Dev).
  - `app/worker.ts`: Entry point for Cloudflare Workers.
- **Configuration**:
  - `deno.json`: Main configuration for Deno tasks and compiler options.
  - `wrangler.jsonc`: Configuration for Cloudflare Workers.
  - `vite.config.ts`: Base Vite config.
  - `vite.hono.config.ts`: *never* include the `@stylexjs/unplugin` plugin;
    the only config allowed to hold `stylex.vite()` is `vite.config.ts`.
    Plugins added to other configs are strictly prohibited and will be removed.
  - **Never create or import a global stylesheet such as `app.css`**. All
    global helpers and resets must be expressed via StyleX tokens, utilities,
    or components. Introducing vanilla CSS causes layering issues and is
    strictly prohibited.

## Coding Style
- Prefer TypeScript.
- Prefer `satisfies` for object literals that must conform to a type instead of
  annotating the variable with `const value: SomeType = ...`, unless an explicit
  variable annotation is required for a specific reason.
- Do not export values, functions, types, or interfaces unless they are actually
  consumed outside the file. Keep file-local helpers private.
- Prefer exporting values, functions, types, and interfaces at their declaration
  sites instead of using trailing `export { ... }` blocks at the end of a file.
- Use `import.meta.env` for environment variables.
- **Comments**:
  - Use `//` for single-line comments.
  - Use `/** */` for multi-line comments/JSDoc.
- **Hono Context**: Access Hono context in React Router loaders/actions via `context`.
  - Use `v8_middleware: true` in `react-router.config.ts`.
  - Define context keys using `Symbol.for` (e.g., `app/router-context.ts`).
  - In `app/ssr-handler.ts`, initialize context: `new RouterContextProvider(new Map([[HonoContext, c.var]]))`.
  - In loaders, use `context.get(HonoContext)`.
  - **Prefer** `RouterContextProvider` over `hono/context-storage` (AsyncLocalStorage) for better performance.

## Workflow
- **Instruction Updates**: When the user asks to "add instructions", update this file (`.github/copilot-instructions.md`) immediately.  
  - ***New rules:***
    * LLM responses must respect the configuration rule above and never
      gratuitously modify other Vite configs with the StyleX plugin.
    * LLMs must **never suggest adding `app.css` or any global CSS file**
      anywhere in the repo; global styling belongs inside StyleX constructs only.
- **Quality Assurance**: **ALWAYS** check for and fix type errors immediately after making any code changes. Run `deno task check` to verify. Do not leave broken types for the user to fix.
- **Testing**: Always verify changes by running relevant tests or build tasks (e.g., `deno task build`) without waiting for explicit user prompts.
