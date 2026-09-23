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
  plugins: [
    {
      /**
       * Extension coverage gate, enforced AFTER every other plugin's
       * config() hook.
       *
       * The VS Code worker injects its own plugin that forces
       * coverage.enabled=true for "Run with Coverage" profile runs, and
       * plugin config() results override the config file's value in that
       * pathway, so the file-level `coverage.enabled` gate below loses the
       * merge. A config hook with order:'post' runs after all normal
       * config() hooks and its return value is merged last, so the gate
       * wins before Vitest ever snapshots its config. CLI runs are
       * untouched (hook returns nothing without the extension marker).
       */
      config: {
        handler() {
          if (typeof Deno !== 'undefined' && Deno.env.get('VITEST_VSCODE')) {
            return {
              test: {
                coverage: {
                  enabled: false,
                },
              },
            };
          }
          return {};
        },
        order: 'post',
      },
      name: 'vscode-coverage-gate',
    },
  ],
  test: {
    coverage: {
      /**
       * The VS Code Vitest extension marks its worker processes with
       * VITEST_VSCODE=true. Its coverage reporter crashes on the flattened
       * JSON payload Vitest sends (it expects FileCoverage instances with a
       * data wrapper), so extension runs skip coverage entirely. The typeof
       * guard keeps this config loadable under the Node runtime used by the
       * global vp CLI, where the Deno global does not exist. CLI runs such
       * as `deno task test` keep coverage and threshold auto updates.
       */
      enabled: !(typeof Deno !== 'undefined' && Deno.env.get('VITEST_VSCODE')),
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
