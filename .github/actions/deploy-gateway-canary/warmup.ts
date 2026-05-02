import { errorScenarios } from '../../../app/utils/error-scenarios.ts';
import { discoverPrerenderRoutes } from '../../../vite-utils/route-discovery.ts';
import { warmRoutes, withLogGroup } from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

await withLogGroup(`🚀 Warming up Canary: ${canaryUrl}`, async () => {
  await warmRoutes(
    canaryUrl,
    [
      ...discoverPrerenderRoutes({
        rootDir: Deno.cwd(),
      }),
      '/ssr',
      '/hono-rpc',
      ...errorScenarios.map(({ code }) => `/errors/${code}`),
    ].filter((path, index, paths) => paths.indexOf(path) === index)
  );
});
