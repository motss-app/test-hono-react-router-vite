# Theme bootstrap virtual module

This document explains how `themeBuildPlugin()` turns the theme bootstrap entry into:

- a stable dev-only script endpoint
- a hashed production asset
- a virtual module that tells the app which script URL to load

The app imports:

```ts
import { themeBootstrapSrc } from 'virtual:theme-bootstrap';
```

and the plugin decides what those values should be in dev versus build.

## Files involved

- `app/critical/theme-bootstrap/bootstrap.ts`
  Real browser code that runs before hydration and sets the theme.

- `vite-plugins/theme-bootstrap/plugin.ts`
  Main Vite plugin entry. Handles `resolveId`, `load`, and build emission.

- `vite-plugins/theme-bootstrap/bundle.ts`
  Runs the nested Vite build, reads the emitted chunk, and computes SRI.

- `vite-plugins/theme-bootstrap/dev-server.ts`
  Serves the dev bootstrap script from memory and rebuilds it on change.

- `vite-plugins/theme-bootstrap/constants.ts`
  Shared constants for virtual IDs, request paths, and watched entry paths.

- `app/root.tsx`
  Imports the virtual module and renders the bootstrap `<script>` in `<head>`.

- `app/types/vite-env.d.ts`
  Declares the virtual module exports for TypeScript.

## High-level flow

```text
app/root.tsx
    |
    | import { themeBootstrapSrc }
    v
virtual:theme-bootstrap
    |
    | resolved by
    v
themeBuildPlugin()
    |
    +--> DEV:   returns /~virtual:theme-bootstrap.js
    |
    \--> BUILD: returns /assets/theme-bootstrap-<hash>.js
```

## Why use a virtual module?

The app wants to render this:

```tsx
<script
  src={themeBootstrapSrc}
/>
```

In production the final `src` is not known ahead of time, because the asset filename is hashed by Rolldown. A virtual module lets the plugin inject the final `src` value at build time while keeping application imports stable.

## Development mode

In development, the plugin optimizes for correctness and quick rebuilds without writing a real bootstrap file to disk.

### What happens in dev

The serve-only plugin calls `configureThemeBuildServer()` which:

1. builds `app/critical/theme-bootstrap/bootstrap.ts`
2. stores the compiled JavaScript in memory as `state.devCode`
3. serves that code at:

   ```text
   /~virtual:theme-bootstrap.js
   ```

4. watches the real entry file for changes
5. rebuilds the in-memory code on change
6. sends a full reload so the browser reruns the bootstrap script

Nothing is written to `public/` during dev.

### What the virtual module returns in dev

In dev, the plugin returns the stable dev URL:

```ts
export const themeBootstrapSrc = '/~virtual:theme-bootstrap.js';
```

That means the rendered script tag points at the in-memory endpoint instead of a built file on disk.

### Why use a full reload in dev?

The bootstrap script is not part of the normal client HMR graph. It is served as a separate asset and runs before hydration. Rebuilding it in memory is not enough by itself; the browser also needs to reload the page so the updated bootstrap script is fetched and rerun.

## Production build mode

In production, the plugin optimizes for immutable assets and correct asset URLs.

### What happens in build

The build-only plugin memoizes a single `BuildArtifact` and uses it for both:

- `buildStart()` to emit the real asset
- `load()` to return the virtual module source

That artifact is created by `buildThemeBootstrap()` in `bundle.ts`.

### How the build artifact is created

`buildThemeBootstrap()` does this:

1. runs a nested `viteBuild()` with `write: false`
2. bundles `bootstrap.ts` as a tiny standalone browser script
3. lets Rolldown generate the asset name with:

   ```ts
   entryFileNames: 'assets/theme-bootstrap-[hash].js'
   ```

4. reads the emitted chunk from the in-memory build result
5. uses the chunk:
   - `code` for the emitted asset content
   - `fileName` to derive `src`
6. uses the emitted file name to expose the final public asset URL

### What the virtual module returns in build

In build mode, the virtual module returns metadata like:

```ts
export const themeBootstrapSrc =
  '/assets/theme-bootstrap-<hash>.js';
```

The app can then render the final `<script>` tag in SSR/SSG HTML with the correct URL.

### Why emit only in the client environment?

The SSR environment needs the metadata so it can render the `<script>` tag, but only the client build should emit the browser asset file itself.

That is why `buildStart()` checks:

```ts
if (this.environment.name === 'client') {
  this.emitFile(...);
}
```

The client build writes the file. The SSR build only reuses the already-built metadata.

## How `resolveId()` and `load()` work together

The plugin follows the standard Vite virtual-module pattern:

```text
import 'virtual:theme-bootstrap'
        |
        v
resolveId('virtual:theme-bootstrap')
        |
        v
returns '\0virtual:theme-bootstrap'
        |
        v
load('\0virtual:theme-bootstrap')
        |
        v
returns generated ESM source code
```

