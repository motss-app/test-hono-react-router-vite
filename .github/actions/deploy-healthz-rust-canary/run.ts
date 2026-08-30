import { runOrDie, withLogGroup } from '../lib/deploy.ts';

await withLogGroup('🚀 Installing worker-build', async () => {
  await runOrDie([
    'cargo',
    'install',
    'worker-build',
    '--version',
    '0.8.5',
    '--locked',
  ]);
});

await withLogGroup('🚀 Building Healthz Rust worker', async () => {
  await runOrDie(
    [
      'cargo',
      'build',
      '--target',
      'wasm32-unknown-unknown',
      '--release',
    ],
    {
      cwd: 'packages/healthz-rust',
    }
  );

  await runOrDie(
    [
      'worker-build',
      '--release',
    ],
    {
      cwd: 'packages/healthz-rust',
    }
  );
});

await withLogGroup('🚀 Deploying private Healthz Rust worker', async () => {
  await runOrDie(
    [
      'deno',
      'x',
      'wrangler',
      'deploy',
      '--config',
      'wrangler.toml',
      '--env',
      'canary',
    ],
    {
      cwd: 'packages/healthz-rust',
    }
  );
});
