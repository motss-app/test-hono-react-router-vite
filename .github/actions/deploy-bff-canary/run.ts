import { runOrDie, withLogGroup } from '../lib/deploy.ts';

await withLogGroup('🚀 Generating frontend React Router types', async () => {
  await runOrDie([
    'deno',
    'task',
    'typegen',
  ]);
});

await withLogGroup('🚀 Typechecking BFF', async () => {
  await runOrDie([
    'deno',
    'task',
    '--cwd=packages/bff',
    'typecheck',
  ]);
});

await withLogGroup('🚀 Deploying private BFF worker', async () => {
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
      cwd: 'packages/bff',
    }
  );
});
