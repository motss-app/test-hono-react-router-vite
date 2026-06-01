import type { Config } from '@react-router/dev/config';

import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { discoverPrerenderRoutes } from '../../vite-utils/route-discovery.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;
const appDirectoryPath = new URL('./app', import.meta.url).pathname;
const buildDirectoryPath = new URL('../../build', import.meta.url).pathname;

loadConfigEnvironment(Deno.env.get('NODE_ENV') ?? 'development', repoRootPath);

export default {
  appDirectory: appDirectoryPath,
  buildDirectory: buildDirectoryPath,
  future: {
    unstable_optimizeDeps: true,
    unstable_trailingSlashAwareDataRequests: true,
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
  prerender(): string[] {
    return discoverPrerenderRoutes({
      rootDir: repoRootPath,
    });
  },
  routeDiscovery: {
    mode: 'lazy',
  },
  ssr: true,
  subResourceIntegrity: true,
} satisfies Config;
