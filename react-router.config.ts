import type { Config } from '@react-router/dev/config';

import { discoverStaticRoutes } from './app/utils/route-discovery.ts';

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_subResourceIntegrity: true,
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
  prerender(): string[] {
    const routes = discoverStaticRoutes({
      exclude: [
        '/ssr',
        '/home', // home.tsx is the index route (/), not /home
      ],
    });

    // Explicitly add the index route since discoverStaticRoutes relies on file names
    // and doesn't know that home.tsx is mapped to /
    if (!routes.includes('/')) {
      routes.push('/');
    }

    return routes;
  },
  ssr: true,
} satisfies Config;
