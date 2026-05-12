import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';
import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';

  return {
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'packages/gateway/vite.config.ts',
          })
        : undefined,
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
