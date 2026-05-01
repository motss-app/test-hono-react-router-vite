import { deployWrangler, runOrDie, writeLine } from '../lib/deploy.ts';

writeLine('🚀 Generating frontend React Router types...');
await runOrDie([
  'deno',
  'task',
  'typegen',
]);

writeLine('🚀 Typechecking BFF...');
await runOrDie([
  'deno',
  'task',
  '--cwd=packages/bff',
  'typecheck',
]);

writeLine('🚀 Deploying private BFF worker...');
await deployWrangler({
  config: 'wrangler.jsonc',
  cwd: 'packages/bff',
  env: 'canary',
  logPath: 'deploy-bff.log',
});
