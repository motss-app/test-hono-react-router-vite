import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'packages/frontend/app',
  future: {
    unstable_optimizeDeps: true,
  },
  routeDiscovery: {
    mode: 'lazy',
  },
  ssr: true,
  subResourceIntegrity: true,
} satisfies Config;
