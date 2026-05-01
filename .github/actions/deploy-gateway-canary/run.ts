import { appendSummary, purgeCache, runOrDie, warmRoutes, writeLine } from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

writeLine('🚀 Building Gateway...');
await runOrDie(['deno', 'task', '--cwd=packages/gateway', 'build'], {
  env: { CLOUDFLARE_ENV: 'canary' },
});

writeLine('🚀 Deploying public gateway worker...');
await runOrDie(
  ['deno', 'x', 'wrangler', 'deploy', '--env', 'canary'],
  { cwd: 'packages/gateway' }
);

writeLine('🚀 Purging Cloudflare cache for Canary...');
await purgeCache(['hono-react-router-vite-canary.motss.fyi']);
writeLine('✅ Canary Cloudflare cache purged');

await appendSummary([
  '### 🚀 Canary Deployment Successful',
  `🐥 **Canary**: ${canaryUrl}`,
]);

writeLine(`Warming up Canary: ${canaryUrl}...`);
await warmRoutes(canaryUrl, ['', 'about', 'ssr', 'hono-rpc', 'errors']);
