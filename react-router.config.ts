import type { Config } from '@react-router/dev/config';

import { loadConfigEnvironment } from './vite-utils/load-env.ts';
import { discoverPrerenderRoutes } from './vite-utils/route-discovery.ts';

loadConfigEnvironment(Deno.env.get('NODE_ENV') ?? 'development');

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_passThroughRequests: true,
    // Keep SRI enabled and keep preview-server prerendering off: the preview
    // server can race on temporary `vite.react-router.config.ts.timestamp-*.mjs`
    // files during canary builds.
    unstable_subResourceIntegrity: true,
    unstable_trailingSlashAwareDataRequests: true,
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
  prerender(): string[] {
    return discoverPrerenderRoutes();
  },
  routeDiscovery: {
    mode: 'lazy',
  },
  ssr: true,
} satisfies Config;
