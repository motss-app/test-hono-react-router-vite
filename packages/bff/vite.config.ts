import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { defineConfig } from 'vite';

import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';
import { getBffSentryRelease } from './build-env.ts';

const packageRootPath = new URL('./', import.meta.url).pathname;

export default defineConfig(() => {
  const sentryRelease = getBffSentryRelease();

  return {
    cacheDir: `${packageRootPath}node_modules/.vite`,
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: sentryRelease,
    }),
    plugins: [
      cloudflare({
        configPath: './wrangler.jsonc',
      }),
      sentryCloudflareVitePlugin({
        _experimental: {
          autoInstrumentation: true,
          useDiagnosticsChannelInjection: true,
        },
      }),
    ],
  };
});
