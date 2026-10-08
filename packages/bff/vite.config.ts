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
      /*
       * The entry is already wrapped with `withSentry`, and the plugin leaves already-wrapped entries
       * alone, so this is safe. Verified: no double-wrapping and tracing still works.
       */
      sentryCloudflareVitePlugin(),
    ],
  };
});
