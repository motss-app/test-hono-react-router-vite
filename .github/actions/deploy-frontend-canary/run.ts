import { retry, runOrDie, withLogGroup, writeLine } from '../lib/deploy.ts';

writeLine('🚀 Building frontend...');
await retry(20)(
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
