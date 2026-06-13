import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { readEnv } from '../../vite-utils/read-env.ts';
import { createSentryVitePluginOptions } from '../../vite-utils/sentry-build.ts';
import { createBuildSentryEnvSnapshot } from '../../vite-utils/sentry-build-env-log.ts';
import { sentryCodeSplittingGroup } from '../../vite-utils/sentry-chunking.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;

function getSentrySourceMapsGlobPatterns() {
  return [
    './build/assets/**/*.map',
    './build/worker.js.map',
  ];
}

export default defineConfig(({ mode }) => {
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  loadConfigEnvironment(mode, repoRootPath);
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[packages/frontend/vite.worker.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('packages/frontend/vite.worker.config.ts', mode))}\n`
    )
  );

  const sentryVitePluginOptions = createSentryVitePluginOptions(mode, {
    createRelease: false,
    dist: 'worker',
    filesToDeleteAfterUpload: getSentrySourceMapsGlobPatterns(),
    finalizeRelease: true,
    useModernDebugIdUpload: true,
  });
  return {
    build: {
      emptyOutDir: true,
      modulePreload: {
        polyfill: true,
      },
      outDir: 'build',
      rolldownOptions: {
        experimental: {
          chunkOptimization: true,
          lazyBarrel: true,
        },
        input: './packages/frontend/worker.ts',
        output: {
          codeSplitting: {
            groups: [
              sentryCodeSplittingGroup,
            ],
          },
          entryFileNames: 'worker.js',
          format: 'esm',
          minify: true,
          minifyInternalExports: true,
        },
      },
      sourcemap: 'hidden',
      ssr: true,
    },
    define: createImportMetaEnvDefine({
      SENTRY_DSN: readEnv('SENTRY_DSN'),
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'packages/frontend/vite.worker.config.ts',
          })
        : readEnv('SENTRY_RELEASE'),
    }),
    plugins: sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [],
    publicDir: false,
    resolve: {
      tsconfigPaths: true,
    },
    root: repoRootPath,
    ssr: {
      noExternal: true,
      target: 'webworker',
    },
  };
});
