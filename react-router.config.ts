import type { Config } from '@react-router/dev/config';

import { discoverStaticRoutes } from './app/utils/route-discovery.ts';

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
    unstable_subResourceIntegrity: true,
    unstable_viteEnvironmentApi: true,
    v8_middleware: true,
  },
  prerender(): string[] {
    return discoverStaticRoutes({
      exclude: [
        '/ssr',
      ],
    });
  },
  ssr: true,
} satisfies Config;
