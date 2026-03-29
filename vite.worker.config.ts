import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { createSentryVitePluginOptions } from './app/monitoring/sentry.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';

export default defineConfig(({ mode }) => {
  loadConfigEnvironment(mode);

  const sentryVitePluginOptions = createSentryVitePluginOptions();
  const workerRelease = Deno.env.get('SENTRY_RELEASE') ?? '';

  return {
    build: {
      emptyOutDir: false,
      modulePreload: {
        polyfill: true,
      },
      outDir: 'build',
      rolldownOptions: {
        input: './app/worker.ts',
        output: {
          entryFileNames: 'worker.js',
          format: 'esm',
        },
      },
      sourcemap: 'hidden',
      ssr: true,
    },
    define: {
      'import.meta.env.SENTRY_RELEASE': JSON.stringify(workerRelease),
    },
    plugins: [
      ...(sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : []),
    ],
    resolve: {
      conditions: ['worker', 'browser'],
      tsconfigPaths: true,
    },
  };
});