The public import path is:

```text
virtual:theme-bootstrap
```

and the internal resolved ID is:

```text
\0virtual:theme-bootstrap
```

The `\0` prefix marks it as an internal virtual module so Vite/Rolldown do not try normal filesystem resolution for it.

## Why build in memory first?

Because the plugin needs both:

- the final generated bootstrap code
- the final emitted asset path

before the app can safely render:

```tsx
<script src={themeBootstrapSrc} />
```

By building in memory first, the plugin can:

- inspect the generated chunk
- read the hashed output filename from Rolldown
- compute SRI from the exact shipped bytes
- emit the asset once with matching metadata

## Hydration note

The bootstrap script sets `document.documentElement.dataset.theme` before hydration so the page starts in the correct theme immediately.

That means the `<html>` element can legitimately differ between SSR HTML and the hydrated client DOM. `app/root.tsx` uses:

```tsx
<html suppressHydrationWarning ...>
```

to tell React that this root-level attribute difference is intentional.

## SRI and CSP notes

The theme bootstrap asset itself is built as an **external** JavaScript file, so it is eligible for integrity protection in principle.

However, React Router's `unstable_subResourceIntegrity` only auto-manages assets that React Router knows about in the generated build/manifest flow. The current `app/root.tsx` inserts the theme bootstrap tag manually, so it does **not** get automatic RR7 SRI decoration just because the asset exists.

Practical consequences:

- inline `<style>` or `<script>` blocks in `root.tsx` are **not** SRI-protected; use a CSP nonce for those
- externally loaded assets like the theme bootstrap script can use SRI, but you must either let the framework manage the tag or add integrity yourself
- if you keep the current manual `<script src={themeBootstrapSrc} />` pattern, treat it as an external asset load and rely on the plugin's hashed output plus CSP, not on automatic RR7 SRI

## Practical guidelines

### Recommended choice for this repo

Inline it if your top priority is to run the theme bootstrap the moment the parser reaches `<head>`.

Why:

- it executes immediately when the parser reaches the script tag, with no network round trip first
- it is tiny, so the inline cost is low
- it is isolated from the React app, so the logic still stays in its own source file
- it avoids the cold-load delay that even a parser-blocking external script still has

Use an external `script src` if you value caching and asset separation more than immediate execution. If you do that, keep it as a plain head script with no `async` or `defer`, because that is what makes it parser-blocking and ensures it runs before later HTML. But it will still wait for the network first.

If you inline it, manage it with a CSP nonce or hash.

If you reuse this pattern elsewhere:

### 1. Keep runtime code in a real file

Author browser logic in a normal file like:

```text
app/critical/theme-bootstrap/bootstrap.ts
```

Do not hand-build the runtime as a big string unless you have to.

### 2. Keep the virtual module small

The virtual module should only return metadata:

```ts
export const themeBootstrapSrc = '...';
```

It should not contain the actual bootstrap logic.

### 3. Keep dev and build behavior separate

Dev should optimize for:

- stable URLs
- rebuild speed
- easy inspection

Build should optimize for:

- hashed asset names
- deterministic output

### 4. Watch the real entry file

The source of truth is `app/critical/theme-bootstrap/bootstrap.ts`, not the virtual ID.

### 5. Use a stable dev path

The stable dev URL keeps the browser request path simple:

```text
/~virtual:theme-bootstrap.js
```

### 6. Let the bundler own filename hashing

Now that the asset filename comes from Rolldown's `[hash]`, the plugin only needs to expose the final asset path. That keeps responsibilities clearer:

- bundler owns output naming
- plugin owns virtual-module metadata

## What this does **not** solve

This plugin removes the custom inline theme bootstrap script, but it does not automatically make the whole React Router document strict-CSP-friendly.

Other framework-generated inline scripts may still exist for things like:

- scroll restoration
- hydration bootstrapping
- streamed data payloads

So this plugin specifically gives you:

- no custom inline theme bootstrap
- a hashed production bootstrap asset
- a stable way to reference that asset from the app

## Quick checklist

Use this checklist if you change `themeBuildPlugin()`:

- Dev server still serves `/~virtual:theme-bootstrap.js` from memory
- Dev HTML still points at the stable dev script path
- Build still emits `build/client/assets/theme-bootstrap-<hash>.js`
- Build HTML still includes the final hashed `src`
- `app/root.tsx` still imports from `virtual:theme-bootstrap`
- `app/types/vite-env.d.ts` still declares the virtual module

## Related files

- `vite-plugins/theme-bootstrap/plugin.ts`
- `vite-plugins/theme-bootstrap/bundle.ts`
- `vite-plugins/theme-bootstrap/dev-server.ts`
- `app/critical/theme-bootstrap/bootstrap.ts`
- `app/root.tsx`
- `app/types/vite-env.d.ts`
