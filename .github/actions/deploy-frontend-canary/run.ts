import { deployWrangler, runOrDie, writeLine } from '../lib/deploy.ts';

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
await deployWrangler({
  config: 'wrangler.jsonc',
  cwd: 'packages/frontend',
  env: 'canary',
  logPath: 'deploy-frontend.log',
});
