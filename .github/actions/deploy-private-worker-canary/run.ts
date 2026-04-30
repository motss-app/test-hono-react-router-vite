import { readRequiredEnv, runDeployStep, runStep } from '../lib/deploy.ts';

const service = readRequiredEnv('SERVICE');

// Patch rolldown for Linux NAPI issue before building
try {
  const patchScript = new URL('../patch-rolldown.mjs', import.meta.url).pathname;
  const process = new Deno.Command('deno', {
    args: ['run', '-A', patchScript],
    stdout: 'piped',
    stderr: 'piped',
  });
  const { code } = await process.output();
  if (code !== 0) {
    console.warn('Failed to apply rolldown patch, continuing anyway...');
  }
} catch (e) {
  console.warn('Error applying rolldown patch:', e.message);
}

async function runFrontendDeploy(): Promise<void> {
  await runStep('🚀 Building private frontend...', [
    'deno',
    'task',
    '--cwd=packages/frontend',
    'build:canary',
  ]);

  await runDeployStep(
    '🚀 Deploying private frontend worker...',
    [
      'deno',
      'run',
      '-A',
      'npm:wrangler',
      'deploy',
      '--config',
      'packages/frontend/wrangler.jsonc',
      '--env',
      'canary',
    ],
    'deploy-frontend.log'
  );
}

async function runBffDeploy(): Promise<void> {
  await runStep('🚀 Generating frontend React Router types...', [
    'deno',
    'task',
    'typegen',
  ]);

  await runStep('🚀 Typechecking BFF...', [
    'deno',
    'task',
    '--cwd=packages/bff',
    'typecheck',
  ]);

  await runDeployStep(
    '🚀 Deploying private BFF worker...',
    [
      'deno',
      'run',
      '-A',
      'npm:wrangler',
      'deploy',
      '--config',
      'packages/bff/wrangler.jsonc',
      '--env',
      'canary',
    ],
    'deploy-bff.log'
  );
}

switch (service) {
  case 'frontend': {
    await runFrontendDeploy();
    break;
  }
  case 'bff': {
    await runBffDeploy();
    break;
  }
  default: {
    throw new Error(`Unknown private worker service: ${service}`);
  }
}
