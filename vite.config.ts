import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { nodeAdapter } from '@hono/vite-dev-server/node';
import { reactRouter } from '@react-router/dev/vite';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

const isRegExpImport = /\?import$/;
const isRegExpRouteImport = /\/app\/routes\/.*\?import$/;

export default defineConfig(config => {
  const isDev = config.mode === 'development';

  return {
    plugins: [
      honoDevServer({
        adapter: nodeAdapter(),
        entry: './app/server.ts',
        exclude: [
          ...defaultOptions.exclude,
          // React Router dev server makes module requests with ?import; letting Hono see them returns HTML instead of JS
          isRegExpImport,
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
          ]
        : []),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
