import { deploy, runOrDie, writeLine } from '../lib/deploy.ts';

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
await deploy(
  [
    'npx',
    'wrangler',
    'deploy',
    '--config',
    'wrangler.jsonc',
    '--env',
    'canary',
  ],
  'deploy-bff.log',
  'packages/bff'
);
