import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

/**
 * Vitest config powered by Vite+ (`vite-plus` bundles Vitest 4.1.11).
 *
 * Two named projects:
 * - `unit`: `*.unit.test.ts` files, node environment.
 * - `browser`: `*.browser.test.ts` files, executed in Playwright-bundled
 *   Chromium via Vitest browser mode with the Playwright provider.
 *
 * Run with `deno task test` (both), or filter with
 * `deno task --cwd=packages/frontend test:unit` / `test:browser`.
 */
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      thresholds: {
        autoUpdate: true,
      },
    },
    projects: [
      {
        test: {
          environment: 'node',
          include: [
            'app/**/*.unit.test.ts',
          ],
          name: 'unit',
        },
      },
      {
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
                experimental: {
                  fsModuleCache: true,
                  nodeLoader: true,
                  openTelemetry: {
                    enabled: true,
                  },
                  preParse: true,
                  viteModuleRunner: true,
                },
              },
            ],
            provider: playwright(),
          },
          include: [
            'app/**/*.browser.test.ts',
          ],
          name: 'browser',
        },
      },
    ],
    reporters: [
      'github-actions',
      'dot',
    ],
  },
});
