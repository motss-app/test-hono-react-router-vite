import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { defineConfig } from 'vite';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';

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
