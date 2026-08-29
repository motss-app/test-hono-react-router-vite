const textDecoder = new TextDecoder();
const whitespacePattern = /\s+/;

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function normalizePorts(ports: number[]): number[] {
  return [
    ...new Set(ports.filter(port => Number.isInteger(port) && port > 0)),
  ];
}

async function getListeningPids(port: number): Promise<number[]> {
  let process: Deno.ChildProcess;

  try {
    process = new Deno.Command('lsof', {
      args: [
        '-nP',
        `-iTCP:${port}`,
        '-sTCP:LISTEN',
        '-t',
      ],
      stderr: 'piped',
      stdout: 'piped',
    }).spawn();
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      writeWarning(`[dev-ports] lsof is not available; skipping port ${port} cleanup`);
      return [];
    }

    throw error;
  }

  const { code, stderr, stdout } = await process.output();

  if (code === 1) {
    return [];
  }

  if (code !== 0) {
    const stderrText = textDecoder.decode(stderr).trim();
    throw new Error(
      stderrText.length > 0
        ? `lsof failed while inspecting port ${port}: ${stderrText}`
        : `lsof failed while inspecting port ${port} with exit code ${code}`
    );
  }

  return [
    ...new Set(
      textDecoder
        .decode(stdout)
        .trim()
        .split(whitespacePattern)
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value > 0)
    ),
  ];
}

async function waitForPortToBeFreeUntil(
  port: number,
  timeoutMs: number,
  startedAt: number
): Promise<void> {
  if ((await getListeningPids(port)).length === 0) {
    return;
  }

  if (Date.now() - startedAt >= timeoutMs) {
    throw new Error(`Port ${port} is still in use after ${timeoutMs}ms`);
  }

  await delay(50);
  return waitForPortToBeFreeUntil(port, timeoutMs, startedAt);
}

function waitForPortToBeFree(port: number, timeoutMs: number): Promise<void> {
  return waitForPortToBeFreeUntil(port, timeoutMs, Date.now());
}

function writeWarning(message: string): void {
  Deno.stderr.writeSync(new TextEncoder().encode(`${message}\n`));
}

export async function clearPort(port: number): Promise<void> {
  const listenerPids = await getListeningPids(port);

  if (listenerPids.length === 0) {
    return;
  }

  writeWarning(`[dev-ports] Clearing port ${port} from pids: ${listenerPids.join(', ')}`);

  for (const pid of listenerPids) {
    try {
      Deno.kill(pid, 'SIGTERM');
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  try {
    await waitForPortToBeFree(port, 1000);
    return;
  } catch {
    // Fall through to SIGKILL if the process didn't exit promptly.
  }

  const remainingPids = await getListeningPids(port);

  for (const pid of remainingPids) {
    try {
      Deno.kill(pid, 'SIGKILL');
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  await waitForPortToBeFree(port, 1000);
}

export async function clearPorts(ports: number[]): Promise<void> {
  const uniquePorts = normalizePorts(ports);

  async function clearPortsAtIndex(index: number): Promise<void> {
    if (index >= uniquePorts.length) {
      return;
    }

    const port = uniquePorts[index];

    if (port === undefined) {
      return;
    }

    await clearPort(port);
    return clearPortsAtIndex(index + 1);
  }

  await clearPortsAtIndex(0);
}
