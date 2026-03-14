---
name: skill-vite-plugin-creation
description: "Use when: create or update a Vite plugin that watches a TypeScript entry file and emits a built JS artifact for dev and production builds. Provides templates, decision points, and validation checks."
applyTo: "vite-plugins/**"
---

# Vite plugin: watch-and-build TypeScript entry -> JS

Purpose
- Provide a repeatable, safe pattern for authoring Vite plugins that watch a .ts entry file and emit a single JavaScript asset in both dev (fast incremental) and production (stable) builds.

When to use
- You want a small, self-contained TypeScript file (e.g. theme bootstrap, runtime tokens) compiled into a JS file under a public/dist folder.
- You need the artifact available as a static asset for the app at runtime.

Decision points
- Use esbuild for dev (fast, minimal env). Use Vite/Rollup for production (correct plugin/alises/resolution).
- Avoid spawning a nested Vite build during the main Vite production build unless you intentionally isolate the plugin's build (prefer running in writeBundle/closeBundle to avoid interfering with the main bundle lifecycle).
- If your entry imports project plugins or relies on Vite-specific resolution (alias, stylex plugin), prefer invoking Vite build with a config that mirrors the project's resolver/plugins. Otherwise esbuild is often enough.

Checklist (quality criteria)
- [ ] watcher uses absolute/normalized paths (path.resolve + path.normalize)
- [ ] change detection compares normalized paths (avoid string suffix matches)
- [ ] rebuilds are debounced (avoid multiple triggers on save)
- [ ] production build runs after/independent of the main bundle (use writeBundle/closeBundle)
- [ ] output file exists in outDir and is non-empty
- [ ] errors are logged cleanly and do not crash the dev server

Template and recommended implementation

Below is a practical template covering both dev and build modes. Adapt `entryRel`, `outDir` and `outFile` for your use case.

```ts
// vite-plugins/theme-build.ts
import path from 'node:path';
import { build as viteBuild, type Plugin, type ViteDevServer } from 'vite';
// Optionally: import esbuild from 'esbuild' if you prefer fast dev builds

export function themeBuildPlugin(): Plugin {
  const entryRel = 'app/theme-bootstrap.ts';
  const entryPoint = path.resolve(entryRel);
  const outDir = path.resolve('public');
  const outFile = 'theme-bootstrap.js';

  // Small debounce helper
  let debounceTimer: NodeJS.Timeout | undefined;
  function schedule(fn: () => Promise<void>, server?: ViteDevServer) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        await fn();
        server?.ws.send({ type: 'full-reload' });
      } catch (err) {
        server?.config.logger.error(`theme-build: ${err}`);
      }
    }, 100);
  }

  async function viteBuildTheme() {
    // Use Vite's build API when you need Rollup/Vite plugins & alias resolution
    await viteBuild({
      root: process.cwd(),
      configFile: false, // deliberate: not reading a separate config file
      build: {
        emptyOutDir: false,
        lib: {
          entry: entryPoint,
          fileName: () => outFile,
          formats: ['es'],
          name: 'themeBootstrap',
        },
        outDir,
        rollupOptions: {
          output: { entryFileNames: outFile },
        },
      },
      logLevel: 'info',
    });
  }

  // Optionally add a fast esbuild-based dev builder for speed.
  // async function esbuildTheme() { ... }

  return {
    name: 'theme-build',

    // Production: run a dedicated build step. Prefer `writeBundle`/`closeBundle`
    // so you don't interfere with the main Rollup input graph.
    async closeBundle() {
      await viteBuildTheme();
    },

    configureServer(server: ViteDevServer) {
      // use absolute path for watcher
      server.watcher.add(entryPoint);
      server.watcher.on('change', async (file) => {
        // normalize/resolve the incoming path before comparing
        if (path.resolve(file) === entryPoint) {
          // For dev, you can call a fast esbuild-based builder here.
          // If you call viteBuildTheme() here, make sure you understand the
          // tradeoff in plugin resolution and performance.
          schedule(() => viteBuildTheme(), server);
        }
      });
    },
  };
}
```

Notes and pitfalls
- Path matching: don't use `endsWith('app/theme-bootstrap.ts')` — that can false-positive on similar names. Use `path.resolve(file) === entryPoint`.
- Debounce rebuilds to avoid expensive repeated builds on editor saves.
- Nested Vite builds: running a full Vite build inside the main Vite build lifecycle (e.g., in buildStart) can be surprising. Prefer `closeBundle`/`writeBundle` to avoid interfering with the primary bundling run.
- If your entry imports code that needs your project's Vite plugins (stylex, alias, JSX transforms), prefer calling Vite build with a config that mirrors those settings. `configFile: false` isolates the build — that's good for predictability but may break imports that rely on aliases/plugins.
- If you need to ship source maps, enable them explicitly in the builder.

Validation steps
1. Start dev server. Modify the watched file. Confirm the out file appears and the dev client reloads.
2. Run a production build. Confirm the out file exists in the configured `outDir` and is the expected size.
3. Test on CI / headless environment to ensure the plugin doesn't rely on interactive prompts.

Example prompts (use these with the Chat agent)
- "Create a Vite plugin that watches 'app/foo.ts' and writes 'public/foo.js' when changed, using debounced builds and safe path matching."
- "Generate a plugin file under 'vite-plugins/' that builds a small TS entry to 'public/' for production and uses esbuild for dev speed."

What this skill produces
- A clear decision checklist for `esbuild` vs `viteBuild`.
- A ready-to-copy TypeScript plugin template that handles dev watch + production build safely.
- A short validation checklist to verify the plugin works in both modes.

Suggested customizations
- Add an `option` block to the plugin factory to customize entry/out names, debounce time, and whether to use esbuild in dev.
- Add CLI tasks (deno/npm) that invoke/validate the plugin outside the dev server for CI checks.

If anything about your project's resolution (alias, stylex plugin, or custom loaders) must be included into the generated build, tell me which config keys to mirror and I will include them in the template.
