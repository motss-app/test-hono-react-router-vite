import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';

export default defineConfig(() => {
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  const sentryRelease = isDeploymentBuild
    ? readRequiredEnv('SENTRY_RELEASE', {
        source: 'packages/bff/vite.config.ts',
      })
    : (Deno.env.get('SENTRY_RELEASE') ?? 'local');

  return {
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: sentryRelease,
    }),
    plugins: [
      cloudflare({
        configPath: './wrangler.jsonc',
      }),
    ],
  };
});
