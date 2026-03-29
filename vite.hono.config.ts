import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

export default defineConfig(({ mode }) => {
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = createSentryVitePluginOptions();

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
      conditions: ['node'],
      tsconfigPaths: true,
    },
  };
});
