import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import stylex from '@stylexjs/unplugin';
import type { ConfigEnv } from 'vite';

import { createSentryBuildOptions } from './app/monitoring/sentry.ts';
import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

export default async function createViteConfig(config: ConfigEnv) {
  const { mode } = config;
  const isDev = mode === 'development';
  loadConfigEnvironment(mode);

  const sentryBuildOptions = createSentryBuildOptions();
  const sentryPlugins =
    isDev || !sentryBuildOptions ? [] : await sentryReactRouter(sentryBuildOptions, config);

  return {
    build: {
      cssCodeSplit: false,
      sourcemap: 'hidden',
    },
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
