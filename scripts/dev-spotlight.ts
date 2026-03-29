interface ManagedProcess {
  child: Deno.ChildProcess;
  name: string;
}

const spotlightUrl = 'http://localhost:8969';
const spotlightHealthcheckTimeoutMs = 1000;

function getSpotlightLaunchCommand(): {
  cmd: string;
  args: string[];
} {
  const binary = Deno.env.get('SPOTLIGHT_BINARY');
  const useMcp = Deno.env.get('SPOTLIGHT_MCP') ?? '1';

  if (binary) {
    return {
      args:
        useMcp === '1' || useMcp?.toLowerCase() === 'true'
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
      ...(useMcp === '1' || useMcp?.toLowerCase() === 'true'
        ? [
            'mcp',
          ]
        : []),
    ],
    cmd: 'pnpm',
  };
}

async function isSpotlightRunning(): Promise<boolean> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, spotlightHealthcheckTimeoutMs);

  try {
    const response = await fetch(spotlightUrl, {
      method: 'GET',
      signal: abortController.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

const processes: ManagedProcess[] = [];

function logWarning(message: string): void {
  Deno.stderr.write(new TextEncoder().encode(`${message}\n`)).catch(() => {
    // ignore stderr write errors
  });
}

let spotlightProcess: ManagedProcess | undefined;

if (!(await isSpotlightRunning())) {
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

    // Keep it running but do not treat Spotlight sidecar failure as fatal.
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

const appStatus = await appProcess.child.status;

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

if (!appStatus.success && appStatus.code !== 1) {
  throw new Error(`App exited with code ${appStatus.code ?? 'unknown'}`);
}
