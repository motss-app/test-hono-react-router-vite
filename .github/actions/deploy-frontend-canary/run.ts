import { deploy, runOrDie, writeLine } from '../lib/deploy.ts';

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
await deploy(
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
  'deploy-frontend.log',
  'packages/frontend'
);
