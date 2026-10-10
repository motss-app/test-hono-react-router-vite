import { runOrDie, withLogGroup } from '../lib/deploy.ts';

await withLogGroup('🚀 Generating frontend React Router types', async () => {
  await runOrDie([
    'pnpm',
    'typegen',
  ]);
});

await withLogGroup('🚀 Typechecking BFF', async () => {
  await runOrDie([
    'pnpm',
    '--dir',
    'packages/bff',
    'typecheck',
  ]);
});

await withLogGroup('🚀 Building BFF', async () => {
  await runOrDie([
    'pnpm',
    '--dir',
    'packages/bff',
    'build:canary',
  ]);
});

await withLogGroup('🚀 Deploying private BFF worker', async () => {
  await runOrDie(
    [
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
