import type { Config } from '@react-router/dev/config';

import { discoverPrerenderRoutes } from './app/utils/route-discovery.ts';

export default {
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
