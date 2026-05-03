import { retry, runOrDie, withLogGroup } from '../lib/deploy.ts';

await withLogGroup('🚀 Building private frontend', async () => {
  await retry(3)(
    [
      'deno',
      'task',
      '--cwd=packages/frontend',
      'build:canary',
    ],
    {
      env: {
        CLOUDFLARE_ENV: 'canary',
      },
    }
  );
});

await withLogGroup('🚀 Deploying private frontend worker', async () => {
  await runOrDie(
    [
      'deno',
      'x',
      'wrangler',
      'deploy',
      '--config',
      'wrangler.jsonc',
      '--env',
      'canary',
    ],
    {
      cwd: 'packages/frontend',
    }
  );
});
