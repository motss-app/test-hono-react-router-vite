import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import honoDevServer, { defaultOptions } from '@hono/vite-dev-server';

export default defineConfig(({ mode }) => {
  const isBuildServer = mode === 'server';

  // Building the Hono server entry point
  if (isBuildServer) {
    return {
      plugins: [tsconfigPaths()],
      build: {
        outDir: 'build',
        emptyOutDir: false, // Don't delete the client and server folders from React Router
        ssr: true,
        rollupOptions: {
          input: './app/server.ts',
          output: {
            format: 'esm',
            entryFileNames: 'server.js',
          },
        },
        target: 'node24',
        minify: false,
      },
    };
  }

  // Development and React Router build
  return {
    plugins: [
      honoDevServer({
        entry: './app/server.ts',
        exclude: [
          ...defaultOptions.exclude,
          /^\/(?!api|apis).*$/,
        ],
      }),
      reactRouter(),
      tsconfigPaths(),
    ],
  };
});
