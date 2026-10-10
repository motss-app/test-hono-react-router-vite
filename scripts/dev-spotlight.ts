import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';

import { clearPorts } from './dev-ports.ts';
import { localBinPath } from './local-bin.ts';
import { spawnCommand } from './run-command.ts';

const FRONTEND_DIR = new URL('../packages/frontend', import.meta.url).pathname;
const GATEWAY_DIR = new URL('../packages/gateway', import.meta.url).pathname;

interface ManagedProcess {
  child: ChildProcess;
  name: string;
}

function getSpotlightLaunchCommand(): {
  cmd: string;
  args: string[];
} {
  const binary = process.env.SPOTLIGHT_BINARY;
  const useMcp = process.env.SPOTLIGHT_MCP ?? '1';

  if (binary) {
    return {
      args:
        useMcp === '1' || useMcp.toLowerCase() === 'true'
          ? [
              'mcp',
            ]
          : [],
      cmd: binary,
    };
  }

  return {
    args: [
      'dlx',
      '@spotlightjs/spotlight@4.12.0',
      ...(useMcp === '1' || useMcp.toLowerCase() === 'true'
        ? [
            'mcp',
          ]
        : []),
    ],
    cmd: 'pnpm',
  };
}

const processes: ManagedProcess[] = [];

function logWarning(message: string): void {
  process.stderr.write(`${message}\n`);
}

let spotlightProcess: ManagedProcess | undefined;

await clearPorts([
  8969,
  5173,
  8787,
]);

try {
  const launch = getSpotlightLaunchCommand();

  spotlightProcess = {
    child: spawnCommand(launch.cmd, launch.args, {
      stdio: 'inherit',
    }),
    name: 'Spotlight',
  };

  processes.push(spotlightProcess);

  once(spotlightProcess.child, 'close')
    .then(([code]) => {
      /*
       * A child stopped by a signal reports a null code, which is the
       * shutdown path rather than a failure worth warning about.
       */
      if (code !== null && code !== 0) {
        logWarning(`Spotlight process exited with code ${code}. continuing without sidecar.`);
      }
    })
    .catch(error => {
      logWarning(`Spotlight process status promise rejected: ${String(error)}`);
    });
} catch (error) {
  logWarning(`Failed to spawn Spotlight process; continuing without Spotlight: ${String(error)}`);
}

/*
 * Mirrors `pnpm dev:app` / `pnpm dev:gateway` but spawns the underlying
 * `vite` process directly, so SIGTERM reliably reaches it. A `pnpm run`
 * wrapper sits above a shell and a second pnpm, none of which forward the
 * signal down, so signalling the wrapper alone left the stack running and
 * Ctrl+C never completed. The ports are already cleared above and vite
 * reads them from each package's config.
 */
const appProcess: ManagedProcess = {
  child: spawnDevWorker(FRONTEND_DIR),
  name: 'App',
};

processes.push(appProcess);

const gatewayProcess: ManagedProcess = {
  child: spawnDevWorker(GATEWAY_DIR),
  name: 'Gateway',
};

processes.push(gatewayProcess);

function spawnDevWorker(cwd: string): ChildProcess {
  return spawnCommand(localBinPath('vite'), [], {
    cwd,
    env: {
      ...process.env,
      CLOUDFLARE_ENV: 'dev',
    },
    stdio: 'inherit',
  });
}

let isShuttingDown = false;

function stopProcesses(signal: NodeJS.Signals): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const entry of processes) {
    try {
      entry.child.kill(signal);
    } catch {
      // Process may already be exited.
    }
  }
}

const signalListeners = new Map<NodeJS.Signals, () => void>();

for (const signal of [
  'SIGINT',
  'SIGTERM',
] as const) {
  const listener = () => {
    stopProcesses(signal);
  };

  signalListeners.set(signal, listener);
  process.on(signal, listener);
}

const exitResult = await Promise.race([
  once(appProcess.child, 'close').then(([code, signal]) => ({
    code,
    name: appProcess.name,
    signal,
  })),
  once(gatewayProcess.child, 'close').then(([code, signal]) => ({
    code,
    name: gatewayProcess.name,
    signal,
  })),
]);

stopProcesses('SIGTERM');

for (const signal of [
  'SIGINT',
  'SIGTERM',
] as const) {
  const listener = signalListeners.get(signal);

  if (listener) {
    process.off(signal, listener);
  }
}

/*
 * A child stopped by a signal reports a null code, so the signal is the only
 * record of why it ended. stopProcesses signalled these children itself as
 * part of shutdown, which is the ordinary Ctrl+C path, so treat that as a
 * clean exit rather than a failure.
 */
const stoppedByUs = exitResult.signal === 'SIGINT' || exitResult.signal === 'SIGTERM';
const stoppedCleanly = exitResult.code === 0 || exitResult.code === 130 || exitResult.code === 143;

if (!stoppedCleanly && !stoppedByUs) {
  throw new Error(`${exitResult.name} exited with code ${exitResult.code ?? 'unknown'}`);
}

/*
 * Exit explicitly instead of falling off the end. A child that outlives its
 * signal, such as the Spotlight sidecar, keeps the event loop alive and would
 * otherwise leave Ctrl+C appearing to hang.
 */
process.exit(0);
