import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import type { ConfigEnv } from 'vite';

import { headersCopyPlugin } from '../../vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from '../../vite-plugins/theme-bootstrap/plugin.ts';
import { veCssTextPlugin } from '../../vite-plugins/ve-css-text/plugin.ts';
import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from '../../vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { readEnv } from '../../vite-utils/read-env.ts';
import { getEnv } from '../../vite-utils/runtime-env.ts';
import { createSentryVitePluginOptions } from '../../vite-utils/sentry-build.ts';
import { logBuildSentryEnvSnapshot } from '../../vite-utils/sentry-build-env-log.ts';
import {
  sentryBrowserProfilingCodeSplittingGroup,
  sentryCodeSplittingGroup,
  sentryContextLinesCodeSplittingGroup,
  sentryExtraErrorDataCodeSplittingGroup,
  sentryHttpClientCodeSplittingGroup,
  sentryViewHierarchyCodeSplittingGroup,
} from '../../vite-utils/sentry-chunking.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;
const publicDirPath = new URL('./public', import.meta.url).pathname;
const reactRouterSourceMapsGlobPatterns = [
  './build/client/**/*.map',
  './build/server/**/*.map',
];
const frontendResolveAlias = [
  {
    find: /^@motss-app\/frontend\/utils\/?(.*)/,
    replacement: `${repoRootPath}packages/frontend/app/utils/$1`,
  },
  {
    find: /^@motss-app\/frontend\/monitoring\/sentry$/,
    replacement: `${repoRootPath}packages/frontend/app/monitoring/sentry.ts`,
  },
];

function logReactRouterSentryEnvSnapshot(mode: string): void {
  logBuildSentryEnvSnapshot('packages/frontend/vite.react-router.config.ts', mode);
}

const reactRouterBuildConfig = {
  cssCodeSplit: true,
  cssMinify: 'lightningcss',
  emptyOutDir: true,
  rolldownOptions: {
    experimental: {
      chunkOptimization: true,
      lazyBarrel: true,
    },
    output: {
      codeSplitting: {
        groups: [
          sentryContextLinesCodeSplittingGroup,
          sentryBrowserProfilingCodeSplittingGroup,
          sentryExtraErrorDataCodeSplittingGroup,
          sentryHttpClientCodeSplittingGroup,
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
  const isDeploymentBuild = getEnv('DEPLOYMENT_BUILD') === 'true';
  const isVrt = Deno.env.get('VRT') === 'true';
  loadConfigEnvironment(mode, repoRootPath);
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
    define: {
      'import.meta.env.VRT': JSON.stringify(isVrt),
      ...createImportMetaEnvDefine({
        SENTRY_DSN: readEnv('SENTRY_DSN'),
        SENTRY_RELEASE: isDeploymentBuild
          ? readRequiredEnv('SENTRY_RELEASE', {
              source: 'packages/frontend/vite.react-router.config.ts',
            })
          : readEnv('SENTRY_RELEASE'),
        VITE_LOAD_TEST: readEnv('VITE_LOAD_TEST'),
      }),
    },
    plugins: isDev
      ? []
      : [
          themeBuildPlugin({
            rootDir: repoRootPath,
          }),
          vanillaExtractPlugin({
            identifiers: 'short',
          }),
          veCssTextPlugin(),
          paraglideVitePlugin({
            outdir: `${repoRootPath}packages/frontend/app/paraglide`,
            project: `${repoRootPath}project.inlang`,
          }),
          reactRouter(),
          headersCopyPlugin({
            dest: 'build/client/_headers',
            headersDir: 'headers',
            mode,
            rootDir: repoRootPath,
          }),
          ...sentryPlugins,
        ],
    publicDir: publicDirPath,
    resolve: {
      alias: frontendResolveAlias,
      tsconfigPaths: true,
    },
    root: repoRootPath,
  };
}
