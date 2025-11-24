import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { nodeAdapter } from '@hono/vite-dev-server/node';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const honoExcludeRegex = /^\/(?!api|apis).*$/;

export default defineConfig({
  plugins: [
    honoDevServer({
      adapter: nodeAdapter(),
      entry: './app/server.ts',
      exclude: [
        ...defaultOptions.exclude,
        honoExcludeRegex,
      ],
    }),
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),
  ],
});
