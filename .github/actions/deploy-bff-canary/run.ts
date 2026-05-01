import { runOrDie, writeLine } from '../lib/deploy.ts';

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
await runOrDie(
  ['deno', 'x', 'wrangler', 'deploy', '--config', 'wrangler.jsonc', '--env', 'canary'],
  { cwd: 'packages/bff' }
);
