import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { createSentryVitePluginOptions } from './vite-utils/sentry-build.ts';
import { createBuildSentryEnvSnapshot } from './vite-utils/sentry-env-log.ts';

function getSentrySourceMapsGlobPatterns() {
  return [
    './build/assets/**/*.map',
    './build/server.js.map',
  ];
}

export default defineConfig(({ mode }) => {
  loadConfigEnvironment(mode);
  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[vite.hono.config.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('vite.hono.config.ts', mode))}\n`
    )
  );

  const sentryVitePluginOptions = createSentryVitePluginOptions(mode, {
    createRelease: false,
    filesToDeleteAfterUpload: getSentrySourceMapsGlobPatterns(),
    finalizeRelease: true,
    uploadLegacySourcemaps: getSentrySourceMapsGlobPatterns(),
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
    plugins: sentryVitePluginOptions ? sentryVitePlugin(sentryVitePluginOptions) : [],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
