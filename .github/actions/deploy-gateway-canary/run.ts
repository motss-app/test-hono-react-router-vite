import {
  appendSummary,
  extractUrls,
  purgeCache,
  runCapture,
  runOrDie,
  writeLine,
} from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

writeLine('🚀 Building Gateway...');
await runOrDie(
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

writeLine('🚀 Deploying public gateway worker...');
const deployResult = await runCapture(
  [
    'deno',
    'x',
    'wrangler',
    'deploy',
    '--env',
    'canary',
  ],
  {
    cwd: 'packages/gateway',
  }
);

if (deployResult.code !== 0) {
  Deno.exit(deployResult.code);
}

const workersDevUrls = extractUrls(`${deployResult.stdout}\n${deployResult.stderr}`).filter(url =>
  url.endsWith('.workers.dev')
);

writeLine('🚀 Purging Cloudflare cache for Canary...');
await purgeCache([
  'hono-react-router-vite-canary.motss.fyi',
]);
writeLine('✅ Canary Cloudflare cache purged');

await appendSummary([
  '### 🚀 Canary Deployment Successful',
  '',
  `🦀 Canary: ${canaryUrl}`,
  ...workersDevUrls.map(url => `🦀 Workers.dev: [${url}](${url})`),
]);
