import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { getRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

export default defineConfig(({ mode }) => {
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = createSentryVitePluginOptions({
    createRelease: false,
    filesToDeleteAfterUpload: './build/worker.js.map',
    finalizeRelease: true,
    uploadLegacySourcemaps: './build/worker.js',
  });
  return {
    build: {
      emptyOutDir: false,
      modulePreload: {
        polyfill: true,
      },
      outDir: 'build',
      rolldownOptions: {
        input: './app/worker.ts',
        output: {
          entryFileNames: 'worker.js',
          format: 'esm',
        },
      },
      sourcemap: 'hidden',
      ssr: true,
    },
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: getRequiredEnv('SENTRY_RELEASE', {
        source: 'vite.worker.config.ts',
      }),
    }),
    plugins: [
      ...(sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : []),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: [
        '@sentry/react-router',
      ],
    },
  };
});
