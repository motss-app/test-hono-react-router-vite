import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';

import { clearPorts } from './dev-ports.ts';
import { spawnCommand } from './run-command.ts';

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
      if (code !== 0) {
        logWarning(
          `Spotlight process exited with code ${code ?? 'unknown'}. continuing without sidecar.`
        );
      }
    })
    .catch(error => {
      logWarning(`Spotlight process status promise rejected: ${String(error)}`);
    });
} catch (error) {
  logWarning(`Failed to spawn Spotlight process; continuing without Spotlight: ${String(error)}`);
}

const appProcess: ManagedProcess = {
  child: spawnCommand(
    'pnpm',
    [
      'dev:app',
    ],
    {
      stdio: 'inherit',
    }
  ),
  name: 'App',
};

processes.push(appProcess);

const gatewayProcess: ManagedProcess = {
  child: spawnCommand(
    'pnpm',
    [
      'dev:gateway',
    ],
    {
      stdio: 'inherit',
    }
  ),
  name: 'Gateway',
};

processes.push(gatewayProcess);

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
  once(appProcess.child, 'close').then(([code]) => ({
    code,
    name: appProcess.name,
  })),
  once(gatewayProcess.child, 'close').then(([code]) => ({
    code,
    name: gatewayProcess.name,
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

if (exitResult.code !== 0) {
  const exitCode = exitResult.code ?? -1;

  if (exitCode === 130 || exitCode === 143) {
    process.exit(0);
  }

  throw new Error(`${exitResult.name} exited with code ${exitResult.code ?? 'unknown'}`);
}
