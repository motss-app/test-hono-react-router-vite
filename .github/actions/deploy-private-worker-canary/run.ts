import { runOrDie, run, deploy, readEnv, writeLine } from '../lib/deploy.ts';

const service = readEnv('SERVICE');

async function deployFrontend(): Promise<void> {
  writeLine('🚀 Building private frontend...');
  await runOrDie(['deno', 'task', '--cwd=packages/frontend', 'build:canary'], {
    env: { CLOUDFLARE_ENV: 'canary' },
  });

  writeLine('🚀 Deploying private frontend worker...');
  await deploy(
    ['deno', 'run', '-A', 'npm:wrangler', 'deploy', '--config', 'packages/frontend/wrangler.jsonc', '--env', 'canary'],
    'deploy-frontend.log',
    'packages/frontend',
  );
}

async function deployBff(): Promise<void> {
  writeLine('🚀 Generating frontend React Router types...');
  await runOrDie(['deno', 'task', 'typegen']);

  writeLine('🚀 Typechecking BFF...');
  await runOrDie(['deno', 'task', '--cwd=packages/bff', 'typecheck']);

  writeLine('🚀 Deploying private BFF worker...');
  await deploy(
    ['deno', 'run', '-A', 'npm:wrangler', 'deploy', '--config', 'packages/bff/wrangler.jsonc', '--env', 'canary'],
    'deploy-bff.log',
    'packages/bff',
  );
}

switch (service) {
  case 'frontend':
    await deployFrontend();
    break;
  case 'bff':
    await deployBff();
    break;
  default:
    throw new Error(`Unknown private worker service: ${service}`);
}
