# Headers Plugin Plan

This document outlines the implementation of a mode-aware Vite plugin to manage `_headers` files for Cloudflare Pages. This replaces the manual `scripts/copy-headers.ts` workflow.

## Goals
- **Automate**: Handle header copying within the Vite build lifecycle.
- **Mode-Aware**: Honor `vite --mode production|canary` to ship the correct cache policies.
- **Deno-Native**: Use Deno APIs and `@std/path` (no Node.js built-ins).
- **Strict**: Fail the build if the required headers file is missing.

## Implementation Details

### Plugin: `vite-plugins/copy-headers.ts`
The plugin hooks into `writeBundle` to copy the environment-specific headers file to the build output.

- **Inputs**:
  - `mode`: The active Vite mode (e.g., `production`, `canary`).
  - `headersDir`: Directory containing source header files (e.g., `headers/`).
  - `dest`: Destination path for the `_headers` file (e.g., `build/client/_headers`).
- **Logic**:
  1. Resolve source file: `headers/_headers.${mode}`.
  2. Check existence using `Deno.statSync`.
  3. **Throw error** if the file is missing (no fallback to production).
  4. Copy file to `dest` using `Deno.copyFileSync`.

### Configuration
- **`vite.react-router.config.ts`**:
  - Imports `headersCopyPlugin`.
  - Passes `mode`, `headersDir: 'headers'`, and `dest: 'build/client/_headers'`.
  - This ensures the headers are copied during the client build.
- **`vite.hono.config.ts`**:
  - **Does NOT** include the plugin.
  - Relies on `emptyOutDir: false` to preserve the `build/client` folder created by the React Router build.

## Workflow

```text
       [ deno task build ]
               |
               v
    +-----------------------------+
    | 1. Client Build (RR7)       |
    | vite.react-router.config.ts |
    +-------------+---------------+
                  |
                  | (writeBundle)
                  v
        +---------------------+
        |  headersCopyPlugin  |
        +----------+----------+
                   |
          Reads    |    Writes
      headers/     |   build/client/
     _headers.prod |   _headers
                   |
                   v
    +-----------------------------+
    | 2. Server Build (Hono)      |
    | vite.hono.config.ts         |
    +-------------+---------------+
                  |
                  | (emptyOutDir: false)
                  v
        [ Preserves _headers ]
        [ Writes server.js   ]
```

1. `deno task build` triggers:
   - `vite build --config vite.react-router.config.ts` (Client Build) -> **Plugin runs, copies headers**.
   - `vite build --config vite.hono.config.ts` (Server Build) -> **Preserves headers**.

## Caching Expectations

Prerendered HTML/SSG routes now use the production cache policy in both production and canary builds; only the non-prerendered static asset rows remain mode-specific.

| Mode | Route group | Browser `max-age` | CDN `s-maxage` | `stale-while-revalidate` | Additional directives |
| ---- | ----------- | ---------------- | -------------- | -------------------------- | --------------------- |
| `production` | HTML/SSG routes | 600s (10 m) | 3600s (1 h) | 180s (3 m) | `must-revalidate` |
| | Other static assets | 1800s (30 m) | 10800s (3 h) | 300s (5 m) | `must-revalidate` |
| | Hashed `/assets/*` | 604800s (7 d) | 315360000s (10 y) | 86400s (24 h) | `immutable` |
| `canary` | HTML/SSG routes | 600s (10 m) | 3600s (1 h) | 180s (3 m) | `must-revalidate` |
| | Other static assets | 900s (15 m) | 3600s (1 h) | 180s (3 m) | `must-revalidate` |
| | Hashed `/assets/*` | 86400s (1 d) | 31536000s (1 y) | 21600s (6 hr) | — |
