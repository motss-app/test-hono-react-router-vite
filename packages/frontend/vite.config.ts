import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import { sentryReactRouter } from '@sentry/react-router';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

import { themeBuildPlugin } from '../../vite-plugins/theme-bootstrap/plugin.ts';
import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { createSentryBuildOptions } from '../../vite-utils/sentry-build.ts';
import { createBuildSentryEnvSnapshot } from '../../vite-utils/sentry-env-log.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;
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

  loadConfigEnvironment(mode, repoRootPath);
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[packages/frontend/vite.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('packages/frontend/vite.config.ts', mode))}\n`
    )
  );

  const sentryBuildOptions = createSentryBuildOptions(mode, 'react-router-dev') ?? undefined;
  const sentryPlugins = await sentryReactRouter(sentryBuildOptions, config);

  return {
    optimizeDeps: {
      include: optimizeDepsInclude,
    },
    plugins: [
      ...(isDev
        ? [
            cloudflare({
              configPath: './packages/frontend/wrangler.jsonc',
              viteEnvironment: { name: 'ssr' },
            }),
            themeBuildPlugin({
              rootDir: repoRootPath,
            }),
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
      alias: [
        {
          find: /^@motss-app\/frontend\/utils\/?(.*)/,
          replacement: `${repoRootPath}packages/frontend/app/utils/$1`,
        },
        {
          find: /^@motss-app\/frontend\/monitoring\/sentry$/,
          replacement: `${repoRootPath}packages/frontend/app/monitoring/sentry.ts`,
        },
      ],
      tsconfigPaths: true,
    },
    root: repoRootPath,
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
