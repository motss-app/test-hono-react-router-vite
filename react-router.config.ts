import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'packages/frontend/app',
  future: {
    unstable_optimizeDeps: true,
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
  routeDiscovery: {
    mode: 'lazy',
  },
  ssr: true,
  subResourceIntegrity: true,
} satisfies Config;
