import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const honoExcludeRegex = /^\/(?!api|apis).*$/;

export default defineConfig(({ mode }) => {
  const isBuildServer = mode === 'server';

  // Building the Hono server entry point
  if (isBuildServer) {
    return {
      build: {
        emptyOutDir: false, // Don't delete the client and server folders from React Router
        minify: false,
        outDir: 'build',
        rollupOptions: {
          input: './app/server.ts',
          output: {
            entryFileNames: 'server.js',
            format: 'esm',
          },
        },
        ssr: true,
        target: 'node24',
      },
      plugins: [
        tsconfigPaths(),
      ],
    };
  }

  // Development and React Router build
  return {
    plugins: [
      honoDevServer({
        entry: './app/server.ts',
        exclude: [
          ...defaultOptions.exclude,
          honoExcludeRegex,
        ],
      }),
      reactRouter(),
      tsconfigPaths(),
    ],
  };
});
