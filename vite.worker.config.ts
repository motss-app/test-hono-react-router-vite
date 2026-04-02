import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { readEnv } from './vite-utils/read-env.ts';
import { readRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { sentryCodeSplittingGroup } from './vite-utils/sentry-chunking.ts';

export default defineConfig(({ mode }) => {
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = createSentryVitePluginOptions(mode, {
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
          codeSplitting: {
            groups: [
              sentryCodeSplittingGroup,
            ],
          },
          entryFileNames: 'worker.js',
          format: 'esm',
        },
      },
      sourcemap: 'hidden',
      ssr: true,
    },
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'vite.worker.config.ts',
          })
        : readEnv('SENTRY_RELEASE'),
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
