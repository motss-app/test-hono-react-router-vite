import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { readRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { readEnv } from './vite-utils/read-env.ts';
import { createSentryVitePluginOptions } from './vite-utils/sentry-build.ts';
import { sentryCodeSplittingGroup } from './vite-utils/sentry-chunking.ts';
import { createBuildSentryEnvSnapshot } from './vite-utils/sentry-env-log.ts';

function getSentrySourceMapsGlobPatterns() {
  return [
    './build/assets/**/*.map',
    './build/worker.js.map',
  ];
}

export default defineConfig(({ mode }) => {
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  loadConfigEnvironment(mode);
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[vite.worker.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('vite.worker.config.ts', mode))}\n`
    )
  );

  const sentryVitePluginOptions = createSentryVitePluginOptions(mode, {
    createRelease: false,
    filesToDeleteAfterUpload: getSentrySourceMapsGlobPatterns(),
    finalizeRelease: true,
    uploadLegacySourcemaps: getSentrySourceMapsGlobPatterns(),
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
    plugins: sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
