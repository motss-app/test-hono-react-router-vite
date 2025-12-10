import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { nodeAdapter } from '@hono/vite-dev-server/node';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    honoDevServer({
      adapter: nodeAdapter(),
      entry: './app/server.ts',
      exclude: [
        ...defaultOptions.exclude,
        /** React Router dev server makes module requests with ?import; letting Hono see them returns HTML instead of JS */
        /\?import$/,
        /** Route module requests (React Router lazy modules) must be handled by Vite, not Hono */
        /\/app\/routes\/.*\?import$/,
      ],
    }),
    /**
     * React Router plugin is required to:
     * 1. Build the app (routes, loaders, actions)
     * 2. Provide the "virtual:react-router/server-build" module used by Hono
     * 3. Handle HMR for React components
     */
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
