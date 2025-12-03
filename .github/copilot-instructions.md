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

## Coding Style
- Prefer TypeScript.
- Use `import.meta.env` for environment variables.

## Workflow
- **Instruction Updates**: When the user asks to "add instructions", update this file (`.github/copilot-instructions.md`) immediately.
- **Quality Assurance**: **ALWAYS** check for and fix type errors immediately after making any code changes. Run `deno task check` to verify. Do not leave broken types for the user to fix.
- **Testing**: Always verify changes by running relevant tests or build tasks (e.g., `deno task build`) without waiting for explicit user prompts.
