import {
  appendStepSummary,
  purgeCloudflareCache,
  runDeployStep,
  runStep,
  warmRoutes,
  writeStdoutLine,
} from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

await runStep(
  '🚀 Building Gateway...',
  [
    'deno',
    'task',
    '--cwd=packages/gateway',
    'build',
  ],
  {
    env: {
      CLOUDFLARE_ENV: 'canary',
    },
  }
);

await runDeployStep(
  '🚀 Deploying public gateway worker...',
  [
    'deno',
    'run',
    '-A',
    'npm:wrangler',
    'deploy',
    '--env',
    'canary',
  ],
  'packages/gateway/deploy-gateway.log',
  {
    cwd: 'packages/gateway',
  }
);

writeStdoutLine('🚀 Purging Cloudflare cache for Canary...');
await purgeCloudflareCache([
  'hono-react-router-vite-canary.motss.fyi',
]);
writeStdoutLine('✅ Canary Cloudflare cache purged');

await appendStepSummary([
  '### 🚀 Canary Deployment Successful',
  `🐥 **Canary**: ${canaryUrl}`,
]);

writeStdoutLine(`Warming up Canary: ${canaryUrl}...`);
await warmRoutes(canaryUrl, [
  '',
  'about',
  'ssr',
  'hono-rpc',
  'errors',
]);
