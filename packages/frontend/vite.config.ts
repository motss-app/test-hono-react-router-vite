import { cloudflare } from '@cloudflare/vite-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { reactRouter } from '@react-router/dev/vite';
import { sentryCloudflareVitePlugin } from '@sentry/cloudflare/vite';
import { sentryReactRouter } from '@sentry/react-router';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig, type UserConfig } from 'vite';

import { themeBuildPlugin } from '../../vite-plugins/theme-bootstrap/plugin.ts';
import { veCssTextPlugin } from '../../vite-plugins/ve-css-text/plugin.ts';
import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { writeStderr } from '../../vite-utils/runtime-env.ts';
import { createSentryBuildOptions } from '../../vite-utils/sentry-build.ts';
import { createBuildSentryEnvSnapshot } from '../../vite-utils/sentry-build-env-log.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;
const publicDirPath = new URL('./public', import.meta.url).pathname;
const optimizeDepsInclude = [
  '@sentry/react-router',
  'hono/client',
  'react',
  'react-dom',
  'react-dom/client',
  'react-router',
  'react-router/dom',
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
];

/**
 * VE's `config` hook sets `ssr.external` to exclude its packages from the SSR
 * bundle, but the Cloudflare Vite plugin rejects any `resolve.external` on the
 * SSR environment because Workers must bundle everything. This strips VE's
 * entries from `ssr.external` after VE sets them, so CF validation passes.
 *
 * @see https://github.com/vanilla-extract-css/vanilla-extract/issues/1603
 */
function vanillaExtractSsrFixPlugin() {
  const externalsToRemove = new Set([
    '@vanilla-extract/css',
    '@vanilla-extract/css/fileScope',
    '@vanilla-extract/css/adapter',
  ]);

  return {
    config(config: UserConfig) {
      if (config.ssr && Array.isArray(config.ssr.external)) {
        config.ssr.external = config.ssr.external.filter(
          (external: string) => !externalsToRemove.has(external)
        );
      }
    },
    name: 'vanilla-extract-ssr-fix',
  };
}

export default defineConfig(async config => {
  const { mode } = config;
  const isDev = mode === 'development';

  loadConfigEnvironment(mode, repoRootPath);
  writeStderr(
    `[packages/frontend/vite.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('packages/frontend/vite.config.ts', mode))}\n`
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
              viteEnvironment: {
                name: 'ssr',
              },
            }),
            sentryCloudflareVitePlugin({
              _experimental: {
                autoInstrumentation: true,
                useDiagnosticsChannelInjection: true,
              },
            }),
            themeBuildPlugin({
              rootDir: repoRootPath,
            }),
            vanillaExtractPlugin(),
            veCssTextPlugin(),
            vanillaExtractSsrFixPlugin(),
            paraglideVitePlugin({
              outdir: `${repoRootPath}packages/frontend/app/paraglide`,
              project: `${repoRootPath}project.inlang`,
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
    publicDir: publicDirPath,
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
      proxy: {
        '/api': {
          changeOrigin: true,
          target: 'http://127.0.0.1:8787',
        },
      },
      strictPort: true,
    },
  };
});
