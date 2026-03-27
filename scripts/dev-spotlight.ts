interface ManagedProcess {
  child: Deno.ChildProcess;
  name: string;
}

const spotlightUrl = 'http://localhost:8969';
const spotlightHealthcheckTimeoutMs = 1000;

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

if (!(await isSpotlightRunning())) {
  processes.push({
    child: new Deno.Command('pnpm', {
      args: [
        'dlx',
        '@spotlightjs/spotlight',
      ],
      stderr: 'inherit',
      stdin: 'inherit',
      stdout: 'inherit',
    }).spawn(),
    name: 'Spotlight',
  });
}

processes.push({
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
});

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

const processResults = await Promise.race(
  processes.map(async process => ({
    name: process.name,
    status: await process.child.status,
  }))
);

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

if (!processResults.status.success) {
  throw new Error(
    `${processResults.name} exited with code ${processResults.status.code ?? 'unknown'}`
  );
}
