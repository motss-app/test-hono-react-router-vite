import { clearPorts } from './dev-ports.ts';

interface ManagedProcess {
  child: Deno.ChildProcess;
  name: string;
}

function getSpotlightLaunchCommand(): {
  cmd: string;
  args: string[];
} {
  const binary = Deno.env.get('SPOTLIGHT_BINARY');
  const useMcp = Deno.env.get('SPOTLIGHT_MCP') ?? '1';

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
      '@spotlightjs/spotlight',
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
const textEncoder = new TextEncoder();

function logWarning(message: string): void {
  Deno.stderr.writeSync(textEncoder.encode(`${message}\n`));
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
    child: new Deno.Command(launch.cmd, {
      args: launch.args,
      stderr: 'inherit',
      stdin: 'inherit',
      stdout: 'inherit',
    }).spawn(),
    name: 'Spotlight',
  };

  processes.push(spotlightProcess);

  spotlightProcess.child.status
    .then(status => {
      if (!status.success) {
        logWarning(
          `Spotlight process exited with code ${status.code ?? 'unknown'}. continuing without sidecar.`
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
  child: new Deno.Command('deno', {
    args: [
      'task',
      'dev:app',
    ],
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: 'inherit',
  }).spawn(),
  name: 'App',
};

processes.push(appProcess);

const gatewayProcess: ManagedProcess = {
  child: new Deno.Command('deno', {
    args: [
      'task',
      'dev:gateway',
    ],
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: 'inherit',
  }).spawn(),
  name: 'Gateway',
};

processes.push(gatewayProcess);

let isShuttingDown = false;

function stopProcesses(signal: Deno.Signal): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const process of processes) {
    try {
      process.child.kill(signal);
    } catch {
      // Process may already be exited.
    }
  }
}

const signalListeners = new Map<Deno.Signal, () => void>();

for (const signal of [
  'SIGINT',
  'SIGTERM',
] as const) {
  const listener = () => {
    stopProcesses(signal);
  };

  signalListeners.set(signal, listener);
  Deno.addSignalListener(signal, listener);
}

const exitResult = await Promise.race([
  appProcess.child.status.then(status => ({
    name: appProcess.name,
    status,
  })),
  gatewayProcess.child.status.then(status => ({
    name: gatewayProcess.name,
    status,
  })),
]);

stopProcesses('SIGTERM');

for (const signal of [
  'SIGINT',
  'SIGTERM',
] as const) {
  const listener = signalListeners.get(signal);

  if (listener) {
    Deno.removeSignalListener(signal, listener);
  }
}

if (!exitResult.status.success) {
  const exitCode = exitResult.status.code ?? -1;

  if (exitCode === 130 || exitCode === 143) {
    Deno.exit(0);
  }

  throw new Error(`${exitResult.name} exited with code ${exitResult.status.code ?? 'unknown'}`);
}
