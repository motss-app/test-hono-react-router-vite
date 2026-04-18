import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import stylex from '@stylexjs/unplugin';
import type { ConfigEnv } from 'vite';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { readRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { readEnv } from './vite-utils/read-env.ts';
import { createSentryVitePluginOptions } from './vite-utils/sentry-build.ts';
import {
  sentryBrowserProfilingCodeSplittingGroup,
  sentryCodeSplittingGroup,
  sentryViewHierarchyCodeSplittingGroup,
} from './vite-utils/sentry-chunking.ts';
import { createBuildSentryEnvSnapshot } from './vite-utils/sentry-env-log.ts';

const reactRouterSourceMapsGlobPatterns = [
  './build/client/**/*.map',
  './build/server/**/*.map',
];

function logReactRouterSentryEnvSnapshot(mode: string): void {
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[vite.react-router.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('vite.react-router.config.ts', mode))}\n`
    )
  );
}

const reactRouterBuildConfig = {
  cssCodeSplit: false,
  emptyOutDir: false,
  rolldownOptions: {
    experimental: {
      chunkOptimization: true,
      lazyBarrel: true,
    },
    output: {
      codeSplitting: {
        groups: [
          sentryBrowserProfilingCodeSplittingGroup,
          sentryViewHierarchyCodeSplittingGroup,
          sentryCodeSplittingGroup,
        ],
      },
      minify: true,
    },
  },
  sourcemap: 'hidden',
};

export default function createViteConfig(config: ConfigEnv) {
  const { mode } = config;
  const isDev = mode === 'development';
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  loadConfigEnvironment(mode);
  logReactRouterSentryEnvSnapshot(mode);

  const sentryVitePluginOptions = isDev
    ? null
    : createSentryVitePluginOptions(mode, {
        createRelease: true,
        dist: 'react-router',
        filesToDeleteAfterUpload: reactRouterSourceMapsGlobPatterns,
        finalizeRelease: false,
        uploadLegacySourcemaps: reactRouterSourceMapsGlobPatterns,
      });
  const sentryPlugins = sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [];

  return {
    build: reactRouterBuildConfig,
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: isDeploymentBuild
        ? readRequiredEnv('SENTRY_RELEASE', {
            source: 'vite.react-router.config.ts',
          })
        : readEnv('SENTRY_RELEASE'),
    }),
    plugins: isDev
      ? []
      : [
          themeBuildPlugin(),
          stylex.vite({
            useCSSLayers: true,
          }),
          reactRouter(),
          headersCopyPlugin({
            dest: 'build/client/_headers',
            headersDir: 'headers',
            mode,
          }),
          ...sentryPlugins,
        ],
    resolve: {
      tsconfigPaths: false,
    },
  };
}
