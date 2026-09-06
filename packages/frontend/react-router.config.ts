import type { Config } from '@react-router/dev/config';

import { loadConfigEnvironment } from '../../vite-utils/load-env.ts';
import { discoverPrerenderRoutes } from '../../vite-utils/route-discovery.ts';
import { getEnv } from '../../vite-utils/runtime-env.ts';

const repoRootPath = new URL('../../', import.meta.url).pathname;
const appDirectoryPath = new URL('./app', import.meta.url).pathname;
const buildDirectoryPath = new URL('../../build', import.meta.url).pathname;

loadConfigEnvironment(getEnv('NODE_ENV') ?? 'development', repoRootPath);

export default {
  appDirectory: appDirectoryPath,
  buildDirectory: buildDirectoryPath,
  future: {
    unstable_optimizeDeps: true,
  },
  prerender(): string[] {
    return discoverPrerenderRoutes();
  },
  routeDiscovery: {
    mode: 'lazy',
  },
  splitRouteModules: true,
  ssr: true,
  subResourceIntegrity: true,
} satisfies Config;
