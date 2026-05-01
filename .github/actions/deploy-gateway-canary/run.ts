import { appendSummary, purgeCache, run, runOrDie, warmRoutes, writeLine } from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

writeLine('🚀 Building Gateway...');
await runOrDie(['deno', 'task', '--cwd=packages/gateway', 'build'], {
  env: { CLOUDFLARE_ENV: 'canary' },
});

writeLine('🚀 Deploying public gateway worker...');
await deployWithRetry(
  ['deno', 'x', 'wrangler', 'deploy', '--env', 'canary'],
  { cwd: 'packages/gateway' },
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

writeLine('🚀 Purging Cloudflare cache for Canary...');
await purgeCache(['hono-react-router-vite-canary.motss.fyi']);
writeLine('✅ Canary Cloudflare cache purged');

await appendSummary([
  '### 🚀 Canary Deployment Successful',
  `🐥 **Canary**: ${canaryUrl}`,
]);

writeLine(`Warming up Canary: ${canaryUrl}...`);
await warmRoutes(canaryUrl, ['', 'about', 'ssr', 'hono-rpc', 'errors']);
