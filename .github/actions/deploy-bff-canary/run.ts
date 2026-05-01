import { run, runOrDie, writeLine } from '../lib/deploy.ts';

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
await deployWithRetry(
  ['deno', 'x', 'wrangler', 'deploy', '--config', 'wrangler.jsonc', '--env', 'canary'],
  { cwd: 'packages/bff' },
  2
);

async function* retryGenerator(retries: number): AsyncGenerator<number, void, void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      writeLine(`Retrying deploy (attempt ${attempt + 1})...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
    yield attempt;
  }
  writeLine(`Deploy failed after ${retries + 1} attempts`);
  Deno.exit(1);
}

async function deployWithRetry(
  cmd: string[],
  opts: { cwd?: string },
  retries: number
): Promise<void> {
  for await (const attempt of retryGenerator(retries)) {
    const code = await run(cmd, opts);
    if (code === 0) return;
    writeLine(`Deploy failed (exit ${code}), attempt ${attempt + 1}`);
  }
}
