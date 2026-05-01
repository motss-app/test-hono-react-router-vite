import { retry, runOrDie, writeLine } from '../lib/deploy.ts';

writeLine('🚀 Building private frontend...');
await runOrDie(
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

writeLine('🚀 Deploying private frontend worker...');
await retry(2)(
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
