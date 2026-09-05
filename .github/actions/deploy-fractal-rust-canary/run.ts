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

await withLogGroup('🚀 Building Fractal Rust worker', async () => {
  await runOrDie(
    [
      'cargo',
      'build',
      '--target',
      'wasm32-unknown-unknown',
      '--release',
    ],
    {
      cwd: 'packages/fractal-rust',
    }
  );

  await runOrDie(
    [
      'worker-build',
      '--release',
    ],
    {
      cwd: 'packages/fractal-rust',
    }
  );
});

await withLogGroup('🚀 Deploying private Fractal Rust worker', async () => {
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
      cwd: 'packages/fractal-rust',
    }
  );
});
