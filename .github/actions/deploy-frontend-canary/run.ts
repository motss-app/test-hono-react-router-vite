import { run, runOrDie, writeLine } from '../lib/deploy.ts';

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
await deployWithRetry(
  ['deno', 'x', 'wrangler', 'deploy', '--config', 'wrangler.jsonc', '--env', 'canary'],
  { cwd: 'packages/frontend' },
  2
);

async function deployWithRetry(
  cmd: string[],
  opts: { cwd?: string },
  retries: number,
  attempt = 0
): Promise<void> {
  if (attempt > retries) {
    writeLine(`Deploy failed after ${retries + 1} attempts`);
    Deno.exit(1);
  }

  if (attempt > 0) {
    writeLine(`Retrying deploy (attempt ${attempt + 1})...`);
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }

  const code = await run(cmd, opts);
  if (code === 0) return;

  writeLine(`Deploy failed (exit ${code}), attempt ${attempt + 1}`);
  return deployWithRetry(cmd, opts, retries, attempt + 1);
}
