import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { defineConfig } from 'vite';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';

const packageRootPath = new URL('./', import.meta.url).pathname;

function isHealthzRustBuilt(): boolean {
  try {
    return Deno.statSync(new URL('../healthz-rust/build/worker/shim.mjs', import.meta.url)).isFile;
  } catch {
    return false;
  }
}

function isFractalRustBuilt(): boolean {
  try {
    return Deno.statSync(new URL('../fractal-rust/build/worker/shim.mjs', import.meta.url)).isFile;
  } catch {
    return false;
  }
}

function isColorRustBuilt(): boolean {
  try {
    return Deno.statSync(new URL('../color-rust/build/worker/shim.mjs', import.meta.url)).isFile;
  } catch {
    return false;
  }
}

function isImageOptimizeRustBuilt(): boolean {
  try {
    return Deno.statSync(new URL('../image-optimize-rust/build/worker/shim.mjs', import.meta.url))
      .isFile;
  } catch {
    return false;
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const isVrt = Deno.env.get('VRT') === 'true';
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';

  return {
    cacheDir: `${packageRootPath}node_modules/.vite`,
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'packages/gateway/vite.config.ts',
          })
        : (Deno.env.get('SENTRY_RELEASE') ?? 'local'),
    }),
    plugins: [
      cloudflare({
        ...(isVrt
          ? {
              inspectorPort: false,
            }
          : {}),
        ...(isDev
          ? {
              auxiliaryWorkers: [
                {
                  configPath: '../bff/wrangler.jsonc',
                },
                // Healthz Rust worker only once built (requires Rust toolchain).
                ...(isHealthzRustBuilt()
                  ? [
                      {
                        configPath: '../healthz-rust/wrangler.toml',
                      },
                    ]
                  : []),
                // Fractal Rust worker only once built (requires Rust toolchain).
                ...(isFractalRustBuilt()
                  ? [
                      {
                        configPath: '../fractal-rust/wrangler.toml',
                      },
                    ]
                  : []),
                // Color Rust worker only once built (requires Rust toolchain).
                ...(isColorRustBuilt()
                  ? [
                      {
                        configPath: '../color-rust/wrangler.toml',
                      },
                    ]
                  : []),
                /*
                 * Register the image optimizer only after its Rust artifact
                 * has been built locally.
                 */
                ...(isImageOptimizeRustBuilt()
                  ? [
                      {
                        configPath: '../image-optimize-rust/wrangler.toml',
                      },
                    ]
                  : []),
              ],
            }
          : {}),
        configPath: './wrangler.jsonc',
      }),
      // The entry is already wrapped with `withSentry`, and the plugin leaves already-wrapped entries
      // alone, so this is safe. Verified: no double-wrapping and tracing still works. The gateway's
      // hand-written `rpcTracePropagationBindings` allow list is unaffected.
      sentryCloudflareVitePlugin(),
    ],
    preview: {
      port: 8787,
      strictPort: true,
    },
    server: {
      port: 8787,
      strictPort: true,
    },
  };
});
