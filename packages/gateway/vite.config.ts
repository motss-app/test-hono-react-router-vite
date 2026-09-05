import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { defineConfig } from 'vite';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';

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

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';

  return {
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'packages/gateway/vite.config.ts',
          })
        : (Deno.env.get('SENTRY_RELEASE') ?? 'local'),
    }),
    plugins: [
      cloudflare({
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
              ],
            }
          : {}),
        configPath: './wrangler.jsonc',
      }),
      sentryCloudflareVitePlugin({
        _experimental: {
          autoInstrumentation: true,
          useDiagnosticsChannelInjection: true,
        },
      }),
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
