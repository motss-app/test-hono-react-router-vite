import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import stylex from '@stylexjs/unplugin';
import type { ConfigEnv } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { getRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

export default function createViteConfig(config: ConfigEnv) {
  const { mode } = config;
  const isDev = mode === 'development';
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = isDev
    ? null
    : createSentryVitePluginOptions({
        createRelease: true,
        filesToDeleteAfterUpload: './build/client/**/*.map',
        finalizeRelease: false,
        uploadLegacySourcemaps: './build/client/assets',
      });
  const sentryPlugins = sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [];

  return {
    build: {
      cssCodeSplit: false,
      sourcemap: 'hidden',
    },
    define: createImportMetaEnvDefine({
      SENTRY_RELEASE: getRequiredEnv('SENTRY_RELEASE', {
        source: 'vite.react-router.config.ts',
      }),
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
      tsconfigPaths: true,
    },
  };
}
