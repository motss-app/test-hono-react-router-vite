# Agents

This file lists available skills and agents for this workspace. LLMs should consult this file to discover reusable workflows.

## Skills

| Skill | Location | Description |
|-------|----------|-------------|
| `frontend-skill` | `.github/skills/frontend-skill/SKILL.md` | Vendored OpenAI frontend skill for visually strong landing pages, apps, demos, and premium UI direction. |
| `skill-vite-plugin-creation` | `.github/skills/skill-vite-plugin-creation/SKILL.md` | Create or update a Vite plugin that watches a TypeScript entry file and emits a built JS artifact for dev and production builds. Provides templates, decision points, and validation checks. |

## How to use

When a task matches a skill's description, load the corresponding `SKILL.md` file before proceeding. Skills contain tested instructions, templates, and best practices specific to this project.

## Conventions

- **Package management**: Use `deno install` for dependencies, never `npm install`.
- **Task execution**: Use `deno task [script-name]` to run scripts.
- **Styling**: Use StyleX (`@stylexjs/stylex`). Never create global CSS files.
- **Function signatures**: Avoid default parameter values. Do not use `= {}` or any other default parameter value; normalize options inside the function instead.
- **Type checking**: Run `deno task check` after code changes.
