# Agent Instructions

This file is the single source of truth for repository rules. It is read by
`.github/copilot-instructions.md` and must be kept in sync with the system-level
Agent Instructions.

## Package version rule

When adding a new npm dependency, always check the npm registry for the latest
available version before pinning. Do not guess or hardcode a version without
verifying it is the latest stable release. Run `npm view <package> version` to
find the current latest version.
