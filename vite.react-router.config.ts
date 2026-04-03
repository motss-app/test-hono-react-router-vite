import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import stylex from '@stylexjs/unplugin';
import type { ConfigEnv } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { readRequiredEnv } from './vite-utils/get-required-env.ts';
import { createImportMetaEnvDefine } from './vite-utils/import-meta-env.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { readEnv } from './vite-utils/read-env.ts';
import { sentryCodeSplittingGroup } from './vite-utils/sentry-chunking.ts';

export default function createViteConfig(config: ConfigEnv) {
  const { mode } = config;
  const isDev = mode === 'development';
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = isDev
    ? null
    : createSentryVitePluginOptions(mode, {
        createRelease: true,
        filesToDeleteAfterUpload: './build/client/**/*.map',
        finalizeRelease: false,
        uploadLegacySourcemaps: './build/client/assets',
      });
  const sentryPlugins = sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [];

  return {
    build: {
      cssCodeSplit: false,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              sentryCodeSplittingGroup,
            ],
          },
        },
      },
      sourcemap: 'hidden',
    },
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
  };
}
