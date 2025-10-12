import type { Config } from '@react-router/dev/config';

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
    unstable_subResourceIntegrity: true,
    unstable_viteEnvironmentApi: true,
    v8_middleware: true,
  },
  prerender(): string[] {
    return [
      '/',
      '/about',
      '/errors',
      '/hono-rpc',
    ];
  },
  ssr: true,
} satisfies Config;
