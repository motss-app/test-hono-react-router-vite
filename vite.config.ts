import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { nodeAdapter } from '@hono/vite-dev-server/node';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

import { createSentryBuildOptions } from './app/monitoring/sentry.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

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

  const sentryBuildOptions = createSentryBuildOptions() ?? undefined;
  const sentryPlugins = await sentryReactRouter(sentryBuildOptions, config);

  return {
    optimizeDeps: {
      include: optimizeDepsInclude,
    },
    plugins: [
      themeBuildPlugin(),
      honoDevServer({
        adapter: nodeAdapter(),
        entry: './app/server.ts',
        exclude: [
          ...defaultOptions.exclude,
          // React Router dev server makes module requests with ?import; letting Hono see them returns HTML instead of JS
          isRegExpImport,
          // Raw app CSS requests should be served by Vite, not Hono SSR.
          isRegExpAppCssAssetRequest,
          // Route module requests (React Router lazy modules) must be handled by Vite, not Hono
          isRegExpRouteImport,
        ],
      }),
      ...(isDev
        ? [
            /**
             * Stylex plugin is used to compile styles and provide HMR for styles.
             * It is configured to use CSS layers to ensure that styles are applied in
             * the correct order, and to include treeshake compensation to
             * prevent styles from being removed during treeshaking.
             */
            stylex.vite({
              useCSSLayers: true,
            }),
            /**
             * React Router plugin is required to:
             * 1. Build the app (routes, loaders, actions)
             * 2. Provide the "virtual:react-router/server-build" module used by Hono
             * 3. Handle HMR for React components
             */
            reactRouter(),
            ...sentryPlugins,
          ]
        : []),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
