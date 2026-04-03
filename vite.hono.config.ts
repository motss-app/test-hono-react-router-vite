import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { createSentryVitePluginOptions } from './vite-utils/sentry-build.ts';

export default defineConfig(({ mode }) => {
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = createSentryVitePluginOptions(mode, {
    createRelease: false,
    filesToDeleteAfterUpload: './build/server.js.map',
    finalizeRelease: true,
    uploadLegacySourcemaps: './build/server.js',
  });

  return {
    build: {
      emptyOutDir: false, // Don't delete the client and server folders from React Router,
      outDir: 'build',
      rolldownOptions: {
        input: './app/server.ts',
        output: {
          entryFileNames: 'server.js',
          format: 'esm',
        },
      },
      sourcemap: 'hidden',
      ssr: true,
    },
    plugins: [
      ...(sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : []),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
