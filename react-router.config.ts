import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

import { createSentryBuildOptions } from './app/monitoring/sentry.ts';
import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { discoverPrerenderRoutes } from './vite-utils/route-discovery.ts';

loadConfigEnvironment(Deno.env.get('NODE_ENV') ?? 'development');

const sentryBuildOptions = createSentryBuildOptions();

export default {
  async buildEnd(args) {
    if (sentryBuildOptions) {
      await sentryOnBuildEnd(args);
    }
  },
  future: {
    unstable_optimizeDeps: true,
    unstable_passThroughRequests: true,
    unstable_previewServerPrerendering: true,
    unstable_subResourceIntegrity: true,
    unstable_trailingSlashAwareDataRequests: true,
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
  prerender(): string[] {
    return discoverPrerenderRoutes();
  },
  ssr: true,
} satisfies Config;
