import { errorScenarios } from '@motss-app/frontend/utils/error-scenarios';

import { discoverPrerenderRoutes } from '../../../vite-utils/route-discovery.ts';
import { withLogGroup, writeLine } from '../lib/deploy.ts';

const TRAILING_SLASHES_RE = /\/+$/;

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

async function warmRoutes(base: string, paths: string[]): Promise<void> {
  const normalizedBase = `${base.replace(TRAILING_SLASHES_RE, '')}/`;

  const results = await Promise.all(
    paths.map(path => {
      const url = new URL(path, normalizedBase).toString().replace(TRAILING_SLASHES_RE, '');
      return fetch(url, {
        redirect: 'follow',
      }).then(
        res => {
          if (res.status === 200) {
            writeLine(`✅ ${url}`);
            return true;
          }
          writeLine(`⚠️ ${url} (${res.status})`);
          return false;
        },
        err => {
          writeLine(`⚠️ ${url} (${err instanceof Error ? err.message : err})`);
          return false;
        }
      );
    })
  );

  const failures = results.filter(r => !r).length;
  if (failures > 0) {
    writeLine(`${failures} route(s) failed to warm up`);
    Deno.exit(1);
  }
}
