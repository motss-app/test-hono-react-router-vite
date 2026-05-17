import {
  appendSummary,
  extractUrls,
  retry,
  runCapture,
  withLogGroup,
  writeLine,
} from '../lib/deploy.ts';

const canaryUrl = 'https://hono-react-router-vite-canary.motss.fyi';

writeLine('🚀 Building Gateway...');
await retry(3)(
  [
    'deno',
    'task',
    '--cwd=packages/gateway',
    'build',
  ]
);

const deployResult = await withLogGroup('🚀 Deploying public gateway worker', async () => {
  const result = await runCapture(
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
      cwd: 'packages/gateway',
    }
  );

  if (result.code !== 0) {
    throw new Error(`Gateway deploy failed with exit code ${result.code}`);
  }

  return result;
});

const workersDevUrls = extractUrls(`${deployResult.stdout}\n${deployResult.stderr}`).filter(url =>
  url.endsWith('.workers.dev')
);

await appendSummary([
  '### 🚀 Canary Deployment Successful',
  '',
  `🦀 Canary: ${canaryUrl}`,
  ...workersDevUrls.map(url => `🦀 Workers.dev: [${url}](${url})`),
]);
