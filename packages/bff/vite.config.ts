import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { defineConfig } from 'vite';

import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';
import { getBffSentryRelease } from './build-env.ts';

export default defineConfig(() => {
  const sentryRelease = getBffSentryRelease();

  return {
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
