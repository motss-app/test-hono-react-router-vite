import { defineConfig } from 'vite-plus';

/**
 * Vitest config powered by Vite+ (`vite-plus` bundles Vitest 4.1.11).
 *
 * The package config aggregates the frontend projects for package-local CLI
 * runs. The root Vitest config discovers the individual projects across the
 * monorepo.
 *
 * Run with `deno task test` (both), or filter with
 * `deno task --cwd=packages/frontend test:unit` / `test:browser`.
 */
export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      clean: true,
      cleanOnRerun: true,
      enabled: true,
      provider: 'v8',
      thresholds: {
        autoUpdate: true,
      },
    },
    mockReset: true,
    projects: [
      './vitest.config.unit.ts',
      './vitest.config.browser.ts',
    ],
    reporters: [
      'github-actions',
      'dot',
    ],
  },
});
