# Agents

Purpose: route tasks to the right workspace skill and record repository rules that should apply to any coding agent working in this repo.

Read this file before making changes.

## How To Use This File

- If a task matches a listed skill, load that `SKILL.md` before proceeding.
- If multiple skills match, use the most specific skill first and treat broader skills as supporting guidance.
- If no skill matches, follow the default workflow and repository rules in this file.
- Keep this file agent-agnostic. GitHub Copilot-specific behavior belongs in `.github/copilot-instructions.md`.

## Skill Selection

- Load `frontend-skill` when the task is primarily about visual direction, layout, landing pages, demos, or premium UI polish.
- Load `skill-vite-plugin-creation` when the task is about creating or updating a Vite plugin that watches a TypeScript entry and emits a JavaScript artifact.
- Load `commit-push-once` when the user explicitly invokes the commit-push-once trigger and wants the current staged changes committed and pushed exactly once. Treat that invocation as one-time permission only; do not reuse it until the user says so again.

## Default Workflow

1. Inspect the relevant files before editing. Do not guess how the project is structured.
2. Prefer targeted changes over broad rewrites unless the user explicitly asks for a larger refactor.
3. Follow repository rules in this file even when a skill is loaded, unless the skill gives a more specific instruction for the same area.
4. After code changes, run the appropriate verification commands. At minimum, run `deno task check` unless the task is documentation-only or the user says not to.
5. Report what changed, what was verified, and any remaining risks or blockers.

## Skills

| Skill | Location | Use when | Notes |
|-------|----------|----------|-------|
| `frontend-skill` | `.github/skills/frontend-skill/SKILL.md` | The task depends on strong art direction, hierarchy, motion, landing-page composition, demo polish, or premium UI quality. | Use for both marketing surfaces and visually led app UI. |
| `skill-vite-plugin-creation` | `.github/skills/skill-vite-plugin-creation/SKILL.md` | The task is to create or update a Vite plugin that watches a TypeScript entry file and emits a built JS artifact for dev and production. | Especially relevant for files under `vite-plugins/**`. |
| `commit-push-once` | `.github/skills/commit-push-once/SKILL.md` | The user explicitly wants the staged changes committed and pushed once, as a command-like trigger. | One-time authorization only; do not persist permission beyond the current invocation. |

## Repository Rules

- **Package management**: Use `deno install` for dependencies. Do not use `npm install`.
- **Task execution**: Prefer `deno task [script-name]` for project scripts. Do not use `npm run` or `pnpm run` for repo tasks.
- **Styling**: Use StyleX (`@stylexjs/stylex`). Do not create or import global CSS files such as `app.css`.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function body instead.
- **Verification**: Run `deno task check` after code changes unless the task is docs-only or the user explicitly says not to.

## Related Instruction Files

- `.github/copilot-instructions.md`: repository-specific GitHub Copilot instructions.
- `.github/LLMS.md`: external LLM reference material used by this repo.

If repository conventions change, keep this file and `.github/copilot-instructions.md` aligned where they intentionally overlap.
