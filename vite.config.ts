import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { nodeAdapter } from '@hono/vite-dev-server/node';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { createSentryBuildOptions } from './vite-utils/sentry-build.ts';
import { createBuildSentryEnvSnapshot } from './vite-utils/sentry-env-log.ts';

const isRegExpImport = /\?import$/;
const isRegExpRouteImport = /\/app\/routes\/.*\?import$/;
const isRegExpAppCssAssetRequest = /\/app\/.*\.css(?:\?(?:raw|inline)(?:=.*)?)?$/;
const optimizeDepsInclude = [
  '@sentry/react-router',
  '@stylexjs/stylex',
  'hono/client',
  'react',
  'react-dom',
  'react-dom/client',
  'react-router',
  'react-router/dom',
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
];

export default defineConfig(async config => {
  const { mode } = config;
  const isDev = mode === 'development';

  loadConfigEnvironment(mode);
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[vite.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('vite.config.ts', mode))}\n`
    )
  );

  const sentryBuildOptions = createSentryBuildOptions(mode, 'react-router-dev') ?? undefined;
  const sentryPlugins = await sentryReactRouter(sentryBuildOptions, config);

  return {
    optimizeDeps: {
      include: optimizeDepsInclude,
      noDiscovery: true,
    },
    plugins: [
      themeBuildPlugin(),
      ...(isDev
        ? [
            honoDevServer({
              adapter: nodeAdapter(),
              entry: './app/server.ts',
              exclude: [
                ...defaultOptions.exclude,
                isRegExpImport,
                isRegExpAppCssAssetRequest,
                isRegExpRouteImport,
              ],
            }),
            stylex.vite({
              useCSSLayers: true,
            }),
            reactRouter(),
            ...sentryPlugins,
          ]
        : []),
    ],
    resolve: {
      tsconfigPaths: false,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
